import { Dispatcher } from '../common';

const dispatcher = new Dispatcher();

export const start = async () => {
  dispatcher.registerHandler('estimate', async () => {
    return Math.floor(Math.random() * 10000) + 1;
  });

  await dispatcher.connect();
};

export const stop = async () => {
  await dispatcher.close();
};
