import type { Result as IResult } from '@sky-light/shared-types';

export class Result implements IResult {
  constructor(
    public id: string,
    public configurationId: string,
    public datasetMetricId: string,
    public value: number,
    public createdAt: Date,
    public experimentalRunId?: string,
    public standardDeviation?: number,
    public sampleSize?: number,
    public executionTimeMs?: number,
    public notes?: string
  ) {}
}

