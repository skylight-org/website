import type { Benchmark } from '@sky-light/shared-types';

export interface IBenchmarkRepository {
  findAll(): Promise<Benchmark[]>;
  findById(id: string): Promise<Benchmark | null>;
}

