import type { DatasetRanking, Metric } from '@sky-light/shared-types';
import { SortableHeader } from '../common/SortableHeader';
import { useSortableData } from '../../hooks/useSortableData';

interface LeaderboardTableProps {
  entries: DatasetRanking[];
  metrics?: Array<Metric & { weight: number; isPrimary: boolean }>;
}

export function LeaderboardTable({ entries, metrics = [] }: LeaderboardTableProps) {
  const { sortedData, sortConfig, requestSort } = useSortableData(entries);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No data available
      </div>
    );
  }

  const metricNames = Object.keys(entries[0]?.metricValues || {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            <SortableHeader
              label="Rank"
              sortKey="rank"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="left"
            />
            <SortableHeader
              label="Baseline"
              sortKey="baseline.name"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="left"
            />
            <SortableHeader
              label="LLM"
              sortKey="llm.name"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="left"
            />
            <SortableHeader
              label="Score"
              sortKey="score"
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
              key={`${entry.baseline.id}-${entry.llm.id}`}
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
                <div className="text-xs text-gray-400">{entry.baseline.version}</div>
              </td>
              <td className="px-4 py-4">
                <div className="font-medium text-white">{entry.llm.name}</div>
                <div className="text-xs text-gray-400">{entry.llm.provider}</div>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="font-semibold text-accent-gold text-lg">{entry.score.toFixed(2)}</span>
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
