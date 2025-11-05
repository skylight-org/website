import type { AggregatedRanking } from '@sky-light/shared-types';
import { InfoTooltip } from '../common/InfoTooltip';
import { SortableHeader } from '../common/SortableHeader';
import { useSortableData } from '../../hooks/useSortableData';

interface AggregatedTableProps {
  rankings: AggregatedRanking[];
}

export function AggregatedTable({ rankings }: AggregatedTableProps) {
  const { sortedData, sortConfig, requestSort } = useSortableData(rankings);

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
              label="Rank"
              sortKey="rank"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="left"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Baseline
                  <InfoTooltip content="The sparse attention implementation being evaluated. Each baseline represents a different approach to optimizing attention mechanisms." />
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
                  <InfoTooltip content="The Large Language Model used for testing. Different LLMs may show different performance characteristics with the same baseline." />
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
                  Avg Rank
                  <InfoTooltip content="Average ranking position across all datasets. This is calculated by taking the mean of the baseline's rank on each individual dataset. Lower is better." />
                </div>
              }
              sortKey="averageRank"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label={
                <div className="flex items-center gap-1">
                  Overall Score
                  <InfoTooltip content="Normalized performance score averaged across all datasets. This represents the actual metric values (not ranks). Higher scores indicate better performance." />
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
                  Best / Worst
                  <InfoTooltip content="Shows the best (lowest) and worst (highest) rank achieved by this baseline+LLM combination across all datasets. For example, '1 / 5' means it ranked 1st on its best dataset and 5th on its worst dataset." />
                </div>
              }
              sortKey="bestDatasetRank"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
            <SortableHeader
              label="#Datasets"
              sortKey="numDatasets"
              sortConfig={sortConfig}
              onSort={requestSort}
              align="right"
            />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((ranking, idx) => (
            <tr 
              key={`${ranking.baseline.id}-${ranking.llm.id}`}
              className={`border-b border-dark-border hover:bg-dark-surface-hover transition-colors ${
                idx < 3 ? 'bg-yellow-500/5' : ''
              }`}
            >
              <td className="px-4 py-4 text-sm">
                <span className={`font-semibold ${
                  ranking.rank === 1 ? 'text-yellow-400' :
                  ranking.rank === 2 ? 'text-gray-300' :
                  ranking.rank === 3 ? 'text-orange-400' :
                  'text-gray-400'
                }`}>
                  #{ranking.rank}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="font-medium text-white">{ranking.baseline.name}</div>
                <div className="text-xs text-gray-400 max-w-xs truncate">{ranking.baseline.description}</div>
              </td>
              <td className="px-4 py-4">
                <div className="font-medium text-white">{ranking.llm.name}</div>
                <div className="text-xs text-gray-400">{ranking.llm.provider}</div>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="font-semibold text-white">
                  {ranking.averageRank.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="font-semibold text-accent-gold text-lg">
                  {ranking.overallScore.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-4 text-right text-sm text-gray-400">
                {ranking.bestDatasetRank} / {ranking.worstDatasetRank}
              </td>
              <td className="px-4 py-4 text-right text-sm text-gray-400">
                {ranking.numDatasets}
              </td>
            </tr>
          ))}
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
