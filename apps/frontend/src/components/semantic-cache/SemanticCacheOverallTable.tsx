import { useState, useMemo } from 'react';
import type { SemanticCacheOverallRanking } from '@sky-light/shared-types';
import { InfoTooltip } from '../common/InfoTooltip';
import { SortableHeader } from '../common/SortableHeader';
import { useSortableData } from '../../hooks/useSortableData';

interface SemanticCacheOverallTableProps {
  rankings: SemanticCacheOverallRanking[];
}

export function SemanticCacheOverallTable({ rankings }: SemanticCacheOverallTableProps) {
  const { sortedData, sortConfig, requestSort } = useSortableData(rankings, {
    key: 'rank',
    direction: 'asc',
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (baselineId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(baselineId)) {
      newExpanded.delete(baselineId);
    } else {
      newExpanded.add(baselineId);
    }
    setExpandedRows(newExpanded);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatRank = (value: number) => value.toFixed(2);

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-bg border-b border-dark-border">
          <tr>
            <th
              rowSpan={2}
              className="px-4 py-3 text-center text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors align-middle"
              onClick={() => requestSort('rank')}
            >
              <div className="flex items-center justify-center gap-1">
                Rank
                <SortIcon active={sortConfig?.key === 'rank'} direction={sortConfig?.direction || null} />
              </div>
            </th>
            <th
              rowSpan={2}
              className="px-4 py-3 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors align-middle"
              onClick={() => requestSort('baseline.name')}
            >
              <div className="flex items-center gap-1">
                Method
                <SortIcon active={sortConfig?.key === 'baseline.name'} direction={sortConfig?.direction || null} />
              </div>
            </th>
            <th
              rowSpan={2}
              className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors align-middle"
              onClick={() => requestSort('avgRank')}
            >
              <div className="flex items-center justify-end gap-1">
                Avg Rank
                <SortIcon active={sortConfig?.key === 'avgRank'} direction={sortConfig?.direction || null} />
                <InfoTooltip content="Average rank across 4 datasets × 4 error budgets (16 configurations). Lower is better." />
              </div>
            </th>
            <th
              colSpan={2}
              className="px-4 py-3 text-center text-sm font-semibold text-gray-300"
            >
              Performance Metrics
            </th>
            <th
              rowSpan={2}
              className="px-4 py-3 text-center text-sm font-semibold text-gray-300 align-middle"
            >
              <div className="flex items-center justify-center gap-1">
                Guarantees
                <InfoTooltip content="Whether method provides theoretical error rate bounds (✓) or uses empirical tuning (✗)" />
              </div>
            </th>
            <th
              rowSpan={2}
              className="px-4 py-3 text-center text-sm font-semibold text-gray-300 align-middle"
            >
              Dataset Ranks
            </th>
          </tr>
          <tr>
            <th
              className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
              onClick={() => requestSort('avgHitRate')}
            >
              <div className="flex items-center justify-end gap-1">
                Avg Hit Rate ↑
                <SortIcon active={sortConfig?.key === 'avgHitRate'} direction={sortConfig?.direction || null} />
                <InfoTooltip content="Average cache hit rate across all configurations. Higher is better." />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
              onClick={() => requestSort('avgErrorRate')}
            >
              <div className="flex items-center justify-end gap-1">
                Avg Error Rate ↓
                <SortIcon active={sortConfig?.key === 'avgErrorRate'} direction={sortConfig?.direction || null} />
                <InfoTooltip content="Average error rate across all configurations. Lower is better." />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((ranking) => (
            <>
              <tr key={ranking.baseline.id} className="border-b border-dark-border hover:bg-dark-surface-hover transition-colors">
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-white text-lg">#{ranking.rank}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-medium text-white">{ranking.baseline.name}</span>
                  <div className="text-xs text-gray-400 mt-1">{ranking.baseline.description}</div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-accent-gold">{formatRank(ranking.avgRank)}</span>
                </td>
                <td className="px-4 py-4 text-right text-white">
                  {formatPercent(ranking.avgHitRate)}
                </td>
                <td className="px-4 py-4 text-right text-white">
                  {formatPercent(ranking.avgErrorRate)}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={ranking.hasGuarantees ? 'text-green-400' : 'text-gray-400'}>
                    {ranking.hasGuarantees ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => toggleRow(ranking.baseline.id)}
                    className="text-accent-gold hover:text-accent-gold/80 transition-colors text-sm"
                  >
                    {expandedRows.has(ranking.baseline.id) ? '▼ Hide' : '▶ Show'}
                  </button>
                </td>
              </tr>
              {expandedRows.has(ranking.baseline.id) && (
                <tr key={`${ranking.baseline.id}-expanded`} className="border-b border-dark-border bg-dark-bg">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Per-Dataset Performance:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(ranking.datasetRanks).map(([datasetId, rank]) => (
                          <div key={datasetId} className="bg-dark-surface p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1 capitalize">{datasetId}</div>
                            <div className="text-sm text-white">Rank: {rank}</div>
                            <div className="text-sm text-gray-300">
                              Hit Rate: {formatPercent(ranking.datasetHitRates[datasetId])}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

