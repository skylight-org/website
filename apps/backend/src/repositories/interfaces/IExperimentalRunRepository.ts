import type { ExperimentalRun } from '@sky-light/shared-types';

export interface IExperimentalRunRepository {
  findAll(): Promise<ExperimentalRun[]>;
  findById(id: string): Promise<ExperimentalRun | undefined>;
  findByStatus(status: 'pending' | 'running' | 'completed' | 'failed'): Promise<ExperimentalRun[]>;
  findLatestCompleted(): Promise<ExperimentalRun | undefined>;
}

