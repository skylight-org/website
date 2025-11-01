import type { LLM } from '@sky-light/shared-types';

export interface ILLMRepository {
  findAll(): Promise<LLM[]>;
  findById(id: string): Promise<LLM | undefined>;
  findByName(name: string): Promise<LLM | undefined>;
}

