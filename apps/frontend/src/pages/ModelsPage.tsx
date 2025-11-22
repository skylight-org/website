import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Overview</h1>
            <p className="text-lg text-gray-400 max-w-4xl mb-6">
              <Link 
                to="/documentation/sparse-attention" 
                className="text-accent-gold hover:underline"
              >
                Sparse attention
              </Link>
              {' '}methods reduce the quadratic complexity of transformers, enabling longer sequences and faster inference with less memory. This leaderboard compares state-of-the-art sparse attention techniques across state-of-the-art benchmarks, measuring their accuracy-efficiency trade-offs.
            </p>
            <p className="text-gray-400 mb-4">
              Explore model performance across all datasets. Click on a model to see detailed configurations.
            </p>
          </div>
          
          {/* Request Model Button */}
          <a
            href="https://github.com/skylight-org/website/discussions/categories/model-requests"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-dark-surface border border-accent-gold/30 rounded-lg text-sm text-gray-300 hover:border-accent-gold hover:bg-dark-surface/80 transition-all group mt-2"
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
        
        {/* Sparse Attention Hub Credit */}
        <a
          href="https://github.com/xAlg-ai/sparse-attention-hub"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-dark-surface border border-accent-gold/30 rounded-lg text-sm text-gray-300 hover:border-accent-gold hover:bg-dark-surface/80 transition-all group"
        >
          <svg className="w-4 h-4 text-gray-400 group-hover:text-accent-gold transition-colors" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span>
            Baselines implemented & experiments conducted with 
            <span className="text-accent-gold ml-1 font-medium">Sparse Attention Hub</span>
          </span>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-accent-gold group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
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
