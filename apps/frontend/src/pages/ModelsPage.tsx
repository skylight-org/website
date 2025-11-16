import { useState, useMemo } from 'react';
import { useLLMs } from '../hooks/useLLMs';
import { useDatasets } from '../hooks/useDatasets';
import { useOverallLeaderboard } from '../hooks/useLeaderboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ModelCard } from '../components/leaderboard/ModelCard';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Toggle } from '../components/common/Toggle';
import { TextRangeFilter } from '../components/common/TextRangeFilter';
import type { LLM, AggregatedRanking, Baseline, NumericRange } from '@sky-light/shared-types';

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
  allConfigurations: BaselineConfig[]; // Keep original unfiltered list
  totalDatasets: number;
  averageScore: number;
}

export function ModelsPage() {
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [showAllDatasets, setShowAllDatasets] = useState(true);
  const [densityFilter, setDensityFilter] = useState<NumericRange | undefined>(undefined);
  const [auxMemoryFilter, setAuxMemoryFilter] = useState<NumericRange | undefined>(undefined);
  
  // Local state for text inputs
  const [localDensityMin, setLocalDensityMin] = useState('');
  const [localDensityMax, setLocalDensityMax] = useState('');
  const [localAuxMemoryMin, setLocalAuxMemoryMin] = useState('');
  const [localAuxMemoryMax, setLocalAuxMemoryMax] = useState('');

  const { data: llms, isLoading: llmsLoading, error: llmsError } = useLLMs();
  const { data: datasets, isLoading: datasetsLoading } = useDatasets();
  const { data: rankings, isLoading: rankingsLoading } = useOverallLeaderboard();

  const isLoading = llmsLoading || datasetsLoading || rankingsLoading;

  // Calculate model statistics across all datasets
  const modelStats = useMemo(() => {
    if (!rankings || !datasets) return [];

    const totalDatasetCount = datasets.length;
    const statsMap = new Map<string, ModelStats>();

    // First, process ALL rankings to build complete model stats
    rankings.forEach(ranking => {
      const llmId = ranking.llm.id;
      
      if (!statsMap.has(llmId)) {
        statsMap.set(llmId, {
          llm: ranking.llm,
          configurations: [],
          allConfigurations: [],
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
      
      stats.allConfigurations.push(config);
    });

    // Calculate scores and apply filtering
    statsMap.forEach((stats) => {
      // Sort ALL configurations by overall score
      stats.allConfigurations.sort((a, b) => b.overallScore - a.overallScore);
      
      // Calculate average score across ALL configurations (not filtered)
      // This ensures consistent ordering regardless of filter state
      const allConfigsScore = stats.allConfigurations.reduce((sum, config) => sum + config.overallScore, 0);
      stats.averageScore = stats.allConfigurations.length > 0 ? allConfigsScore / stats.allConfigurations.length : 0;
      
      // Get total unique datasets from ALL configurations
      const uniqueDatasets = new Set<string>();
      rankings
        .filter(r => r.llm.id === stats.llm.id)
        .forEach(r => Object.keys(r.datasetScores).forEach(datasetId => uniqueDatasets.add(datasetId)));
      stats.totalDatasets = uniqueDatasets.size;
      
      // Apply filters to create display configurations from allConfigurations
      let filteredConfigs = stats.allConfigurations;
      
      // Filter by all datasets
      if (showAllDatasets) {
        filteredConfigs = filteredConfigs.filter(config => config.datasetCount === totalDatasetCount);
      }
      
      // Filter by density
      if (densityFilter?.min !== undefined || densityFilter?.max !== undefined) {
        filteredConfigs = filteredConfigs.filter(config => {
          if (config.sparsity === undefined) return false;
          if (densityFilter.min !== undefined && config.sparsity < densityFilter.min) return false;
          if (densityFilter.max !== undefined && config.sparsity > densityFilter.max) return false;
          return true;
        });
      }
      
      // Filter by auxiliary memory
      if (auxMemoryFilter?.min !== undefined || auxMemoryFilter?.max !== undefined) {
        filteredConfigs = filteredConfigs.filter(config => {
          if (config.auxMemory === undefined) return false;
          if (auxMemoryFilter.min !== undefined && config.auxMemory < auxMemoryFilter.min) return false;
          if (auxMemoryFilter.max !== undefined && config.auxMemory > auxMemoryFilter.max) return false;
          return true;
        });
      }
      
      stats.configurations = filteredConfigs;
    });

    return Array.from(statsMap.values())
      // Only show models that have at least one configuration matching the filter
      .filter(stats => stats.configurations.length > 0)
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [rankings, datasets, showAllDatasets, densityFilter, auxMemoryFilter]);

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!modelSearchQuery.trim()) return modelStats;

    const query = modelSearchQuery.toLowerCase();
    return modelStats.filter(stats => 
      stats.llm.name.toLowerCase().includes(query) ||
      stats.llm.provider.toLowerCase().includes(query)
    );
  }, [modelStats, modelSearchQuery]);

  // Handle applying filters
  const handleApplyFilters = () => {
    const newDensityFilter: NumericRange | undefined = 
      localDensityMin || localDensityMax 
        ? { 
            min: localDensityMin ? parseFloat(localDensityMin) : undefined,
            max: localDensityMax ? parseFloat(localDensityMax) : undefined
          } 
        : undefined;
    
    const newAuxMemoryFilter: NumericRange | undefined = 
      localAuxMemoryMin || localAuxMemoryMax 
        ? { 
            min: localAuxMemoryMin ? parseFloat(localAuxMemoryMin) : undefined,
            max: localAuxMemoryMax ? parseFloat(localAuxMemoryMax) : undefined
          } 
        : undefined;
    
    setDensityFilter(newDensityFilter);
    setAuxMemoryFilter(newAuxMemoryFilter);
  };

  const clearFilters = () => {
    setLocalDensityMin('');
    setLocalDensityMax('');
    setLocalAuxMemoryMin('');
    setLocalAuxMemoryMax('');
    setDensityFilter(undefined);
    setAuxMemoryFilter(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (llmsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message="Failed to load models" />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Models</h1>
        <p className="text-gray-400">
          Explore model performance across all datasets. Click on a model to see detailed configurations.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search models..."
          value={modelSearchQuery}
          onChange={(e) => setModelSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold"
        />
        
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white mb-1">Show All Datasets Only</h3>
              <p className="text-xs text-gray-400">
                When enabled, only shows configurations tested on all available datasets
              </p>
            </div>
            <Toggle
              checked={showAllDatasets}
              onChange={setShowAllDatasets}
              label="All datasets only"
            />
          </div>
          
          <div className="border-t border-dark-border pt-4">
            <h3 className="text-sm font-medium text-white mb-3">Configuration Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Density Range Filter */}
              <div onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}>
                <TextRangeFilter
                  label="Target Density Range (%)"
                  minValue={localDensityMin}
                  maxValue={localDensityMax}
                  onMinChange={setLocalDensityMin}
                  onMaxChange={setLocalDensityMax}
                  minDefault={0}
                  maxDefault={100}
                  tooltip="Filter by density percentage. Higher density means more attention computation."
                />
              </div>

              {/* Aux Memory Range Filter */}
              <div onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}>
                <TextRangeFilter
                  label="Auxiliary Memory Range (bits)"
                  minValue={localAuxMemoryMin}
                  maxValue={localAuxMemoryMax}
                  onMinChange={setLocalAuxMemoryMin}
                  onMaxChange={setLocalAuxMemoryMax}
                  minDefault={0}
                  maxDefault={2048}
                  tooltip="Filter by auxiliary memory size in bits."
                />
              </div>
              
              {/* Apply/Clear Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 bg-accent-gold text-dark-bg rounded-lg font-medium hover:bg-accent-gold/90 transition-colors"
                >
                  Apply Filters
                </button>
                {(densityFilter || auxMemoryFilter) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-dark-bg text-gray-300 rounded-lg font-medium hover:text-white hover:bg-dark-surface-hover transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((stats) => (
          <ModelCard 
            key={`${stats.llm.id}-${showAllDatasets ? 'all' : 'any'}-${densityFilter?.min ?? ''}-${densityFilter?.max ?? ''}-${auxMemoryFilter?.min ?? ''}-${auxMemoryFilter?.max ?? ''}-${stats.configurations.length}`} 
            modelStats={stats} 
          />
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No models found matching your search.</p>
        </div>
      )}
    </div>
  );
}
