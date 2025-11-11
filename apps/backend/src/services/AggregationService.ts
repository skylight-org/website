import type { AggregatedRanking, DatasetRanking, Baseline, LLM, NumericRange, Configuration } from '@sky-light/shared-types';
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
    benchmarkId?: string,
    filters?: {
      targetDensity?: NumericRange;
      targetAuxMemory?: NumericRange;
      llmId?: string;
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
    const totalNumDatasets = datasets.length;

    // Calculate ranking for each dataset
    const datasetRankings = await Promise.all(
      datasets.map(d => this.rankingService.calculateDatasetRanking(d.id, filters))
    );

    // Group rankings by baseline+llm+sparsity+aux_memory combination
    const rankingsByConfig = new Map<string, {
      baseline: Baseline;
      llm: LLM;
      targetSparsity?: number;
      targetAuxMemory?: number;
      datasetRanks: Map<string, number>;
      datasetScores: Map<string, number>;
      datasetDetails: Map<string, { sparsity?: number; auxMemory?: number; localError?: number; configuration: Configuration }>;
      ranks: number[];
      localErrorValues: (number | undefined)[];
      sparsityValues: (number | undefined)[];
    }>();

    datasetRankings.forEach((rankings, datasetIdx) => {
      const dataset = datasets[datasetIdx];
      
      rankings.forEach(ranking => {
        const key = `${ranking.baseline.id}-${ranking.llm.id}-${ranking.targetSparsity ?? 'N/A'}-${ranking.targetAuxMemory ?? 'N/A'}`;
        
        if (!rankingsByConfig.has(key)) {
          rankingsByConfig.set(key, {
            baseline: ranking.baseline,
            llm: ranking.llm,
            targetSparsity: ranking.targetSparsity,
            targetAuxMemory: ranking.targetAuxMemory,
            datasetRanks: new Map(),
            datasetScores: new Map(),
            datasetDetails: new Map(),
            ranks: [],
            localErrorValues: [],
            sparsityValues: [],
          });
        }

        const entry = rankingsByConfig.get(key)!;
        entry.datasetRanks.set(dataset.id, ranking.rank);
        entry.datasetScores.set(dataset.id, ranking.score);
        entry.datasetDetails.set(dataset.id, {
          sparsity: ranking.targetSparsity,
          auxMemory: ranking.targetAuxMemory,
          localError: ranking.metricValues?.average_local_error,
          configuration: ranking.configuration,
        });
        entry.ranks.push(ranking.rank);
        // Debug: Log first few rankings to see metricValues
        if (datasetIdx === 0 && rankings.indexOf(ranking) === 0) {
          console.log('DEBUG AggregationService: First dataset, first ranking');
          console.log('  - Full ranking object:', JSON.stringify(ranking, null, 2));
          console.log('  - metricValues:', ranking.metricValues);
          console.log('  - Has average_local_error?', 'average_local_error' in (ranking.metricValues || {}));
          console.log('  - average_local_error value:', ranking.metricValues?.average_local_error);
        }
        if (ranking.metricValues?.average_local_error !== undefined) {
          entry.localErrorValues.push(ranking.metricValues.average_local_error);
        }
        if (ranking.targetSparsity !== undefined) {
          entry.sparsityValues.push(ranking.targetSparsity);
        }
      });
    });

    // Calculate average rank and create aggregated rankings
    const aggregated: Array<AggregatedRanking & { averageRank: number }> = [];

    rankingsByConfig.forEach((data) => {
      const averageRank = data.ranks.reduce((sum, r) => sum + r, 0) / data.ranks.length;
      const overallScore = Array.from(data.datasetScores.values()).reduce((sum, s) => sum + s, 0) / data.datasetScores.size;
      
      const avgLocalError = data.localErrorValues.length > 0
        ? data.localErrorValues.filter((v): v is number => v !== undefined).reduce((sum, e) => sum + e, 0) / data.localErrorValues.length
        : undefined;
      
      const avgTargetSparsity = data.sparsityValues.length > 0
        ? data.sparsityValues.filter((v): v is number => v !== undefined).reduce((sum, s) => sum + s, 0) / data.sparsityValues.length
        : undefined;

      aggregated.push({
        rank: 0, // Will be assigned after sorting
        baseline: data.baseline,
        llm: data.llm,
        averageRank,
        overallScore,
        datasetRanks: Object.fromEntries(data.datasetRanks),
        datasetScores: Object.fromEntries(data.datasetScores),
        datasetDetails: Object.fromEntries(data.datasetDetails),
        numDatasets: data.ranks.length,
        totalNumDatasets,
        bestDatasetRank: Math.min(...data.ranks),
        worstDatasetRank: Math.max(...data.ranks),
        targetSparsity: data.targetSparsity,
        targetAuxMemory: data.targetAuxMemory,
        avgLocalError,
        avgTargetSparsity,
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
}
