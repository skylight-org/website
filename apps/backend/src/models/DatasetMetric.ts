import type { DatasetMetric as IDatasetMetric } from '@sky-light/shared-types';

export class DatasetMetric implements IDatasetMetric {
  constructor(
    public id: string,
    public datasetId: string,
    public metricId: string,
    public weight: number,
    public isPrimary: boolean,
    public createdAt: Date
  ) {}
}

