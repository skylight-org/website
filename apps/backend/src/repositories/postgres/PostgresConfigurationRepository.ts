import { SupabaseClient } from '@supabase/supabase-js';
import { IConfigurationRepository, ConfigurationFilters } from '../interfaces/IConfigurationRepository';
import { Configuration } from '../../models/Configuration';

/**
 * PostgreSQL implementation of ConfigurationRepository using Supabase
 */
export class PostgresConfigurationRepository implements IConfigurationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(filters?: ConfigurationFilters): Promise<Configuration[]> {
    let query = this.supabase
      .from('configurations')
      .select('*');

    // Apply filters if provided
    if (filters) {
      if (filters.baselineId) {
        query = query.eq('baseline_id', filters.baselineId);
      }
      if (filters.datasetId) {
        query = query.eq('dataset_id', filters.datasetId);
      }
      if (filters.llmId) {
        query = query.eq('llm_id', filters.llmId);
      }
      if (filters.targetSparsity) {
        if (filters.targetSparsity.min !== undefined) {
          query = query.gte('target_sparsity', filters.targetSparsity.min);
        }
        if (filters.targetSparsity.max !== undefined) {
          query = query.lte('target_sparsity', filters.targetSparsity.max);
        }
      }
      if (filters.targetAuxMemory) {
        if (filters.targetAuxMemory.min !== undefined) {
          query = query.gte('target_aux_memory', filters.targetAuxMemory.min);
        }
        if (filters.targetAuxMemory.max !== undefined) {
          query = query.lte('target_aux_memory', filters.targetAuxMemory.max);
        }
      }
    }

    const { data, error } = await query;

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

  async findByDatasetId(datasetId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    let query = this.supabase
      .from('configurations')
      .select('*')
      .eq('dataset_id', datasetId);

    // Apply filters
    if (filters) {
      if (filters.llmId) {
        query = query.eq('llm_id', filters.llmId);
      }
      if (filters.baselineId) {
        query = query.eq('baseline_id', filters.baselineId);
      }
      if (filters.targetSparsity) {
        if (filters.targetSparsity.min !== undefined) {
          query = query.gte('target_sparsity', filters.targetSparsity.min);
        }
        if (filters.targetSparsity.max !== undefined) {
          query = query.lte('target_sparsity', filters.targetSparsity.max);
        }
      }
      if (filters.targetAuxMemory) {
        if (filters.targetAuxMemory.min !== undefined) {
          query = query.gte('target_aux_memory', filters.targetAuxMemory.min);
        }
        if (filters.targetAuxMemory.max !== undefined) {
          query = query.lte('target_aux_memory', filters.targetAuxMemory.max);
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch configurations: ${error.message}`);
    }

    return (data || []).map(this.mapToConfiguration);
  }

  async findByBaselineId(baselineId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    let query = this.supabase
      .from('configurations')
      .select('*')
      .eq('baseline_id', baselineId);

    // Apply additional filters if provided
    if (filters) {
      if (filters.datasetId) {
        query = query.eq('dataset_id', filters.datasetId);
      }
      if (filters.llmId) {
        query = query.eq('llm_id', filters.llmId);
      }
      if (filters.targetSparsity) {
        if (filters.targetSparsity.min !== undefined) {
          query = query.gte('target_sparsity', filters.targetSparsity.min);
        }
        if (filters.targetSparsity.max !== undefined) {
          query = query.lte('target_sparsity', filters.targetSparsity.max);
        }
      }
      if (filters.targetAuxMemory) {
        if (filters.targetAuxMemory.min !== undefined) {
          query = query.gte('target_aux_memory', filters.targetAuxMemory.min);
        }
        if (filters.targetAuxMemory.max !== undefined) {
          query = query.lte('target_aux_memory', filters.targetAuxMemory.max);
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch configurations: ${error.message}`);
    }

    return (data || []).map(this.mapToConfiguration);
  }

  async findByLLMId(llmId: string, filters?: ConfigurationFilters): Promise<Configuration[]> {
    let query = this.supabase
      .from('configurations')
      .select('*')
      .eq('llm_id', llmId);

    // Apply additional filters if provided
    if (filters) {
      if (filters.baselineId) {
        query = query.eq('baseline_id', filters.baselineId);
      }
      if (filters.datasetId) {
        query = query.eq('dataset_id', filters.datasetId);
      }
      if (filters.targetSparsity) {
        if (filters.targetSparsity.min !== undefined) {
          query = query.gte('target_sparsity', filters.targetSparsity.min);
        }
        if (filters.targetSparsity.max !== undefined) {
          query = query.lte('target_sparsity', filters.targetSparsity.max);
        }
      }
      if (filters.targetAuxMemory) {
        if (filters.targetAuxMemory.min !== undefined) {
          query = query.gte('target_aux_memory', filters.targetAuxMemory.min);
        }
        if (filters.targetAuxMemory.max !== undefined) {
          query = query.lte('target_aux_memory', filters.targetAuxMemory.max);
        }
      }
    }

    const { data, error } = await query;

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
    const config = {
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
    
    return config;
  }
}

