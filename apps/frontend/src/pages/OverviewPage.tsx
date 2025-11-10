import { useState, useMemo, useEffect } from 'react';
import type { NumericRange } from '@sky-light/shared-types';
import { useOverallLeaderboard, useOverviewStats } from '../hooks/useLeaderboard';
import { useLLMs } from '../hooks/useLLMs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { AggregatedTable } from '../components/leaderboard/AggregatedTable';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { TextRangeFilter } from '../components/common/TextRangeFilter';
import { MultiSelectFilter } from '../components/common/MultiSelectFilter';

export function OverviewPage() {
  const [rankingsSearchQuery, setRankingsSearchQuery] = useState('');
  const [sparsityFilter, setSparsityFilter] = useState<NumericRange | undefined>(undefined);
  const [auxMemoryFilter, setAuxMemoryFilter] = useState<NumericRange | undefined>(undefined);
  const [selectedLlms, setSelectedLlms] = useState<string[]>([]);
  
  // Local state for text inputs
  const [localSparsityMin, setLocalSparsityMin] = useState<string>('');
  const [localSparsityMax, setLocalSparsityMax] = useState<string>('');
  const [localAuxMemoryMin, setLocalAuxMemoryMin] = useState<string>('');
  const [localAuxMemoryMax, setLocalAuxMemoryMax] = useState<string>('');
  
  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: aggregated, isLoading: aggregatedLoading, error: aggregatedError } = useOverallLeaderboard({
    targetSparsity: sparsityFilter,
    targetAuxMemory: auxMemoryFilter,
  });
  const { data: llms } = useLLMs();
  
  console.log('OverviewPage stats:', stats);
  console.log('OverviewPage aggregated data:', aggregated);

  // Get unique LLM names
  const uniqueLlms = Array.from(new Set(aggregated?.map(a => a.llm.name) || []));

  // Initialize selected LLMs
  useEffect(() => {
    if (uniqueLlms.length > 0 && selectedLlms.length === 0) {
      setSelectedLlms(uniqueLlms);
    }
  }, [uniqueLlms.length]);
  
  // Sync local state with filter values
  useEffect(() => {
    setLocalSparsityMin(sparsityFilter?.min?.toString() ?? '');
    setLocalSparsityMax(sparsityFilter?.max?.toString() ?? '');
  }, [sparsityFilter]);
  
  useEffect(() => {
    setLocalAuxMemoryMin(auxMemoryFilter?.min?.toString() ?? '');
    setLocalAuxMemoryMax(auxMemoryFilter?.max?.toString() ?? '');
  }, [auxMemoryFilter]);

  // Fuzzy search for overall rankings with LLM filter
  const filteredRankings = useMemo(() => {
    if (!aggregated) return [];
    
    let filtered = aggregated;
    
    // Filter by selected LLMs
    if (selectedLlms.length > 0) {
      filtered = filtered.filter(ranking => selectedLlms.includes(ranking.llm.name));
    }
    
    // Search filter
    if (rankingsSearchQuery.trim()) {
      const query = rankingsSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((ranking) => {
        return (
          ranking.baseline.name.toLowerCase().includes(query) ||
          ranking.baseline.description.toLowerCase().includes(query) ||
          ranking.llm.name.toLowerCase().includes(query) ||
          ranking.llm.provider.toLowerCase().includes(query)
        );
      });
    }
    
    return filtered;
  }, [aggregated, rankingsSearchQuery, selectedLlms]);
  
  const handleApplyFilters = () => {
    // Apply sparsity filter
    const sparsityMin = localSparsityMin === '' ? 0 : parseFloat(localSparsityMin);
    const sparsityMax = localSparsityMax === '' ? 100.0 : parseFloat(localSparsityMax);
    
    if (!isNaN(sparsityMin) && !isNaN(sparsityMax)) {
      if (sparsityMin === 0 && sparsityMax === 100.0) {
        setSparsityFilter(undefined);
      } else {
        setSparsityFilter({ min: sparsityMin, max: sparsityMax });
      }
    }
    
    // Apply auxiliary memory filter
    const auxMin = localAuxMemoryMin === '' ? 0 : parseFloat(localAuxMemoryMin);
    const auxMax = localAuxMemoryMax === '' ? 128 : parseFloat(localAuxMemoryMax);
    
    if (!isNaN(auxMin) && !isNaN(auxMax)) {
      if (auxMin === 0 && auxMax === 128) {
        setAuxMemoryFilter(undefined);
      } else {
        setAuxMemoryFilter({ min: auxMin, max: auxMax });
      }
    }
  };
  
  const handleClearFilters = () => {
    setSelectedLlms(uniqueLlms);
    setSparsityFilter(undefined);
    setAuxMemoryFilter(undefined);
    setLocalSparsityMin('');
    setLocalSparsityMax('');
    setLocalAuxMemoryMin('');
    setLocalAuxMemoryMax('');
  };

  if (statsLoading || aggregatedLoading) {
    return <LoadingSpinner />;
  }

  if (aggregatedError) {
    return <ErrorMessage message="Failed to load leaderboard data" />;
  }

  return (
    <div className="space-y-12">
      <Breadcrumb />
      
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold text-white mb-4">
          Sparse Attention Leaderboard
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Compare performance of sparse attention baselines across multiple benchmarks and datasets. 
          This is the official leaderboard of the{' '}
          <a 
            href="https://github.com/xAlg-ai/sparse-attention-hub" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent-gold hover:underline"
          >
            sparse-attention-hub
          </a>{' '}
          repository.
        </p>
        
        {/* Development Notice */}
        <div className="mt-6 bg-dark-surface border-2 border-accent-gold rounded-lg p-4 max-w-3xl">
          <div className="flex items-start gap-3">
            <span className="text-accent-gold text-xl">⚠️</span>
            <div>
              <h3 className="text-accent-gold font-semibold mb-1">Under Development</h3>
              <p className="text-gray-300 text-sm">
                This project is currently under active development. Features and data may change as we continue to improve the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalBaselines}</div>
            <div className="text-sm text-gray-400">Baselines</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalBenchmarks}</div>
            <div className="text-sm text-gray-400">Benchmarks</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalDatasets}</div>
            <div className="text-sm text-gray-400">Datasets</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalLLMs}</div>
            <div className="text-sm text-gray-400">LLMs</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalResults}</div>
            <div className="text-sm text-gray-400">Results</div>
          </div>
        </section>
      )}

      {/* Aggregated Leaderboard */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Overall Rankings</h2>
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search baselines and LLMs..."
              value={rankingsSearchQuery}
              onChange={(e) => setRankingsSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors"
            />
            {rankingsSearchQuery && (
              <button
                onClick={() => setRankingsSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters for Configuration Parameters */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-accent-gold">Configuration Filters</h3>
            {/* Filter Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 rounded-lg bg-accent-gold text-dark-bg hover:bg-accent-gold/90 transition-colors font-medium text-sm"
              >
                Apply
              </button>
              {(selectedLlms.length < uniqueLlms.length || sparsityFilter !== undefined || auxMemoryFilter !== undefined || localSparsityMin !== '' || localSparsityMax !== '' || localAuxMemoryMin !== '' || localAuxMemoryMax !== '') && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:border-accent-gold hover:text-accent-gold transition-colors text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LLM Filter */}
            <MultiSelectFilter
              label="Models"
              options={uniqueLlms}
              selectedValues={selectedLlms}
              onChange={setSelectedLlms}
            />
            
            {/* Sparsity Range Filter */}
            <div onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}>
              <TextRangeFilter
                label="Target Sparsity Range (%)"
                minValue={localSparsityMin}
                maxValue={localSparsityMax}
                onMinChange={setLocalSparsityMin}
                onMaxChange={setLocalSparsityMax}
                minDefault={0}
                maxDefault={100.0}
              />
            </div>

            {/* Aux Memory Range Filter */}
            <div onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}>
              <TextRangeFilter
                label="Auxiliary Memory Range"
                minValue={localAuxMemoryMin}
                maxValue={localAuxMemoryMax}
                onMinChange={setLocalAuxMemoryMin}
                onMaxChange={setLocalAuxMemoryMax}
                minDefault={0}
                maxDefault={128}
              />
            </div>
          </div>
        </div>
        
        {filteredRankings.length === 0 ? (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
            <p className="text-gray-400">No rankings found matching "{rankingsSearchQuery}"</p>
          </div>
        ) : (
          <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
            <AggregatedTable rankings={filteredRankings} />
          </div>
        )}
      </section>

    </div>
  );
}
