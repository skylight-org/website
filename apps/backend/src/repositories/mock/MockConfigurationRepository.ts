import type { Configuration } from '@sky-light/shared-types';
import type { IConfigurationRepository, ConfigurationFilters } from '../interfaces/IConfigurationRepository';
import { mockConfigurations } from './mockData';

export class MockConfigurationRepository implements IConfigurationRepository {
  async findAll(filters?: ConfigurationFilters): Promise<Configuration[]> {
    return this.applyFilters(mockConfigurations, filters);
  }

  async findById(id: string): Promise<Configuration | null> {
    return mockConfigurations.find(c => c.id === id) || null;
  }

  async findByDatasetId(datasetId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    const datasetConfigs = mockConfigurations.filter(c => c.datasetId === datasetId);
    return this.applyFilters(datasetConfigs, filters);
  }

  async findByBaselineId(baselineId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    const baselineConfigs = mockConfigurations.filter(c => c.baselineId === baselineId);
    return this.applyFilters(baselineConfigs, filters);
  }

  async findByLLMId(llmId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    const llmConfigs = mockConfigurations.filter(c => c.llmId === llmId);
    return this.applyFilters(llmConfigs, filters);
  }

  async getUniqueSparsityValues(): Promise<number[]> {
    const values = new Set<number>();
    mockConfigurations.forEach(c => {
      if (c.targetSparsity !== undefined && c.targetSparsity !== null) {
        values.add(c.targetSparsity);
      }
    });
    return Array.from(values).sort((a, b) => a - b);
  }

  async getUniqueAuxMemoryValues(): Promise<number[]> {
    const values = new Set<number>();
    mockConfigurations.forEach(c => {
      if (c.targetAuxMemory !== undefined && c.targetAuxMemory !== null) {
        values.add(c.targetAuxMemory);
      }
    });
    return Array.from(values).sort((a, b) => a - b);
  }

  private applyFilters(configs: Configuration[], filters?: ConfigurationFilters): Configuration[] {
    if (!filters) return configs;

    let results = configs;

    if (filters.baselineId) {
      results = results.filter(c => c.baselineId === filters.baselineId);
    }

    if (filters.datasetId) {
      results = results.filter(c => c.datasetId === filters.datasetId);
    }

    if (filters.llmId) {
      results = results.filter(c => c.llmId === filters.llmId);
    }

    if (filters.targetSparsity !== undefined) {
      results = results.filter(c => this.matchesRange(c.targetSparsity, filters.targetSparsity));
    }

    if (filters.targetAuxMemory !== undefined) {
      results = results.filter(c => this.matchesRange(c.targetAuxMemory, filters.targetAuxMemory));
    }

    return results;
  }

  private matchesRange(value: number | undefined, range: { min?: number; max?: number }): boolean {
    if (value === undefined) return false;

    const { min, max } = range;
    
    if (min !== undefined && value < min) {
      return false;
    }
    
    if (max !== undefined && value > max) {
      return false;
    }

    return true;
  }
}

