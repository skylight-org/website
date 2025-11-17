import { useState, useMemo } from 'react';
import { useLLMs } from '../hooks/useLLMs';
import { useOverallLeaderboard } from '../hooks/useLeaderboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ModelCard } from '../components/leaderboard/ModelCard';
import { Breadcrumb } from '../components/common/Breadcrumb';
import type { LLM, Baseline } from '@sky-light/shared-types';

interface BaselineConfig {
  baseline: Baseline;
  overallScore: number;
  averageRank: number;
  datasetCount: number;
  sparsity?: number;
  auxMemory?: number;
}

interface ModelStats {
  llm: LLM;
  configurations: BaselineConfig[];
  totalDatasets: number;
  averageScore: number;
}

export function ModelsPage() {
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const { isLoading: llmsLoading, error: llmsError } = useLLMs();
  const { data: rankings, isLoading: rankingsLoading } = useOverallLeaderboard();

  const isLoading = llmsLoading || rankingsLoading;

  // Calculate model statistics across all datasets
  const modelStats = useMemo(() => {
    if (!rankings) return [];

    const statsMap = new Map<string, ModelStats>();
    
    // Get total dataset count from the first ranking's datasetScores
    const totalDatasetCount = rankings.length > 0 ? 
      Math.max(...rankings.map(r => Object.keys(r.datasetScores).length)) : 0;

    // Process ALL rankings to build complete model stats
    rankings.forEach(ranking => {
      const llmId = ranking.llm.id;
      
      if (!statsMap.has(llmId)) {
        statsMap.set(llmId, {
          llm: ranking.llm,
          configurations: [],
          totalDatasets: 0,
          averageScore: 0
        });
      }
      
      const stats = statsMap.get(llmId)!;
      
      // Get sparsity and auxMemory from the first dataset detail
      const firstDatasetDetail = Object.values(ranking.datasetDetails)[0];
      
      const config: BaselineConfig = {
        baseline: ranking.baseline,
        overallScore: ranking.overallScore,
        averageRank: ranking.averageRank,
        datasetCount: Object.keys(ranking.datasetScores).length,
        sparsity: firstDatasetDetail?.sparsity,
        auxMemory: firstDatasetDetail?.auxMemory
      };
      
      // Only add configurations that have been tested on all datasets
      if (config.datasetCount === totalDatasetCount) {
        stats.configurations.push(config);
      }
    });

    // Calculate scores and sort
    statsMap.forEach((stats) => {
      // Sort configurations by overall score
      stats.configurations.sort((a, b) => b.overallScore - a.overallScore);
      
      // Calculate average score across configurations (which are already filtered for all datasets)
      const totalScore = stats.configurations.reduce((sum, config) => sum + config.overallScore, 0);
      stats.averageScore = stats.configurations.length > 0 ? totalScore / stats.configurations.length : 0;
      
      // Set total datasets to the max dataset count
      stats.totalDatasets = totalDatasetCount;
    });

    return Array.from(statsMap.values())
      // Only show models that have at least one configuration tested on all datasets
      .filter(stats => stats.configurations.length > 0)
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [rankings]);

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!modelSearchQuery.trim()) return modelStats;

    const query = modelSearchQuery.toLowerCase();
    return modelStats.filter(stats => 
      stats.llm.name.toLowerCase().includes(query) ||
      stats.llm.provider.toLowerCase().includes(query)
    );
  }, [modelStats, modelSearchQuery]);


  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Models</h1>
        <p className="text-gray-400">
          Explore model performance across all datasets. Click on a model to see detailed configurations.
        </p>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <label className="text-sm font-medium text-white mb-2 block">Search Models</label>
          <input
            type="text"
            placeholder="Search by model name or provider..."
            value={modelSearchQuery}
            onChange={(e) => setModelSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold"
          />
        </div>
      </div>

      {/* Model Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : llmsError ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage message="Failed to load models" />
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-12 bg-dark-surface border border-dark-border rounded-lg">
          <p className="text-gray-400">
            {modelSearchQuery
              ? 'No models found matching your search.'
              : 'No models available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((stats) => (
            <ModelCard 
              key={stats.llm.id} 
              modelStats={stats} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
