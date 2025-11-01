import type { Result } from '@sky-light/shared-types';
import type { IResultRepository } from '../interfaces/IResultRepository';
import { mockResults, mockConfigurations } from './mockData';

export class MockResultRepository implements IResultRepository {
  async findAll(): Promise<Result[]> {
    return mockResults;
  }

  async findById(id: string): Promise<Result | undefined> {
    return mockResults.find(r => r.id === id);
  }

  async findByConfigurationId(configurationId: string): Promise<Result[]> {
    return mockResults.filter(r => r.configurationId === configurationId);
  }

  async findByMetricId(metricId: string): Promise<Result[]> {
    return mockResults.filter(r => r.metricId === metricId);
  }

  async findByExperimentalRunId(experimentalRunId: string): Promise<Result[]> {
    return mockResults.filter(r => r.experimentalRunId === experimentalRunId);
  }

  async findByDatasetId(datasetId: string): Promise<Result[]> {
    const configs = mockConfigurations.filter(c => c.datasetId === datasetId);
    const configIds = new Set(configs.map(c => c.id));
    return mockResults.filter(r => configIds.has(r.configurationId));
  }

  async findByDatasetAndRun(datasetId: string, experimentalRunId: string): Promise<Result[]> {
    const configs = mockConfigurations.filter(c => c.datasetId === datasetId);
    const configIds = new Set(configs.map(c => c.id));
    return mockResults.filter(
      r => configIds.has(r.configurationId) && r.experimentalRunId === experimentalRunId
    );
  }
}

