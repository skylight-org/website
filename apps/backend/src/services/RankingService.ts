import type { DatasetRanking, Metric, Baseline, LLM, Dataset, Configuration, Result, NumericRange, DatasetMetric } from '@sky-light/shared-types';
import type { ILLMRepository } from '../repositories/interfaces/ILLMRepository';
import type { IDatasetRepository } from '../repositories/interfaces/IDatasetRepository';
import type { IMetricRepository } from '../repositories/interfaces/IMetricRepository';
import type { IDatasetMetricRepository } from '../repositories/interfaces/IDatasetMetricRepository';
import type { IConfigurationRepository } from '../repositories/interfaces/IConfigurationRepository';
import type { IResultRepository } from '../repositories/interfaces/IResultRepository';
import type { BaselineService } from './BaselineService';

interface ConfigurationScore {
  configuration: Configuration;
  baseline: Baseline;
  llm: LLM;
  score: number;
  metricValues: Record<string, number>;
}

export class RankingService {
  constructor(
    private baselineService: BaselineService,
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
    filters?: {
      targetSparsity?: NumericRange;
      llmId?: string;
    }
  ): Promise<DatasetRanking[]> {
    // Fetch all data needed
    const [dataset, allMetrics, allBaselines, allLLMs, datasetMetrics] = await Promise.all([
      this.datasetRepository.findById(datasetId),
      this.metricRepository.findAll(),
      this.baselineService.getAll(),
      this.llmRepository.findAll(),
      this.datasetMetricRepository.findByDatasetId(datasetId),
    ]);

    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    // Step 1: Find configurations for the dataset
    const configurations = await this.configurationRepository.findByDatasetId(datasetId, filters);
    if (configurations.length === 0) {
      return [];
    }
    const configurationIds = configurations.map(c => c.id);

    // Step 2: Get all results for these configurations
    const allResults = await this.resultRepository.findByConfigurationIds(configurationIds);

    // Create lookup maps
    const metricsMap = new Map(allMetrics.map(m => [m.id, m]));
    const baselinesMap = new Map(allBaselines.map(b => [b.id, b]));
    const llmsMap = new Map(allLLMs.map(l => [l.id, l]));

    // Step 3: Find the best experimental run for each configuration
    // Selection criteria: 
    // 1. Lowest average_local_error
    // 2. If tied, lowest aux_memory
    // 3. If tied, best primary metric score
    
    // First, group results by configuration and experimental run
    const resultsByConfigAndRun = new Map<string, Map<string, Result[]>>();
    allResults.forEach(result => {
      const configId = result.configurationId;
      const runId = result.experimentalRunId || 'unknown';
      
      if (!resultsByConfigAndRun.has(configId)) {
        resultsByConfigAndRun.set(configId, new Map());
      }
      
      const runsMap = resultsByConfigAndRun.get(configId)!;
      if (!runsMap.has(runId)) {
        runsMap.set(runId, []);
      }
      
      runsMap.get(runId)!.push(result);
    });

    // Helper function to get metric value by name from a set of results
    const getMetricValue = (results: Result[], metricName: string): number | undefined => {
      for (const result of results) {
        const datasetMetric = datasetMetrics.find(dm => dm.id === result.datasetMetricId);
        if (!datasetMetric) continue;
        
        const metric = metricsMap.get(datasetMetric.metricId);
        if (metric && metric.name === metricName) {
          return result.value;
        }
      }
      return undefined;
    };

    // Select the best run for each configuration
    const bestResultsByConfig = new Map<string, Result[]>();
    
    resultsByConfigAndRun.forEach((runsMap, configId) => {
      let bestRunId: string | undefined;
      let bestRunResults: Result[] = [];
      let bestLocalError: number | undefined;
      let bestAuxMemory: number | undefined;
      let bestPrimaryScore: number | undefined;
      
      // Debug logging for configurations with multiple runs
      const shouldDebug = runsMap.size > 1 && bestResultsByConfig.size < 3;
      if (shouldDebug) {
        console.log(`\nDEBUG RankingService: Config ${configId} has ${runsMap.size} runs, comparing...`);
      }
      
      runsMap.forEach((runResults, runId) => {
        const localError = getMetricValue(runResults, 'average_local_error');
        const auxMemory = getMetricValue(runResults, 'aux_memory');
        
        // Get primary metric score
        const primaryDatasetMetric = datasetMetrics.find(dm => dm.isPrimary);
        const primaryScore = primaryDatasetMetric 
          ? getMetricValue(runResults, metricsMap.get(primaryDatasetMetric.metricId)?.name || '')
          : undefined;
        
        if (shouldDebug) {
          console.log(`  Run ${runId}: localError=${localError}, auxMemory=${auxMemory}, primaryScore=${primaryScore}`);
        }
        
        // First run, set as best
        if (!bestRunId) {
          bestRunId = runId;
          bestRunResults = runResults;
          bestLocalError = localError;
          bestAuxMemory = auxMemory;
          bestPrimaryScore = primaryScore;
          if (shouldDebug) {
            console.log(`    → Set as initial best`);
          }
          return;
        }
        
        // Compare: 1. Local error (lower is better)
        if (localError !== undefined && bestLocalError !== undefined) {
          if (localError < bestLocalError) {
            if (shouldDebug) {
              console.log(`    → NEW BEST: lower localError (${localError} < ${bestLocalError})`);
            }
            bestRunId = runId;
            bestRunResults = runResults;
            bestLocalError = localError;
            bestAuxMemory = auxMemory;
            bestPrimaryScore = primaryScore;
            return;
          } else if (localError > bestLocalError) {
            if (shouldDebug) {
              console.log(`    → Keep current best: higher localError (${localError} > ${bestLocalError})`);
            }
            return; // Keep current best
          }
          // If equal, fall through to aux_memory comparison
          if (shouldDebug) {
            console.log(`    → LocalError tied (${localError} == ${bestLocalError}), checking aux_memory...`);
          }
        } else if (localError !== undefined && bestLocalError === undefined) {
          // Prefer run with defined local error
          if (shouldDebug) {
            console.log(`    → NEW BEST: has localError (${localError}) vs undefined`);
          }
          bestRunId = runId;
          bestRunResults = runResults;
          bestLocalError = localError;
          bestAuxMemory = auxMemory;
          bestPrimaryScore = primaryScore;
          return;
        } else if (localError === undefined && bestLocalError !== undefined) {
          if (shouldDebug) {
            console.log(`    → Keep current best: has localError vs undefined`);
          }
          return; // Keep current best
        }
        
        // Local errors are equal or both undefined, compare aux_memory (lower is better)
        if (auxMemory !== undefined && bestAuxMemory !== undefined) {
          if (auxMemory < bestAuxMemory) {
            if (shouldDebug) {
              console.log(`    → NEW BEST: lower auxMemory (${auxMemory} < ${bestAuxMemory})`);
            }
            bestRunId = runId;
            bestRunResults = runResults;
            bestLocalError = localError;
            bestAuxMemory = auxMemory;
            bestPrimaryScore = primaryScore;
            return;
          } else if (auxMemory > bestAuxMemory) {
            if (shouldDebug) {
              console.log(`    → Keep current best: higher auxMemory (${auxMemory} > ${bestAuxMemory})`);
            }
            return; // Keep current best
          }
          // If equal, fall through to primary score comparison
          if (shouldDebug) {
            console.log(`    → AuxMemory tied (${auxMemory} == ${bestAuxMemory}), checking primary score...`);
          }
        } else if (auxMemory !== undefined && bestAuxMemory === undefined) {
          // Prefer run with defined aux_memory
          if (shouldDebug) {
            console.log(`    → NEW BEST: has auxMemory (${auxMemory}) vs undefined`);
          }
          bestRunId = runId;
          bestRunResults = runResults;
          bestLocalError = localError;
          bestAuxMemory = auxMemory;
          bestPrimaryScore = primaryScore;
          return;
        } else if (auxMemory === undefined && bestAuxMemory !== undefined) {
          if (shouldDebug) {
            console.log(`    → Keep current best: has auxMemory vs undefined`);
          }
          return; // Keep current best
        }
        
        // Both local_error and aux_memory are equal or undefined, compare primary score
        if (primaryScore !== undefined && bestPrimaryScore !== undefined) {
          const primaryMetric = primaryDatasetMetric ? metricsMap.get(primaryDatasetMetric.metricId) : undefined;
          if (primaryMetric) {
            const isCurrentBetter = primaryMetric.higherIsBetter 
              ? primaryScore > bestPrimaryScore 
              : primaryScore < bestPrimaryScore;
            
            if (isCurrentBetter) {
              if (shouldDebug) {
                console.log(`    → NEW BEST: better primaryScore (${primaryScore} vs ${bestPrimaryScore})`);
              }
              bestRunId = runId;
              bestRunResults = runResults;
              bestLocalError = localError;
              bestAuxMemory = auxMemory;
              bestPrimaryScore = primaryScore;
            } else if (shouldDebug) {
              console.log(`    → Keep current best: worse primaryScore (${primaryScore} vs ${bestPrimaryScore})`);
            }
          }
        }
        // If all metrics are equal or undefined, keep the first one (current best)
        if (shouldDebug && localError === bestLocalError && auxMemory === bestAuxMemory && primaryScore === bestPrimaryScore) {
          console.log(`    → Keep current best: all metrics equal`);
        }
      });
      
      if (bestRunResults.length > 0) {
        bestResultsByConfig.set(configId, bestRunResults);
        
        // Debug logging for configurations with multiple runs
        if (runsMap.size > 1 && bestResultsByConfig.size <= 3) {
          console.log(`  ✓ SELECTED: Run ${bestRunId}`);
          console.log(`    - Local error: ${bestLocalError}`);
          console.log(`    - Aux memory: ${bestAuxMemory}`);
          console.log(`    - Primary score: ${bestPrimaryScore}\n`);
        }
      }
    });

    // Calculate scores for each configuration using the run of the best result
    const configScores: ConfigurationScore[] = [];

    for (const config of configurations) {
      const configResults = bestResultsByConfig.get(config.id) || [];
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

      const rankingEntry = {
        rank: currentRank,
        dataset,
        baseline: configScore.baseline,
        llm: configScore.llm,
        configurationId: configScore.configuration.id,
        score: configScore.score,
        metricValues: configScore.metricValues,
        targetSparsity: configScore.configuration.targetSparsity,
        configuration: configScore.configuration,
      };
      
      // Debug: Log the first ranking to check metricValues
      if (rankings.length === 0) {
        console.log('DEBUG RankingService: First ranking entry');
        console.log('  - metricValues:', rankingEntry.metricValues);
        console.log('  - Has average_local_error?', 'average_local_error' in rankingEntry.metricValues);
      }
      
      rankings.push(rankingEntry);

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
    datasetMetrics: DatasetMetric[],
    metricsMap: Map<string, Metric>
  ): { score: number; metricValues: Record<string, number> } {
    const metricValues: Record<string, number> = {};
    
    // Create a map of datasetMetricId to datasetMetric for quick lookup
    const datasetMetricsMap = new Map<string, DatasetMetric>();
    datasetMetrics.forEach(dm => {
      datasetMetricsMap.set(dm.id, dm);
    });
    
    // Build metric values map
    results.forEach(result => {
      const datasetMetric = datasetMetricsMap.get(result.datasetMetricId);
      if (datasetMetric) {
        const metric = metricsMap.get(datasetMetric.metricId);
        if (metric) {
          metricValues[metric.name] = result.value;
        }
      }
    });

    // Find primary metric
    const primaryDatasetMetric = datasetMetrics.find(dm => dm.isPrimary);
    
    if (primaryDatasetMetric) {
      // Use primary metric as score
      const result = results.find(r => r.datasetMetricId === primaryDatasetMetric.id);
      const metric = metricsMap.get(primaryDatasetMetric.metricId);
      
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
      const datasetMetric = datasetMetricsMap.get(result.datasetMetricId);
      if (datasetMetric) {
        const metric = metricsMap.get(datasetMetric.metricId);
        
        if (metric) {
          const weight = datasetMetric.weight;
          // Normalize value based on metric direction
          const normalizedValue = metric.higherIsBetter 
            ? result.value 
            : 100 - result.value;
          
          weightedSum += normalizedValue * weight;
          totalWeight += weight;
        }
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
