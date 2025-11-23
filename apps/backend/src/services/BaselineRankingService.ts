import type { BaselineRanking, Baseline, LLM, Configuration } from '@sky-light/shared-types';
import type { IBaselineRepository } from '../repositories/interfaces/IBaselineRepository';
import type { ILLMRepository } from '../repositories/interfaces/ILLMRepository';
import type { IDatasetRepository } from '../repositories/interfaces/IDatasetRepository';
import type { IConfigurationRepository } from '../repositories/interfaces/IConfigurationRepository';
import type { IResultRepository } from '../repositories/interfaces/IResultRepository';
import type { IMetricRepository } from '../repositories/interfaces/IMetricRepository';
import type { IDatasetMetricRepository } from '../repositories/interfaces/IDatasetMetricRepository';

interface BaselineValue {
  baselineId: string;
  avgValue: number;
  rank: number;
}

interface IndividualTableRanking {
  llmId: string;
  targetSparsity: number;
  baselineRanks: Map<string, number>;
}

export class BaselineRankingService {
  constructor(
    private baselineRepository: IBaselineRepository,
    private llmRepository: ILLMRepository,
    private datasetRepository: IDatasetRepository,
    private configurationRepository: IConfigurationRepository,
    private resultRepository: IResultRepository,
    private metricRepository: IMetricRepository,
    private datasetMetricRepository: IDatasetMetricRepository
  ) {}

  /**
   * Calculate average ranks for all baselines across (LLM, target_sparsity) combinations
   */
  async calculateBaselineAverageRanks(): Promise<BaselineRanking[]> {
    // Fetch all baselines
    const baselines = await this.baselineRepository.findAll();
    const baselinesMap = new Map<string, Baseline>(baselines.map(b => [b.id, b]));

    console.log('baselines', baselines);

    // Calculate individual table rankings for both modes
    const scoreRankings = await this.calculateIndividualTableRankings('score');
    const localErrorRankings = await this.calculateIndividualTableRankings('local_error');

    // Aggregate ranks by baseline
    const baselineRankingsMap = new Map<string, {
      scoreRanks: number[];
      localErrorRanks: number[];
    }>();

    // Initialize map with all baselines
    for (const baseline of baselines) {
      baselineRankingsMap.set(baseline.id, {
        scoreRanks: [],
        localErrorRanks: [],
      });
    }

    // Collect score ranks
    for (const table of scoreRankings) {
      for (const [baselineId, rank] of table.baselineRanks) {
        const entry = baselineRankingsMap.get(baselineId);
        if (entry) {
          entry.scoreRanks.push(rank);
        }
      }
    }

    // Collect local error ranks
    for (const table of localErrorRankings) {
      for (const [baselineId, rank] of table.baselineRanks) {
        const entry = baselineRankingsMap.get(baselineId);
        if (entry) {
          entry.localErrorRanks.push(rank);
        }
      }
    }

    // Calculate average ranks
    const results: BaselineRanking[] = [];
    
    for (const [baselineId, data] of baselineRankingsMap) {
      const baseline = baselinesMap.get(baselineId);
      if (!baseline) continue;

      const avgRankScore = data.scoreRanks.length > 0
        ? data.scoreRanks.reduce((sum, r) => sum + r, 0) / data.scoreRanks.length
        : 999; // High number for baselines with no score data

      const avgRankLocalError = data.localErrorRanks.length > 0
        ? data.localErrorRanks.reduce((sum, r) => sum + r, 0) / data.localErrorRanks.length
        : 999; // High number for baselines with no error data

      results.push({
        baseline,
        avgRankScore,
        avgRankLocalError,
        numTablesScore: data.scoreRanks.length,
        numTablesLocalError: data.localErrorRanks.length,
      });
    }

    // Sort by average score rank by default
    results.sort((a, b) => a.avgRankScore - b.avgRankScore);

    return results;
  }

