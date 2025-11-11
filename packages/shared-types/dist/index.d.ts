export interface Baseline {
    id: string;
    name: string;
    description: string;
    version: string;
    paperUrl?: string;
    codeUrl?: string;
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
    configurationCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Metric {
    id: string;
    name: string;
    displayName: string;
    description: string;
    unit?: string;
    higherIsBetter: boolean;
    createdAt: Date;
}
export interface DatasetMetric {
    id: string;
    datasetId: string;
    metricId: string;
    weight: number;
    isPrimary: boolean;
    createdAt: Date;
}
export interface LLM {
    id: string;
    name: string;
    provider: string;
    parameterCount?: number;
    contextLength?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Configuration {
    id: string;
    baselineId: string;
    datasetId: string;
    llmId: string;
    targetSparsity?: number;
    targetAuxMemory?: number;
    additionalParams?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface ExperimentalRun {
    id: string;
    name: string;
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
export interface LeaderboardEntry {
    rank: number;
    baseline: Baseline;
    llm: LLM;
    configuration: Configuration;
    score: number;
    metrics: Record<string, number>;
}
export interface DatasetRanking {
    rank: number;
    dataset: Dataset;
    baseline: Baseline;
    llm: LLM;
    configurationId: string;
    score: number;
    metricValues: Record<string, number>;
    targetSparsity?: number;
    targetAuxMemory?: number;
    configuration: Configuration;
}
export interface AggregatedRanking {
    rank: number;
    baseline: Baseline;
    llm: LLM;
    averageRank: number;
    overallScore: number;
    datasetRanks: Record<string, number>;
    datasetScores: Record<string, number>;
    datasetDetails: Record<string, {
        sparsity?: number;
        auxMemory?: number;
        localError?: number;
        configuration: Configuration;
    }>;
    numDatasets: number;
    totalNumDatasets: number;
    bestDatasetRank: number;
    worstDatasetRank: number;
    targetSparsity?: number;
    targetAuxMemory?: number;
    avgLocalError?: number;
    avgTargetSparsity?: number;
}
export interface NumericRange {
    min?: number;
    max?: number;
}
export interface RankingOptions {
    sortBy?: string;
    order?: 'asc' | 'desc';
    llmFilter?: string;
    baselineFilter?: string;
    experimentalRunId?: string;
    targetSparsity?: NumericRange;
    targetAuxMemory?: NumericRange;
}
export interface AggregationMethod {
    type: 'mean' | 'median' | 'weighted';
    weights?: Record<string, number>;
}
export interface DatasetWithMetrics extends Dataset {
    benchmark: Benchmark;
    metrics: Metric[];
    metricWeights: Record<string, number>;
    primaryMetric?: Metric;
}
export interface ConfigurationWithDetails extends Configuration {
    baseline: Baseline;
    dataset: Dataset;
    llm: LLM;
}
export interface ResultWithDetails extends Result {
    configuration: ConfigurationWithDetails;
    metric: Metric;
}
export interface OverviewStats {
    totalBaselines: number;
    totalBenchmarks: number;
    totalDatasets: number;
    totalLLMs: number;
    totalConfigurations: number;
    totalResults: number;
    lastUpdated: Date;
}
