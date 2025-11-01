import type { DatasetRanking, Metric } from '@sky-light/shared-types';

interface LeaderboardTableProps {
  entries: DatasetRanking[];
  metrics?: Array<Metric & { weight: number; isPrimary: boolean }>;
}

export function LeaderboardTable({ entries, metrics = [] }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No data available
      </div>
    );
  }

  // Get metric names from the first entry's metricValues
  const metricNames = Object.keys(entries[0]?.metricValues || {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Baseline</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">LLM</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Score</th>
            {metricNames.map(name => {
              const metric = metrics.find(m => m.name === name);
              return (
                <th key={name} className="px-4 py-3 text-right text-sm font-semibold text-gray-400">
                  {metric?.displayName || name.replace(/_/g, ' ')}
                  {metric?.unit && <span className="text-xs ml-1">({metric.unit})</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
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
