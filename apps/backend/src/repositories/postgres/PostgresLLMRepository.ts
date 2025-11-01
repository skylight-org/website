import { SupabaseClient } from '@supabase/supabase-js';
import { ILLMRepository } from '../interfaces/ILLMRepository';
import { LLM } from '../../models/LLM';

/**
 * PostgreSQL implementation of LLMRepository using Supabase
 */
export class PostgresLLMRepository implements ILLMRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<LLM[]> {
    const { data, error } = await this.supabase
      .from('llms')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch LLMs: ${error.message}`);
    }

    return (data || []).map(this.mapToLLM);
  }

  async findById(id: string): Promise<LLM | null> {
    const { data, error } = await this.supabase
      .from('llms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch LLM: ${error.message}`);
    }

    return data ? this.mapToLLM(data) : null;
  }

  /**
   * Map database row to LLM model
   */
  private mapToLLM(row: any): LLM {
    return {
      id: row.id,
      name: row.name,
      provider: row.provider || '',
      parameterCount: row.parameter_count,
      contextLength: row.context_length,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

