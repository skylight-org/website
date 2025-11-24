import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { AggregatedRanking } from '@sky-light/shared-types';
import { InfoTooltip } from '../common/InfoTooltip';
import { SortableHeader } from '../common/SortableHeader';
import { Pagination } from '../common/Pagination';
import { useSortableData } from '../../hooks/useSortableData';
import { useDatasets } from '../../hooks/useDatasets';
import { useBenchmarks } from '../../hooks/useBenchmarks';

interface AggregatedTableProps {
  rankings: AggregatedRanking[];
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

export function AggregatedTable({ rankings }: AggregatedTableProps) {
  const { sortedData, sortConfig, requestSort } = useSortableData(rankings, {
    key: 'overallScore',
    direction: 'desc',
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedDatasets, setExpandedDatasets] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: datasets } = useDatasets();
  const { data: benchmarks } = useBenchmarks();

  useEffect(() => {
    setCurrentPage(1);
    setExpandedRows(new Set());
  }, [sortConfig]);
  
  const rankMap = useMemo(() => {
    const map = new Map<number, number>();
    
    if (!sortConfig || sortConfig.direction === null) {
      sortedData.forEach((_, idx) => map.set(idx, idx + 1));
      return map;
    }
    
    let currentRank = 1;
    
    sortedData.forEach((entry, idx) => {
      if (idx === 0) {
        map.set(idx, currentRank);
      } else {
        const currentValue = getNestedValue(entry, sortConfig.key as string);
        const previousValue = getNestedValue(sortedData[idx - 1], sortConfig.key as string);
        
        if (currentValue === previousValue) {
          map.set(idx, map.get(idx - 1)!);
        } else {
          currentRank++;
          map.set(idx, currentRank);
        }
      }
    });
    
    return map;
  }, [sortedData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedRows(new Set());
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    setExpandedRows(new Set());
  };
  
  // Replacer function to remove 'search_space' keys from JSON output
  const jsonReplacer = (key: string, value: any) => {
    if (key === 'search_space') {
      return undefined;
    }
    return value;
  };
  
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000); // Reset after 2 seconds
    });
  };
  
  console.log('AggregatedTable rankings:', rankings);
  if (rankings.length > 0) {
    console.log('First ranking:', rankings[0]);
    console.log('First ranking datasetScores:', rankings[0].datasetScores);
    console.log('First ranking avgLocalError:', rankings[0].avgLocalError);
    console.log('First ranking avgTargetSparsity:', rankings[0].avgTargetSparsity);
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

  const toggleDatasetExpansion = (datasetKey: string) => {
    setExpandedDatasets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(datasetKey)) {
        newSet.delete(datasetKey);
      } else {
        newSet.add(datasetKey);
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-dark-surface z-10">
            <tr className="border-b border-dark-border">
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">
              <div className="flex items-center justify-center gap-1">
                Rank
                <InfoTooltip content="Position in the leaderboard based on overall score." />
              </div>
            </th>
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
                  <InfoTooltip 
                    content={
                      <>
                        Benchmark Metric Score: See{' '}
                        <a 
                          href="https://github.com/xAlg-ai/sparse-attention-hub/tree/main/benchmark" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent-gold hover:underline"
                        >
                          here
                        </a>{' '}
                        for benchmark details. Higher is better.
                      </>
                    } 
                  />
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
                  <InfoTooltip content="Relative approximation error in attention layer output due to sparse attention approximation. Lower is better" />
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
                  Avg Density (%)
                  <InfoTooltip content="The average target density level across all datasets." />
                </div>
              }
              sortKey="avgTargetSparsity"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Avg Aux Memory
                  <InfoTooltip 
                    content={
                      <>
                        Average auxiliary memory used across datasets (bits per token per KV head). See{' '}
                        <Link to="/documentation/auxiliary-memory" className="text-accent-gold hover:underline">
                          here
                        </Link>{' '}
                        for more details on how it is computed
                      </>
                    } 
                  />
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
          {paginatedData.map((ranking, pageIdx) => {
            const globalIdx = (currentPage - 1) * pageSize + pageIdx;
            const rankingKey = `row-${globalIdx}`;
            const isExpanded = expandedRows.has(rankingKey);
            
            return (
              <>
                <tr 
                  key={rankingKey}
                  className={`border-b border-dark-border hover:bg-dark-surface-hover transition-colors cursor-pointer select-none ${
                globalIdx < 3 ? 'bg-yellow-500/5' : ''
              }`}
                  onClick={() => toggleRowExpansion(rankingKey)}
                  title="Click to see dataset breakdown"
                >
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold text-white text-lg">
                      #{rankMap.get(globalIdx)}
                    </span>
                  </td>
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
                <Link
                  to={`/documentation/baselines/${ranking.baseline.id}`}
                  className="font-medium text-white hover:text-accent-gold transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {ranking.baseline.name}
                </Link>
                <div className="text-xs text-gray-500 mt-1">
                  {`Evaluated on ${ranking.numDatasets}/${ranking.totalNumDatasets} datasets`}
                </div>
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
                      {ranking.avgTargetSparsity?.toFixed(2) || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-gray-400">
                      {ranking.avgAuxMemory?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '-'}
                    </span>
                  </td>
                </tr>
                
                {isExpanded && (
                  <tr key={`${rankingKey}-expanded`}>
                    <td colSpan={8} className="p-0 bg-dark-bg">
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
                                        details: ranking.datasetDetails[datasetId] || {}
                                      });
                                      
                                      return acc;
                                    }, {} as Record<string, any[]>);
                                    
                                    return Object.entries(groupedData)
                                      .sort(([a], [b]) => a.localeCompare(b))  // Sort benchmarks alphabetically
                                      .flatMap(([, datasets]) => 
                                        datasets
                                          .sort((a, b) => b.score - a.score)  // Sort by score within benchmark
                                          .flatMap(({ datasetId, dataset, score, benchmark, details }) => {
                                            const datasetKey = `${rankingKey}-${datasetId}`;
                                            const isDatasetExpanded = expandedDatasets.has(datasetKey);
                                            
                                            return [
                            <tr 
                              key={datasetId}
                              className="border-t border-dark-border/30 hover:bg-dark-surface/20 transition-colors cursor-pointer"
                              onClick={() => toggleDatasetExpansion(datasetKey)}
                            >
                              <td className="w-[40%] px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <svg 
                                    className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${isDatasetExpanded ? 'rotate-90' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-500 truncate">{ranking.llm.name} - {ranking.baseline.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="w-[20%] px-4 py-3">
                                {dataset ? (
                                  <Link
                                    to={`/datasets/${datasetId}`}
                                    className="text-sm text-white hover:text-accent-gold transition-colors truncate block"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {dataset.name}
                                  </Link>
                                ) : (
                                  <div className="text-sm text-white truncate">{datasetId}</div>
                                )}
                                <div className="text-xs text-gray-400">{benchmark?.name}</div>
                              </td>
                              <td className="w-[10%] px-4 py-3 text-right">
                                <span className="text-sm font-medium text-accent-gold">
                                  {score.toFixed(1)}
                                </span>
                              </td>
                              <td className="w-[10%] px-4 py-3 text-right text-sm text-gray-400">
                                {details.localError?.toPrecision(2) || '-'}
                              </td>
                              <td className="w-[10%] px-4 py-3 text-right text-sm text-gray-400">
                                {details.sparsity?.toFixed(2) || '-'}
                              </td>
                              <td className="w-[10%] px-4 py-3 text-right text-sm text-gray-400">
                                {details.auxMemory?.toLocaleString() || '-'}
                              </td>
                            </tr>,
                            isDatasetExpanded && (
                              <tr key={`${datasetId}-config`} className="border-t border-dark-border/30">
                                <td colSpan={6} className="px-4 py-3 bg-black/20">
                                  <div className="p-3 bg-black/30 rounded">
                                    <div className="flex justify-between items-center mb-2">
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Sparse Attention Config for {dataset?.name || datasetId}
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const configToCopy = details.configuration?.additionalParams?.sparse_attention_config ?? { name: 'DenseAttention', description: 'Standard full attention mechanism.' };
                                          handleCopy(
                                            JSON.stringify(configToCopy, jsonReplacer, 2),
                                            datasetKey
                                          );
                                        }}
                                        className="text-xs px-2 py-1 text-gray-400 hover:text-white hover:bg-dark-surface rounded transition-colors"
                                      >
                                        {copiedKey === datasetKey ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto max-h-96">
{details.configuration?.additionalParams?.sparse_attention_config
  ? JSON.stringify(details.configuration.additionalParams.sparse_attention_config, jsonReplacer, 2)
  : JSON.stringify({ name: 'DenseAttention', description: 'Standard full attention mechanism.' }, null, 2)
}
                                    </pre>
                                  </div>
                                </td>
                              </tr>
                            )
                          ].filter(Boolean);
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
    
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalItems={sortedData.length}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  </div>
  );
}
