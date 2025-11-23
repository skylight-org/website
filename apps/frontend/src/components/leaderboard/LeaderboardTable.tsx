import { useState } from 'react';
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleRowExpansion = (configId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(configId)) {
        newSet.delete(configId);
      } else {
        newSet.add(configId);
      }
      return newSet;
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Replacer function to remove 'search_space' keys from JSON output
  const jsonReplacer = (key: string, value: any) => {
    if (key === 'search_space') {
      return undefined;
    }
    return value;
  };

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
          {sortedData.map((entry, idx) => {
            const isExpanded = expandedRows.has(entry.configurationId);
            
            return (
              <>
                <tr 
                  key={entry.configurationId}
                  className={`border-b border-dark-border hover:bg-dark-surface-hover transition-colors cursor-pointer ${
                    idx < 3 ? 'bg-yellow-500/5' : ''
                  }`}
                  onClick={() => toggleRowExpansion(entry.configurationId)}
                >
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <svg 
                        className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className={`font-semibold ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-orange-400' :
                        'text-gray-400'
                      }`}>
                        #{entry.rank}
                      </span>
                    </div>
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
                
                {isExpanded && (
                  <tr key={`${entry.configurationId}-config`} className="border-b border-dark-border bg-black/20">
                    <td colSpan={7 + metricNames.length} className="px-4 py-4">
                      <div className="p-4 bg-black/30 rounded border border-dark-border/30">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-accent-gold">Configuration Details</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const configToCopy = entry.configuration?.additionalParams?.sparse_attention_config ?? { name: 'DenseAttention', description: 'Standard full attention mechanism.' };
                              handleCopy(
                                JSON.stringify(configToCopy, jsonReplacer, 2),
                                entry.configurationId
                              );
                            }}
                            className="text-xs px-2 py-1 text-gray-400 hover:text-white hover:bg-dark-surface rounded transition-colors"
                          >
                            {copiedKey === entry.configurationId ? 'Copied!' : 'Copy Config'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Sparse Attention Config</p>
                            <pre className="text-xs text-gray-300 font-mono bg-dark-bg p-3 rounded overflow-x-auto max-h-60">
{entry.configuration?.additionalParams?.sparse_attention_config
  ? JSON.stringify(entry.configuration.additionalParams.sparse_attention_config, jsonReplacer, 2)
  : JSON.stringify({ name: 'DenseAttention', description: 'Standard full attention mechanism.' }, null, 2)
}
                            </pre>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Metadata</p>
                              <div className="text-xs text-gray-300 space-y-1">
                                <div className="flex justify-between border-b border-dark-border/30 pb-1">
                                  <span>Created At:</span>
                                  <span>{new Date(entry.configuration.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-dark-border/30 pb-1">
                                  <span>Target Sparsity:</span>
                                  <span>{entry.targetSparsity !== undefined ? `${entry.targetSparsity}%` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-dark-border/30 pb-1">
                                  <span>Target Aux Memory:</span>
                                  <span>{entry.targetAuxMemory !== undefined ? entry.targetAuxMemory : 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            {entry.configuration?.additionalParams && Object.keys(entry.configuration.additionalParams).length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Additional Parameters</p>
                                <pre className="text-xs text-gray-300 font-mono bg-dark-bg p-3 rounded overflow-x-auto max-h-40">
{JSON.stringify(
  Object.fromEntries(
    Object.entries(entry.configuration.additionalParams).filter(([key]) => key !== 'sparse_attention_config')
  ), 
  jsonReplacer, 
  2
)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
