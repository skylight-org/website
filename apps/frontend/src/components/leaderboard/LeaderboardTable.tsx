import { Fragment, useState } from 'react';
import type { DatasetRanking, Metric } from '@sky-light/shared-types';
import { SortableHeader } from '../common/SortableHeader';
import { useSortableData } from '../../hooks/useSortableData';

interface LeaderboardTableProps {
  entries: DatasetRanking[];
  metrics?: Array<Metric & { weight: number; isPrimary: boolean }>;
}

export function LeaderboardTable({ entries, metrics = [] }: LeaderboardTableProps) {
  const { sortedData, sortConfig, requestSort } = useSortableData(entries);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No data available
      </div>
    );
  }

  const metricNames = Object.keys(entries[0]?.metricValues || {});
  const columnCount = 5 + metricNames.length;

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
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Config
            </th>
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
          {sortedData.map((entry, idx) => {
            const isExpanded = expandedId === entry.configurationId;
            const hasConfiguration = !!entry.configuration;

            return (
              <Fragment key={entry.configurationId}>
                <tr
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
                  <td className="px-4 py-4 text-left text-sm">
                    {hasConfiguration ? (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : entry.configurationId)}
                        className="rounded border border-dark-border px-3 py-1 text-xs font-medium text-accent-gold transition-colors hover:border-accent-gold/60 hover:text-accent-gold"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Unavailable</span>
                    )}
                  </td>
                  {metricNames.map(name => (
                    <td key={name} className="px-4 py-4 text-right text-sm text-gray-300">
                      {entry.metricValues[name] !== undefined
                        ? entry.metricValues[name].toFixed(2)
                        : '-'}
                    </td>
                  ))}
                </tr>
                {isExpanded && (
                  <tr className="border-b border-dark-border bg-dark-surface">
                    <td colSpan={columnCount} className="px-6 py-4">
                      <div className="rounded-lg border border-dark-border bg-black/30 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-accent-gold">
                          Configuration Details
                        </h4>
                        <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs text-gray-200">
                          {formatConfigurationDetails(entry.configuration)}
                        </pre>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatConfigurationDetails(configuration?: DatasetRanking['configuration']): string {
  if (!configuration) {
    return 'No configuration details available for this entry.';
  }

  const { additionalParams } = configuration;

  if (!additionalParams) {
    return 'No configuration parameters available.';
  }

  // If it's a string, return as-is
  if (typeof additionalParams === 'string') {
    return additionalParams;
  }

  const params = additionalParams as Record<string, unknown>;

  // Priority 1: Show only sparse_attention_config if it exists
  if (params.sparse_attention_config) {
    return JSON.stringify(params.sparse_attention_config, null, 2);
  }

  // Priority 2: Check for python_config string
  if (typeof params.python_config === 'string') {
    return params.python_config;
  }

  // Priority 3: Check for config string
  if (typeof params.config === 'string') {
    return params.config;
  }

  // Fallback: Show all additionalParams
  return JSON.stringify(additionalParams, null, 2);
}
