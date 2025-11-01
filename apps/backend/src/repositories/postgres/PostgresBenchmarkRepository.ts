import { SupabaseClient } from '@supabase/supabase-js';
import { IBenchmarkRepository } from '../interfaces/IBenchmarkRepository';
import { Benchmark } from '../../models/Benchmark';

/**
 * PostgreSQL implementation of BenchmarkRepository using Supabase
 */
export class PostgresBenchmarkRepository implements IBenchmarkRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Benchmark[]> {
    const { data, error } = await this.supabase
      .from('benchmarks')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch benchmarks: ${error.message}`);
    }

    return (data || []).map(this.mapToBenchmark);
  }

  async findById(id: string): Promise<Benchmark | null> {
    const { data, error } = await this.supabase
      .from('benchmarks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch benchmark: ${error.message}`);
    }

    return data ? this.mapToBenchmark(data) : null;
  }

  /**
   * Map database row to Benchmark model
   */
  private mapToBenchmark(row: any): Benchmark {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      paperUrl: row.paper_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

