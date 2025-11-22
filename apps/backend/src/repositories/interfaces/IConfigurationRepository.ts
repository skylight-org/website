import type { Configuration, NumericRange } from '@sky-light/shared-types';

export interface ConfigurationFilters {
  baselineId?: string;
  datasetId?: string;
  llmId?: string;
  targetSparsity?: NumericRange;
}

export interface IConfigurationRepository {
  findAll(filters?: ConfigurationFilters): Promise<Configuration[]>;
  findById(id: string): Promise<Configuration | null>;
  findByDatasetId(datasetId: string, filters?: ConfigurationFilters): Promise<Configuration[]>;
  findByBaselineId(baselineId: string, filters?: ConfigurationFilters): Promise<Configuration[]>;
  findByLLMId(llmId: string, filters?: ConfigurationFilters): Promise<Configuration[]>;
  getUniqueSparsityValues(): Promise<number[]>;
}

