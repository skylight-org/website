import type { DatasetRanking, Metric } from '@sky-light/shared-types';
import { SortableHeader } from '../common/SortableHeader';
import { useSortableData } from '../../hooks/useSortableData';
import { InfoTooltip } from '../common/InfoTooltip';

interface LeaderboardTableProps {
  entries: DatasetRanking[];
  metrics?: Array<Metric & { weight: number; isPrimary: boolean }>;
}

export function LeaderboardTable({ entries, metrics = [] }: LeaderboardTableProps) {
  const { sortedData, sortConfig, requestSort } = useSortableData(entries, {
    key: 'score',
    direction: 'desc',
  });

  console.log('LeaderboardTable entries:', entries);
  console.log('LeaderboardTable metrics:', metrics);
  if (entries.length > 0) {
    console.log('First entry metricValues:', entries[0].metricValues);
    console.log('Has average_local_error?', 'average_local_error' in entries[0].metricValues);
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No data available
      </div>
    );
  }

  const metricNames = Object.keys(entries[0]?.metricValues || {}).filter(
    name => name !== 'average_density' && name !== 'average_local_error' && name !== 'aux_memory'
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Rank
                  <InfoTooltip content="Position in the leaderboard based on score for this dataset." />
                </div>
              }
              sortKey="rank"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="left"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Baseline
                  <InfoTooltip content="The sparse attention implementation being evaluated." />
                </div>
              }
              sortKey="baseline.name"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="left"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  LLM
                  <InfoTooltip content="The Large Language Model used for testing." />
                </div>
              }
              sortKey="llm.name"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="left"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Score
                  <InfoTooltip content="Performance score on this dataset. Higher is better. Used as secondary sort." />
                </div>
              }
              sortKey="score"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Avg Density (%)
                  <InfoTooltip content="Average attention density - percentage of tokens used in attention computation." />
                </div>
              }
              sortKey="metricValues.average_density"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Local Error
                  <InfoTooltip content="Average local error of the sparse attention method." />
                </div>
              }
              sortKey="metricValues.average_local_error"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Aux Memory
                  <InfoTooltip content="Auxiliary memory used by the sparse attention method (bytes per token per KV head)." />
                </div>
              }
              sortKey="metricValues.aux_memory"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            {metricNames.map(name => {
              const metric = metrics.find(m => m.name === name);
              const displayLabel = (
                <>
                  {metric?.displayName || name.replace(/_/g, ' ')}
                  {metric?.unit && <span className="text-xs ml-1">({metric.unit})</span>}
                </>
              );
              return (
                <SortableHeader
                  key={name}
                  label={displayLabel}
                  sortKey={`metricValues.${name}`}
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  align="right"
                />
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((entry, idx) => (
            <tr 
              key={entry.configurationId}
              className={`border-b border-dark-border hover:bg-dark-surface-hover transition-colors ${
                idx < 3 ? 'bg-yellow-500/5' : ''
              }`}
            >
              <td className="px-4 py-4 text-sm">
                <span className={`font-semibold ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-gray-300' :
                  entry.rank === 3 ? 'text-orange-400' :
                  'text-gray-400'
                }`}>
                  #{entry.rank}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="font-medium text-white">{entry.baseline.name}</div>
              </td>
              <td className="px-4 py-4">
                <div className="font-medium text-white">{entry.llm.name}</div>
                <div className="text-xs text-gray-400">{entry.llm.provider}</div>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="font-semibold text-accent-gold text-lg">{entry.score.toFixed(2)}</span>
              </td>
              <td className="px-4 py-4 text-right text-sm text-gray-300">
                {entry.metricValues.average_density !== undefined &&
                entry.metricValues.average_density !== null
                  ? entry.metricValues.average_density.toFixed(2)
                  : '-'}
              </td>
              <td className="px-4 py-4 text-right text-sm text-gray-300">
                {entry.metricValues.average_local_error !== undefined &&
                entry.metricValues.average_local_error !== null
                  ? entry.metricValues.average_local_error.toPrecision(2)
                  : '-'}
              </td>
              <td className="px-4 py-4 text-right text-sm text-gray-300">
                {entry.metricValues.aux_memory !== undefined && entry.metricValues.aux_memory !== null
                  ? entry.metricValues.aux_memory.toLocaleString()
                  : '-'}
              </td>
              {metricNames.map(name => (
                <td key={name} className="px-4 py-4 text-right text-sm text-gray-300">
                  {entry.metricValues[name] !== undefined 
                    ? entry.metricValues[name].toFixed(2) 
                    : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
