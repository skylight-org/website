import type { DatasetMetric } from '@sky-light/shared-types';

export interface IDatasetMetricRepository {
  findAll(): Promise<DatasetMetric[]>;
  findByDatasetId(datasetId: string): Promise<DatasetMetric[]>;
  findByMetricId(metricId: string): Promise<DatasetMetric[]>;
  findByDatasetAndMetric(datasetId: string, metricId: string): Promise<DatasetMetric | undefined>;
}

