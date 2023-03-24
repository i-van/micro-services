import { Dispatcher } from '../common';

export class Controller {
  constructor(protected readonly dispatcher: Dispatcher) {}

  findAll = () => this.dispatcher.dispatchEvent<number[]>('worker.find-estimations');

  removeAll = () => this.dispatcher.dispatchEvent<void>('worker.remove-estimations');

  generateEstimation = async (): Promise<number> => {
    const estimation = await this.dispatcher.dispatchEvent<number>('estimation.estimate');
    if (estimation <= 500) {
      return estimation;
    }
    await this.dispatcher.dispatchEvent('worker.add-estimation', { estimation }, { reply: false });
    return -1;
  }
}
