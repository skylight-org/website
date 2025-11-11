import type { DatasetRanking, AggregatedRanking, OverviewStats, NumericRange } from '@sky-light/shared-types';
import type { IConfigurationRepository } from '../repositories/interfaces/IConfigurationRepository';
import type { IDatasetRepository } from '../repositories/interfaces/IDatasetRepository';
import type { IBenchmarkRepository } from '../repositories/interfaces/IBenchmarkRepository';
import type { IBaselineRepository } from '../repositories/interfaces/IBaselineRepository';
import type { ILLMRepository } from '../repositories/interfaces/ILLMRepository';
import type { IResultRepository } from '../repositories/interfaces/IResultRepository';
import type { IExperimentalRunRepository } from '../repositories/interfaces/IExperimentalRunRepository';
import { RankingService } from './RankingService';
import { AggregationService } from './AggregationService';

export class LeaderboardService {
  constructor(
    private configurationRepository: IConfigurationRepository,
    private datasetRepository: IDatasetRepository,
    private benchmarkRepository: IBenchmarkRepository,
    private baselineRepository: IBaselineRepository,
    private llmRepository: ILLMRepository,
    private resultRepository: IResultRepository,
    private experimentalRunRepository: IExperimentalRunRepository,
    private rankingService: RankingService,
    private aggregationService: AggregationService
  ) {}

  /**
   * Get leaderboard for a specific dataset
   */
  async getDatasetLeaderboard(
    datasetId: string,
    experimentalRunId?: string,
    filters?: {
      targetSparsity?: NumericRange;
      targetAuxMemory?: NumericRange;
      llmId?: string;
    }
  ): Promise<DatasetRanking[]> {
    // Use latest completed run if not specified
    const runId = experimentalRunId || await this.getLatestRunId();
    
    const rankings = await this.rankingService.calculateDatasetRanking(datasetId, runId, filters);
    return rankings;
  }

  /**
   * Get overall leaderboard (aggregated across all datasets)
   */
  async getOverallLeaderboard(
    experimentalRunId?: string,
    benchmarkId?: string,
    llmId?: string,
    filters?: {
      targetSparsity?: NumericRange;
      targetAuxMemory?: NumericRange;
    }
  ): Promise<AggregatedRanking[]> {
    // Use latest completed run if not specified
    const runId = experimentalRunId || await this.getLatestRunId();
    
    if (llmId) {
      return this.aggregationService.calculateOverallRankingByLLM(llmId, runId, filters);
    }
    
    return this.aggregationService.calculateOverallRanking(runId, benchmarkId, filters);
  }

  async getPlotData(filters?: {
    targetSparsity?: NumericRange;
    targetAuxMemory?: NumericRange;
  }): Promise<DatasetRanking[]> {
    const runId = await this.getLatestRunId();
    const datasets = await this.datasetRepository.findAll();
    
    if (datasets.length === 0) {
      return [];
    }

    const allRankings = await Promise.all(
      datasets.map(d => this.rankingService.calculateDatasetRanking(d.id, runId, filters))
    );

    return allRankings.flat();
  }

  /**
   * Get overview statistics for the leaderboard
   */
  async getOverviewStats(): Promise<OverviewStats> {
    const [
      baselines,
      benchmarks,
      datasets,
      llms,
      configurations,
      results,
      latestRun
    ] = await Promise.all([
      this.baselineRepository.findAll(),
      this.benchmarkRepository.findAll(),
      this.datasetRepository.findAll(),
      this.llmRepository.findAll(),
      this.configurationRepository.findAll(),
      this.resultRepository.findAll(),
      this.experimentalRunRepository.findLatestCompleted(),
    ]);

    return {
      totalBaselines: baselines.length,
      totalBenchmarks: benchmarks.length,
      totalDatasets: datasets.length,
      totalLLMs: llms.length,
      totalConfigurations: configurations.length,
      totalResults: results.length,
      lastUpdated: latestRun?.runDate || new Date(),
    };
  }

  /**
   * Get available filter values for sparsity
   */
  async getAvailableSparsityValues(): Promise<number[]> {
    return this.configurationRepository.getUniqueSparsityValues();
  }

  /**
   * Get available filter values for auxiliary memory
   */
  async getAvailableAuxMemoryValues(): Promise<number[]> {
    return this.configurationRepository.getUniqueAuxMemoryValues();
  }

  /**
   * Get latest completed experimental run ID
   */
  private async getLatestRunId(): Promise<string> {
    const latestRun = await this.experimentalRunRepository.findLatestCompleted();
    
    if (!latestRun) {
      throw new Error('No completed experimental runs found');
    }
    
    return latestRun.id;
  }
}
