import { useState } from 'react';
import type { AggregatedRanking } from '@sky-light/shared-types';
import { InfoTooltip } from '../common/InfoTooltip';
import { SortableHeader } from '../common/SortableHeader';
import { useSortableData } from '../../hooks/useSortableData';
import { useDatasets } from '../../hooks/useDatasets';
import { useBenchmarks } from '../../hooks/useBenchmarks';

interface AggregatedTableProps {
  rankings: AggregatedRanking[];
}

export function AggregatedTable({ rankings }: AggregatedTableProps) {
  const { sortedData, sortConfig, requestSort } = useSortableData(rankings);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { data: datasets } = useDatasets();
  const { data: benchmarks } = useBenchmarks();
  
  console.log('AggregatedTable rankings:', rankings);
  if (rankings.length > 0) {
    console.log('First ranking:', rankings[0]);
    console.log('First ranking datasetScores:', rankings[0].datasetScores);
    console.log('First ranking avgLocalError:', rankings[0].avgLocalError);
    console.log('First ranking avgSparsity:', rankings[0].avgSparsity);
  }
  
  const toggleRowExpansion = (rankingKey: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rankingKey)) {
        newSet.delete(rankingKey);
      } else {
        newSet.add(rankingKey);
      }
      return newSet;
    });
  };

  if (rankings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto overflow-y-auto max-h-[680px]">
        <table className="w-full">
          <thead className="sticky top-0 bg-dark-surface z-10">
            <tr className="border-b border-dark-border">
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
                  Sparse Attention
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
                  Score
                  <InfoTooltip content="Overall performance score averaged across all datasets. Higher is better." />
                </div>
              }
              sortKey="overallScore"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Local Errors
                  <InfoTooltip content="Average local error across all datasets. Lower is better." />
                </div>
              }
              sortKey="avgLocalError"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Sparsity
                  <InfoTooltip content="Average sparsity level used in experiments." />
                </div>
              }
              sortKey="avgSparsity"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Aux Memory
                  <InfoTooltip content="Average auxiliary memory used in experiments." />
                </div>
              }
              sortKey="avgAuxMemory"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((ranking, idx) => {
            const rankingKey = `${ranking.baseline.id}-${ranking.llm.id}`;
            const isExpanded = expandedRows.has(rankingKey);
            
            return (
              <>
                <tr 
                  key={rankingKey}
                  className={`border-b border-dark-border hover:bg-dark-surface-hover transition-colors cursor-pointer select-none ${
                idx < 3 ? 'bg-yellow-500/5' : ''
              }`}
                  onClick={() => toggleRowExpansion(rankingKey)}
                  title="Click to see dataset breakdown"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <div className="font-medium text-white">{ranking.llm.name}</div>
                        <div className="text-xs text-gray-400">{ranking.llm.provider}</div>
                      </div>
                    </div>
              </td>
              <td className="px-4 py-4">
                <div className="font-medium text-white">{ranking.baseline.name}</div>
                <div className="text-xs text-gray-400 max-w-xs truncate">{ranking.baseline.description}</div>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="font-semibold text-accent-gold text-lg">
                  {ranking.overallScore.toFixed(2)}
                </span>
              </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-gray-400">
                      {ranking.avgLocalError?.toFixed(4) || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-gray-400">
                      {ranking.avgSparsity?.toFixed(2) || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-gray-400">
                      {(ranking as any).avgAuxMemory?.toFixed(0) || '-'}
                    </span>
                  </td>
                </tr>
                
                {isExpanded && (
                  <tr key={`${rankingKey}-expanded`}>
                    <td colSpan={6} className="p-0 bg-dark-bg">
                      <div className="border-l-4 border-accent-gold/20 bg-dark-bg/30">
                        <div className="max-h-96 overflow-y-auto">
                          <table className="w-full table-fixed">
                            <thead className="bg-dark-surface/50 sticky top-0 z-10">
                              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                                <th className="w-[40%] px-4 py-2 text-left font-medium">Model/Config</th>
                                <th className="w-[20%] px-4 py-2 text-left font-medium">Dataset</th>
                                <th className="w-[10%] px-4 py-2 text-right font-medium">Score</th>
                                <th className="w-[10%] px-4 py-2 text-right font-medium">Local Err</th>
                                <th className="w-[10%] px-4 py-2 text-right font-medium">Sparsity</th>
                                <th className="w-[10%] px-4 py-2 text-right font-medium">Aux Mem</th>
                              </tr>
                            </thead>
                            <tbody>
                              {!datasets || !benchmarks ? (
                                <tr>
                                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                                    Loading dataset information...
                                  </td>
                                </tr>
                              ) : Object.keys(ranking.datasetScores).length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                                    No individual dataset scores available
                                  </td>
                                </tr>
                              ) : (
                                <>
                                  {/* Group datasets by benchmark for better organization */}
                                  {(() => {
                                    const groupedData = Object.entries(ranking.datasetScores).reduce((acc, [datasetId, score]) => {
                                      const dataset = datasets?.find(d => d.id === datasetId);
                                      const benchmark = benchmarks?.find(b => b.id === dataset?.benchmarkId);
                                      const benchmarkName = benchmark?.name || 'Unknown';
                                      
                                      if (!acc[benchmarkName]) {
                                        acc[benchmarkName] = [];
                                      }
                                      
                                      acc[benchmarkName].push({
                                        datasetId,
                                        dataset,
                                        score,
                                        benchmark,
                                        details: (ranking as any).datasetDetails?.[datasetId] || {}
                                      });
                                      
                                      return acc;
                                    }, {} as Record<string, any[]>);
                                    
                                    let isFirstRow = true;
                                    
                                    return Object.entries(groupedData)
                                      .sort(([a], [b]) => a.localeCompare(b))  // Sort benchmarks alphabetically
                                      .flatMap(([benchmarkName, datasets]) => 
                                        datasets
                                          .sort((a, b) => b.score - a.score)  // Sort by score within benchmark
                                          .map(({ datasetId, dataset, score, benchmark, details }) => {
                                            const currentIsFirst = isFirstRow;
                                            isFirstRow = false;
                                            
                                            return (
                            <tr 
                              key={datasetId}
                              className="border-t border-dark-border/30 hover:bg-dark-surface/20 transition-colors"
                            >
                              {currentIsFirst && (
                                <td className="w-[40%] px-4 py-3 align-top" rowSpan={Object.keys(ranking.datasetScores).length}>
                                  <div className="text-sm text-white">{ranking.llm.name}</div>
                                  <div className="text-xs text-gray-400 mb-2">{ranking.baseline.name}</div>
                                  <div className="mt-2 p-2 bg-black/30 rounded">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Config (example)</p>
                                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
{`{
  "sparse_attention_config": {
    "method": "${ranking.baseline.name}",
    "sparsity": ${details.sparsity || 0},
    "aux_memory": ${details.auxMemory || 0}
  }
}`}
                                    </pre>
                                  </div>
                                </td>
                              )}
                              <td className="w-[20%] px-4 py-3">
                                <div className="text-sm text-white truncate">{dataset?.name || datasetId}</div>
                                <div className="text-xs text-gray-400">{benchmark?.name}</div>
                              </td>
                              <td className="w-[10%] px-4 py-3 text-right">
                                <span className="text-sm font-medium text-accent-gold">
                                  {score.toFixed(1)}
                                </span>
                              </td>
                              <td className="w-[10%] px-4 py-3 text-right text-sm text-gray-400">
                                {details.localErrors || 0}
                              </td>
                              <td className="w-[10%] px-4 py-3 text-right text-sm text-gray-400">
                                {details.sparsity?.toFixed(2) || '-'}
                              </td>
                              <td className="w-[10%] px-4 py-3 text-right text-sm text-gray-400">
                                {details.auxMemory || '-'}
              </td>
                            </tr>
                                            );
                                          })
                                      );
                                  })()}
                                </>
                              )}
                            </tbody>
                          </table>
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
    
    {/* Scroll indicator - shows when there's more content */}
    {rankings.length > 10 && (
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-dark-surface to-transparent pointer-events-none" />
    )}
  </div>
  );
}
