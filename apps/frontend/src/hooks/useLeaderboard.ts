import { useQuery } from '@tanstack/react-query';
import type { DatasetRanking, AggregatedRanking, OverviewStats, NumericRange } from '@sky-light/shared-types';
import { api } from '../services/api';

export function useDatasetLeaderboard(
  datasetId?: string,
  params?: {
    targetSparsity?: NumericRange;
    llmId?: string;
  }
) {
  return useQuery<DatasetRanking[], Error>({
    queryKey: ['leaderboard', 'dataset', datasetId, params],
    queryFn: () => api.leaderboards.getDataset(datasetId!, params),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOverallLeaderboard(params?: { 
  experimentalRunId?: string; 
  benchmarkId?: string; 
  llmId?: string;
  targetSparsity?: NumericRange;
}) {
  return useQuery<AggregatedRanking[], Error>({
    queryKey: ['leaderboard', 'overall', params],
    queryFn: () => api.leaderboards.getOverall(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOverviewStats() {
  return useQuery<OverviewStats, Error>({
    queryKey: ['leaderboard', 'overview'],
    queryFn: () => api.leaderboards.getOverview(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlotData(params?: {
  targetSparsity?: NumericRange;
}) {
  return useQuery<DatasetRanking[], Error>({
    queryKey: ['leaderboard', 'plot-data', params],
    queryFn: () => api.leaderboards.getPlotData(params),
  });
}

export function useAvailableSparsityValues() {
  return useQuery<number[], Error>({
    queryKey: ['leaderboard', 'filters', 'sparsity'],
    queryFn: () => api.leaderboards.getAvailableSparsityValues(),
    staleTime: 15 * 60 * 1000, // 15 minutes (filter values change rarely)
  });
}
