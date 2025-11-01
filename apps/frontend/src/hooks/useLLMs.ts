import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { LLM } from '@sky-light/shared-types';

export function useLLMs() {
  return useQuery<LLM[], Error>({
    queryKey: ['llms'],
    queryFn: api.llms.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLLM(id: string | undefined) {
  return useQuery<LLM, Error>({
    queryKey: ['llms', id],
    queryFn: () => api.llms.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

