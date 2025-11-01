import type { Configuration } from '@sky-light/shared-types';
import type { IConfigurationRepository } from '../interfaces/IConfigurationRepository';
import { mockConfigurations } from './mockData';

export class MockConfigurationRepository implements IConfigurationRepository {
  async findAll(filters?: {
    baselineId?: string;
    datasetId?: string;
    llmId?: string;
  }): Promise<Configuration[]> {
    let results = mockConfigurations;

    if (filters?.baselineId) {
      results = results.filter(c => c.baselineId === filters.baselineId);
    }

    if (filters?.datasetId) {
      results = results.filter(c => c.datasetId === filters.datasetId);
    }

    if (filters?.llmId) {
      results = results.filter(c => c.llmId === filters.llmId);
    }

    return results;
  }

  async findById(id: string): Promise<Configuration | null> {
    return mockConfigurations.find(c => c.id === id) || null;
  }

  async findByDatasetId(datasetId: string): Promise<Configuration[]> {
    return mockConfigurations.filter(c => c.datasetId === datasetId);
  }

  async findByBaselineId(baselineId: string): Promise<Configuration[]> {
    return mockConfigurations.filter(c => c.baselineId === baselineId);
  }

  async findByLLMId(llmId: string): Promise<Configuration[]> {
    return mockConfigurations.filter(c => c.llmId === llmId);
  }
}

