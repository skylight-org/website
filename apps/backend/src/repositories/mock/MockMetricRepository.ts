import type { Metric } from '@sky-light/shared-types';
import type { IMetricRepository } from '../interfaces/IMetricRepository';
import { mockMetrics } from './mockData';

export class MockMetricRepository implements IMetricRepository {
  async findAll(): Promise<Metric[]> {
    return mockMetrics;
  }

  async findById(id: string): Promise<Metric | undefined> {
    return mockMetrics.find(m => m.id === id);
  }

  async findByName(name: string): Promise<Metric | undefined> {
    return mockMetrics.find(m => m.name === name);
  }
}

