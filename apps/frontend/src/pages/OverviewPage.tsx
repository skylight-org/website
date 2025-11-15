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
  const [densityFilter, setDensityFilter] = useState<NumericRange | undefined>(undefined);
  const [auxMemoryFilter, setAuxMemoryFilter] = useState<NumericRange | undefined>(undefined);
  const [selectedLlms, setSelectedLlms] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false); // Default to showing only complete runs
  
  // Local state for text inputs to sync with TextRangeFilter
  const [localDensityMin, setLocalDensityMin] = useState('');
  const [localDensityMax, setLocalDensityMax] = useState('');
  const [localAuxMemoryMin, setLocalAuxMemoryMin] = useState('');
  const [localAuxMemoryMax, setLocalAuxMemoryMax] = useState('');

  const { 
    data: rankings, 
    isLoading: rankingsLoading, 
    error: rankingsError 
  } = useOverallLeaderboard({
    targetSparsity: densityFilter,
    targetAuxMemory: auxMemoryFilter,
  });
  const { data: llms, isLoading: llmsLoading, error: llmsError } = useLLMs();
  const { data: stats, isLoading: statsLoading, error: statsError } = useOverviewStats();

  const isLoading = rankingsLoading || llmsLoading || statsLoading;
  const error = rankingsError || llmsError || statsError;

  const llmOptions = useMemo(() => llms?.map(llm => llm.name) || [], [llms]);

  useEffect(() => {
    if (llmOptions.length > 0 && selectedLlms.length === 0) {
      setSelectedLlms(llmOptions);
    }
  }, [llmOptions]);

  const filteredRankings = useMemo(() => {
    if (!rankings) return [];
    
    let filtered = rankings;

    // Filter by "Show only complete" toggle (now inverted logic)
    if (!showAll) {
      filtered = filtered.filter(ranking => ranking.numDatasets === ranking.totalNumDatasets);
    }

    // Filter by selected LLMs client-side
    if (llmOptions.length > 0 && selectedLlms.length === 0) {
      return filtered; // Show all if no models are specifically selected yet
    }
    return filtered.filter(ranking => selectedLlms.includes(ranking.llm.name));
  }, [rankings, selectedLlms, llmOptions, showAll]);

  const handleApplyFilters = () => {
    setDensityFilter({
      min: localDensityMin ? parseFloat(localDensityMin) : undefined,
      max: localDensityMax ? parseFloat(localDensityMax) : undefined,
    });
    setAuxMemoryFilter({
      min: localAuxMemoryMin ? parseInt(localAuxMemoryMin, 10) : undefined,
      max: localAuxMemoryMax ? parseInt(localAuxMemoryMax, 10) : undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedLlms(llmOptions);
    setDensityFilter(undefined);
    setAuxMemoryFilter(undefined);
    setLocalDensityMin('');
    setLocalDensityMax('');
    setLocalAuxMemoryMin('');
    setLocalAuxMemoryMax('');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!filteredRankings || !llms) {
    return <div className="text-center py-12 text-gray-400">No data available.</div>;
  }

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold text-white mb-4">
          Sparse Attention Leaderboard
        </h1>
        <p className="text-lg text-gray-400 max-w-4xl">
        Sparse attention methods reduce the quadratic complexity of transformers, enabling longer sequences and faster inference with less memory. This leaderboard compares state-of-the-art sparse attention techniques across state-of-the-art benchmarks, measuring their accuracy-efficiency trade-offs.
        </p>
      </section>

      {/* Filters Section */}
      <form onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Filters</h3>
            <div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-gold text-dark-bg hover:bg-accent-gold/90 transition-colors mr-2"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-bg text-gray-300 hover:text-white hover:bg-dark-surface-hover transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MultiSelectFilter
              className="md:col-span-2 lg:col-span-2"
              label="Models"
              options={llmOptions}
              selectedValues={selectedLlms}
              onChange={setSelectedLlms}
              tooltip="Select which LLMs to include in the leaderboard rankings."
            />
            <TextRangeFilter
              label="Filter by Density (%)"
              minValue={localDensityMin}
              maxValue={localDensityMax}
              onMinChange={setLocalDensityMin}
              onMaxChange={setLocalDensityMax}
              minDefault={0}
              maxDefault={100}
              tooltip="Filter results by target density percentage (100% - sparsity). Higher density means more attention computation."
            />
            <TextRangeFilter
              label="Filter by Aux Memory"
              minValue={localAuxMemoryMin}
              maxValue={localAuxMemoryMax}
              onMinChange={setLocalAuxMemoryMin}
              onMaxChange={setLocalAuxMemoryMax}
              minDefault={0}
              maxDefault={2048}
              tooltip="Filter results by auxiliary memory size. This represents additional memory used by the sparse attention method."
            />
            <div className="flex items-center justify-center pt-6">
              <label htmlFor="showAll" className="flex items-center cursor-pointer text-sm text-gray-300">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    id="showAll" 
                    className="sr-only" 
                    checked={showAll}
                    onChange={() => setShowAll(!showAll)}
                  />
                  <div className="block bg-dark-bg w-14 h-8 rounded-full border border-dark-border"></div>
                  <div className={`dot absolute left-1 top-1 bg-gray-400 w-6 h-6 rounded-full transition-transform ${showAll ? 'translate-x-6 bg-accent-gold' : ''}`}></div>
                </div>
                <div className="ml-3">Show All</div>
              </label>
            </div>
          </div>
        </div>
      </form>

      {/* Leaderboard Table Section */}
      <div className="bg-dark-surface border border-dark-border rounded-lg">
        <h2 className="text-xl font-bold text-white p-6">Overall Rankings</h2>
        <AggregatedTable rankings={filteredRankings} />
      </div>

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
    </div>
  );
}
