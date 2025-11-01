import { useQuery } from '@tanstack/react-query';
import type { DatasetRanking, AggregatedRanking, OverviewStats } from '@sky-light/shared-types';
import { api } from '../services/api';

export function useDatasetLeaderboard(
  datasetId?: string,
  experimentalRunId?: string
) {
  return useQuery<DatasetRanking[], Error>({
    queryKey: ['leaderboard', 'dataset', datasetId, experimentalRunId],
    queryFn: () => api.leaderboards.getDataset(datasetId!, experimentalRunId),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOverallLeaderboard(params?: { 
  experimentalRunId?: string; 
  benchmarkId?: string; 
  llmId?: string;
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
