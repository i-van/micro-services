import Fastify from 'fastify';
import { Dispatcher } from '../common';

const server = Fastify({ logger: true });
const dispatcher = new Dispatcher();

export const start = async () => {
  try {
    server.get('/', async () => {
      const estimation = await dispatcher.dispatchEvent<number>('estimate', {});
      if (estimation <= 500) {
        return estimation;
      }
      return -1;
    });

    await dispatcher.connect();
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    throw err;
  }
};

export const stop = async () => {
  await server.close();
  await dispatcher.close();
};
