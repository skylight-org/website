import type { Baseline as IBaseline } from '@sky-light/shared-types';

export class Baseline implements IBaseline {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public version: string,
    public createdAt: Date,
    public updatedAt: Date,
    public paperUrl?: string,
    public codeUrl?: string
  ) {}
}

