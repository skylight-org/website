import { useQuery } from '@tanstack/react-query';
import type { SemanticCacheDataset } from '@sky-light/shared-types';
import { semanticCacheApi } from '../services/semanticCacheApi';

export function useSemanticCacheDatasets() {
  return useQuery<SemanticCacheDataset[], Error>({
    queryKey: ['semantic-cache', 'datasets'],
    queryFn: () => semanticCacheApi.getDatasets(),
    staleTime: 5 * 60 * 1000,
  });
}

