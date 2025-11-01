import { useQuery } from '@tanstack/react-query';
import type { Dataset } from '@sky-light/shared-types';
import { api } from '../services/api';

export function useDatasets() {
  return useQuery<Dataset[]>({
    queryKey: ['datasets'],
    queryFn: () => api.datasets.getAll(),
  });
}

export function useDatasetsByBenchmark(benchmarkId?: string) {
  return useQuery<Dataset[]>({
    queryKey: ['datasets', 'benchmark', benchmarkId],
    queryFn: () => api.benchmarks.getDatasets(benchmarkId!),
    enabled: !!benchmarkId,
  });
}

