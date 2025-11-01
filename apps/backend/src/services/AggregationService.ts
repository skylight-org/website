import type { AggregatedRanking, DatasetRanking, Baseline, LLM, NumericRange } from '@sky-light/shared-types';
import type { IDatasetRepository } from '../repositories/interfaces/IDatasetRepository';
import { RankingService } from './RankingService';

export class AggregationService {
  constructor(
    private datasetRepository: IDatasetRepository,
    private rankingService: RankingService
  ) {}

  /**
   * Calculate overall ranking by averaging ranks across all datasets
   * This is the key aggregation strategy for the leaderboard
   */
  async calculateOverallRanking(
    experimentalRunId: string,
    benchmarkId?: string,
    filters?: {
      targetSparsity?: NumericRange;
      targetAuxMemory?: NumericRange;
    }
  ): Promise<AggregatedRanking[]> {
    // Get all datasets (optionally filtered by benchmark)
    let datasets = await this.datasetRepository.findAll();
    
    if (benchmarkId) {
      datasets = datasets.filter(d => d.benchmarkId === benchmarkId);
    }

    if (datasets.length === 0) {
      return [];
    }

    // Calculate ranking for each dataset
    const datasetRankings = await Promise.all(
      datasets.map(d => this.rankingService.calculateDatasetRanking(d.id, experimentalRunId, filters))
    );

    // Group rankings by baseline+llm combination
    const rankingsByBaselineLLM = new Map<string, {
      baseline: Baseline;
      llm: LLM;
      datasetRanks: Map<string, number>;
      datasetScores: Map<string, number>;
      ranks: number[];
    }>();

    datasetRankings.forEach((rankings, datasetIdx) => {
      const dataset = datasets[datasetIdx];
      
      rankings.forEach(ranking => {
        const key = `${ranking.baseline.id}-${ranking.llm.id}`;
        
        if (!rankingsByBaselineLLM.has(key)) {
          rankingsByBaselineLLM.set(key, {
            baseline: ranking.baseline,
            llm: ranking.llm,
            datasetRanks: new Map(),
            datasetScores: new Map(),
            ranks: [],
          });
        }

        const entry = rankingsByBaselineLLM.get(key)!;
        entry.datasetRanks.set(dataset.id, ranking.rank);
        entry.datasetScores.set(dataset.id, ranking.score);
        entry.ranks.push(ranking.rank);
      });
    });

    // Calculate average rank and create aggregated rankings
    const aggregated: Array<AggregatedRanking & { averageRank: number }> = [];

    rankingsByBaselineLLM.forEach((data) => {
      const averageRank = data.ranks.reduce((sum, r) => sum + r, 0) / data.ranks.length;
      const overallScore = Array.from(data.datasetScores.values()).reduce((sum, s) => sum + s, 0) / data.datasetScores.size;
      
      aggregated.push({
        rank: 0, // Will be assigned after sorting
        baseline: data.baseline,
        llm: data.llm,
        averageRank,
        overallScore,
        datasetRanks: Object.fromEntries(data.datasetRanks),
        datasetScores: Object.fromEntries(data.datasetScores),
        numDatasets: data.ranks.length,
        bestDatasetRank: Math.min(...data.ranks),
        worstDatasetRank: Math.max(...data.ranks),
      });
    });

    // Sort by average rank (ascending - lower rank is better)
    aggregated.sort((a, b) => a.averageRank - b.averageRank);

    // Assign overall ranks (handle ties)
    let currentRank = 1;
    let previousAvgRank: number | null = null;

    aggregated.forEach((entry, index) => {
      // If average rank is different from previous, update rank
      if (previousAvgRank !== null && Math.abs(entry.averageRank - previousAvgRank) > 0.001) {
        currentRank = index + 1;
      }

      entry.rank = currentRank;
      previousAvgRank = entry.averageRank;
    });

    return aggregated;
  }

  /**
   * Calculate aggregated ranking for a specific LLM
   */
  async calculateOverallRankingByLLM(
    llmId: string,
    experimentalRunId: string,
    filters?: {
      targetSparsity?: NumericRange;
      targetAuxMemory?: NumericRange;
    }
  ): Promise<AggregatedRanking[]> {
    const datasets = await this.datasetRepository.findAll();

    if (datasets.length === 0) {
      return [];
    }

    // Calculate ranking for each dataset with filters
    const datasetRankings = await Promise.all(
      datasets.map(d => this.rankingService.calculateDatasetRanking(d.id, experimentalRunId, {
        ...filters,
        llmId, // Add LLM filter
      }))
    );

    // Filter rankings to only include specified LLM
    const filteredRankings = datasetRankings.map(rankings => 
      rankings.filter(r => r.llm.id === llmId)
    );

    // Group rankings by baseline
    const rankingsByBaseline = new Map<string, {
      baseline: Baseline;
      llm: LLM;
      datasetRanks: Map<string, number>;
      datasetScores: Map<string, number>;
      ranks: number[];
    }>();

    filteredRankings.forEach((rankings, datasetIdx) => {
      const dataset = datasets[datasetIdx];
      
      rankings.forEach(ranking => {
        const key = ranking.baseline.id;
        
        if (!rankingsByBaseline.has(key)) {
          rankingsByBaseline.set(key, {
            baseline: ranking.baseline,
            llm: ranking.llm,
            datasetRanks: new Map(),
            datasetScores: new Map(),
            ranks: [],
          });
        }

        const entry = rankingsByBaseline.get(key)!;
        entry.datasetRanks.set(dataset.id, ranking.rank);
        entry.datasetScores.set(dataset.id, ranking.score);
        entry.ranks.push(ranking.rank);
      });
    });

    // Calculate average rank and create aggregated rankings
    const aggregated: Array<AggregatedRanking & { averageRank: number }> = [];

    rankingsByBaseline.forEach((data) => {
      const averageRank = data.ranks.reduce((sum, r) => sum + r, 0) / data.ranks.length;
      const overallScore = Array.from(data.datasetScores.values()).reduce((sum, s) => sum + s, 0) / data.datasetScores.size;
      
      aggregated.push({
        rank: 0,
        baseline: data.baseline,
        llm: data.llm,
        averageRank,
        overallScore,
        datasetRanks: Object.fromEntries(data.datasetRanks),
        datasetScores: Object.fromEntries(data.datasetScores),
        numDatasets: data.ranks.length,
        bestDatasetRank: Math.min(...data.ranks),
        worstDatasetRank: Math.max(...data.ranks),
      });
    });

    // Sort and assign ranks
    aggregated.sort((a, b) => a.averageRank - b.averageRank);

    let currentRank = 1;
    let previousAvgRank: number | null = null;

    aggregated.forEach((entry, index) => {
      if (previousAvgRank !== null && Math.abs(entry.averageRank - previousAvgRank) > 0.001) {
        currentRank = index + 1;
      }

      entry.rank = currentRank;
      previousAvgRank = entry.averageRank;
    });

    return aggregated;
  }
}
