import type { DatasetMetric } from '@sky-light/shared-types';
import type { IDatasetMetricRepository } from '../interfaces/IDatasetMetricRepository';
import { mockDatasetMetrics } from './mockData';

export class MockDatasetMetricRepository implements IDatasetMetricRepository {
  async findAll(): Promise<DatasetMetric[]> {
    return mockDatasetMetrics;
  }

  async findByDatasetId(datasetId: string): Promise<DatasetMetric[]> {
    return mockDatasetMetrics.filter(dm => dm.datasetId === datasetId);
  }

  async findByMetricId(metricId: string): Promise<DatasetMetric[]> {
    return mockDatasetMetrics.filter(dm => dm.metricId === metricId);
  }

  async findByDatasetAndMetric(datasetId: string, metricId: string): Promise<DatasetMetric | undefined> {
    return mockDatasetMetrics.find(
      dm => dm.datasetId === datasetId && dm.metricId === metricId
    );
  }
}

