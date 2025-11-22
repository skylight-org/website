import type { Configuration as IConfiguration } from '@sky-light/shared-types';

export class Configuration implements IConfiguration {
  constructor(
    public id: string,
    public baselineId: string,
    public datasetId: string,
    public llmId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public targetSparsity?: number,
    public additionalParams?: Record<string, any>
  ) {}
}

