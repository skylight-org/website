import type { SupabaseClient } from '@supabase/supabase-js';
import type { CombinedViewResult } from '@sky-light/shared-types';
import type { BaselineService } from './BaselineService';

/**
 * CombinedViewService
 * 
 * Implements the logic from combinedview.py to generate combined baseline rankings
 * by aggregating ranks from all individual baseline views (across all LLMs and target sparsities).
 * 
 * For each baseline, it computes:
 * - Average rank across all individual tables
 * - Metric-specific values (% gap for overall_score, error percentage for average_local_error)
 * - Values organized by sparsity level
 */
export class CombinedViewService {
  constructor(
    private supabase: SupabaseClient,
    private baselineService: BaselineService
  ) {}

  /**
   * Get all LLMs from database
   */
  private async getAllLLMs(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data, error } = await this.supabase
        .from('llms')
        .select('id, name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error querying LLMs:', error);
      return [];
    }
  }

  /**
   * Get all unique target_sparsity values from configurations
   */
  private async getAllTargetSparsities(): Promise<number[]> {
    try {
      const { data, error } = await this.supabase
        .from('configurations')
        .select('target_sparsity');
      
      if (error) throw error;
      
      // Extract unique non-null sparsities (excluding 100.0)
      const sparsities = new Set<number>();
      data?.forEach(config => {
        if (config.target_sparsity !== null) {
          const sparsity = parseFloat(config.target_sparsity);
          if (sparsity !== 100.0) {
            sparsities.add(sparsity);
          }
        }
      });
      
      return Array.from(sparsities).sort((a, b) => a - b);
    } catch (error) {
      console.error('Error querying target sparsities:', error);
      return [];
    }
  }

  /**
   * Get all datasets map (id -> name)
   */
  private async getAllDatasets(): Promise<Map<string, string>> {
    try {
      const { data, error } = await this.supabase
        .from('datasets')
        .select('id, name');
      
      if (error) throw error;
      
      return new Map(data?.map(d => [d.id, d.name]) || []);
    } catch (error) {
      console.error('Error querying datasets:', error);
      return new Map();
    }
  }

  /**
   * Get baseline rankings for a specific LLM and target_sparsity
   */
  private async getBaselineRankingForLLMSparsity(
    llmId: string,
    llmName: string,
    targetSparsity: number,
    metricName: string,
    datasetsMap: Map<string, string>,
    excludedDatasets: string[] = []
  ): Promise<Record<string, { rank: number; score: number; metricValue: number | null }>> {
    try {
      // Get the metric ID and properties
      const { data: metricData, error: metricError } = await this.supabase
        .from('metrics')
        .select('id, higher_is_better')
        .eq('name', metricName)
        .single();
      
      if (metricError || !metricData) return {};
      
      const metricId = metricData.id;
      const higherIsBetter = metricData.higher_is_better;

      // Get all baselines through BaselineService
      const baselinesData = await this.baselineService.getAll();
      
      if (!baselinesData || baselinesData.length === 0) return {};
      
      const baselines = new Map<string, string>(
        baselinesData.map(b => [b.id, b.name])
      );

      // For each baseline, compute average metric value
      const baselineScores: Array<{ name: string; score: number }> = [];

      for (const [baselineId, baselineName] of baselines) {
        const isDense = baselineName.toLowerCase() === 'dense';

        // Get configurations for this baseline
        let configQuery = this.supabase
          .from('configurations')
          .select('id, dataset_id')
          .eq('baseline_id', baselineId)
          .eq('llm_id', llmId);

        if (!isDense) {
          configQuery = configQuery.eq('target_sparsity', targetSparsity);
        }

        const { data: configs, error: configsError } = await configQuery;
        if (configsError || !configs || configs.length === 0) continue;

        // Group configurations by dataset_id to pick best per dataset
        const configsByDataset = new Map<string, typeof configs>();
        for (const config of configs) {
          const datasetId = config.dataset_id;
          const datasetName = datasetsMap.get(datasetId);
          
          // Filter out excluded datasets
          if (datasetName && excludedDatasets.includes(datasetName)) {
            continue;
          }

          if (!configsByDataset.has(datasetId)) {
            configsByDataset.set(datasetId, []);
          }
          configsByDataset.get(datasetId)!.push(config);
        }

        // For each dataset, get the best score across all configs (e.g., different aux_memory)
        const datasetScores: number[] = [];

        for (const [datasetId, datasetConfigs] of configsByDataset) {
          // Get the dataset_metric_id
          const { data: dmData, error: dmError } = await this.supabase
            .from('dataset_metrics')
            .select('id')
            .eq('dataset_id', datasetId)
            .eq('metric_id', metricId)
            .single();

          if (dmError || !dmData) continue;

          const datasetMetricId = dmData.id;

          // Get scores for all configs of this dataset
          const configScores: number[] = [];
          for (const config of datasetConfigs) {
            const configId = config.id;

            // Get the result value
            const { data: resultData, error: resultError } = await this.supabase
              .from('results')
              .select('value')
              .eq('configuration_id', configId)
              .eq('dataset_metric_id', datasetMetricId);

            if (resultError || !resultData || resultData.length === 0) continue;

            configScores.push(...resultData.map(item => parseFloat(item.value)));
          }

          // Pick the best score for this dataset
          if (configScores.length > 0) {
            const bestScore = higherIsBetter 
              ? Math.max(...configScores)
              : Math.min(...configScores);
            datasetScores.push(bestScore);
          }
        }

        // Compute average across datasets
        if (datasetScores.length > 0) {
          const avgScore = datasetScores.reduce((sum, s) => sum + s, 0) / datasetScores.length;
          baselineScores.push({ name: baselineName, score: avgScore });
        }
      }

      // Sort by score
      baselineScores.sort((a, b) => 
        higherIsBetter ? b.score - a.score : a.score - b.score
      );

      // Find dense baseline score for gap calculations
      const denseScore = baselineScores.find(b => b.name.toLowerCase() === 'dense')?.score ?? null;

      // Create result dict with ranks and metric-specific values
      const result: Record<string, { rank: number; score: number; metricValue: number | null }> = {};
      
      baselineScores.forEach((baseline, index) => {
        let metricValue: number | null = null;
        
        // Calculate % gap relative to dense
        if (denseScore !== null && denseScore > 0) {
          metricValue = ((baseline.score - denseScore) / denseScore) * 100;
        } else if (denseScore === 0) {
          // If dense is 0 (like for errors), just show the value as percentage
          metricValue = baseline.score * 100;
        }

        result[baseline.name] = {
          rank: index + 1,
          score: baseline.score,
          metricValue
        };
      });

      return result;
    } catch (error) {
      console.error(`Error getting rankings for ${llmName} @ ${targetSparsity}%:`, error);
      return {};
    }
  }

  /**
   * Compute combined ranking across LLMs and target sparsities
   */
  async computeCombinedRanking(
    metricName: string = 'overall_score',
    excludedDatasets: string[] = []
  ): Promise<CombinedViewResult[]> {
    console.log('\n' + '='.repeat(80));
    console.log(`Computing Combined Baseline Rankings - Metric: ${metricName}${excludedDatasets.length > 0 ? ` (Excluded: ${excludedDatasets.join(', ')})` : ''}`);
    console.log('='.repeat(80));

    // Get all LLMs and sparsities
    let llms = await this.getAllLLMs();
    let sparsities = await this.getAllTargetSparsities();
    const datasetsMap = await this.getAllDatasets();

    if (llms.length === 0) {
      console.log('Error: No LLMs found in database');
      return [];
    }

    if (sparsities.length === 0) {
      console.log('Error: No target sparsity values found in database');
      return [];
    }

    console.log(`\nFound ${llms.length} LLMs`);
    console.log(`Found ${sparsities.length} target sparsity values: ${sparsities.join(', ')}%`);
    console.log(`Total individual tables: ${llms.length * sparsities.length}`);

    // Collect ranks and metric values for each baseline across all tables
    const baselineRanks = new Map<string, number[]>();
    const baselineValuesBySparsity = new Map<string, Map<number, number[]>>();

    // Process each combination of LLM and sparsity
    let processed = 0;
    const totalTables = llms.length * sparsities.length;

    for (const llm of llms) {
      for (const sparsity of sparsities) {
        const rankings = await this.getBaselineRankingForLLMSparsity(
          llm.id,
          llm.name,
          sparsity,
          metricName,
          datasetsMap,
          excludedDatasets
        );

        processed++;
        const progress = ((processed / totalTables) * 100).toFixed(1);
        
        // Print individual table
        console.log(`\n\n${'─'.repeat(80)}`);
        console.log(`Table ${processed}/${totalTables}: ${llm.name} @ ${sparsity}% - ${metricName}`);
        console.log('─'.repeat(80));
        
        if (Object.keys(rankings).length > 0) {
          console.log('Rank | Baseline Name              | Score      | Metric Value (% gap)');
          console.log('─'.repeat(80));
          
          // Sort by rank for display
          const sortedRankings = Object.entries(rankings).sort((a, b) => a[1].rank - b[1].rank);
          
          for (const [baselineName, data] of sortedRankings) {
            const rankStr = data.rank.toString().padEnd(4);
            const nameStr = baselineName.padEnd(26);
            const scoreStr = data.score.toFixed(6).padEnd(10);
            const metricValueStr = data.metricValue !== null 
              ? `${data.metricValue.toFixed(2)}%` 
              : 'N/A';
            
            console.log(`${rankStr} | ${nameStr} | ${scoreStr} | ${metricValueStr}`);
          }
        } else {
          console.log('No data for this combination');
        }
        
        process.stdout.write(`\nProgress: ${progress}% (${processed}/${totalTables})`);

        if (Object.keys(rankings).length > 0) {
          for (const [baselineName, data] of Object.entries(rankings)) {
            // Collect ranks
            if (!baselineRanks.has(baselineName)) {
              baselineRanks.set(baselineName, []);
            }
            baselineRanks.get(baselineName)!.push(data.rank);

            // Collect metric values by sparsity
            if (data.metricValue !== null) {
              if (!baselineValuesBySparsity.has(baselineName)) {
                baselineValuesBySparsity.set(baselineName, new Map());
              }
              const sparsityMap = baselineValuesBySparsity.get(baselineName)!;
              if (!sparsityMap.has(sparsity)) {
                sparsityMap.set(sparsity, []);
              }
              sparsityMap.get(sparsity)!.push(data.metricValue);
            }
          }
        }
      }
    }

    console.log('\n\nComputing averages...');

    // Compute average ranks and average metric values per sparsity
    let results: CombinedViewResult[] = [];
    
    for (const [baselineName, ranks] of baselineRanks) {
      const avgRank = ranks.reduce((sum, r) => sum + r, 0) / ranks.length;

      // Compute average metric value for each sparsity level
      const avgValuesPerSparsity: Record<number, number> = {};
      const sparsityMap = baselineValuesBySparsity.get(baselineName);
      
      if (sparsityMap) {
        for (const [sparsity, values] of sparsityMap) {
          avgValuesPerSparsity[sparsity] = 
            values.reduce((sum, v) => sum + v, 0) / values.length;
        }
      }

      results.push({
        baselineName,
        avgRank,
        avgValuesPerSparsity,
        numTables: ranks.length,
        rank: 0, // Will be assigned after sorting
        metricName
      });
    }

    // Filter out baselines that don't have the same number of tables as dense
    const denseResult = results.find(r => r.baselineName.toLowerCase() === 'dense');
    if (denseResult) {
      const denseNumTables = denseResult.numTables;
      const filteredBaselines = results.filter(r => r.numTables !== denseNumTables);
      results = results.filter(r => r.numTables === denseNumTables);
      
      if (filteredBaselines.length > 0) {
        console.log(`\nFiltered out ${filteredBaselines.length} baseline(s) with incomplete data (expected ${denseNumTables} tables):`);
        filteredBaselines.forEach(fb => {
          console.log(`  - ${fb.baselineName} (${fb.numTables} tables)`);
        });
      }
    }

    // Sort by average rank (ascending - lower is better)
    results.sort((a, b) => a.avgRank - b.avgRank);

    // Assign final ranks
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    console.log(`\nSuccessfully computed rankings for ${results.length} baselines`);
    console.log('='.repeat(80) + '\n');

    return results;
  }
}

