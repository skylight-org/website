import type { DatasetRanking, Metric, Baseline, LLM, Dataset, Configuration, Result, NumericRange } from '@sky-light/shared-types';
import type { IBaselineRepository } from '../repositories/interfaces/IBaselineRepository';
import type { ILLMRepository } from '../repositories/interfaces/ILLMRepository';
import type { IDatasetRepository } from '../repositories/interfaces/IDatasetRepository';
import type { IMetricRepository } from '../repositories/interfaces/IMetricRepository';
import type { IDatasetMetricRepository } from '../repositories/interfaces/IDatasetMetricRepository';
import type { IConfigurationRepository } from '../repositories/interfaces/IConfigurationRepository';
import type { IResultRepository } from '../repositories/interfaces/IResultRepository';

interface ConfigurationScore {
  configuration: Configuration;
  baseline: Baseline;
  llm: LLM;
  score: number;
  metricValues: Record<string, number>;
}

export class RankingService {
  constructor(
    private baselineRepository: IBaselineRepository,
    private llmRepository: ILLMRepository,
    private datasetRepository: IDatasetRepository,
    private metricRepository: IMetricRepository,
    private datasetMetricRepository: IDatasetMetricRepository,
    private configurationRepository: IConfigurationRepository,
    private resultRepository: IResultRepository
  ) {}

  /**
   * Calculate ranking for a specific dataset
   * Fetches results, calculates weighted scores, and ranks configurations
   */
  async calculateDatasetRanking(
    datasetId: string,
    experimentalRunId: string,
    filters?: {
      targetSparsity?: NumericRange;
      targetAuxMemory?: NumericRange;
      llmId?: string;
    }
  ): Promise<DatasetRanking[]> {
    // Fetch all data needed
    const [dataset, configurations, results, datasetMetrics, allMetrics, allBaselines, allLLMs] = await Promise.all([
      this.datasetRepository.findById(datasetId),
      this.configurationRepository.findByDatasetId(datasetId, {
        targetSparsity: filters?.targetSparsity,
        targetAuxMemory: filters?.targetAuxMemory,
        llmId: filters?.llmId,
      }),
      this.resultRepository.findByDatasetAndRun(datasetId, experimentalRunId),
      this.datasetMetricRepository.findByDatasetId(datasetId),
      this.metricRepository.findAll(),
      this.baselineRepository.findAll(),
      this.llmRepository.findAll(),
    ]);

    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    // Create lookup maps
    const metricsMap = new Map(allMetrics.map(m => [m.id, m]));
    const baselinesMap = new Map(allBaselines.map(b => [b.id, b]));
    const llmsMap = new Map(allLLMs.map(l => [l.id, l]));

    // Group results by configuration
    const resultsByConfig = new Map<string, Result[]>();
    results.forEach(result => {
      if (!resultsByConfig.has(result.configurationId)) {
        resultsByConfig.set(result.configurationId, []);
      }
      resultsByConfig.get(result.configurationId)!.push(result);
    });

    // Calculate scores for each configuration
    const configScores: ConfigurationScore[] = [];

    for (const config of configurations) {
      const configResults = resultsByConfig.get(config.id) || [];
      if (configResults.length === 0) continue;

      const baseline = baselinesMap.get(config.baselineId);
      const llm = llmsMap.get(config.llmId);
      if (!baseline || !llm) continue;

      // Calculate weighted score
      const { score, metricValues } = this.calculateWeightedScore(
        configResults,
        datasetMetrics,
        metricsMap
      );

      configScores.push({
        configuration: config,
        baseline,
        llm,
        score,
        metricValues,
      });
    }

    // Sort by score (descending)
    configScores.sort((a, b) => b.score - a.score);

    // Assign ranks (handle ties with shared ranking)
    const rankings: DatasetRanking[] = [];
    let currentRank = 1;
    let previousScore: number | null = null;

    configScores.forEach((configScore, index) => {
      // If score is different from previous, update rank
      if (previousScore !== null && Math.abs(configScore.score - previousScore) > 0.001) {
        currentRank = index + 1;
      }

      rankings.push({
        rank: currentRank,
        dataset,
        baseline: configScore.baseline,
        llm: configScore.llm,
        configurationId: configScore.configuration.id,
        score: configScore.score,
        metricValues: configScore.metricValues,
      });

      previousScore = configScore.score;
    });

    return rankings;
  }

  /**
   * Calculate weighted score from results
   * Uses primary metric or weighted average of all metrics
   */
  private calculateWeightedScore(
    results: Result[],
    datasetMetrics: Array<{ metricId: string; weight: number; isPrimary: boolean }>,
    metricsMap: Map<string, Metric>
  ): { score: number; metricValues: Record<string, number> } {
    const metricValues: Record<string, number> = {};
    
    // Build metric values map
    results.forEach(result => {
      const metric = metricsMap.get(result.metricId);
      if (metric) {
        metricValues[metric.name] = result.value;
      }
    });

    // Find primary metric
    const primaryMetric = datasetMetrics.find(dm => dm.isPrimary);
    
    if (primaryMetric) {
      // Use primary metric as score
      const result = results.find(r => r.metricId === primaryMetric.metricId);
      const metric = metricsMap.get(primaryMetric.metricId);
      
      if (result && metric) {
        // Normalize score (if lower is better, invert it)
        const normalizedScore = metric.higherIsBetter 
          ? result.value 
          : 100 - result.value;
        
        return { score: normalizedScore, metricValues };
      }
    }

    // Calculate weighted average if no primary metric
    let totalWeight = 0;
    let weightedSum = 0;

    results.forEach(result => {
      const datasetMetric = datasetMetrics.find(dm => dm.metricId === result.metricId);
      const metric = metricsMap.get(result.metricId);
      
      if (datasetMetric && metric) {
        const weight = datasetMetric.weight;
        // Normalize value based on metric direction
        const normalizedValue = metric.higherIsBetter 
          ? result.value 
          : 100 - result.value;
        
        weightedSum += normalizedValue * weight;
        totalWeight += weight;
      }
    });

    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return { score, metricValues };
  }

  /**
   * Get primary metric for a dataset
   */
  private async getPrimaryMetric(datasetId: string): Promise<Metric | null> {
    const datasetMetrics = await this.datasetMetricRepository.findByDatasetId(datasetId);
    const primaryDM = datasetMetrics.find(dm => dm.isPrimary);
    
    if (primaryDM) {
      return await this.metricRepository.findById(primaryDM.metricId) || null;
    }
    
    return null;
  }
}
