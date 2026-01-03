import { useQuery } from '@tanstack/react-query';
import type { SemanticCacheDataset, SemanticCacheDatasetRanking } from '@sky-light/shared-types';
import { semanticCacheApi } from '../services/semanticCacheApi';

export function useSemanticCacheDatasetRankings(datasetId?: string) {
  return useQuery<SemanticCacheDatasetRanking[], Error>({
    queryKey: ['semantic-cache', 'dataset', datasetId],
    queryFn: () => semanticCacheApi.getDatasetRankings(datasetId!),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSemanticCacheDataset(datasetId?: string) {
  return useQuery<SemanticCacheDataset | undefined, Error>({
    queryKey: ['semantic-cache', 'dataset-info', datasetId],
    queryFn: () => semanticCacheApi.getDatasetById(datasetId!),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
}

