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
    const totalNumDatasets = datasets.length;

    // Calculate ranking for each dataset
    const datasetRankings = await Promise.all(
      datasets.map(d => this.rankingService.calculateDatasetRanking(d.id, experimentalRunId, filters))
    );

    // Group rankings by baseline+llm+sparsity+aux_memory combination
    const rankingsByConfig = new Map<string, {
      baseline: Baseline;
      llm: LLM;
      targetSparsity?: number;
      targetAuxMemory?: number;
      datasetRanks: Map<string, number>;
      datasetScores: Map<string, number>;
      datasetDetails: Map<string, { sparsity?: number; auxMemory?: number; localError?: number; configuration?: any }>;
      ranks: number[];
      localErrorValues: (number | undefined)[];
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
    const totalNumDatasets = datasets.length;

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
      datasetDetails: Map<string, { sparsity?: number; auxMemory?: number; localError?: number; configuration?: any }>;
      ranks: number[];
      sparsityValues: (number | undefined)[];
      auxMemoryValues: (number | undefined)[];
      localErrorValues: (number | undefined)[];
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
            datasetDetails: new Map(),
            ranks: [],
            sparsityValues: [],
            auxMemoryValues: [],
            localErrorValues: [],
          });
        }

        const entry = rankingsByBaseline.get(key)!;
        entry.datasetRanks.set(dataset.id, ranking.rank);
        entry.datasetScores.set(dataset.id, ranking.score);
        entry.datasetDetails.set(dataset.id, {
          sparsity: ranking.targetSparsity,
          auxMemory: ranking.targetAuxMemory,
          localError: ranking.metricValues?.average_local_error,
          configuration: ranking.configuration,
        });
        entry.ranks.push(ranking.rank);
        entry.sparsityValues.push(ranking.targetSparsity);
        entry.auxMemoryValues.push(ranking.targetAuxMemory);
        if (ranking.metricValues?.average_local_error !== undefined) {
          entry.localErrorValues.push(ranking.metricValues.average_local_error);
        }
      });
    });

    // Calculate average rank and create aggregated rankings
    const aggregated: Array<AggregatedRanking & { averageRank: number }> = [];

    rankingsByBaseline.forEach((data) => {
      const averageRank = data.ranks.reduce((sum, r) => sum + r, 0) / data.ranks.length;
      const overallScore = Array.from(data.datasetScores.values()).reduce((sum, s) => sum + s, 0) / data.datasetScores.size;
      
      // Calculate average sparsity if any values are present
      const avgSparsity = data.sparsityValues.length > 0
        ? data.sparsityValues.filter((v): v is number => v !== undefined).reduce((sum, s) => sum + s, 0) / data.sparsityValues.length
        : undefined;
        
      const avgAuxMemory = data.auxMemoryValues.length > 0
        ? data.auxMemoryValues.filter((v): v is number => v !== undefined).reduce((sum, s) => sum + s, 0) / data.auxMemoryValues.length
        : undefined;
      
      // Calculate average local error if any values are present
      const avgLocalError = data.localErrorValues.length > 0
        ? data.localErrorValues.reduce((sum, e) => sum + e, 0) / data.localErrorValues.length
        : undefined;
      
      const aggregatedEntry = {
        rank: 0,
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
        avgSparsity,
        avgAuxMemory,
        avgLocalError,
      };
      
      // Debug: Log aggregated entry
      if (aggregated.length === 0) {
        console.log('DEBUG AggregationService calculateOverallRankingByLLM: First aggregated entry');
        console.log('  - localErrorValues array:', data.localErrorValues);
        console.log('  - localErrorValues length:', data.localErrorValues.length);
        console.log('  - avgLocalError calculated:', avgLocalError);
      }
      
      aggregated.push(aggregatedEntry);
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
