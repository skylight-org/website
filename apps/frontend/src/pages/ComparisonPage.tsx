import { useState } from 'react';
import { useBaselines } from '../hooks/useBaselines';
import { useOverallLeaderboard } from '../hooks/useLeaderboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Breadcrumb } from '../components/common/Breadcrumb';

export function ComparisonPage() {
  const { data: baselines, isLoading: baselinesLoading } = useBaselines();
  const { data: rankings, isLoading: rankingsLoading } = useOverallLeaderboard();
  const [selectedBaselines, setSelectedBaselines] = useState<string[]>([]);

  if (baselinesLoading || rankingsLoading) {
    return <LoadingSpinner />;
  }

  if (!baselines || !rankings) {
    return <ErrorMessage message="Failed to load comparison data" />;
  }

  const toggleBaseline = (id: string) => {
    setSelectedBaselines(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const selectedRankings = rankings.filter(r => 
    selectedBaselines.includes(r.baseline.id)
  );

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Compare Baselines</h1>
        <p className="text-gray-400">
          Select baselines to compare their performance across datasets
        </p>
      </div>

      {/* Baseline Selection */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Baselines</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {baselines.map(baseline => (
            <button
              key={baseline.id}
              onClick={() => toggleBaseline(baseline.id)}
              className={`px-4 py-3 rounded-lg border transition-all text-left ${
                selectedBaselines.includes(baseline.id)
                  ? 'bg-accent-gold border-accent-gold text-dark-bg'
                  : 'bg-dark-bg border-dark-border text-gray-300 hover:border-accent-gold'
              }`}
            >
              <div className="font-medium">{baseline.name}</div>
              <div className="text-xs opacity-75">{baseline.version}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedRankings.length > 0 && (
        <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Baseline
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    LLM
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">
                    Overall Rank
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">
                    Overall Score
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">
                    Datasets
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedRankings.map(ranking => (
                  <tr key={`${ranking.baseline.id}-${ranking.llm.id}`} className="border-b border-dark-border">
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{ranking.baseline.name}</div>
                      <div className="text-xs text-gray-400">{ranking.baseline.description}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{ranking.llm.name}</div>
                      <div className="text-xs text-gray-400">{ranking.llm.provider}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-white">
                        #{ranking.rank}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-semibold text-white">
                        {ranking.overallScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400">
                      {ranking.numDatasets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dataset-specific scores */}
          <div className="p-6 border-t border-dark-border">
            <h4 className="text-sm font-semibold text-white mb-4">Per-Dataset Scores</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {selectedRankings[0] && Object.keys(selectedRankings[0].datasetScores).map(datasetId => (
                <div key={datasetId} className="bg-dark-bg rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-2">
                    {datasetId.split('-')[1]}
                  </div>
                  {selectedRankings.map(ranking => (
                    <div key={ranking.baseline.id} className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">{ranking.baseline.name}</span>
                      <span className="text-sm font-medium text-white">
                        {ranking.datasetScores[datasetId]?.toFixed(1) || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRankings.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Select at least one baseline to compare
        </div>
      )}
    </div>
  );
}

