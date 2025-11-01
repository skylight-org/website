import type { ExperimentalRun as IExperimentalRun } from '@sky-light/shared-types';

export class ExperimentalRun implements IExperimentalRun {
  constructor(
    public id: string,
    public name: string,
    public runDate: Date,
    public status: 'pending' | 'running' | 'completed' | 'failed',
    public createdAt: Date,
    public description?: string,
    public metadata?: Record<string, any>
  ) {}
}

