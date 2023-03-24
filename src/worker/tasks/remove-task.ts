import { Repository } from '../repository';

export class RemoveTask {
  constructor(protected readonly repository: Repository) {}

  handle = () => this.repository.removeAll();
}
