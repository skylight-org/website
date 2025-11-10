import { SupabaseClient } from '@supabase/supabase-js';
import { IResultRepository } from '../interfaces/IResultRepository';
import { Result } from '../../models/Result';

/**
 * PostgreSQL implementation of ResultRepository using Supabase
 */
export class PostgresResultRepository implements IResultRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Result[]> {
    const { data, error } = await this.supabase
      .from('results')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    return (data || []).map(this.mapToResult);
  }

  async findById(id: string): Promise<Result | undefined> {
    const { data, error } = await this.supabase
      .from('results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return undefined;
      }
      throw new Error(`Failed to fetch result: ${error.message}`);
    }

    return data ? this.mapToResult(data) : undefined;
  }

  async findByConfigurationId(configurationId: string): Promise<Result[]> {
    const { data, error } = await this.supabase
      .from('results')
      .select('*')
      .eq('configuration_id', configurationId);

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    return (data || []).map(this.mapToResult);
  }

  async findByDatasetMetricId(datasetMetricId: string): Promise<Result[]> {
    const { data, error } = await this.supabase
      .from('results')
      .select('*')
      .eq('dataset_metric_id', datasetMetricId);

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    return (data || []).map(this.mapToResult);
  }

  async findByExperimentalRunId(experimentalRunId: string): Promise<Result[]> {
    const { data, error } = await this.supabase
      .from('results')
      .select('*')
      .eq('experimental_run_id', experimentalRunId);

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    return (data || []).map(this.mapToResult);
  }

  async findByDatasetId(datasetId: string): Promise<Result[]> {
    const { data, error } = await this.supabase
      .from('results')
      .select(`
        *,
        configurations!inner(dataset_id)
      `)
      .eq('configurations.dataset_id', datasetId);

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    return (data || []).map(this.mapToResult);
  }

  async findByDatasetAndRun(datasetId: string, experimentalRunId: string): Promise<Result[]> {
    const { data, error } = await this.supabase
      .from('results')
      .select(`
        *,
        configurations!inner(dataset_id)
      `)
      .eq('configurations.dataset_id', datasetId)
      .eq('experimental_run_id', experimentalRunId);

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    return (data || []).map(this.mapToResult);
  }

  /**
   * Map database row to Result model
   */
  private mapToResult(row: any): Result {
    return {
      id: row.id,
      configurationId: row.configuration_id,
      datasetMetricId: row.dataset_metric_id,
      experimentalRunId: row.experimental_run_id,
      value: parseFloat(row.value),
      standardDeviation: row.standard_deviation ? parseFloat(row.standard_deviation) : undefined,
      sampleSize: row.sample_size,
      executionTimeMs: row.execution_time_ms,
      notes: row.notes,
      createdAt: new Date(row.created_at),
    };
  }
}

