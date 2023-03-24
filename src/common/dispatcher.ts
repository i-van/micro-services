import Redis from 'ioredis';
import { v4 as uuid } from 'uuid';
import { RedisOptions } from 'ioredis/built/redis/RedisOptions';

type DispatcherOptions = RedisOptions & {
  timeout?: number;
};
type DispatchEventOptions = {
  reply?: boolean;
  timeout?: number;
};
type Handler = (data: any) => Promise<any>;
type ResponseMessage = {
  transactionId: string;
  error: string | null;
  response: any;
};
type RequestMessage = {
  transactionId: string;
  event: string;
  data: any;
  replyTo: string | null;
};

export class Dispatcher {
  protected id = uuid();
  protected logger = console;
  protected pubClient: Redis;
  protected subClient: Redis;
  protected requestChannel = 'request';
  protected responseChannel = `response-${this.id}`;
  protected handlers = new Map<string, Handler>();
  protected transactions = new Map<string, Function>();

  constructor(protected readonly options: DispatcherOptions = {}) {}

  public async connect(): Promise<void> {
    if (this.pubClient && this.subClient) {
      return;
    }

    this.pubClient = this.createClient();
    this.subClient = this.createClient();

    await Promise.all([
      this.pubClient.connect(),
      this.subClient.connect(),
    ]);

    this.subClient.subscribe(this.requestChannel);
    this.subClient.subscribe(this.responseChannel);
    this.subClient.on('message', async (channel: string, buffer: string) => {
      this.logger.log(`[${this.id}][${channel}] ${buffer}`);
      const isResponse = channel === this.responseChannel;
      isResponse
        ? this.handleResponseMessage(JSON.parse(buffer) as ResponseMessage)
        : await this.handleRequestMessage(JSON.parse(buffer) as RequestMessage);
    });
  }

  public close(): void {
    this.pubClient?.quit();
    this.subClient?.quit();
    this.pubClient = null;
    this.subClient = null;
  }

  public registerHandler(eventName: string, handler: Handler): void {
    this.handlers.set(eventName, handler);
  }

  public async dispatchEvent<T, D = Record<string, any>>(
    event: string,
    data?: D,
    options?: DispatchEventOptions,
  ): Promise<T> {
    const transactionId = uuid();
    const timeout = this.options.timeout || options?.timeout || 1000;
    const replyTo = options?.reply === false ? null : this.responseChannel;
    const publishPromise = new Promise((resolve, reject) => {
      const callback = (err: string, data: T) => err ? reject(new Error(err)) : resolve(data);
      this.transactions.set(transactionId, callback);
      this.pubClient.publish(this.requestChannel, JSON.stringify({
        transactionId,
        event,
        data,
        replyTo,
      }));
      if (!replyTo) {
        callback(null, null);
      }
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(reject, timeout, new Error(`"${event}" aborted`))
    );

    try {
      return await Promise.race<T | any>([publishPromise, timeoutPromise]);
    } finally {
      this.transactions.delete(transactionId);
    }
  }

  protected createClient(): Redis {
    const client = new Redis({ ...this.options, lazyConnect: true });
    client.on('error', (err: Error) => this.logger.error(err));

    return client;
  }

  protected async handleRequestMessage({ transactionId, event, data, replyTo }: RequestMessage): Promise<void> {
    const handler = this.handlers.get(event);
    if (!handler) {
      return;
    }

    const reply = (error: string, response: any): void => {
      replyTo && this.pubClient.publish(replyTo, JSON.stringify({
        transactionId,
        error,
        response,
      }));
    };

    try {
      const response = await handler(data);
      reply(null, response);
    } catch (err) {
      reply(err.message, null);
    }
  }

  protected handleResponseMessage({ transactionId, error, response }: ResponseMessage): void {
    const callback = this.transactions.get(transactionId);
    callback && callback(error, response);
  }
}
