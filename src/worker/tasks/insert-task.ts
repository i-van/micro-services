import { Repository } from '../repository';

type InsertTaskPayload = {
  estimation: number;
};

export class InsertTask {
  constructor(protected readonly repository: Repository) {}

  handle = ({ estimation }: InsertTaskPayload) => this.repository.insert(estimation);
}
