import type {
  SemanticCacheBaseline,
  SemanticCacheDataset,
  SemanticCacheOverallRanking,
  SemanticCacheDatasetRanking,
  SemanticCacheStats,
} from '@sky-light/shared-types';

// 4 Baselines
export const mockBaselines: SemanticCacheBaseline[] = [
  {
    id: '1',
    name: 'vCache',
    description: 'Verified cache with per-embedding dynamic thresholds',
    supportsGuarantees: true,
    thresholdType: 'dynamic',
  },
  {
    id: '2',
    name: 'GPTCache',
    description: 'Static threshold semantic cache',
    supportsGuarantees: false,
    thresholdType: 'static',
  },
  {
    id: '3',
    name: 'Fine-tuned Embeddings',
    description: 'Static threshold with domain-adapted embeddings',
    supportsGuarantees: false,
    thresholdType: 'static',
  },
  {
    id: '4',
    name: 'No Cache',
    description: 'Direct LLM inference (control)',
    supportsGuarantees: true,
    thresholdType: 'none',
  },
];

// 4 Datasets
export const mockDatasets: SemanticCacheDataset[] = [
  {
    id: 'classification',
    name: 'SemCacheClassification',
    description: 'Short-form classification tasks with fixed label spaces (CommonsenseQA, E-commerce, Amazon Reviews)',
    size: 45000,
    domain: 'classification',
    numClasses: 21,
  },
  {
    id: 'lmarena',
    name: 'SemCacheLMArena',
    description: 'Chatbot-style queries with paraphrased variants from real-world user interactions',
    size: 60000,
    domain: 'chatbot',
    numClasses: 3500,
  },
  {
    id: 'search',
    name: 'SemCacheSearchQueries',
    description: 'Real-world search engine queries from ORCAS dataset with semantic equivalence classes',
    size: 150000,
    domain: 'search',
    numClasses: 54961,
  },
  {
    id: 'combo',
    name: 'SemCacheCombo',
    description: 'Combined cross-domain evaluation testing out-of-distribution robustness',
    size: 50000,
    domain: 'mixed',
  },
];

// Overall Rankings (aggregated across 4 datasets × 4 error budgets = 16 configs)
export const mockOverallRankings: SemanticCacheOverallRanking[] = [
  {
    rank: 1,
    baseline: mockBaselines[0],  // vCache
    avgRank: 1.31,
    avgHitRate: 64.2,
    avgErrorRate: 0.82,
    boundViolations: 0,
    hasGuarantees: true,
    datasetRanks: {
      classification: 1,
      lmarena: 1,
      search: 2,
      combo: 1,
    },
    datasetHitRates: {
      classification: 67.3,
      lmarena: 71.2,
      search: 58.1,
      combo: 60.5,
    },
  },
  {
    rank: 2,
    baseline: mockBaselines[2],  // Fine-tuned Embeddings
    avgRank: 2.12,
    avgHitRate: 56.8,
    avgErrorRate: 1.15,
    boundViolations: 0,
    hasGuarantees: false,
    datasetRanks: {
      classification: 2,
      lmarena: 2,
      search: 1,
      combo: 3,
    },
    datasetHitRates: {
      classification: 58.2,
      lmarena: 63.5,
      search: 59.3,
      combo: 46.2,
    },
  },
  {
    rank: 3,
    baseline: mockBaselines[1],  // GPTCache
    avgRank: 2.81,
    avgHitRate: 48.3,
    avgErrorRate: 1.85,
    boundViolations: 3,
    hasGuarantees: false,
    datasetRanks: {
      classification: 3,
      lmarena: 3,
      search: 3,
      combo: 2,
    },
    datasetHitRates: {
      classification: 45.1,
      lmarena: 52.3,
      search: 43.2,
      combo: 52.6,
    },
  },
  {
    rank: 4,
    baseline: mockBaselines[3],  // No Cache
    avgRank: 4.0,
    avgHitRate: 0.0,
    avgErrorRate: 0.0,
    boundViolations: 0,
    hasGuarantees: true,
    datasetRanks: {
      classification: 4,
      lmarena: 4,
      search: 4,
      combo: 4,
    },
    datasetHitRates: {
      classification: 0.0,
      lmarena: 0.0,
      search: 0.0,
      combo: 0.0,
    },
  },
];

