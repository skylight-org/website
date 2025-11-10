import type { Result } from '@sky-light/shared-types';

export interface IResultRepository {
  findAll(): Promise<Result[]>;
  findById(id: string): Promise<Result | undefined>;
  findByConfigurationId(configurationId: string): Promise<Result[]>;
  findByDatasetMetricId(datasetMetricId: string): Promise<Result[]>;
  findByExperimentalRunId(experimentalRunId: string): Promise<Result[]>;
  findByDatasetId(datasetId: string): Promise<Result[]>;
  findByDatasetAndRun(datasetId: string, experimentalRunId: string): Promise<Result[]>;
}

