import type { Dataset as IDataset } from '@sky-light/shared-types';

export class Dataset implements IDataset {
  constructor(
    public id: string,
    public benchmarkId: string,
    public name: string,
    public description: string,
    public createdAt: Date,
    public updatedAt: Date,
    public size?: number
  ) {}
}

