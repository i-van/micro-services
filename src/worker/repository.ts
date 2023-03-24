import Redis from 'ioredis';

export class Repository {
  constructor(
    protected readonly client: Redis,
    protected readonly key: string,
  ) {}

  public async findAll(): Promise<number[]> {
    const length = await this.client.llen(this.key);
    const list = await this.client.lrange(this.key, 0, length);
    return list.map(Number);
  }

  public async insert(n: number): Promise<void> {
    await this.client.lpush(this.key, n);
  }

  public async removeAll(): Promise<void> {
    await this.client.del(this.key);
  }
}
