import { useQuery } from '@tanstack/react-query';
import type { BaselineRanking } from '@sky-light/shared-types';
import { api } from '../services/api';

export function useBaselineRankings() {
  return useQuery<BaselineRanking[]>({
    queryKey: ['baseline-rankings'],
    queryFn: () => api.baselineRankings.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

