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
  const [sparsityFilter, setSparsityFilter] = useState<NumericRange | undefined>(undefined);
  const [auxMemoryFilter, setAuxMemoryFilter] = useState<NumericRange | undefined>(undefined);
  const [selectedLlms, setSelectedLlms] = useState<string[]>([]);
  
  // Local state for text inputs to sync with TextRangeFilter
  const [localSparsityMin, setLocalSparsityMin] = useState('');
  const [localSparsityMax, setLocalSparsityMax] = useState('');
  const [localAuxMemoryMin, setLocalAuxMemoryMin] = useState('');
  const [localAuxMemoryMax, setLocalAuxMemoryMax] = useState('');

  const { 
    data: rankings, 
    isLoading: rankingsLoading, 
    error: rankingsError 
  } = useOverallLeaderboard({
    targetSparsity: sparsityFilter,
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
  }, [llmOptions, selectedLlms.length]);

  const filteredRankings = useMemo(() => {
    if (!rankings) return [];
    
    // Filter by selected LLMs client-side
    return rankings.filter(ranking => selectedLlms.includes(ranking.llm.name));
  }, [rankings, selectedLlms]);

  const handleApplyFilters = () => {
    setSparsityFilter({
      min: localSparsityMin ? parseFloat(localSparsityMin) : undefined,
      max: localSparsityMax ? parseFloat(localSparsityMax) : undefined,
    });
    setAuxMemoryFilter({
      min: localAuxMemoryMin ? parseInt(localAuxMemoryMin, 10) : undefined,
      max: localAuxMemoryMax ? parseInt(localAuxMemoryMax, 10) : undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedLlms(llmOptions);
    setSparsityFilter(undefined);
    setAuxMemoryFilter(undefined);
    setLocalSparsityMin('');
    setLocalSparsityMax('');
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
        <p className="text-lg text-gray-400 max-w-3xl">
          Compare performance of sparse attention baselines across multiple benchmarks and datasets.
        </p>
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

      {/* Filters Section */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Filters</h3>
          <div>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-gold text-dark-bg hover:bg-accent-gold/90 transition-colors mr-2"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-bg text-gray-300 hover:text-white hover:bg-dark-surface-hover transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MultiSelectFilter
            label="Models"
            options={llmOptions}
            selectedValues={selectedLlms}
            onChange={setSelectedLlms}
          />
          <TextRangeFilter
            label="Filter by Density (%)"
            minValue={localSparsityMin}
            maxValue={localSparsityMax}
            onMinChange={setLocalSparsityMin}
            onMaxChange={setLocalSparsityMax}
            minDefault={0}
            maxDefault={100}
          />
          <TextRangeFilter
            label="Filter by Aux Memory"
            minValue={localAuxMemoryMin}
            maxValue={localAuxMemoryMax}
            onMinChange={setLocalAuxMemoryMin}
            onMaxChange={setLocalAuxMemoryMax}
            minDefault={0}
            maxDefault={2048}
          />
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="bg-dark-surface border border-dark-border rounded-lg">
        <h2 className="text-xl font-bold text-white p-6">Overall Rankings</h2>
        <AggregatedTable rankings={filteredRankings} />
      </div>
    </div>
  );
}
