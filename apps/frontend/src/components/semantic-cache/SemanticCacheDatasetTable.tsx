import type { SemanticCacheDatasetRanking } from '@sky-light/shared-types';
import { InfoTooltip } from '../common/InfoTooltip';
import { SortableHeader } from '../common/SortableHeader';
import { useSortableData } from '../../hooks/useSortableData';

interface SemanticCacheDatasetTableProps {
  rankings: SemanticCacheDatasetRanking[];
  datasetName?: string;
}

export function SemanticCacheDatasetTable({ rankings, datasetName }: SemanticCacheDatasetTableProps) {
  const { sortedData, sortConfig, requestSort } = useSortableData(rankings, {
    key: 'rank',
    direction: 'asc',
  });

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatLatency = (value: number) => `${value}×`;

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-dark-border">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          {datasetName ? `${datasetName} Rankings` : 'Dataset Rankings'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Rankings at error bound δ = 1.0% (balanced configuration)
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-dark-bg">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <SortableHeader
                label="Method"
                sortKey="baseline.name"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableHeader
                label={
                  <div className="flex items-center gap-1">
                    Hit Rate ↑
                    <InfoTooltip content="Percentage of requests served from cache. Higher is better." />
                  </div>
                }
                sortKey="hitRate"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableHeader
                label={
                  <div className="flex items-center gap-1">
                    Error Rate ↓
                    <InfoTooltip content="Percentage of incorrect cached responses. Lower is better." />
                  </div>
                }
                sortKey="errorRate"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Bound Met
                  <InfoTooltip content="Whether error rate ≤ error bound δ. ✓ = satisfied, ✗ = violated, ⚠️ = warning" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Guarantees
                  <InfoTooltip content="Whether method provides theoretical bounds (✓) or empirical tuning (✗)" />
                </div>
              </th>
              <SortableHeader
                label={
                  <div className="flex items-center gap-1">
                    Latency Reduction
                    <InfoTooltip content="Speedup factor compared to no caching. Higher is better." />
                  </div>
                }
                sortKey="latencyReduction"
                currentSort={sortConfig}
                onSort={requestSort}
              />
            </tr>
          </thead>
          <tbody className="bg-dark-surface divide-y divide-dark-border">
            {sortedData.map((ranking) => (
              <tr key={ranking.baseline.id} className="hover:bg-dark-surface-hover transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                  {ranking.rank}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{ranking.baseline.name}</div>
                  <div className="text-xs text-gray-400">{ranking.baseline.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                  {formatPercent(ranking.hitRate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatPercent(ranking.errorRate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={ranking.boundSatisfied ? 'text-green-400' : 'text-red-400'}>
                    {ranking.boundSatisfied ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={ranking.hasGuarantees ? 'text-green-400' : 'text-gray-400'}>
                    {ranking.hasGuarantees ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatLatency(ranking.latencyReduction)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

