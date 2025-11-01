import { useQuery } from '@tanstack/react-query';
import type { Benchmark } from '@sky-light/shared-types';
import { api } from '../services/api';

export function useBenchmarks() {
  return useQuery<Benchmark[]>({
    queryKey: ['benchmarks'],
    queryFn: () => api.benchmarks.getAll(),
  });
}

