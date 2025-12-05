import { useQuery } from '@tanstack/react-query';
import type { CombinedViewResult } from '@sky-light/shared-types';
import { api } from '../services/api';

export function useCombinedViewOverallScore() {
  return useQuery<{
    metric: string;
    sparsities: number[];
    results: CombinedViewResult[];
  }>({
    queryKey: ['combinedView', 'overallScore'],
    queryFn: () => api.combinedView.getOverallScore(),
    staleTime: Infinity, // Cache forever since it's generated on server startup
  });
}

export function useCombinedViewLocalError() {
  return useQuery<{
    metric: string;
    sparsities: number[];
    results: CombinedViewResult[];
  }>({
    queryKey: ['combinedView', 'localError'],
    queryFn: () => api.combinedView.getLocalError(),
    staleTime: Infinity, // Cache forever since it's generated on server startup
  });
}

export function useCombinedViewBoth() {
  return useQuery<{
    sparsities: number[];
    overallScore: {
      metric: string;
      results: CombinedViewResult[];
    };
    localError: {
      metric: string;
      results: CombinedViewResult[];
    };
  }>({
    queryKey: ['combinedView', 'both'],
    queryFn: () => api.combinedView.getBoth(),
    staleTime: Infinity, // Cache forever since it's generated on server startup
  });
}

export function useCombinedViewVAttentionBlog() {
  return useQuery<{
    sparsities: number[];
    overallScore: {
      metric: string;
      results: CombinedViewResult[];
    };
    localError: {
      metric: string;
      results: CombinedViewResult[];
    };
  }>({
    queryKey: ['combinedView', 'vattentionBlog'],
    queryFn: () => api.combinedView.getVAttentionBlog(),
    staleTime: Infinity, // Cache forever since it's generated on server startup
  });
}

