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
    filters?: {
      targetSparsity?: NumericRange;
      llmId?: string;
    }
  ): Promise<DatasetRanking[]> {
    const rankings = await this.rankingService.calculateDatasetRanking(datasetId, filters);
    return rankings;
  }

  /**
   * Get overall leaderboard (aggregated across all datasets)
   */
  async getOverallLeaderboard(
    benchmarkId?: string,
    filters?: {
      targetDensity?: NumericRange;
      llmId?: string;
    }
  ): Promise<AggregatedRanking[]> {
    return this.aggregationService.calculateOverallRanking(benchmarkId, filters);
  }

  async getPlotData(filters?: {
    targetSparsity?: NumericRange;
    llmId?: string;
  }): Promise<DatasetRanking[]> {
    const datasets = await this.datasetRepository.findAll();
    
    if (datasets.length === 0) {
      return [];
    }

    const allRankings = await Promise.all(
      datasets.map(d => this.rankingService.calculateDatasetRanking(d.id, filters))
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
      resultCount,
      latestRun
    ] = await Promise.all([
      this.baselineRepository.findAll(),
      this.benchmarkRepository.findAll(),
      this.datasetRepository.findAll(),
      this.llmRepository.findAll(),
      this.configurationRepository.findAll(),
      this.resultRepository.countAll(),
      this.experimentalRunRepository.findLatestCompleted(),
    ]);

    return {
      totalBaselines: baselines.length,
      totalBenchmarks: benchmarks.length,
      totalDatasets: datasets.length,
      totalLLMs: llms.length,
      totalConfigurations: configurations.length,
      totalResults: resultCount,
      lastUpdated: latestRun?.runDate || new Date(),
    };
  }

  private async getLatestRunId(): Promise<string | null> {
    const latestRun = await this.experimentalRunRepository.findLatestCompleted();
    return latestRun?.id || null;
  }

  /**
   * Get available filter values for sparsity
   */
  async getAvailableSparsityValues(): Promise<number[]> {
    return this.configurationRepository.getUniqueSparsityValues();
  }
}
