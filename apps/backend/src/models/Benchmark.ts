import type { Benchmark as IBenchmark } from '@sky-light/shared-types';

export class Benchmark implements IBenchmark {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public createdAt: Date,
    public updatedAt: Date,
    public paperUrl?: string
  ) {}
}

