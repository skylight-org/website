import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { NumericRange } from '@sky-light/shared-types';
import { useDatasetLeaderboard, useAvailableSparsityValues, useAvailableAuxMemoryValues } from '../hooks/useLeaderboard';
import { useDatasets } from '../hooks/useDatasets';
import { useBenchmarks } from '../hooks/useBenchmarks';
import { useDatasetMetrics } from '../hooks/useMetrics';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { RangeFilter } from '../components/common/RangeFilter';
import { MultiSelectFilter } from '../components/common/MultiSelectFilter';

export function DatasetDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const [selectedLlms, setSelectedLlms] = useState<string[]>([]);
  const [sparsityFilter, setSparsityFilter] = useState<NumericRange | undefined>(undefined);
  const [auxMemoryFilter, setAuxMemoryFilter] = useState<NumericRange | undefined>(undefined);

  const { data: datasets } = useDatasets();
  const { data: benchmarks } = useBenchmarks();
  const { data: metrics, isLoading: metricsLoading } = useDatasetMetrics(datasetId);
  const { data: sparsityValues, isLoading: sparsityLoading } = useAvailableSparsityValues();
  const { data: auxMemoryValues, isLoading: auxMemoryLoading } = useAvailableAuxMemoryValues();
  
  const { data: entries, isLoading: entriesLoading, error } = useDatasetLeaderboard(datasetId, {
    targetSparsity: sparsityFilter,
    targetAuxMemory: auxMemoryFilter,
  });

  const dataset = datasets?.find(d => d.id === datasetId);
  const benchmark = benchmarks?.find(b => b.id === dataset?.benchmarkId);

  const uniqueLlms = Array.from(new Set(entries?.map(e => e.llm.name) || []));

  useEffect(() => {
    if (uniqueLlms.length > 0 && selectedLlms.length === 0) {
      setSelectedLlms([uniqueLlms[0]]);
    }
  }, [uniqueLlms.length]);

  const isLoading = entriesLoading || metricsLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !dataset) {
    return <ErrorMessage message="Failed to load dataset" />;
  }

  const filteredEntries = entries?.filter(e => selectedLlms.includes(e.llm.name));

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">{dataset.name}</h1>
          {benchmark && (
            <span className="px-3 py-1 text-sm font-medium bg-accent-gold/10 text-accent-gold rounded border border-accent-gold/20">
              {benchmark.name}
            </span>
          )}
        </div>
        <p className="text-gray-400 mb-4">{dataset.description}</p>
        
        {/* Dataset Info */}
        {dataset.size && (
          <div className="text-sm text-gray-400 mb-2">
            Dataset Size: {dataset.size.toLocaleString()} examples
          </div>
        )}
        
        {/* Benchmark Info Card */}
        {benchmark && (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold text-accent-gold mb-2">Benchmark Information</h3>
            <p className="text-sm text-gray-300 mb-2">{benchmark.description}</p>
            {benchmark.paperUrl && (
              <a
                href={benchmark.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-gold hover:underline"
              >
                View Paper →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-accent-gold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* LLM Filter */}
          <MultiSelectFilter
            label="LLM"
            options={uniqueLlms}
            selectedValues={selectedLlms}
            onChange={setSelectedLlms}
          />

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
          {(selectedLlms.length !== 1 || selectedLlms[0] !== uniqueLlms[0] || sparsityFilter !== undefined || auxMemoryFilter !== undefined) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedLlms(uniqueLlms.length > 0 ? [uniqueLlms[0]] : []);
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

      {/* Leaderboard */}
      <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
        {filteredEntries && metrics && (
          <LeaderboardTable 
            entries={filteredEntries} 
            metrics={metrics}
          />
        )}
      </div>

      {/* Metrics Info */}
      {metrics && metrics.length > 0 && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map(metric => (
              <div 
                key={metric.id} 
                className={`border-l-2 pl-4 ${metric.isPrimary ? 'border-accent-gold' : 'border-gray-600'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{metric.displayName}</h4>
                  {metric.isPrimary && (
                    <span className="text-xs px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-1">{metric.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {metric.unit && <span>Unit: {metric.unit}</span>}
                  <span>Weight: {metric.weight.toFixed(2)}</span>
                  <span className={metric.higherIsBetter ? 'text-green-400' : 'text-blue-400'}>
                    {metric.higherIsBetter ? '↑ Higher is better' : '↓ Lower is better'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
