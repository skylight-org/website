import { SupabaseClient } from '@supabase/supabase-js';
import { IExperimentalRunRepository } from '../interfaces/IExperimentalRunRepository';
import { ExperimentalRun } from '../../models/ExperimentalRun';

/**
 * PostgreSQL implementation of ExperimentalRunRepository using Supabase
 */
export class PostgresExperimentalRunRepository implements IExperimentalRunRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<ExperimentalRun[]> {
    const { data, error } = await this.supabase
      .from('experimental_runs')
      .select('*')
      .order('run_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch experimental runs: ${error.message}`);
    }

    return (data || []).map(this.mapToExperimentalRun);
  }

  async findById(id: string): Promise<ExperimentalRun | undefined> {
    const { data, error } = await this.supabase
      .from('experimental_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw new Error(`Failed to fetch experimental run: ${error.message}`);
    }

    return data ? this.mapToExperimentalRun(data) : undefined;
  }

  async findByStatus(status: 'pending' | 'running' | 'completed' | 'failed'): Promise<ExperimentalRun[]> {
    const { data, error } = await this.supabase
      .from('experimental_runs')
      .select('*')
      .eq('status', status)
      .order('run_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch experimental runs: ${error.message}`);
    }

    return (data || []).map(this.mapToExperimentalRun);
  }

  async findLatestCompleted(): Promise<ExperimentalRun | undefined> {
    const { data, error } = await this.supabase
      .from('experimental_runs')
      .select('*')
      .eq('status', 'completed')
      .order('run_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw new Error(`Failed to fetch latest experimental run: ${error.message}`);
    }

    return data ? this.mapToExperimentalRun(data) : undefined;
  }

  /**
   * Map database row to ExperimentalRun model
   */
  private mapToExperimentalRun(row: any): ExperimentalRun {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      runDate: new Date(row.run_date),
      status: row.status as 'pending' | 'running' | 'completed' | 'failed',
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
    };
  }
}

