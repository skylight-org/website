import { SupabaseClient } from '@supabase/supabase-js';
import { IDatasetRepository } from '../interfaces/IDatasetRepository';
import type { Dataset } from '@sky-light/shared-types';

/**
 * PostgreSQL implementation of DatasetRepository using Supabase
 */
export class PostgresDatasetRepository implements IDatasetRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Dataset[]> {
    const { data, error } = await this.supabase
      .from('datasets')
      .select(`
        *,
        configurations(count)
      `)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch datasets: ${error.message}`);
    }

    return (data || []).map(this.mapToDataset);
  }

  async findById(id: string): Promise<Dataset | null> {
    const { data, error } = await this.supabase
      .from('datasets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch dataset: ${error.message}`);
    }

    return data ? this.mapToDataset(data) : null;
  }

  async findByBenchmarkId(benchmarkId: string): Promise<Dataset[]> {
    const { data, error } = await this.supabase
      .from('datasets')
      .select('*')
      .eq('benchmark_id', benchmarkId)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch datasets for benchmark: ${error.message}`);
    }

    return (data || []).map(this.mapToDataset);
  }

  /**
   * Map database row to Dataset model
   */
  private mapToDataset(row: any): Dataset {
    return {
      id: row.id,
      benchmarkId: row.benchmark_id,
      name: row.name,
      description: row.description || '',
      size: row.size,
      configurationCount: Array.isArray(row.configurations) ? row.configurations[0]?.count ?? 0 : 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

