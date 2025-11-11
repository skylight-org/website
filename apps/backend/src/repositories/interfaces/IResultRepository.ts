import type { Result } from '@sky-light/shared-types';

export interface IResultRepository {
  findAll(): Promise<Result[]>;
  findById(id: string): Promise<Result | null>;
  findByConfigurationId(configurationId: string): Promise<Result[]>;
  findByConfigurationIds(configurationIds: string[]): Promise<Result[]>;
<<<<<<< HEAD
  findByDatasetId(datasetId: string): Promise<Result[]>;
=======
>>>>>>> eaecfca8cb800209812107652ea47170ba258004
  findByDatasetAndRun(datasetId: string, experimentalRunId: string): Promise<Result[]>;
  countAll(): Promise<number>;
}

