import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { NumericRange } from '@sky-light/shared-types';
import { useDatasetLeaderboard } from '../hooks/useLeaderboard';
import { useDatasets } from '../hooks/useDatasets';
import { useBenchmarks } from '../hooks/useBenchmarks';
import { useDatasetMetrics } from '../hooks/useMetrics';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { TextRangeFilter } from '../components/common/TextRangeFilter';
import { MultiSelectFilter } from '../components/common/MultiSelectFilter';

export function DatasetDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const [selectedLlms, setSelectedLlms] = useState<string[]>([]);
  const [densityFilter, setDensityFilter] = useState<NumericRange | undefined>(undefined);
  const [auxMemoryFilter, setAuxMemoryFilter] = useState<NumericRange | undefined>(undefined);
  
  // Local state for text inputs
  const [localDensityMin, setLocalDensityMin] = useState<string>('');
  const [localDensityMax, setLocalDensityMax] = useState<string>('');
  const [localAuxMemoryMin, setLocalAuxMemoryMin] = useState<string>('');
  const [localAuxMemoryMax, setLocalAuxMemoryMax] = useState<string>('');

  const { data: datasets } = useDatasets();
  const { data: benchmarks } = useBenchmarks();
  const { data: metrics, isLoading: metricsLoading } = useDatasetMetrics(datasetId);
  
  const { data: entries, isLoading: entriesLoading, error } = useDatasetLeaderboard(datasetId, {
    targetSparsity: densityFilter,
  });
  
  console.log('DatasetDetailPage entries:', entries);

  const dataset = datasets?.find(d => d.id === datasetId);
  const benchmark = benchmarks?.find(b => b.id === dataset?.benchmarkId);

  const uniqueLlms = Array.from(new Set(entries?.map(e => e.llm.name) || []));

  useEffect(() => {
    if (uniqueLlms.length > 0 && selectedLlms.length === 0) {
      setSelectedLlms(uniqueLlms);
    }
  }, [uniqueLlms]);
  
  // Sync local state with filters when they change
  useEffect(() => {
    setLocalDensityMin(densityFilter?.min?.toString() ?? '');
    setLocalDensityMax(densityFilter?.max?.toString() ?? '');
  }, [densityFilter]);
  
  useEffect(() => {
    setLocalAuxMemoryMin(auxMemoryFilter?.min?.toString() ?? '');
    setLocalAuxMemoryMax(auxMemoryFilter?.max?.toString() ?? '');
  }, [auxMemoryFilter]);

  const isLoading = entriesLoading || metricsLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !dataset) {
    return <ErrorMessage message="Failed to load dataset" />;
  }

  const filteredEntries = entries
    ?.filter(e => selectedLlms.includes(e.llm.name))
    ?.filter(e => {
      // Apply auxiliary memory filter
      if (!auxMemoryFilter) return true;
      const auxMemory = e.metricValues?.aux_memory;
      if (auxMemory === undefined || auxMemory === null) return true;
      
      const meetsMin = auxMemoryFilter.min === undefined || auxMemory >= auxMemoryFilter.min;
      const meetsMax = auxMemoryFilter.max === undefined || auxMemory <= auxMemoryFilter.max;
      return meetsMin && meetsMax;
    });
  
  const handleApplyFilters = () => {
    // Apply density filter
    const densityMin = localDensityMin === '' ? 0 : parseFloat(localDensityMin);
    const densityMax = localDensityMax === '' ? 100.0 : parseFloat(localDensityMax);
    
    if (!isNaN(densityMin) && !isNaN(densityMax)) {
      if (densityMin === 0 && densityMax === 100.0) {
        setDensityFilter(undefined);
      } else {
        setDensityFilter({ min: densityMin, max: densityMax });
      }
    }
    
    // Apply auxiliary memory filter
    const auxMin = localAuxMemoryMin === '' ? 0 : parseFloat(localAuxMemoryMin);
    const auxMax = localAuxMemoryMax === '' ? 2048 : parseInt(localAuxMemoryMax, 10);
    
    if (!isNaN(auxMin) && !isNaN(auxMax)) {
      if (auxMin === 0 && auxMax === 2048) {
        setAuxMemoryFilter(undefined);
      } else {
        setAuxMemoryFilter({ min: auxMin, max: auxMax });
      }
    }
  };
  
  const handleClearFilters = () => {
    setSelectedLlms(uniqueLlms);
    setDensityFilter(undefined);
    setAuxMemoryFilter(undefined);
    setLocalDensityMin('');
    setLocalDensityMax('');
    setLocalAuxMemoryMin('');
    setLocalAuxMemoryMax('');
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{dataset.name}</h1>
              {benchmark && (
                <span className="px-3 py-1 text-sm font-medium bg-accent-gold/10 text-accent-gold rounded border border-accent-gold/20">
                  {benchmark.name}
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-4">{dataset.description}</p>
          </div>
          
          {/* Add Dataset Button */}
          <a
            href="https://github.com/skylight-org/website/discussions/categories/benchmark-dataset-requests"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 bg-dark-surface border border-accent-gold/30 rounded-lg text-sm text-gray-300 hover:border-accent-gold hover:bg-dark-surface/80 transition-all group self-start"
            title="Request a dataset"
          >
            <svg className="w-4 h-4 text-gray-400 group-hover:text-accent-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden lg:inline whitespace-nowrap">Add Dataset</span>
          </a>
        </div>
        
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
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-accent-gold">Filters</h3>
          {/* Filter Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-lg bg-accent-gold text-dark-bg hover:bg-accent-gold/90 transition-colors font-medium text-sm"
            >
              Apply
            </button>
            {(selectedLlms.length !== 1 || selectedLlms[0] !== uniqueLlms[0] || densityFilter !== undefined || auxMemoryFilter !== undefined || localDensityMin !== '' || localDensityMax !== '' || localAuxMemoryMin !== '' || localAuxMemoryMax !== '') && (
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
            label="LLM"
            options={uniqueLlms}
            selectedValues={selectedLlms}
            onChange={setSelectedLlms}
          />

          {/* Sparsity Range Filter */}
          <div onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}>
            <TextRangeFilter
              label="Target Density Range (%)"
              minValue={localDensityMin}
              maxValue={localDensityMax}
              onMinChange={setLocalDensityMin}
              onMaxChange={setLocalDensityMax}
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
              maxDefault={2048}
            />
          </div>
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
