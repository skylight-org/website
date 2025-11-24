import { useState } from 'react';
import { useCombinedViewBoth } from '../hooks/useCombinedView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CombinedViewTable } from '../components/leaderboard/CombinedViewTable';

export function SummaryPage() {
  const [activeMetricTab, setActiveMetricTab] = useState<'overall-score' | 'local-error'>('overall-score');
  const { data: combinedViewData, isLoading: combinedViewLoading, error: combinedViewError } = useCombinedViewBoth();

  return (
    <div>
      {/* Combined View Tables with Tabs */}
      <h2 className="text-4xl font-bold font-quantico text-white">Summary of Sparse Attention Ranking</h2>

      <div className="mb-8">
        {/* Metric Tabs */}
        <div className="border-b border-dark-border mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveMetricTab('overall-score')}
              className={`py-4 px-1 border-b-2 font-medium text-xl transition-colors ${
                activeMetricTab === 'overall-score'
                  ? 'border-accent-gold text-accent-gold'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Benchmark Metrics Rankings
            </button>
            <button
              onClick={() => setActiveMetricTab('local-error')}
              className={`py-4 px-1 border-b-2 font-medium text-xl transition-colors ${
                activeMetricTab === 'local-error'
                  ? 'border-accent-gold text-accent-gold'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Attention Approximation Quality Rankings
            </button>
          </nav>
        </div>

        {/* Table Content */}
        {combinedViewLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : combinedViewError ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <ErrorMessage message="Failed to load combined view rankings" />
          </div>
        ) : combinedViewData ? (
          activeMetricTab === 'overall-score' ? (
            <CombinedViewTable
              results={combinedViewData.overallScore.results}
              sparsities={combinedViewData.sparsities}
              metricName={combinedViewData.overallScore.metric}
              title="Sparse Attention Algorithm Rankings (Benchmark Metrics)"
            />
          ) : (
            <CombinedViewTable
              results={combinedViewData.localError.results}
              sparsities={combinedViewData.sparsities}
              metricName={combinedViewData.localError.metric}
              title="Sparse Attention Algorithm Rankings (Attention Approximation Quality)"
            />
          )
        ) : (
          <div className="text-center py-12 bg-dark-surface border border-dark-border rounded-lg">
            <p className="text-gray-400">No combined view data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