// Per-Dataset Rankings (at δ=1.0% for display)
export const mockDatasetRankings: Record<string, SemanticCacheDatasetRanking[]> = {
  classification: [
    {
      rank: 1,
      baseline: mockBaselines[0],  // vCache
      hitRate: 67.3,
      errorRate: 0.8,
      errorBound: 1.0,
      latencyReduction: 52,
      boundSatisfied: true,
      hasGuarantees: true,
    },
    {
      rank: 2,
      baseline: mockBaselines[2],  // Fine-tuned
      hitRate: 58.2,
      errorRate: 0.9,
      errorBound: 1.0,
      latencyReduction: 48,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 3,
      baseline: mockBaselines[1],  // GPTCache
      hitRate: 45.1,
      errorRate: 0.95,
      errorBound: 1.0,
      latencyReduction: 35,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 4,
      baseline: mockBaselines[3],  // No Cache
      hitRate: 0.0,
      errorRate: 0.0,
      errorBound: 1.0,
      latencyReduction: 1,
      boundSatisfied: true,
      hasGuarantees: true,
    },
  ],
  lmarena: [
    {
      rank: 1,
      baseline: mockBaselines[0],  // vCache
      hitRate: 71.2,
      errorRate: 0.75,
      errorBound: 1.0,
      latencyReduction: 58,
      boundSatisfied: true,
      hasGuarantees: true,
    },
    {
      rank: 2,
      baseline: mockBaselines[2],  // Fine-tuned
      hitRate: 63.5,
      errorRate: 0.88,
      errorBound: 1.0,
      latencyReduction: 51,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 3,
      baseline: mockBaselines[1],  // GPTCache
      hitRate: 52.3,
      errorRate: 0.92,
      errorBound: 1.0,
      latencyReduction: 41,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 4,
      baseline: mockBaselines[3],  // No Cache
      hitRate: 0.0,
      errorRate: 0.0,
      errorBound: 1.0,
      latencyReduction: 1,
      boundSatisfied: true,
      hasGuarantees: true,
    },
  ],
  search: [
    {
      rank: 1,
      baseline: mockBaselines[2],  // Fine-tuned
      hitRate: 59.3,
      errorRate: 0.85,
      errorBound: 1.0,
      latencyReduction: 45,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 2,
      baseline: mockBaselines[0],  // vCache
      hitRate: 58.1,
      errorRate: 0.87,
      errorBound: 1.0,
      latencyReduction: 43,
      boundSatisfied: true,
      hasGuarantees: true,
    },
    {
      rank: 3,
      baseline: mockBaselines[1],  // GPTCache
      hitRate: 43.2,
      errorRate: 0.98,
      errorBound: 1.0,
      latencyReduction: 32,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 4,
      baseline: mockBaselines[3],  // No Cache
      hitRate: 0.0,
      errorRate: 0.0,
      errorBound: 1.0,
      latencyReduction: 1,
      boundSatisfied: true,
      hasGuarantees: true,
    },
  ],
  combo: [
    {
      rank: 1,
      baseline: mockBaselines[0],  // vCache
      hitRate: 60.5,
      errorRate: 0.86,
      errorBound: 1.0,
      latencyReduction: 47,
      boundSatisfied: true,
      hasGuarantees: true,
    },
    {
      rank: 2,
      baseline: mockBaselines[1],  // GPTCache
      hitRate: 52.6,
      errorRate: 0.91,
      errorBound: 1.0,
      latencyReduction: 39,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 3,
      baseline: mockBaselines[2],  // Fine-tuned
      hitRate: 46.2,
      errorRate: 0.94,
      errorBound: 1.0,
      latencyReduction: 36,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 4,
      baseline: mockBaselines[3],  // No Cache
      hitRate: 0.0,
      errorRate: 0.0,
      errorBound: 1.0,
      latencyReduction: 1,
      boundSatisfied: true,
      hasGuarantees: true,
    },
  ],
};

export const mockStats: SemanticCacheStats = {
  totalBaselines: 4,
  totalDatasets: 4,
  totalConfigurations: 64,  // 4 baselines × 4 datasets × 4 error budgets
  avgHitRate: 48.3,
  avgErrorRate: 1.2,
};

