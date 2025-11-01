import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDatasets } from '../hooks/useDatasets';
import { useBenchmarks } from '../hooks/useBenchmarks';
import { useDatasetMetrics } from '../hooks/useMetrics';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Breadcrumb } from '../components/common/Breadcrumb';
import type { Dataset, Benchmark } from '@sky-light/shared-types';

export function DocumentationDatasetsPage() {
  const [benchmarkSearchQuery, setBenchmarkSearchQuery] = useState('');
  const [datasetSearchQuery, setDatasetSearchQuery] = useState('');

  const { data: datasets, isLoading: datasetsLoading, error: datasetsError } = useDatasets();
  const { data: benchmarks, isLoading: benchmarksLoading } = useBenchmarks();

  const isLoading = datasetsLoading || benchmarksLoading;

  // Filter benchmarks
  const filteredBenchmarks = useMemo(() => {
    if (!benchmarks) return [];
    if (!benchmarkSearchQuery.trim()) return benchmarks;

    const query = benchmarkSearchQuery.toLowerCase().trim();
    return benchmarks.filter((benchmark) => 
      benchmark.name.toLowerCase().includes(query) ||
      benchmark.description.toLowerCase().includes(query)
    );
  }, [benchmarks, benchmarkSearchQuery]);

  // Filter datasets
  const filteredDatasets = useMemo(() => {
    if (!datasets) return [];
    if (!datasetSearchQuery.trim()) return datasets;

    const query = datasetSearchQuery.toLowerCase().trim();
    return datasets.filter((dataset) => {
      const benchmark = benchmarks?.find(b => b.id === dataset.benchmarkId);
      return (
        dataset.name.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query) ||
        benchmark?.name.toLowerCase().includes(query)
      );
    });
  }, [datasets, datasetSearchQuery, benchmarks]);

  if (isLoading) return <LoadingSpinner />;
  if (datasetsError) return <ErrorMessage message="Failed to load datasets" />;

  return (
    <div className="space-y-12">
      <Breadcrumb />
      
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-3">Datasets & Benchmarks</h1>
        <p className="text-gray-300 text-lg">
          Comprehensive documentation for benchmarks and their evaluation datasets used to assess sparse attention methods.
        </p>
      </div>

      {/* Benchmarks Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Benchmarks</h2>
            <p className="text-sm text-gray-400">
              Test suites containing multiple datasets for comprehensive evaluation
            </p>
          </div>
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search benchmarks..."
              value={benchmarkSearchQuery}
              onChange={(e) => setBenchmarkSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors"
            />
            {benchmarkSearchQuery && (
              <button
                onClick={() => setBenchmarkSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredBenchmarks.length === 0 ? (
          <div className="text-center py-12 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-gray-400">No benchmarks found matching "{benchmarkSearchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBenchmarks.map((benchmark) => (
              <BenchmarkCard 
                key={benchmark.id} 
                benchmark={benchmark}
                datasets={datasets?.filter(d => d.benchmarkId === benchmark.id) || []}
              />
            ))}
          </div>
        )}
      </section>

      {/* Datasets Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">All Datasets</h2>
            <p className="text-sm text-gray-400">
              Individual test sets with specific evaluation metrics
            </p>
          </div>
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search datasets..."
              value={datasetSearchQuery}
              onChange={(e) => setDatasetSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors"
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

        {filteredDatasets.length === 0 ? (
          <div className="text-center py-12 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-gray-400">No datasets found matching "{datasetSearchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDatasets.map((dataset) => {
              const benchmark = benchmarks?.find(b => b.id === dataset.benchmarkId);
              return (
                <DatasetCard key={dataset.id} dataset={dataset} benchmark={benchmark} />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// Benchmark Card Component
interface BenchmarkCardProps {
  benchmark: Benchmark;
  datasets: Dataset[];
}

function BenchmarkCard({ benchmark, datasets }: BenchmarkCardProps) {
  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
      {/* Benchmark Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-2xl font-bold text-white">{benchmark.name}</h3>
          <span className="px-3 py-1 text-sm font-medium bg-accent-gold/10 text-accent-gold rounded border border-accent-gold/20">
            {datasets.length} {datasets.length === 1 ? 'Dataset' : 'Datasets'}
          </span>
        </div>
        <p className="text-gray-300 leading-relaxed">{benchmark.description}</p>
      </div>

      {/* Paper Link */}
      {benchmark.paperUrl && (
        <div className="mb-4">
          <a
            href={benchmark.paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-accent-gold hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Read Paper
          </a>
        </div>
      )}

      {/* Datasets List */}
      {datasets.length > 0 && (
        <div className="pt-4 border-t border-dark-border">
          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Included Datasets
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {datasets.map((dataset) => (
              <Link
                key={dataset.id}
                to={`/documentation/datasets/${dataset.id}`}
                className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg hover:border-accent-gold transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white group-hover:text-accent-gold transition-colors">
                    {dataset.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-accent-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {dataset.size && (
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    {dataset.size.toLocaleString()} examples
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Dataset Card Component
interface DatasetCardProps {
  dataset: Dataset;
  benchmark?: Benchmark;
}

function DatasetCard({ dataset, benchmark }: DatasetCardProps) {
  const { data: metrics } = useDatasetMetrics(dataset.id);

  return (
    <Link
      to={`/documentation/datasets/${dataset.id}`}
      className="block bg-dark-surface rounded-lg border border-dark-border p-5 hover:border-accent-gold transition-colors group"
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-accent-gold transition-colors">
            {dataset.name}
          </h3>
          {benchmark && (
            <span className="px-2 py-1 text-xs font-medium bg-accent-gold/10 text-accent-gold rounded">
              {benchmark.name}
            </span>
          )}
        </div>
        {dataset.size && (
          <p className="text-xs text-gray-500">
            {dataset.size.toLocaleString()} examples
          </p>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-3 line-clamp-2 leading-relaxed">
        {dataset.description}
      </p>

      {/* Metrics Count */}
      {metrics && metrics.length > 0 && (
        <div className="flex items-center gap-4 pt-3 border-t border-dark-border">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{metrics.length} {metrics.length === 1 ? 'Metric' : 'Metrics'}</span>
          </div>
          <span className="text-xs text-accent-gold group-hover:underline">
            View details →
          </span>
        </div>
      )}
    </Link>
  );
}
