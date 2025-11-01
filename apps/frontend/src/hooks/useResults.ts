import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Result } from '@sky-light/shared-types';

export function useResults() {
  return useQuery<Result[], Error>({
    queryKey: ['results'],
    queryFn: api.results.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useConfigurationResults(configurationId: string | undefined) {
  return useQuery<Result[], Error>({
    queryKey: ['results', 'configuration', configurationId],
    queryFn: () => api.results.getByConfigurationId(configurationId!),
    enabled: !!configurationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDatasetResults(datasetId: string | undefined, experimentalRunId?: string) {
  return useQuery<Result[], Error>({
    queryKey: ['results', 'dataset', datasetId, experimentalRunId],
    queryFn: () => api.results.getByDatasetId(datasetId!, experimentalRunId),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
}

