import type { ExperimentalRun } from '@sky-light/shared-types';
import type { IExperimentalRunRepository } from '../interfaces/IExperimentalRunRepository';
import { mockExperimentalRuns } from './mockData';

export class MockExperimentalRunRepository implements IExperimentalRunRepository {
  async findAll(): Promise<ExperimentalRun[]> {
    return mockExperimentalRuns;
  }

  async findById(id: string): Promise<ExperimentalRun | undefined> {
    return mockExperimentalRuns.find(r => r.id === id);
  }

  async findByStatus(status: 'pending' | 'running' | 'completed' | 'failed'): Promise<ExperimentalRun[]> {
    return mockExperimentalRuns.filter(r => r.status === status);
  }

  async findLatestCompleted(): Promise<ExperimentalRun | undefined> {
    const completed = mockExperimentalRuns
      .filter(r => r.status === 'completed')
      .sort((a, b) => b.runDate.getTime() - a.runDate.getTime());
    return completed[0];
  }
}

