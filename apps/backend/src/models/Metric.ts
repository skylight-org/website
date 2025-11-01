import type { Metric as IMetric } from '@sky-light/shared-types';

export class Metric implements IMetric {
  constructor(
    public id: string,
    public name: string,
    public displayName: string,
    public description: string,
    public higherIsBetter: boolean,
    public createdAt: Date,
    public unit?: string
  ) {}
}

