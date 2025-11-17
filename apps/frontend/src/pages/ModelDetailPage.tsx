import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOverallLeaderboard } from '../hooks/useLeaderboard';
import { useLLM } from '../hooks/useLLMs';
import { useDatasets } from '../hooks/useDatasets';
import { AggregatedTable } from '../components/leaderboard/AggregatedTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Toggle } from '../components/common/Toggle';
import { TextRangeFilter } from '../components/common/TextRangeFilter';
import type { NumericRange } from '@sky-light/shared-types';

export function ModelDetailPage() {
  const { modelId } = useParams<{ modelId: string }>();
  const [showAllDatasets, setShowAllDatasets] = useState(true);
  const [densityFilter, setDensityFilter] = useState<NumericRange | undefined>(undefined);
  const [auxMemoryFilter, setAuxMemoryFilter] = useState<NumericRange | undefined>(undefined);
  
  // Local state for text inputs
  const [localDensityMin, setLocalDensityMin] = useState('');
  const [localDensityMax, setLocalDensityMax] = useState('');
  const [localAuxMemoryMin, setLocalAuxMemoryMin] = useState('');
  const [localAuxMemoryMax, setLocalAuxMemoryMax] = useState('');
  
  const { data: llm, isLoading: llmLoading, error: llmError } = useLLM(modelId);
  const { data: rankings, isLoading: rankingsLoading } = useOverallLeaderboard({ llmId: modelId });
  const { data: datasets, isLoading: datasetsLoading } = useDatasets();

  const isLoading = llmLoading || rankingsLoading || datasetsLoading;

  // Filter rankings based on all filters
  const filteredRankings = useMemo(() => {
    if (!rankings || !datasets) return [];
    
    let filtered = [...rankings];
    const totalDatasetCount = datasets.length;
    
    // Filter by all datasets
    if (showAllDatasets) {
      filtered = filtered.filter(ranking => {
        const datasetCount = Object.keys(ranking.datasetScores).length;
        return datasetCount === totalDatasetCount;
      });
    }
    
    // Filter by density
    if (densityFilter?.min !== undefined || densityFilter?.max !== undefined) {
      filtered = filtered.filter(ranking => {
        // Get density from any dataset detail (should be consistent across datasets)
        const firstDatasetDetail = Object.values(ranking.datasetDetails)[0];
        const density = firstDatasetDetail?.sparsity;
        
        if (density === undefined) return false;
        if (densityFilter.min !== undefined && density < densityFilter.min) return false;
        if (densityFilter.max !== undefined && density > densityFilter.max) return false;
        return true;
      });
    }
    
    // Filter by auxiliary memory
    if (auxMemoryFilter?.min !== undefined || auxMemoryFilter?.max !== undefined) {
      filtered = filtered.filter(ranking => {
        // Get auxMemory from any dataset detail (should be consistent across datasets)
        const firstDatasetDetail = Object.values(ranking.datasetDetails)[0];
        const auxMemory = firstDatasetDetail?.auxMemory;
        
        if (auxMemory === undefined) return false;
        if (auxMemoryFilter.min !== undefined && auxMemory < auxMemoryFilter.min) return false;
        if (auxMemoryFilter.max !== undefined && auxMemory > auxMemoryFilter.max) return false;
        return true;
      });
    }
    
    return filtered;
  }, [rankings, datasets, showAllDatasets, densityFilter, auxMemoryFilter]);

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

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Model Header */}
      {llmError ? (
        <ErrorMessage message="Failed to load model details" />
      ) : isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-dark-surface rounded mb-2"></div>
          <div className="h-6 w-48 bg-dark-surface rounded"></div>
        </div>
      ) : llm ? (
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{llm.name}</h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span>{llm.provider}</span>
            {llm.parameterCount && (
              <span>{formatParameterCount(llm.parameterCount)} parameters</span>
            )}
            {llm.contextLength && (
              <span>{llm.contextLength.toLocaleString()} context</span>
            )}
          </div>
        </div>
      ) : null}

      {/* Filters */}
      {!llmError && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
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
      )}

      {/* Leaderboard */}
      {!llmError && (
        <div>
        <h2 className="text-xl font-semibold text-white mb-4">Configurations Leaderboard</h2>
        <div className="bg-dark-surface border border-dark-border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No configurations found matching your filters.
            </div>
          ) : (
            <AggregatedTable rankings={filteredRankings} />
          )}
        </div>
      </div>
      )}
    </div>
  );
}

function formatParameterCount(count: number): string {
  if (count >= 1e9) {
    return `${(count / 1e9).toFixed(1)}B`;
  } else if (count >= 1e6) {
    return `${(count / 1e6).toFixed(1)}M`;
  } else if (count >= 1e3) {
    return `${(count / 1e3).toFixed(1)}K`;
  }
  return count.toString();
}
