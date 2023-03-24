import Redis from 'ioredis';
import { Dispatcher } from '../common';
import { Repository } from './repository';
import { ListTask } from './tasks/list-task';
import { InsertTask } from './tasks/insert-task';
import { RemoveTask } from './tasks/remove-task';

const dispatcher = new Dispatcher();
const estimationRepository = new Repository(new Redis(), 'estimations');
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
