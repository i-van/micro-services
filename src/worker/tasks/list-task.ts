import { Repository } from '../repository';

export class ListTask {
  constructor(protected readonly repository: Repository) {}

  handle = () => this.repository.findAll();
}
