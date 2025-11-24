import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBaselineRankings } from '../hooks/useBaselineRankings';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { SortableHeader } from '../components/common/SortableHeader';
import { useSortableData } from '../hooks/useSortableData';

type SortMode = 'score' | 'local_error';

export function SparseAttentionMethodsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('score');
  
  const { data: rankings, isLoading, error } = useBaselineRankings();

  // Filter rankings by search query
  const filteredRankings = useMemo(() => {
    if (!rankings) return [];
    
    if (!searchQuery.trim()) return rankings;
    
    const query = searchQuery.toLowerCase();
    return rankings.filter(ranking => 
      ranking.baseline.name.toLowerCase().includes(query) ||
      ranking.baseline.description.toLowerCase().includes(query)
    );
  }, [rankings, searchQuery]);

  // Sort by selected mode
  const { sortedData, sortConfig, requestSort } = useSortableData(
    filteredRankings,
    {
      key: sortMode === 'score' ? 'avgRankScore' : 'avgRankLocalError',
      direction: 'asc', // Lower rank is better
    }
  );

  // Assign display ranks based on sorted data
  const rankedData = useMemo(() => {
    return sortedData.map((ranking, idx) => ({
      ...ranking,
      displayRank: idx + 1,
    }));
  }, [sortedData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load baseline rankings" />;
  }

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">Sparse Attention Methods</h1>
        <p className="text-lg text-gray-400 max-w-4xl">
          Average rankings across all (LLM, Density) configurations. Each baseline is ranked 
          within individual tables and then averaged to show overall performance.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md w-full">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Search</label>
            <input
              type="text"
              placeholder="Search by baseline name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors"
            />
          </div>
          
          {/* Sort Mode Toggle */}
          <div className="flex-shrink-0">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Ranking Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortMode('score')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortMode === 'score'
                    ? 'bg-accent-gold text-dark-bg'
                    : 'bg-dark-bg text-gray-300 hover:text-white'
                }`}
              >
                Score
              </button>
              <button
                onClick={() => setSortMode('local_error')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortMode === 'local_error'
                    ? 'bg-accent-gold text-dark-bg'
                    : 'bg-dark-bg text-gray-300 hover:text-white'
                }`}
              >
                Local Error
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
        {rankedData.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {searchQuery ? 'No baselines found matching your search.' : 'No baselines available.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                    Rank
                  </th>
                  <SortableHeader
                    label="Baseline"
                    sortKey="baseline.name"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableHeader
                    label="Avg Rank (Score)"
                    sortKey="avgRankScore"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
                  <SortableHeader
                    label="Avg Rank (Local Error)"
                    sortKey="avgRankLocalError"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-300">
                    Tables (Score)
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-gray-300">
                    Tables (Error)
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankedData.map((ranking) => (
                  <tr 
                    key={ranking.baseline.id}
                    className={`border-b border-dark-border hover:bg-dark-surface-hover transition-colors ${
                      ranking.displayRank <= 3 ? 'bg-yellow-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${
                        ranking.displayRank === 1 ? 'text-yellow-400 text-lg' :
                        ranking.displayRank === 2 ? 'text-gray-300 text-lg' :
                        ranking.displayRank === 3 ? 'text-orange-400 text-lg' :
                        'text-gray-500'
                      }`}>
                        #{ranking.displayRank}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/documentation/baselines/${ranking.baseline.id}`}
                        className="text-white hover:text-accent-gold transition-colors font-medium"
                      >
                        {ranking.baseline.name}
                      </Link>
                      <div className="text-sm text-gray-400 mt-1 max-w-md">
                        {ranking.baseline.description}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-semibold ${
                        sortMode === 'score' ? 'text-accent-gold text-lg' : 'text-gray-300'
                      }`}>
                        {ranking.avgRankScore < 999 ? ranking.avgRankScore.toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-semibold ${
                        sortMode === 'local_error' ? 'text-accent-gold text-lg' : 'text-gray-300'
                      }`}>
                        {ranking.avgRankLocalError < 999 ? ranking.avgRankLocalError.toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-400">
                      {ranking.numTablesScore}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-400">
                      {ranking.numTablesLocalError}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">How Rankings Are Calculated</h3>
        <div className="text-gray-300 space-y-2 text-sm">
          <p>
            <strong>Individual Tables:</strong> For each (LLM, Density) combination, baselines are ranked 
            based on their average performance across datasets (picking best auxiliary memory value).
          </p>
          <p>
            <strong>Average Rank:</strong> Each baseline's ranks across all individual tables are averaged 
            to produce the final ranking. Lower average rank indicates better overall performance.
          </p>
          <p>
            <strong>Score Mode:</strong> Higher scores are better (accuracy-like metrics).
          </p>
          <p>
            <strong>Local Error Mode:</strong> Lower errors are better (distance/error metrics).
          </p>
        </div>
      </div>
    </div>
  );
}

