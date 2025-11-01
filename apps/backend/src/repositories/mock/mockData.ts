import type {
  Baseline,
  Benchmark,
  Dataset,
  LLM,
  Metric,
  DatasetMetric,
  Configuration,
  Result,
  ExperimentalRun,
} from '@sky-light/shared-types';

// ============================================================================
// BASELINES - Sparse attention implementations
// ============================================================================
export const mockBaselines: Baseline[] = [
  {
    id: 'baseline-1',
    name: 'oracle-topp',
    description: 'Oracle Top-P sampling baseline for sparse attention',
    version: '1.0.0',
    paperUrl: 'https://arxiv.org/abs/1904.09751',
    codeUrl: 'https://github.com/example/oracle-topp',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'baseline-2',
    name: 'oracle-topk',
    description: 'Oracle Top-K selection baseline for sparse attention',
    version: '1.0.0',
    paperUrl: 'https://arxiv.org/abs/1805.04833',
    codeUrl: 'https://github.com/example/oracle-topk',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'baseline-3',
    name: 'hashattention',
    description: 'Hash-based attention mechanism for efficient sparse attention',
    version: '1.2.1',
    paperUrl: 'https://arxiv.org/abs/2310.05688',
    codeUrl: 'https://github.com/example/hashattention',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'baseline-4',
    name: 'magicpig',
    description: 'MagicPIG: Pattern-Informed Gradient attention method',
    version: '2.0.0',
    paperUrl: 'https://arxiv.org/abs/2510.05688',
    codeUrl: 'https://github.com/example/magicpig',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 'baseline-5',
    name: 'vAttention(oracle-topk)',
    description: 'vAttention with oracle Top-K strategy',
    version: '1.5.0',
    paperUrl: 'https://arxiv.org/abs/2405.04437',
    codeUrl: 'https://github.com/example/vattention-topk',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'baseline-6',
    name: 'vAttention(pqcache)',
    description: 'vAttention with PQCache optimization',
    version: '1.5.0',
    paperUrl: 'https://arxiv.org/abs/2405.04437',
    codeUrl: 'https://github.com/example/vattention-pqcache',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
  },
];

