import Fastify from 'fastify';
import { config, Dispatcher } from '../common';
import { Controller } from './controller';

const server = Fastify({ logger: true });
const dispatcher = new Dispatcher(config.redis);
const controller = new Controller(dispatcher);

export const start = async () => {
  try {
    server.get('/', controller.findAll);
    server.post('/', controller.generateEstimation);
    server.delete('/', controller.removeAll);

    await dispatcher.connect();
    await server.listen(config.app);
  } catch (err) {
    server.log.error(err);
    throw err;
  }
};

export const stop = async () => {
  await server.close();
  await dispatcher.close();
};
