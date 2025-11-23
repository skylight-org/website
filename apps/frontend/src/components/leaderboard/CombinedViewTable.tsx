import { useState, useMemo } from 'react';
import type { CombinedViewResult } from '@sky-light/shared-types';
import { InfoTooltip } from '../common/InfoTooltip';

interface CombinedViewTableProps {
  results: CombinedViewResult[];
  sparsities: number[];
  metricName: string;
  title: string;
}

export function CombinedViewTable({ 
  results, 
  sparsities, 
  metricName,
  title 
}: CombinedViewTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: 'rank', direction: 'asc' });

  // Sort results based on current sort config
  const sortedResults = useMemo(() => {
    if (!sortConfig.direction) return results;

    return [...results].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'baseline') {
        aValue = a.baselineName.toLowerCase();
        bValue = b.baselineName.toLowerCase();
      } else if (sortConfig.key === 'avgRank') {
        aValue = a.avgRank;
        bValue = b.avgRank;
      } else if (sortConfig.key === 'numTables') {
        aValue = a.numTables;
        bValue = b.numTables;
      } else if (sortConfig.key.startsWith('sparsity_')) {
        const sparsity = parseFloat(sortConfig.key.replace('sparsity_', ''));
        aValue = a.avgValuesPerSparsity[sparsity] ?? Infinity;
        bValue = b.avgValuesPerSparsity[sparsity] ?? Infinity;
      } else {
        aValue = a.rank;
        bValue = b.rank;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [results, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getColumnLabel = (metricName: string, sparsity: number): string => {
    if (metricName === 'overall_score') {
      return `Gap@${sparsity.toFixed(1)}%`;
    } else if (metricName === 'average_local_error') {
      return `Err@${sparsity.toFixed(1)}%`;
    }
    return `Val@${sparsity.toFixed(1)}%`;
  };

  const formatValue = (value: number | undefined, metricName: string): string => {
    if (value === undefined || value === null) return 'N/A';
    
    if (metricName === 'overall_score') {
      return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
    }
    return `${value.toFixed(2)}%`;
  };

  const getTooltipContent = (metricName: string): string => {
    if (metricName === 'overall_score') {
      return 'Performance gap at sparsity X% relative to dense baseline';
    } else if (metricName === 'average_local_error') {
      return 'Average local error at sparsity X%';
    }
    return 'Metric value at sparsity X%';
  };

  const SortIcon = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' | null }) => {
    if (!active || !direction) {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return direction === 'asc' ? (
      <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-dark-surface border border-dark-border rounded-lg">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-dark-border">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">
          {metricName === 'overall_score' 
            ? 'Baseline rankings by overall score - lower average rank is better'
            : 'Baseline rankings by local error - lower average rank is better'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th 
                className="px-4 py-3 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center justify-center gap-1">
                  Rank
                  <SortIcon active={sortConfig.key === 'rank'} direction={sortConfig.direction} />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('baseline')}
              >
                <div className="flex items-center gap-1">
                  Baseline
                  <SortIcon active={sortConfig.key === 'baseline'} direction={sortConfig.direction} />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('avgRank')}
              >
                <div className="flex items-center justify-end gap-1">
                  Avg Rank
                  <SortIcon active={sortConfig.key === 'avgRank'} direction={sortConfig.direction} />
                  <InfoTooltip content="Average rank across all LLM × sparsity combinations. Lower is better." />
                </div>
              </th>
              {sparsities.map(sparsity => (
                <th 
                  key={sparsity}
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                  onClick={() => handleSort(`sparsity_${sparsity}`)}
                >
                  <div className="flex items-center justify-end gap-1">
                    {getColumnLabel(metricName, sparsity)}
                    <SortIcon active={sortConfig.key === `sparsity_${sparsity}`} direction={sortConfig.direction} />
                    <InfoTooltip content={getTooltipContent(metricName)} />
                  </div>
                </th>
              ))}
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('numTables')}
              >
                <div className="flex items-center justify-end gap-1">
                  # Tables
                  <SortIcon active={sortConfig.key === 'numTables'} direction={sortConfig.direction} />
                  <InfoTooltip content="Number of individual tables (LLM × sparsity combinations) where this baseline appears." />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, idx) => {
              const isDense = result.baselineName.toLowerCase() === 'dense';
              
              return (
                <tr 
                  key={`${result.baselineName}-${idx}`}
                  className={`border-b border-dark-border hover:bg-dark-surface-hover transition-colors ${
                    idx < 3 ? 'bg-yellow-500/5' : ''
                  }`}
                >
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold text-white text-lg">
                      #{result.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-white">
                      {result.baselineName}
                      {isDense && (
                        <span className="ml-2 text-xs text-gray-400">(Full Attention)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-accent-gold">
                      {result.avgRank.toFixed(2)}
                    </span>
                  </td>
                  {sparsities.map(sparsity => (
                    <td key={sparsity} className="px-4 py-4 text-right text-gray-400 whitespace-nowrap">
                      {formatValue(result.avgValuesPerSparsity[sparsity], metricName)}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-right text-gray-400">
                    {result.numTables}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-dark-border bg-dark-bg">
        <p className="text-xs text-gray-400">
          Total baselines: {results.length}
          {' • '}
          Lower average rank indicates better overall performance
          {metricName === 'overall_score' && (
            <> • Gap@X% shows average performance gap at sparsity X% relative to dense baseline</>
          )}
          {metricName === 'average_local_error' && (
            <> • Err@X% shows average local error at sparsity X%</>
          )}
        </p>
      </div>
    </div>
  );
}

