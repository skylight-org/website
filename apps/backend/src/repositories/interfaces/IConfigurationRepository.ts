import type { Configuration } from '@sky-light/shared-types';

export interface IConfigurationRepository {
  findAll(filters?: {
    baselineId?: string;
    datasetId?: string;
    llmId?: string;
  }): Promise<Configuration[]>;
  findById(id: string): Promise<Configuration | null>;
  findByDatasetId(datasetId: string): Promise<Configuration[]>;
  findByBaselineId(baselineId: string): Promise<Configuration[]>;
  findByLLMId(llmId: string): Promise<Configuration[]>;
}

