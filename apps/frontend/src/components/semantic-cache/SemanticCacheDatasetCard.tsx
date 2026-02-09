import { Link } from 'react-router-dom';
import type { SemanticCacheDataset } from '@sky-light/shared-types';

interface SemanticCacheDatasetCardProps {
  dataset: SemanticCacheDataset;
}

export function SemanticCacheDatasetCard({ dataset }: SemanticCacheDatasetCardProps) {
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <Link
      to={`/semantic-caching/datasets/${dataset.id}`}
      className="block bg-dark-surface border border-dark-border rounded-lg p-4 sm:p-6 hover:border-accent-gold transition-colors"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2">{dataset.name}</h3>
        <p className="text-sm text-gray-400">{dataset.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Size</div>
          <div className="text-sm text-white font-medium">{formatNumber(dataset.size)} prompts</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Domain</div>
          <div className="text-sm text-white font-medium capitalize">{dataset.domain}</div>
        </div>
        {dataset.numClasses && (
          <div className="col-span-2">
            <div className="text-xs text-gray-400 mb-1">Semantic Classes</div>
            <div className="text-sm text-white font-medium">{formatNumber(dataset.numClasses)}</div>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-dark-border">
        <span className="text-sm text-accent-gold hover:underline">View Rankings →</span>
      </div>
    </Link>
  );
}

