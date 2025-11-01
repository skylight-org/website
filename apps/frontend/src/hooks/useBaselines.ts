import { useQuery } from '@tanstack/react-query';
import type { Baseline } from '@sky-light/shared-types';
import { api } from '../services/api';

export function useBaselines() {
  return useQuery<Baseline[]>({
    queryKey: ['baselines'],
    queryFn: () => api.baselines.getAll(),
  });
}

