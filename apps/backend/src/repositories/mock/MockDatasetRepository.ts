import type { Dataset } from '@sky-light/shared-types';
import type { IDatasetRepository } from '../interfaces/IDatasetRepository';
import { mockDatasets } from './mockData';

export class MockDatasetRepository implements IDatasetRepository {
  async findAll(): Promise<Dataset[]> {
    return mockDatasets;
  }

  async findById(id: string): Promise<Dataset | null> {
    return mockDatasets.find(d => d.id === id) || null;
  }

  async findByBenchmarkId(benchmarkId: string): Promise<Dataset[]> {
    return mockDatasets.filter(d => d.benchmarkId === benchmarkId);
  }
}

