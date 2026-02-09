import type {
  SemanticCacheBaseline,
  SemanticCacheDataset,
  SemanticCacheOverallRanking,
  SemanticCacheDatasetRanking,
  SemanticCacheStats,
} from '@sky-light/shared-types';

// 4 Baselines
export const semanticCacheBaselines: SemanticCacheBaseline[] = [
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
export const semanticCacheDatasets: SemanticCacheDataset[] = [
  {
    id: 'classification',
    name: 'SemCacheClassification',
    description: 'Short-form classification tasks with fixed label spaces (CommonsenseQA, E-commerce, Amazon Reviews)',
    size: 45000,
    domain: 'classification',
  },
  {
    id: 'lmarena',
    name: 'SemCacheLMArena',
    description: 'Chatbot-style queries with paraphrased variants from real-world user interactions',
    size: 50000,
    domain: 'chatbot'
  },
  {
    id: 'search',
    name: 'SemCacheSearchQueries',
    description: 'Real-world search engine queries from ORCAS dataset with semantic equivalence classes',
    size: 150000,
    domain: 'search',
  },
  {
    id: 'combo',
    name: 'SemCacheCombo',
    description: 'Combined cross-domain evaluation testing out-of-distribution robustness',
    size: 27500,
    domain: 'mixed',
  },
];

// Overall Rankings (aggregated across 4 datasets × 4 error budgets = 16 configs)
export const semanticCacheOverallRankings: SemanticCacheOverallRanking[] = [
  {
    rank: 1,
    baseline: semanticCacheBaselines[0],  // vCache
    avgRank: 1.0,
    avgHitRate: 25.85,
    avgErrorRate: 0.90,
    boundViolations: 0,
    hasGuarantees: true,
    datasetRanks: {
      classification: 1,
      lmarena: 1,
      search: 1,
      combo: 1,
    },
    datasetHitRates: {
      classification: 28.5,
      lmarena: 48.2,
      search: 8.5,
      combo: 18.2,
    },
  },
  {
    rank: 2,
    baseline: semanticCacheBaselines[2],  // Fine-tuned Embeddings
    avgRank: 2.0,
    avgHitRate: 22.98,
    avgErrorRate: 0.94,
    boundViolations: 1,
    hasGuarantees: false,
    datasetRanks: {
      classification: 2,
      lmarena: 2,
      search: 2,
      combo: 2,
    },
    datasetHitRates: {
      classification: 24.1,
      lmarena: 46.8,
      search: 6.5,
      combo: 14.5,
    },
  },
  {
    rank: 3,
    baseline: semanticCacheBaselines[1],  // GPTCache
    avgRank: 3.0,
    avgHitRate: 17.28,
    avgErrorRate: 0.97,
    boundViolations: 2,
    hasGuarantees: false,
    datasetRanks: {
      classification: 3,
      lmarena: 3,
      search: 3,
      combo: 3,
    },
    datasetHitRates: {
      classification: 22.3,
      lmarena: 40.5,
      search: 3.2,
      combo: 3.1,
    },
  },
  {
    rank: 4,
    baseline: semanticCacheBaselines[3],  // No Cache
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
export const semanticCacheDatasetRankings: Record<string, SemanticCacheDatasetRanking[]> = {
  classification: [
    {
      rank: 1,
      baseline: semanticCacheBaselines[0],  // vCache
      hitRate: 28.5,
      errorRate: 0.92,
      errorBound: 1.0,
      latencyReduction: 25,
      boundSatisfied: true,
      hasGuarantees: true,
    },
    {
      rank: 2,
      baseline: semanticCacheBaselines[2],  // Fine-tuned
      hitRate: 24.1,
      errorRate: 0.95,
      errorBound: 1.0,
      latencyReduction: 21,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 3,
      baseline: semanticCacheBaselines[1],  // GPTCache
      hitRate: 22.3,
      errorRate: 0.98,
      errorBound: 1.0,
      latencyReduction: 19,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 4,
      baseline: semanticCacheBaselines[3],  // No Cache
      hitRate: 0.0,
      errorRate: 0.0,
      errorBound: 1.0,
      latencyReduction: 0,
      boundSatisfied: true,
      hasGuarantees: true,
    },
  ],
  lmarena: [
    {
      rank: 1,
      baseline: semanticCacheBaselines[0],  // vCache
      hitRate: 48.2,
      errorRate: 0.96,
      errorBound: 1.0,
      latencyReduction: 45,
      boundSatisfied: true,
      hasGuarantees: true,
    },
    {
      rank: 2,
      baseline: semanticCacheBaselines[2],  // Fine-tuned
      hitRate: 46.8,
      errorRate: 0.97,
      errorBound: 1.0,
      latencyReduction: 43,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 3,
      baseline: semanticCacheBaselines[1],  // GPTCache
      hitRate: 40.5,
      errorRate: 0.99,
      errorBound: 1.0,
      latencyReduction: 38,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 4,
      baseline: semanticCacheBaselines[3],  // No Cache
      hitRate: 0.0,
      errorRate: 0.0,
      errorBound: 1.0,
      latencyReduction: 0,
      boundSatisfied: true,
      hasGuarantees: true,
    },
  ],
  search: [
    {
      rank: 1,
      baseline: semanticCacheBaselines[0],  // vCache
      hitRate: 8.5,
      errorRate: 0.85,
      errorBound: 1.0,
      latencyReduction: 8,
      boundSatisfied: true,
      hasGuarantees: true,
    },
    {
      rank: 2,
      baseline: semanticCacheBaselines[2],  // Fine-tuned
      hitRate: 6.5,
      errorRate: 0.90,
      errorBound: 1.0,
      latencyReduction: 6,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 3,
      baseline: semanticCacheBaselines[1],  // GPTCache
      hitRate: 3.2,
      errorRate: 0.95,
      errorBound: 1.0,
      latencyReduction: 3,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 4,
      baseline: semanticCacheBaselines[3],  // No Cache
      hitRate: 0.0,
      errorRate: 0.0,
      errorBound: 1.0,
      latencyReduction: 0,
      boundSatisfied: true,
      hasGuarantees: true,
    },
  ],
  combo: [
    {
      rank: 1,
      baseline: semanticCacheBaselines[0],  // vCache
      hitRate: 18.2,
      errorRate: 0.88,
      errorBound: 1.0,
      latencyReduction: 16,
      boundSatisfied: true,
      hasGuarantees: true,
    },
    {
      rank: 2,
      baseline: semanticCacheBaselines[2],  // Fine-tuned
      hitRate: 14.5,
      errorRate: 0.92,
      errorBound: 1.0,
      latencyReduction: 13,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 3,
      baseline: semanticCacheBaselines[1],  // GPTCache
      hitRate: 3.1,
      errorRate: 0.95,
      errorBound: 1.0,
      latencyReduction: 3,
      boundSatisfied: true,
      hasGuarantees: false,
    },
    {
      rank: 4,
      baseline: semanticCacheBaselines[3],  // No Cache
      hitRate: 0.0,
      errorRate: 0.0,
      errorBound: 1.0,
      latencyReduction: 0,
      boundSatisfied: true,
      hasGuarantees: true,
    },
  ],
};

export const semanticCacheStats: SemanticCacheStats = {
  totalBaselines: 4,
  totalDatasets: 4,
  totalConfigurations: 64,  // 4 baselines × 4 datasets × 4 error budgets
  avgHitRate: 16.5,
  avgErrorRate: 0.93,
};

