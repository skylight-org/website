import type { Dataset } from '@sky-light/shared-types';

export interface IDatasetRepository {
  findAll(): Promise<Dataset[]>;
  findById(id: string): Promise<Dataset | null>;
  findByBenchmarkId(benchmarkId: string): Promise<Dataset[]>;
}

