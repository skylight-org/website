import { SupabaseClient } from '@supabase/supabase-js';
import { IMetricRepository } from '../interfaces/IMetricRepository';
import { Metric } from '../../models/Metric';

/**
 * PostgreSQL implementation of MetricRepository using Supabase
 */
export class PostgresMetricRepository implements IMetricRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Metric[]> {
    const { data, error } = await this.supabase
      .from('metrics')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }

    return (data || []).map(this.mapToMetric);
  }

  async findById(id: string): Promise<Metric | null> {
    const { data, error } = await this.supabase
      .from('metrics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch metric: ${error.message}`);
    }

    return data ? this.mapToMetric(data) : null;
  }

  /**
   * Map database row to Metric model
   */
  private mapToMetric(row: any): Metric {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description || '',
      unit: row.unit,
      higherIsBetter: row.higher_is_better,
      createdAt: new Date(row.created_at),
    };
  }
}

