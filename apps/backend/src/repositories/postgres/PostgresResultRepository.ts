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
      .select('*')
      .limit(10000);

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    return (data || []).map(this.mapToResult);
  }

  async findById(id: string): Promise<Result | null> {
    const { data, error } = await this.supabase
      .from('results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Failed to fetch result: ${error.message}`);
    }

    return data ? this.mapToResult(data) : null;
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

  async findByConfigurationIds(configurationIds: string[]): Promise<Result[]> {
    if (configurationIds.length === 0) {
      return [];
    }
    const { data, error } = await this.supabase
      .from('results')
      .select('*')
      .in('configuration_id', configurationIds)
      .limit(10000);

    if (error) {
      throw new Error(`Failed to fetch results by configuration IDs: ${error.message}`);
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

  async countAll(): Promise<number> {
    const { count, error } = await this.supabase
      .from('results')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to count results: ${error.message}`);
    }
    return count || 0;
  }

  async findByDatasetAndRun(datasetId: string, experimentalRunId: string): Promise<Result[]> {
    const { data, error } = await this.supabase.rpc('get_results_for_dataset_run', {
      p_dataset_id: datasetId,
      p_run_id: experimentalRunId
    });
    if (error) throw new Error(`Failed to fetch results: ${error.message}`);
    return (data || []).map(this.mapToResult);
  }
  
  async findBestResultsForDataset(datasetId: string): Promise<Result[]> {
    const { data, error } = await this.supabase.rpc('get_best_results_for_dataset', {
      p_dataset_id: datasetId,
    });
    if (error) throw new Error(`Failed to fetch best results for dataset: ${error.message}`);
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

