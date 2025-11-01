import { Link } from 'react-router-dom';
import type { Dataset, DatasetRanking, Benchmark } from '@sky-light/shared-types';

interface DatasetCardProps {
  dataset: Dataset;
  topEntries: DatasetRanking[];
  benchmark?: Benchmark;
}

export function DatasetCard({ dataset, topEntries, benchmark }: DatasetCardProps) {
  return (
    <Link 
      to={`/documentation/datasets/${dataset.id}`}
      className="block bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-accent-gold transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{dataset.name}</h3>
            {benchmark && (
              <span className="px-2 py-1 text-xs font-medium bg-accent-gold/10 text-accent-gold rounded border border-accent-gold/20">
                {benchmark.name}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{dataset.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {topEntries.slice(0, 5).map((entry, idx) => (
          <div 
            key={`${entry.baseline.id}-${entry.llm.id}`}
            className="flex items-center justify-between py-2 border-b border-dark-border last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold w-6 ${
                idx === 0 ? 'text-yellow-400' :
                idx === 1 ? 'text-gray-300' :
                idx === 2 ? 'text-orange-400' :
                'text-gray-500'
              }`}>
                {idx + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-white">{entry.baseline.name}</span>
                <span className="text-xs text-gray-400">{entry.llm.name}</span>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-300">
              {entry.score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-dark-border">
        <span className="text-xs text-accent-gold hover:underline">
          View full description →
        </span>
      </div>
    </Link>
  );
}
