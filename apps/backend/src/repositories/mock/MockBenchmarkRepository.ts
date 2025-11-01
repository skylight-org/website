import type { Benchmark } from '@sky-light/shared-types';
import type { IBenchmarkRepository } from '../interfaces/IBenchmarkRepository';
import { mockBenchmarks } from './mockData';

export class MockBenchmarkRepository implements IBenchmarkRepository {
  async findAll(): Promise<Benchmark[]> {
    return mockBenchmarks;
  }

  async findById(id: string): Promise<Benchmark | null> {
    return mockBenchmarks.find(b => b.id === id) || null;
  }
}

