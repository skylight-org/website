import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Metric } from '@sky-light/shared-types';

export function useMetrics() {
  return useQuery<Metric[], Error>({
    queryKey: ['metrics'],
    queryFn: api.metrics.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMetric(id: string | undefined) {
  return useQuery<Metric, Error>({
    queryKey: ['metrics', id],
    queryFn: () => api.metrics.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDatasetMetrics(datasetId: string | undefined) {
  return useQuery<Array<Metric & { weight: number; isPrimary: boolean }>, Error>({
    queryKey: ['metrics', 'dataset', datasetId],
    queryFn: () => api.metrics.getByDatasetId(datasetId!),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
}

