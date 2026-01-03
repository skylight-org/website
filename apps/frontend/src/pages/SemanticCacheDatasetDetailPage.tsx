import { useParams, Link } from 'react-router-dom';
import { useSemanticCacheDataset, useSemanticCacheDatasetRankings } from '../hooks/useSemanticCacheDatasetDetail';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { SemanticCacheDatasetTable } from '../components/semantic-cache/SemanticCacheDatasetTable';

export function SemanticCacheDatasetDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const { data: dataset, isLoading: datasetLoading, error: datasetError } = useSemanticCacheDataset(datasetId);
  const { data: rankings, isLoading: rankingsLoading, error: rankingsError } = useSemanticCacheDatasetRankings(datasetId);

  const isLoading = datasetLoading || rankingsLoading;
  const error = datasetError || rankingsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Breadcrumb />
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="space-y-8">
        <Breadcrumb />
        <ErrorMessage message="Dataset not found" />
      </div>
    );
  }

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-8">
      <Breadcrumb />

      {/* Dataset Header */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-4">
          <Link
            to="/semantic-caching"
            className="text-accent-gold hover:underline text-xs sm:text-sm mb-2 inline-block"
          >
            ← Back to Overview
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">{dataset.name}</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-6">{dataset.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <div className="text-xs sm:text-sm text-gray-400 mb-1">Size</div>
            <div className="text-base sm:text-lg lg:text-xl text-white font-medium">{formatNumber(dataset.size)} prompts</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-400 mb-1">Domain</div>
            <div className="text-base sm:text-lg lg:text-xl text-white font-medium capitalize">{dataset.domain}</div>
          </div>
          {dataset.numClasses && (
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Semantic Classes</div>
              <div className="text-base sm:text-lg lg:text-xl text-white font-medium">{formatNumber(dataset.numClasses)}</div>
            </div>
          )}
          <div>
            <div className="text-xs sm:text-sm text-gray-400 mb-1">Baselines Evaluated</div>
            <div className="text-base sm:text-lg lg:text-xl text-white font-medium">{rankings?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      {rankings && rankings.length > 0 ? (
        <SemanticCacheDatasetTable rankings={rankings} datasetName={dataset.name} />
      ) : (
        <div className="text-center py-12 bg-dark-surface border border-dark-border rounded-lg">
          <p className="text-gray-400">No rankings available for this dataset</p>
        </div>
      )}
    </div>
  );
}

