import type { LLM } from '@sky-light/shared-types';
import type { ILLMRepository } from '../interfaces/ILLMRepository';
import { mockLLMs } from './mockData';

export class MockLLMRepository implements ILLMRepository {
  async findAll(): Promise<LLM[]> {
    return mockLLMs;
  }

  async findById(id: string): Promise<LLM | undefined> {
    return mockLLMs.find(l => l.id === id);
  }

  async findByName(name: string): Promise<LLM | undefined> {
    return mockLLMs.find(l => l.name === name);
  }
}

