import { config, Dispatcher } from '../common';

const dispatcher = new Dispatcher(config.redis);

export const start = async () => {
  dispatcher.registerHandler('estimation.estimate', async () => {
    return Math.floor(Math.random() * 10000) + 1;
  });

  await dispatcher.connect();
};

export const stop = async () => {
  await dispatcher.close();
};