  /**
   * Calculate rankings for individual (LLM, target_sparsity) tables
   */
  private async calculateIndividualTableRankings(
    mode: 'score' | 'local_error'
  ): Promise<IndividualTableRanking[]> {
    const results: IndividualTableRanking[] = [];
    console.log('1. calculateIndividualTableRankings', mode);
    // Get all configurations
    const allConfigurations = await this.configurationRepository.findAll();
    console.log('2. allConfigurations', allConfigurations);
    
    // Get the metric we're interested in
    const metricName = mode === 'score' ? 'overall_score' : 'average_local_error';
    const allMetrics = await this.metricRepository.findAll();
    const targetMetric = allMetrics.find(m => m.name === metricName);
    
    if (!targetMetric) {
      console.warn(`Metric ${metricName} not found`);
      return results;
    }

    // Group configurations by (LLM, target_sparsity)
    const configGroups = new Map<string, Configuration[]>();
    
    for (const config of allConfigurations) {
      // Skip if no target_sparsity (e.g., dense baseline)
      if (config.targetSparsity === null || config.targetSparsity === undefined) {
        continue;
      }
      
      const key = `${config.llmId}-${config.targetSparsity}`;
      if (!configGroups.has(key)) {
        configGroups.set(key, []);
      }
      configGroups.get(key)!.push(config);
    }
    
    // Print table of LLM, target sparsity, and config count
    process.stdout.write('\n📊 Configuration Groups (LLM, Target Sparsity, Config Count):\n');
    process.stdout.write('─'.repeat(80) + '\n');
    for (const [key, configs] of configGroups) {
      process.stdout.write(`${key.padEnd(20)} | ${configs.length}\n`);
    }

    // Process each (LLM, target_sparsity) group
    for (const [key, configs] of configGroups) {
      const [llmId, sparsityStr] = key.split('-');
      const targetSparsity = parseFloat(sparsityStr);

      const baselineValues = await this.calculateBaselineValuesForGroup(
        configs,
        targetMetric.id,
        mode
      );

      if (baselineValues.length === 0) continue;

      // Sort and assign ranks
      baselineValues.sort((a, b) => 
        mode === 'score' ? b.avgValue - a.avgValue : a.avgValue - b.avgValue
      );

      const baselineRanks = new Map<string, number>();
      baselineValues.forEach((entry, idx) => {
        entry.rank = idx + 1;
        baselineRanks.set(entry.baselineId, entry.rank);
      });

      results.push({
        llmId,
        targetSparsity,
        baselineRanks,
      });
    }

    return results;
  }

  /**
   * Calculate average values for baselines in a configuration group
   */
  private async calculateBaselineValuesForGroup(
    configs: Configuration[],
    metricId: string,
    mode: 'score' | 'local_error'
  ): Promise<BaselineValue[]> {
    // Group by baseline
    const configsByBaseline = new Map<string, Configuration[]>();
    
    for (const config of configs) {
      if (!configsByBaseline.has(config.baselineId)) {
        configsByBaseline.set(config.baselineId, []);
      }
      configsByBaseline.get(config.baselineId)!.push(config);
    }

    const baselineValues: BaselineValue[] = [];

    // For each baseline, calculate average across datasets and best aux_memory
    for (const [baselineId, baselineConfigs] of configsByBaseline) {
      // Group by dataset
      const configsByDataset = new Map<string, Configuration[]>();
      
      for (const config of baselineConfigs) {
        if (!configsByDataset.has(config.datasetId)) {
          configsByDataset.set(config.datasetId, []);
        }
        configsByDataset.get(config.datasetId)!.push(config);
      }

      // For each dataset, get best aux_memory value
      const datasetValues: number[] = [];
      
      for (const [datasetId, datasetConfigs] of configsByDataset) {
        const values: number[] = [];
        
        // Get results for each configuration
        for (const config of datasetConfigs) {
          const configResults = await this.resultRepository.findByConfigurationIds([config.id]);
          
          // Find the result for our target metric
          const datasetMetrics = await this.datasetMetricRepository.findByDatasetId(datasetId);
          const targetDatasetMetric = datasetMetrics.find(dm => dm.metricId === metricId);
          
          if (!targetDatasetMetric) continue;
          
          const result = configResults.find(r => r.datasetMetricId === targetDatasetMetric.id);
          if (result) {
            values.push(result.value);
          }
        }
        
        if (values.length > 0) {
          // Pick best value (max for score, min for local_error)
          const bestValue = mode === 'score' 
            ? Math.max(...values)
            : Math.min(...values);
          datasetValues.push(bestValue);
        }
      }

      if (datasetValues.length > 0) {
        // Calculate average across datasets
        const avgValue = datasetValues.reduce((sum, v) => sum + v, 0) / datasetValues.length;
        
        baselineValues.push({
          baselineId,
          avgValue,
          rank: 0, // Will be assigned later
        });
      }
    }

    return baselineValues;
  }
}

