import { useState, useMemo } from 'react';
import type { Dataset, Benchmark, NumericRange } from '@sky-light/shared-types';
import { useOverallLeaderboard, useOverviewStats, useAvailableSparsityValues, useAvailableAuxMemoryValues } from '../hooks/useLeaderboard';
import { useDatasets } from '../hooks/useDatasets';
import { useBenchmarks } from '../hooks/useBenchmarks';
import { useDatasetLeaderboard } from '../hooks/useLeaderboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { AggregatedTable } from '../components/leaderboard/AggregatedTable';
import { DatasetCard } from '../components/leaderboard/DatasetCard';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { RangeFilter } from '../components/common/RangeFilter';

export function OverviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingsSearchQuery, setRankingsSearchQuery] = useState('');
  const [sparsityFilter, setSparsityFilter] = useState<NumericRange | undefined>(undefined);
  const [auxMemoryFilter, setAuxMemoryFilter] = useState<NumericRange | undefined>(undefined);
  
  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: aggregated, isLoading: aggregatedLoading, error: aggregatedError } = useOverallLeaderboard({
    targetSparsity: sparsityFilter,
    targetAuxMemory: auxMemoryFilter,
  });
  const { data: datasets, isLoading: datasetsLoading } = useDatasets();
  const { data: benchmarks, isLoading: benchmarksLoading } = useBenchmarks();
  const { data: sparsityValues, isLoading: sparsityLoading } = useAvailableSparsityValues();
  const { data: auxMemoryValues, isLoading: auxMemoryLoading } = useAvailableAuxMemoryValues();

  // Fuzzy search for datasets
  const filteredDatasets = useMemo(() => {
    if (!datasets) return [];
    if (!searchQuery.trim()) return datasets;

    const query = searchQuery.toLowerCase().trim();
    return datasets.filter((dataset) => {
      const benchmark = benchmarks?.find(b => b.id === dataset.benchmarkId);
      
      // Search in dataset name, description, and benchmark name
      return (
        dataset.name.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query) ||
        benchmark?.name.toLowerCase().includes(query) ||
        benchmark?.description.toLowerCase().includes(query)
      );
    });
  }, [datasets, benchmarks, searchQuery]);

  // Fuzzy search for overall rankings
  const filteredRankings = useMemo(() => {
    if (!aggregated) return [];
    if (!rankingsSearchQuery.trim()) return aggregated;

    const query = rankingsSearchQuery.toLowerCase().trim();
    return aggregated.filter((ranking) => {
      // Search in baseline name, description, LLM name, and provider
      return (
        ranking.baseline.name.toLowerCase().includes(query) ||
        ranking.baseline.description.toLowerCase().includes(query) ||
        ranking.llm.name.toLowerCase().includes(query) ||
        ranking.llm.provider.toLowerCase().includes(query)
      );
    });
  }, [aggregated, rankingsSearchQuery]);

  if (statsLoading || aggregatedLoading || datasetsLoading || benchmarksLoading) {
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
          <h3 className="text-sm font-semibold text-accent-gold mb-4">Configuration Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sparsity Range Filter */}
            <RangeFilter
              label="Target Sparsity Range"
              value={sparsityFilter}
              onChange={setSparsityFilter}
              options={sparsityValues || []}
              formatValue={(v) => `${v}%`}
              placeholder="All"
              isLoading={sparsityLoading}
            />

            {/* Aux Memory Range Filter */}
            <RangeFilter
              label="Auxiliary Memory Range"
              value={auxMemoryFilter}
              onChange={setAuxMemoryFilter}
              options={auxMemoryValues || []}
              formatValue={(v) => {
                if (v >= 1024) return `${(v / 1024).toFixed(1)}K`;
                return v.toString();
              }}
              placeholder="All"
              isLoading={auxMemoryLoading}
            />

            {/* Clear Filters Button */}
            {(sparsityFilter !== undefined || auxMemoryFilter !== undefined) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSparsityFilter(undefined);
                    setAuxMemoryFilter(undefined);
                  }}
                  className="px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:border-accent-gold hover:text-accent-gold transition-colors w-full"
                >
                  Clear Filters
                </button>
              </div>
            )}
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

      {/* Dataset Cards */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Dataset-based Rankings</h2>
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search datasets and benchmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {filteredDatasets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No datasets found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map((dataset) => (
              <DatasetCardWithData 
                key={dataset.id} 
                dataset={dataset}
                benchmark={benchmarks?.find(b => b.id === dataset.benchmarkId)}
                sparsityFilter={sparsityFilter}
                auxMemoryFilter={auxMemoryFilter}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Helper component to fetch dataset leaderboard data
interface DatasetCardWithDataProps {
  dataset: Dataset;
  benchmark?: Benchmark;
  sparsityFilter?: NumericRange;
  auxMemoryFilter?: NumericRange;
}

function DatasetCardWithData({ dataset, benchmark, sparsityFilter, auxMemoryFilter }: DatasetCardWithDataProps) {
  const { data: entries } = useDatasetLeaderboard(dataset.id, {
    targetSparsity: sparsityFilter,
    targetAuxMemory: auxMemoryFilter,
  });
  
  return <DatasetCard dataset={dataset} topEntries={entries || []} benchmark={benchmark} />;
}

