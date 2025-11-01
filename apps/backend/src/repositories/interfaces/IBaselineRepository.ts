import type { Baseline } from '@sky-light/shared-types';

export interface IBaselineRepository {
  findAll(): Promise<Baseline[]>;
  findById(id: string): Promise<Baseline | null>;
}

