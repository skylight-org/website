import { useSemanticCacheDatasets } from '../hooks/useSemanticCacheDatasets';
import { useSemanticCacheDatasetRankings } from '../hooks/useSemanticCacheDatasetDetail';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import type { SemanticCacheDataset, SemanticCacheDatasetRanking } from '@sky-light/shared-types';
import { Link } from 'react-router-dom';

interface DatasetCardWithRankingsProps {
  dataset: SemanticCacheDataset;
}

function DatasetCardWithRankings({ dataset }: DatasetCardWithRankingsProps) {
  const { data: rankings, isLoading } = useSemanticCacheDatasetRankings(dataset.id);
  const topRankings = rankings?.slice(0, 3) || [];

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <Link
      to={`/semantic-caching/datasets/${dataset.id}`}
      className="block bg-dark-surface border border-dark-border rounded-lg p-4 sm:p-6 hover:border-accent-gold transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{dataset.name}</h3>
            <span className="px-2 py-1 text-xs font-medium bg-accent-gold/10 text-accent-gold rounded border border-accent-gold/20 capitalize flex-shrink-0">
              {dataset.domain}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{dataset.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Top Performers</div>
        {isLoading ? (
          <div className="text-center py-4">
            <LoadingSpinner />
          </div>
        ) : topRankings.length > 0 ? (
          topRankings.map((ranking, idx) => (
            <div
              key={ranking.baseline.id}
              className="flex items-center justify-between py-2 border-b border-dark-border last:border-0 gap-2"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className={`text-sm font-semibold w-4 sm:w-6 flex-shrink-0 ${
                  idx === 0 ? 'text-yellow-400' :
                  idx === 1 ? 'text-gray-300' :
                  idx === 2 ? 'text-orange-400' :
                  'text-gray-500'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs sm:text-sm text-white truncate">{ranking.baseline.name}</span>
                  <span className="text-xs text-gray-400 truncate">
                    Hit: {ranking.hitRate.toFixed(1)}% • Err: {ranking.errorRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-300 flex-shrink-0">
                {ranking.latencyReduction}×
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-2 text-gray-400 text-sm">No data</div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-center gap-2">
        <div className="text-xs sm:text-sm">
          <span className="font-semibold text-white">{formatNumber(dataset.size)}</span>
          <span className="text-gray-400"> prompts</span>
        </div>
        <span className="text-xs text-accent-gold hover:underline flex-shrink-0">
          View leaderboard →
        </span>
      </div>
    </Link>
  );
}

export function SemanticCacheDatasetsPage() {
  const { data: datasets, isLoading, error } = useSemanticCacheDatasets();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">Benchmark Datasets</h2>
      <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-8">
        Semantic caching methods are evaluated on four diverse datasets covering classification,
        chatbot interactions, search queries, and cross-domain robustness.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {datasets?.map((dataset) => (
          <DatasetCardWithRankings key={dataset.id} dataset={dataset} />
        ))}
      </div>
    </div>
  );
}

