import Redis from 'ioredis';
import { config, Dispatcher } from '../common';
import { Repository } from './repository';
import { InsertTask, ListTask, RemoveTask } from './tasks';

const dispatcher = new Dispatcher(config.redis);
const estimationRepository = new Repository(new Redis(config.redis), 'estimations');
const listTask = new ListTask(estimationRepository);
const insertTask = new InsertTask(estimationRepository);
const removeTask = new RemoveTask(estimationRepository);

export const start = async () => {
  dispatcher.registerHandler('worker.add-estimation', insertTask.handle);
  dispatcher.registerHandler('worker.find-estimations', listTask.handle);
  dispatcher.registerHandler('worker.remove-estimations', removeTask.handle);

  await dispatcher.connect();
};

export const stop = async () => {
  await dispatcher.close();
};
