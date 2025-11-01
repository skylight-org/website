import type { Baseline } from '@sky-light/shared-types';
import type { IBaselineRepository } from '../interfaces/IBaselineRepository';
import { mockBaselines } from './mockData';

export class MockBaselineRepository implements IBaselineRepository {
  async findAll(): Promise<Baseline[]> {
    return mockBaselines;
  }

  async findById(id: string): Promise<Baseline | null> {
    return mockBaselines.find(b => b.id === id) || null;
  }
}

