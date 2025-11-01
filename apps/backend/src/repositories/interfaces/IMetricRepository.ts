import type { Metric } from '@sky-light/shared-types';

export interface IMetricRepository {
  findAll(): Promise<Metric[]>;
  findById(id: string): Promise<Metric | undefined>;
  findByName(name: string): Promise<Metric | undefined>;
}