// ============================================================================
// BENCHMARKS - Top-level test suites
// ============================================================================
export const mockBenchmarks: Benchmark[] = [
  {
    id: 'benchmark-1',
    name: 'Ruler',
    description: 'Comprehensive benchmark for evaluating long-context understanding in language models',
    paperUrl: 'https://arxiv.org/abs/2404.06654',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// DATASETS - Specific test sets within benchmarks
// ============================================================================
export const mockDatasets: Dataset[] = [
  {
    id: 'dataset-1',
    benchmarkId: 'benchmark-1',
    name: 'vt',
    description: 'Variable Tracking: Tests ability to track variables across long contexts',
    size: 500,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dataset-2',
    benchmarkId: 'benchmark-1',
    name: 'qa1',
    description: 'Question Answering Level 1: Basic factual question answering',
    size: 1000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dataset-3',
    benchmarkId: 'benchmark-1',
    name: 'qa2',
    description: 'Question Answering Level 2: Complex multi-hop reasoning questions',
    size: 800,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dataset-4',
    benchmarkId: 'benchmark-1',
    name: 'fwe',
    description: 'Fact-based World Events: Tests knowledge of historical and current events',
    size: 600,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dataset-5',
    benchmarkId: 'benchmark-1',
    name: 'mk2',
    description: 'Multi-hop Knowledge Level 2: Intermediate reasoning complexity',
    size: 700,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dataset-6',
    benchmarkId: 'benchmark-1',
    name: 'mk3',
    description: 'Multi-hop Knowledge Level 3: Advanced reasoning with multiple inference steps',
    size: 650,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// LLMs - Large Language Models
// ============================================================================
export const mockLLMs: LLM[] = [
  {
    id: 'llm-1',
    name: 'GPT-4',
    provider: 'OpenAI',
    parameterCount: 1760000000000, // 1.76T parameters (estimated)
    contextLength: 128000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'llm-2',
    name: 'Claude-3',
    provider: 'Anthropic',
    parameterCount: 1000000000000, // 1T parameters (estimated)
    contextLength: 200000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'llm-3',
    name: 'Llama-3-70B',
    provider: 'Meta',
    parameterCount: 70000000000, // 70B parameters
    contextLength: 8192,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// METRICS - Performance measurements
// ============================================================================
export const mockMetrics: Metric[] = [
  {
    id: 'metric-1',
    name: 'accuracy',
    displayName: 'Accuracy',
    description: 'Percentage of correct predictions',
    unit: '%',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-2',
    name: 'f1_score',
    displayName: 'F1 Score',
    description: 'Harmonic mean of precision and recall',
    unit: '',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-3',
    name: 'latency',
    displayName: 'Latency',
    description: 'Average inference time per example',
    unit: 'ms',
    higherIsBetter: false,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-4',
    name: 'exact_match',
    displayName: 'Exact Match',
    description: 'Percentage of answers that match exactly',
    unit: '%',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-5',
    name: 'bleu_score',
    displayName: 'BLEU Score',
    description: 'BiLingual Evaluation Understudy score for translation quality',
    unit: '',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-6',
    name: 'perplexity',
    displayName: 'Perplexity',
    description: 'Language model perplexity (lower is better)',
    unit: '',
    higherIsBetter: false,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-7',
    name: 'rouge_l',
    displayName: 'ROUGE-L',
    description: 'Longest common subsequence based evaluation',
    unit: '',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-8',
    name: 'precision',
    displayName: 'Precision',
    description: 'Precision score for classification',
    unit: '%',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-9',
    name: 'recall',
    displayName: 'Recall',
    description: 'Recall score for classification',
    unit: '%',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-10',
    name: 'consistency',
    displayName: 'Consistency',
    description: 'Consistency of answers across similar queries',
    unit: '%',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-11',
    name: 'reasoning_steps',
    displayName: 'Reasoning Steps',
    description: 'Average number of reasoning steps required',
    unit: '',
    higherIsBetter: false,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-12',
    name: 'completeness',
    displayName: 'Completeness',
    description: 'How complete the answer is',
    unit: '%',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'metric-13',
    name: 'coherence',
    displayName: 'Coherence',
    description: 'Logical coherence of the reasoning',
    unit: '',
    higherIsBetter: true,
    createdAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// DATASET_METRICS - Links datasets to their relevant metrics
// ============================================================================
export const mockDatasetMetrics: DatasetMetric[] = [
  // VT dataset (dataset-1): accuracy, f1_score, latency
  { id: 'dm-1', datasetId: 'dataset-1', metricId: 'metric-1', weight: 1.0, isPrimary: true, createdAt: new Date('2024-01-01') },
  { id: 'dm-2', datasetId: 'dataset-1', metricId: 'metric-2', weight: 0.8, isPrimary: false, createdAt: new Date('2024-01-01') },
  { id: 'dm-3', datasetId: 'dataset-1', metricId: 'metric-3', weight: 0.5, isPrimary: false, createdAt: new Date('2024-01-01') },
  
  // QA1 dataset (dataset-2): exact_match, bleu_score, perplexity
  { id: 'dm-4', datasetId: 'dataset-2', metricId: 'metric-4', weight: 1.0, isPrimary: true, createdAt: new Date('2024-01-01') },
  { id: 'dm-5', datasetId: 'dataset-2', metricId: 'metric-5', weight: 0.7, isPrimary: false, createdAt: new Date('2024-01-01') },
  { id: 'dm-6', datasetId: 'dataset-2', metricId: 'metric-6', weight: 0.6, isPrimary: false, createdAt: new Date('2024-01-01') },
  
  // QA2 dataset (dataset-3): exact_match, f1_score, rouge_l
  { id: 'dm-7', datasetId: 'dataset-3', metricId: 'metric-4', weight: 1.0, isPrimary: true, createdAt: new Date('2024-01-01') },
  { id: 'dm-8', datasetId: 'dataset-3', metricId: 'metric-2', weight: 0.9, isPrimary: false, createdAt: new Date('2024-01-01') },
  { id: 'dm-9', datasetId: 'dataset-3', metricId: 'metric-7', weight: 0.8, isPrimary: false, createdAt: new Date('2024-01-01') },
  
  // FWE dataset (dataset-4): accuracy, precision, recall
  { id: 'dm-10', datasetId: 'dataset-4', metricId: 'metric-1', weight: 1.0, isPrimary: true, createdAt: new Date('2024-01-01') },
  { id: 'dm-11', datasetId: 'dataset-4', metricId: 'metric-8', weight: 0.85, isPrimary: false, createdAt: new Date('2024-01-01') },
  { id: 'dm-12', datasetId: 'dataset-4', metricId: 'metric-9', weight: 0.85, isPrimary: false, createdAt: new Date('2024-01-01') },
  
  // MK2 dataset (dataset-5): accuracy, consistency, reasoning_steps
  { id: 'dm-13', datasetId: 'dataset-5', metricId: 'metric-1', weight: 1.0, isPrimary: true, createdAt: new Date('2024-01-01') },
  { id: 'dm-14', datasetId: 'dataset-5', metricId: 'metric-10', weight: 0.8, isPrimary: false, createdAt: new Date('2024-01-01') },
  { id: 'dm-15', datasetId: 'dataset-5', metricId: 'metric-11', weight: 0.4, isPrimary: false, createdAt: new Date('2024-01-01') },
  
  // MK3 dataset (dataset-6): accuracy, completeness, coherence
  { id: 'dm-16', datasetId: 'dataset-6', metricId: 'metric-1', weight: 1.0, isPrimary: true, createdAt: new Date('2024-01-01') },
  { id: 'dm-17', datasetId: 'dataset-6', metricId: 'metric-12', weight: 0.9, isPrimary: false, createdAt: new Date('2024-01-01') },
  { id: 'dm-18', datasetId: 'dataset-6', metricId: 'metric-13', weight: 0.85, isPrimary: false, createdAt: new Date('2024-01-01') },
];

// ============================================================================
// EXPERIMENTAL RUNS
// ============================================================================
export const mockExperimentalRuns: ExperimentalRun[] = [
  {
    id: 'run-1',
    name: 'Baseline Evaluation - January 2024',
    description: 'Initial comprehensive evaluation of all baselines across RULER benchmark',
    runDate: new Date('2024-01-15'),
    status: 'completed',
    metadata: {
      gpuType: 'NVIDIA A100',
      batchSize: 32,
      temperature: 0.7,
    },
    createdAt: new Date('2024-01-10'),
  },
];

// ============================================================================
// CONFIGURATIONS - Baseline × Dataset × LLM × Parameters combinations
// ============================================================================
export const mockConfigurations: Configuration[] = [];

// Target sparsity levels to test
const sparsityLevels = [1.0, 5.0, 10.0, 20.0]; // 1%, 5%, 10%, 20%
const auxMemoryLevels = [512, 1024, 2048]; // Different memory configurations

mockBaselines.forEach((baseline) => {
  mockDatasets.forEach((dataset) => {
    mockLLMs.forEach((llm) => {
      // For demonstration: first 3 baselines get tested with all sparsity levels
      // Others get one default configuration
      if (['baseline-1', 'baseline-2', 'baseline-3'].includes(baseline.id)) {
        sparsityLevels.forEach((sparsity, idx) => {
          mockConfigurations.push({
            id: `config-${baseline.id}-${dataset.id}-${llm.id}-s${sparsity}`,
            baselineId: baseline.id,
            datasetId: dataset.id,
            llmId: llm.id,
            targetSparsity: sparsity,
            targetAuxMemory: auxMemoryLevels[idx % auxMemoryLevels.length],
            additionalParams: {
              averageLocalError: 0.01 + Math.random() * 0.05,
            },
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-10'),
          });
        });
      } else {
        // Other baselines: single configuration
        mockConfigurations.push({
          id: `config-${baseline.id}-${dataset.id}-${llm.id}`,
          baselineId: baseline.id,
          datasetId: dataset.id,
          llmId: llm.id,
          targetSparsity: 10.0, // Default 10% sparsity
          targetAuxMemory: 1024,
          additionalParams: {
            averageLocalError: 0.01 + Math.random() * 0.05,
          },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
        });
      }
    });
  });
});

// ============================================================================
// RESULTS - Performance metrics for each configuration
// ============================================================================
export const mockResults: Result[] = [];

// Helper function to generate realistic scores with controlled variance
const generateScore = (base: number, variance: number, higherIsBetter: boolean = true): number => {
  const score = base + (Math.random() - 0.5) * variance;
  return Math.max(0, Math.min(higherIsBetter ? 100 : 1000, score));
};

// Generate results for each configuration
mockConfigurations.forEach((config, configIdx) => {
  const baselineIdx = mockBaselines.findIndex(b => b.id === config.baselineId);
  const datasetIdx = mockDatasets.findIndex(d => d.id === config.datasetId);
  const llmIdx = mockLLMs.findIndex(l => l.id === config.llmId);
  
  // Base performance varies by baseline (better baselines = higher base)
  const basePerformance = 65 + baselineIdx * 4 - datasetIdx * 2.5 + llmIdx * 1.5;
  
  // Get metrics for this dataset
  const datasetMetrics = mockDatasetMetrics.filter(dm => dm.datasetId === config.datasetId);
  
  datasetMetrics.forEach((dm) => {
    const metric = mockMetrics.find(m => m.id === dm.metricId)!;
    
    // Generate realistic value based on metric type
    let value: number;
    if (metric.name === 'latency') {
      // Latency: 50-500ms, lower is better
      value = generateScore(200 - baselineIdx * 20, 100, false);
    } else if (metric.name === 'perplexity') {
      // Perplexity: 5-50, lower is better
      value = generateScore(25 - baselineIdx * 2, 10, false);
    } else if (metric.name === 'reasoning_steps') {
      // Reasoning steps: 2-10, lower is better
      value = generateScore(6 - baselineIdx * 0.5, 2, false);
    } else if (metric.name === 'bleu_score' || metric.name === 'coherence') {
      // BLEU/Coherence: 0-1 scale
      value = generateScore(basePerformance / 100, 0.15, true);
    } else {
      // Accuracy-like metrics: 0-100 scale
      value = generateScore(basePerformance, 12, true);
    }
    
    mockResults.push({
      id: `result-${config.id}-${metric.id}`,
      configurationId: config.id,
      metricId: metric.id,
      experimentalRunId: 'run-1',
      value: parseFloat(value.toFixed(3)),
      standardDeviation: parseFloat((value * 0.05).toFixed(3)), // 5% std dev
      sampleSize: mockDatasets.find(d => d.id === config.datasetId)?.size,
      executionTimeMs: Math.floor(1000 + Math.random() * 5000),
      createdAt: new Date('2024-01-15'),
    });
  });
});
