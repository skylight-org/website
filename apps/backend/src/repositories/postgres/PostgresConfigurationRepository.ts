import { SupabaseClient } from '@supabase/supabase-js';
import { IConfigurationRepository } from '../interfaces/IConfigurationRepository';
import { Configuration } from '../../models/Configuration';

/**
 * PostgreSQL implementation of ConfigurationRepository using Supabase
 */
export class PostgresConfigurationRepository implements IConfigurationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Configuration[]> {
    const { data, error } = await this.supabase
      .from('configurations')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch configurations: ${error.message}`);
    }

    return (data || []).map(this.mapToConfiguration);
  }

  async findById(id: string): Promise<Configuration | null> {
    const { data, error } = await this.supabase
      .from('configurations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch configuration: ${error.message}`);
    }

    return data ? this.mapToConfiguration(data) : null;
  }

  async findByDatasetId(datasetId: string): Promise<Configuration[]> {
    const { data, error } = await this.supabase
      .from('configurations')
      .select('*')
      .eq('dataset_id', datasetId);

    if (error) {
      throw new Error(`Failed to fetch configurations: ${error.message}`);
    }

    return (data || []).map(this.mapToConfiguration);
  }

  async findByBaselineId(baselineId: string): Promise<Configuration[]> {
    const { data, error } = await this.supabase
      .from('configurations')
      .select('*')
      .eq('baseline_id', baselineId);

    if (error) {
      throw new Error(`Failed to fetch configurations: ${error.message}`);
    }

    return (data || []).map(this.mapToConfiguration);
  }

  async findByLLMId(llmId: string): Promise<Configuration[]> {
    const { data, error } = await this.supabase
      .from('configurations')
      .select('*')
      .eq('llm_id', llmId);

    if (error) {
      throw new Error(`Failed to fetch configurations: ${error.message}`);
    }

    return (data || []).map(this.mapToConfiguration);
  }

  async getUniqueSparsityValues(): Promise<number[]> {
    const { data, error } = await this.supabase
      .from('configurations')
      .select('target_sparsity')
      .not('target_sparsity', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch sparsity values: ${error.message}`);
    }

    // Extract unique values, round to 1 decimal place, and sort
    const uniqueValues = [...new Set(
      (data || [])
        .map(row => row.target_sparsity)
        .filter((val): val is number => val !== null && val !== undefined)
        .map(val => parseFloat(val.toString()))
        .map(val => Math.round(val * 10) / 10) // Round to 1 decimal place
    )];

    return uniqueValues.sort((a, b) => a - b);
  }

  async getUniqueAuxMemoryValues(): Promise<number[]> {
    const { data, error } = await this.supabase
      .from('configurations')
      .select('target_aux_memory')
      .not('target_aux_memory', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch aux memory values: ${error.message}`);
    }

    // Extract unique values and sort
    const uniqueValues = [...new Set(
      (data || [])
        .map(row => row.target_aux_memory)
        .filter((val): val is number => val !== null && val !== undefined)
    )];

    return uniqueValues.sort((a, b) => a - b);
  }

  /**
   * Map database row to Configuration model
   */
  private mapToConfiguration(row: any): Configuration {
    return {
      id: row.id,
      baselineId: row.baseline_id,
      datasetId: row.dataset_id,
      llmId: row.llm_id,
      targetSparsity: row.target_sparsity ? parseFloat(row.target_sparsity) : undefined,
      targetAuxMemory: row.target_aux_memory,
      additionalParams: row.additional_params,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

