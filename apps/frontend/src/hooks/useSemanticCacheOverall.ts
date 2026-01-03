import { useQuery } from '@tanstack/react-query';
import type { SemanticCacheOverallRanking, SemanticCacheStats } from '@sky-light/shared-types';
import { semanticCacheApi } from '../services/semanticCacheApi';

export function useSemanticCacheOverall() {
  return useQuery<SemanticCacheOverallRanking[], Error>({
    queryKey: ['semantic-cache', 'overall'],
    queryFn: () => semanticCacheApi.getOverallRankings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSemanticCacheStats() {
  return useQuery<SemanticCacheStats, Error>({
    queryKey: ['semantic-cache', 'stats'],
    queryFn: () => semanticCacheApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
}

