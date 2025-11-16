// ============================================================================
// MASTER/REFERENCE TYPES
// ============================================================================

export interface Baseline {
  id: string;
  name: string;
  description: string;
  version: string;
  paperUrl?: string;
  codeUrl?: string;
  abstract?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  paperUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dataset {
  id: string;
  benchmarkId: string;
  name: string;
  description: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LLM {
  id: string;
  name: string;
  provider?: string;
  parameterCount?: number;
  contextLength?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Metric {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  unit?: string;
  higherIsBetter: boolean;
  createdAt: Date;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface Configuration {
  id: string;
  baselineId: string;
  datasetId: string;
  llmId: string;
  targetSparsity?: number; // stored as percentage (e.g., 1.00 for 1%, 5.00 for 5%)
  targetAuxMemory?: number; // in bytes or tokens
  additionalParams?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// RESULTS TYPES
// ============================================================================

export interface ExperimentalRun {
  id: string;
  name?: string;
  description?: string;
  runDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Result {
  id: string;
  configurationId: string;
  datasetMetricId: string;
  experimentalRunId?: string;
  value: number;
  standardDeviation?: number;
  sampleSize?: number;
  executionTimeMs?: number;
  notes?: string;
  createdAt: Date;
}

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export interface DatasetRanking {
  rank: number;
  baselineId: string;
  baselineName: string;
  llmId: string;
  llmName: string;
  configurationId: string;
  score: number;
  targetSparsity?: number;
  targetAuxMemory?: number;
  metricValues: Record<string, number>;
}

export interface AggregatedRanking {
  rank: number;
  baselineId: string;
  baselineName: string;
  llmId: string;
  llmName: string;
  overallScore: number;
  targetSparsity?: number;
  targetAuxMemory?: number;
  datasetScores: Record<string, number>;
}

export interface OverviewStats {
  totalBaselines: number;
  totalDatasets: number;
  totalExperiments: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface NumericRange {
  min?: number;
  max?: number;
}
