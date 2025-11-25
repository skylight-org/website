import type { Baseline } from '@sky-light/shared-types';
import type { IBaselineRepository } from '../repositories/interfaces/IBaselineRepository';

/**
 * Service for managing baselines with filtering capabilities
 * All baseline fetching should go through this service
 */
export class BaselineService {
  // Configuration for which baselines to expose to the frontend
  // Can be set via environment variable: EXPOSED_BASELINES="baseline1,baseline2,baseline3"
  private exposedBaselines: Set<string>;

  constructor(private baselineRepository: IBaselineRepository) {
    // Initialize exposed baselines from environment variable
    const exposedList = (process.env.EXPOSED_BASELINES || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    this.exposedBaselines = new Set(exposedList);
    
    if (this.exposedBaselines.size > 0) {
      console.log(`📋 BaselineService: Filtering to expose only ${this.exposedBaselines.size} baselines:`, Array.from(this.exposedBaselines));
    } else {
      console.log('📋 BaselineService: Exposing all baselines (no filter configured)');
    }
  }

  /**
   * Get all baselines (with optional filtering based on exposed list)
   * This is the single source of truth for fetching baselines
   */
  async getAll(): Promise<Baseline[]> {
    const allBaselines = await this.baselineRepository.findAll();
    
    // If no filter is configured, return all baselines
    if (this.exposedBaselines.size === 0) {
      return allBaselines;
    }
    
    // Filter to only exposed baselines
    return allBaselines.filter(baseline => this.exposedBaselines.has(baseline.name));
  }

  /**
   * Get a single baseline by ID
   */
  async getById(id: string): Promise<Baseline | null> {
    const baseline = await this.baselineRepository.findById(id);
    
    if (!baseline) {
      return null;
    }
    
    // If filtering is enabled and this baseline is not exposed, return null
    if (this.exposedBaselines.size > 0 && !this.exposedBaselines.has(baseline.name)) {
      return null;
    }
    
    return baseline;
  }

  /**
   * Check if a baseline should be exposed
   * Useful for filtering in other services
   */
  isBaselineExposed(baseline: Baseline): boolean {
    if (this.exposedBaselines.size === 0) {
      return true; // All baselines are exposed if no filter
    }
    return this.exposedBaselines.has(baseline.name);
  }

  /**
   * Get the set of exposed baseline names
   */
  getExposedBaselineNames(): Set<string> {
    return new Set(this.exposedBaselines);
  }
}


