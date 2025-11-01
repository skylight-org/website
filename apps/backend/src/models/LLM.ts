import type { LLM as ILLM } from '@sky-light/shared-types';

export class LLM implements ILLM {
  constructor(
    public id: string,
    public name: string,
    public provider: string,
    public createdAt: Date,
    public updatedAt: Date,
    public parameterCount?: number,
    public contextLength?: number
  ) {}
}

