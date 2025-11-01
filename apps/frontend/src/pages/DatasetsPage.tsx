import { useDatasets } from '../hooks/useDatasets';
import { useBenchmarks } from '../hooks/useBenchmarks';
import { useDatasetLeaderboard } from '../hooks/useLeaderboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { DatasetCard } from '../components/leaderboard/DatasetCard';
import { Breadcrumb } from '../components/common/Breadcrumb';
import type { Dataset, Benchmark } from '@sky-light/shared-types';

export function DatasetsPage() {
  const { data: datasets, isLoading: datasetsLoading, error: datasetsError } = useDatasets();
  const { data: benchmarks, isLoading: benchmarksLoading } = useBenchmarks();

  const isLoading = datasetsLoading || benchmarksLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (datasetsError) {
    return <ErrorMessage message="Failed to load datasets" />;
  }

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Datasets</h1>
        <p className="text-gray-400">
          Browse all datasets and compare baseline performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets?.map((dataset) => (
          <DatasetCardWithData 
            key={dataset.id} 
            dataset={dataset}
            benchmark={benchmarks?.find(b => b.id === dataset.benchmarkId)}
          />
        ))}
      </div>
    </div>
  );
}

// Helper component
interface DatasetCardWithDataProps {
  dataset: Dataset;
  benchmark?: Benchmark;
}

function DatasetCardWithData({ dataset, benchmark }: DatasetCardWithDataProps) {
  const { data: entries } = useDatasetLeaderboard(dataset.id);
  return <DatasetCard dataset={dataset} topEntries={entries || []} benchmark={benchmark} />;
}
