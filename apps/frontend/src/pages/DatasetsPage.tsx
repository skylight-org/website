import { useState, useMemo, useEffect } from 'react';
import { useDatasets } from '../hooks/useDatasets';
import { useBenchmarks } from '../hooks/useBenchmarks';
import { useDatasetLeaderboard } from '../hooks/useLeaderboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { DatasetCard } from '../components/leaderboard/DatasetCard';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { MultiSelectFilter } from '../components/common/MultiSelectFilter';
import type { Dataset, Benchmark } from '@sky-light/shared-types';

export function DatasetsPage() {
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  const [datasetSearchQuery, setDatasetSearchQuery] = useState('');

  const { data: datasets, isLoading: datasetsLoading, error: datasetsError } = useDatasets();
  const { data: benchmarks, isLoading: benchmarksLoading } = useBenchmarks();

  const isLoading = datasetsLoading || benchmarksLoading;
  
  // Initialize selected benchmarks with all benchmarks when data loads
  useEffect(() => {
    if (benchmarks && benchmarks.length > 0 && selectedBenchmarks.length === 0) {
      setSelectedBenchmarks(benchmarks.map(b => b.name));
    }
  }, [benchmarks, selectedBenchmarks.length]);

  // Filter datasets
  const filteredDatasets = useMemo(() => {
    if (!datasets) return [];
    
    // Filter by benchmark first
    let filtered = datasets;
    if (selectedBenchmarks.length > 0 && benchmarks) {
      // Get IDs of selected benchmarks
      const selectedBenchmarkIds = benchmarks
        .filter(b => selectedBenchmarks.includes(b.name))
        .map(b => b.id);
      
      // Only show datasets that belong to selected benchmarks
      filtered = filtered.filter(dataset => selectedBenchmarkIds.includes(dataset.benchmarkId));
    }
    
    // Then filter by search query
    if (datasetSearchQuery.trim()) {
      const query = datasetSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((dataset) => {
        const benchmark = benchmarks?.find(b => b.id === dataset.benchmarkId);
        return (
          dataset.name.toLowerCase().includes(query) ||
          dataset.description.toLowerCase().includes(query) ||
          benchmark?.name.toLowerCase().includes(query)
        );
      });
    }
    
    return filtered;
  }, [datasets, datasetSearchQuery, selectedBenchmarks, benchmarks]);

  if (isLoading) return <LoadingSpinner />;
  if (datasetsError) return <ErrorMessage message="Failed to load datasets" />;

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Datasets</h1>
        <p className="text-gray-400">
          Compare baseline performance across datasets
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          {/* Benchmark MultiSelect Filter */}
          <div className="min-w-[200px]">
            <MultiSelectFilter
              label="Benchmarks"
              options={benchmarks?.map(b => b.name) || []}
              selectedValues={selectedBenchmarks}
              onChange={setSelectedBenchmarks}
            />
          </div>
          
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search datasets..."
                value={datasetSearchQuery}
                onChange={(e) => setDatasetSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors"
              />
              {datasetSearchQuery && (
                <button
                  onClick={() => setDatasetSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(selectedBenchmarks.length < (benchmarks?.length || 0) || datasetSearchQuery) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedBenchmarks(benchmarks?.map(b => b.name) || []);
                  setDatasetSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-bg text-gray-300 hover:text-white hover:bg-dark-surface-hover transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Datasets Grid */}
      {filteredDatasets.length === 0 ? (
        <div className="text-center py-12 bg-dark-surface rounded-lg border border-dark-border">
          <p className="text-gray-400">
            No datasets found
            {selectedBenchmarks.length < (benchmarks?.length || 0) && selectedBenchmarks.length > 0 && 
              ` in selected benchmark${selectedBenchmarks.length > 1 ? 's' : ''}`}
            {datasetSearchQuery && ` matching "${datasetSearchQuery}"`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <DatasetCardWithData 
              key={dataset.id} 
              dataset={dataset}
              benchmark={benchmarks?.find(b => b.id === dataset.benchmarkId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper components
interface DatasetCardWithDataProps {
  dataset: Dataset;
  benchmark?: Benchmark;
}

function DatasetCardWithData({ dataset, benchmark }: DatasetCardWithDataProps) {
  const { data: entries } = useDatasetLeaderboard(dataset.id);
  return <DatasetCard dataset={dataset} topEntries={entries || []} benchmark={benchmark} />;
}