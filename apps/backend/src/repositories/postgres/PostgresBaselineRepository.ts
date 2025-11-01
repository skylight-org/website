import { SupabaseClient } from '@supabase/supabase-js';
import { IBaselineRepository } from '../interfaces/IBaselineRepository';
import { Baseline } from '../../models/Baseline';

/**
 * PostgreSQL implementation of BaselineRepository using Supabase
 */
export class PostgresBaselineRepository implements IBaselineRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Baseline[]> {
    const { data, error } = await this.supabase
      .from('baselines')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch baselines: ${error.message}`);
    }

    return (data || []).map(this.mapToBaseline);
  }

  async findById(id: string): Promise<Baseline | null> {
    const { data, error } = await this.supabase
      .from('baselines')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Failed to fetch baseline: ${error.message}`);
    }

    return data ? this.mapToBaseline(data) : null;
  }

  /**
   * Map database row to Baseline model
   */
  private mapToBaseline(row: any): Baseline {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      version: row.version || '1.0',
      paperUrl: row.paper_url,
      codeUrl: row.code_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

