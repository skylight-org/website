import { SupabaseClient } from '@supabase/supabase-js';
import { IConfigurationRepository, ConfigurationFilters } from '../interfaces/IConfigurationRepository';
import { Configuration } from '../../models/Configuration';
import type { NumericRange } from '@sky-light/shared-types';

export class PostgresConfigurationRepository implements IConfigurationRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  private get baseQuery() {
    return this.supabase.from('configurations').select('*');
  }

  async findAll(filters?: ConfigurationFilters): Promise<Configuration[]> {
    let query = this.baseQuery;
    
    if (filters?.baselineId) {
      query = query.eq('baseline_id', filters.baselineId);
    }
    if (filters?.datasetId) {
      query = query.eq('dataset_id', filters.datasetId);
    }
    if (filters?.llmId) {
      query = query.eq('llm_id', filters.llmId);
    }
    if (filters?.targetSparsity) {
      if (filters.targetSparsity.min !== undefined) {
        query = query.gte('target_sparsity', filters.targetSparsity.min);
      }
      if (filters.targetSparsity.max !== undefined) {
        query = query.lte('target_sparsity', filters.targetSparsity.max);
      }
    }
    if (filters?.targetAuxMemory) {
      if (filters.targetAuxMemory.min !== undefined) {
        query = query.gte('target_aux_memory', filters.targetAuxMemory.min);
      }
      if (filters.targetAuxMemory.max !== undefined) {
        query = query.lte('target_aux_memory', filters.targetAuxMemory.max);
      }
    }
    
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch configurations: ${error.message}`);
    return (data || []).map(this.mapToConfiguration);
  }

  async findById(id: string): Promise<Configuration | null> {
    const { data, error } = await this.baseQuery.eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch configuration: ${error.message}`);
    }
    return data ? this.mapToConfiguration(data) : null;
  }

  async findByDatasetId(datasetId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    return this.findAll({ ...filters, datasetId });
  }

  async findByBaselineId(baselineId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    return this.findAll({ ...filters, baselineId });
  }

  async findByLLMId(llmId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    return this.findAll({ ...filters, llmId });
  }

  async getUniqueSparsityValues(): Promise<number[]> {
    const { data, error } = await this.supabase.rpc('get_unique_target_sparsity_values');
    if (error) throw new Error(`Failed to fetch unique sparsity values: ${error.message}`);
    return data || [];
  }

  async getUniqueAuxMemoryValues(): Promise<number[]> {
    const { data, error } = await this.supabase.rpc('get_unique_target_aux_memory_values');
    if (error) throw new Error(`Failed to fetch unique aux memory values: ${error.message}`);
    return data || [];
  }
  
  private mapToConfiguration(row: any): Configuration {
    return {
      id: row.id,
      baselineId: row.baseline_id,
      datasetId: row.dataset_id,
      llmId: row.llm_id,
      targetSparsity: row.target_sparsity,
      targetAuxMemory: row.target_aux_memory,
      additionalParams: row.additional_params,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

