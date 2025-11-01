import { SupabaseClient } from '@supabase/supabase-js';
import { IDatasetMetricRepository } from '../interfaces/IDatasetMetricRepository';
import { DatasetMetric } from '../../models/DatasetMetric';

/**
 * PostgreSQL implementation of DatasetMetricRepository using Supabase
 */
export class PostgresDatasetMetricRepository implements IDatasetMetricRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<DatasetMetric[]> {
    const { data, error } = await this.supabase
      .from('dataset_metrics')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch dataset metrics: ${error.message}`);
    }

    return (data || []).map(this.mapToDatasetMetric);
  }

  async findByDatasetId(datasetId: string): Promise<DatasetMetric[]> {
    const { data, error } = await this.supabase
      .from('dataset_metrics')
      .select('*')
      .eq('dataset_id', datasetId)
      .order('is_primary', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch dataset metrics: ${error.message}`);
    }

    return (data || []).map(this.mapToDatasetMetric);
  }

  async findByMetricId(metricId: string): Promise<DatasetMetric[]> {
    const { data, error } = await this.supabase
      .from('dataset_metrics')
      .select('*')
      .eq('metric_id', metricId);

    if (error) {
      throw new Error(`Failed to fetch dataset metrics: ${error.message}`);
    }

    return (data || []).map(this.mapToDatasetMetric);
  }

  async findByDatasetAndMetric(datasetId: string, metricId: string): Promise<DatasetMetric | undefined> {
    const { data, error } = await this.supabase
      .from('dataset_metrics')
      .select('*')
      .eq('dataset_id', datasetId)
      .eq('metric_id', metricId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw new Error(`Failed to fetch dataset metric: ${error.message}`);
    }

    return data ? this.mapToDatasetMetric(data) : undefined;
  }

  /**
   * Map database row to DatasetMetric model
   */
  private mapToDatasetMetric(row: any): DatasetMetric {
    return {
      id: row.id,
      datasetId: row.dataset_id,
      metricId: row.metric_id,
      weight: parseFloat(row.weight),
      isPrimary: row.is_primary,
      createdAt: new Date(row.created_at),
    };
  }
}

