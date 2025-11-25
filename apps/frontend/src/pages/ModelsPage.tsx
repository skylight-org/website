import { useState, useMemo } from 'react';
import { useLLMs } from '../hooks/useLLMs';
import { useOverallLeaderboard } from '../hooks/useLeaderboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ModelCard } from '../components/leaderboard/ModelCard';
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
      
      //add configuration to stats regardless of dataset count
      stats.configurations.push(config);
    });

    // Calculate scores and sort
    statsMap.forEach((stats) => {
      // Sort configurations by overall score
      stats.configurations.sort((a, b) => b.overallScore - a.overallScore);
      
      // Calculate average score across configurations
      const totalScore = stats.configurations.reduce((sum, config) => sum + config.overallScore, 0);
      stats.averageScore = stats.configurations.length > 0 ? totalScore / stats.configurations.length : 0;
      
      // Set total datasets to the max dataset count
      stats.totalDatasets = totalDatasetCount;
    });

    return Array.from(statsMap.values())
      // Only show models that have at least one configuration
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
      {/* Models Section Header */}
      <div className="mb-6 flex items-center justify-between">
       <h2 className="text-4xl font-bold font-quantico text-white">Models</h2>
        
        {/* Request Model Button */}
        <a
          href="https://github.com/skylight-org/website/discussions/categories/model-requests"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-dark-surface border border-accent-gold/30 rounded-lg text-sm text-gray-300 hover:border-accent-gold hover:bg-dark-surface/80 transition-all group"
        >
          <svg className="w-4 h-4 text-gray-400 group-hover:text-accent-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="whitespace-nowrap">Request Model</span>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-accent-gold group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Search Box */}
      <div className="mb-6">
      <p className="text-gray-400 mb-4">
            Explore a specific model's performance on datasets. Click on a model pane below to explore. You can also access specific sparse attention configurations there.
      </p>

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
