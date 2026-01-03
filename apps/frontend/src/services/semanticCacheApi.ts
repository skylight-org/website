import {
  semanticCacheOverallRankings,
  semanticCacheDatasets,
  semanticCacheDatasetRankings,
  semanticCacheStats,
} from '../data/semanticCacheData';
import type {
  SemanticCacheOverallRanking,
  SemanticCacheDataset,
  SemanticCacheDatasetRanking,
  SemanticCacheStats,
} from '@sky-light/shared-types';

// Simulates API delay for realistic loading states
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const semanticCacheApi = {
  getOverallRankings: async (): Promise<SemanticCacheOverallRanking[]> => {
    await delay(300);
    return semanticCacheOverallRankings;
  },

  getDatasets: async (): Promise<SemanticCacheDataset[]> => {
    await delay(200);
    return semanticCacheDatasets;
  },

  getDatasetRankings: async (datasetId: string): Promise<SemanticCacheDatasetRanking[]> => {
    await delay(300);
    return semanticCacheDatasetRankings[datasetId] || [];
  },

  getDatasetById: async (datasetId: string): Promise<SemanticCacheDataset | undefined> => {
    await delay(200);
    return semanticCacheDatasets.find(d => d.id === datasetId);
  },

  getStats: async (): Promise<SemanticCacheStats> => {
    await delay(200);
    return semanticCacheStats;
  },
};

