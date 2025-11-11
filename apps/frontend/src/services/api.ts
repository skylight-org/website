import type {
  Baseline,
  Benchmark,
  Dataset,
  LLM,
  Metric,
  Result,
  DatasetRanking,
  AggregatedRanking,
  OverviewStats,
  NumericRange,
} from '@sky-light/shared-types';

// Use environment variable for API URL, fallback to local proxy for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
// const API_BASE_URL = "https://skynetbackend.duckdns.org/api/v1"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  baselines: {
    getAll: (): Promise<Baseline[]> => fetchApi('/baselines'),
    getById: (id: string): Promise<Baseline> => fetchApi(`/baselines/${id}`),
  },
  
  benchmarks: {
    getAll: (): Promise<Benchmark[]> => fetchApi('/benchmarks'),
    getById: (id: string): Promise<Benchmark> => fetchApi(`/benchmarks/${id}`),
    getDatasets: (id: string): Promise<Dataset[]> => fetchApi(`/benchmarks/${id}/datasets`),
  },
  
  datasets: {
    getAll: (): Promise<Dataset[]> => fetchApi('/datasets'),
    getById: (id: string): Promise<Dataset> => fetchApi(`/datasets/${id}`),
  },

  llms: {
    getAll: (): Promise<LLM[]> => fetchApi('/llms'),
    getById: (id: string): Promise<LLM> => fetchApi(`/llms/${id}`),
  },

  metrics: {
    getAll: (): Promise<Metric[]> => fetchApi('/metrics'),
    getById: (id: string): Promise<Metric> => fetchApi(`/metrics/${id}`),
    getByDatasetId: (datasetId: string): Promise<Array<Metric & { weight: number; isPrimary: boolean }>> => 
      fetchApi(`/metrics/dataset/${datasetId}`),
  },

  results: {
    getAll: (): Promise<Result[]> => fetchApi('/results'),
    getByConfigurationId: (configurationId: string): Promise<Result[]> => 
      fetchApi(`/results/configuration/${configurationId}`),
    getByDatasetId: (datasetId: string, experimentalRunId?: string): Promise<Result[]> => {
      const query = experimentalRunId ? `?experimentalRunId=${experimentalRunId}` : '';
      return fetchApi(`/results/dataset/${datasetId}${query}`);
    },
  },
  
  leaderboards: {
    getDataset: (
      datasetId: string, 
      params?: { 
        targetSparsity?: NumericRange;
        targetAuxMemory?: NumericRange;
        llmId?: string;
      }
    ): Promise<DatasetRanking[]> => {
      const queryParams: Record<string, string> = {};
      
      // Handle sparsity range
      if (params?.targetSparsity) {
        if (params.targetSparsity.min !== undefined) {
          queryParams.targetSparsityMin = params.targetSparsity.min.toString();
        }
        if (params.targetSparsity.max !== undefined) {
          queryParams.targetSparsityMax = params.targetSparsity.max.toString();
        }
      }
      
      // Handle aux memory range
      if (params?.targetAuxMemory) {
        if (params.targetAuxMemory.min !== undefined) {
          queryParams.targetAuxMemoryMin = params.targetAuxMemory.min.toString();
        }
        if (params.targetAuxMemory.max !== undefined) {
          queryParams.targetAuxMemoryMax = params.targetAuxMemory.max.toString();
        }
      }
      
      if (params?.llmId) queryParams.llmId = params.llmId;
      
      const query = Object.keys(queryParams).length > 0 
        ? `?${new URLSearchParams(queryParams).toString()}` 
        : '';
      return fetchApi(`/leaderboards/dataset/${datasetId}${query}`);
    },
    getOverall: (params?: { 
      experimentalRunId?: string; 
      benchmarkId?: string; 
      llmId?: string;
      targetSparsity?: NumericRange;
      targetAuxMemory?: NumericRange;
    }): Promise<AggregatedRanking[]> => {
      const queryParams: Record<string, string> = {};
      if (params?.experimentalRunId) queryParams.experimentalRunId = params.experimentalRunId;
      if (params?.benchmarkId) queryParams.benchmarkId = params.benchmarkId;
      if (params?.llmId) queryParams.llmId = params.llmId;
      
      // Handle sparsity range
      if (params?.targetSparsity) {
        if (params.targetSparsity.min !== undefined) {
          queryParams.targetSparsityMin = params.targetSparsity.min.toString();
        }
        if (params.targetSparsity.max !== undefined) {
          queryParams.targetSparsityMax = params.targetSparsity.max.toString();
        }
      }
      
      // Handle aux memory range
      if (params?.targetAuxMemory) {
        if (params.targetAuxMemory.min !== undefined) {
          queryParams.targetAuxMemoryMin = params.targetAuxMemory.min.toString();
        }
        if (params.targetAuxMemory.max !== undefined) {
          queryParams.targetAuxMemoryMax = params.targetAuxMemory.max.toString();
        }
      }
      
      const query = Object.keys(queryParams).length > 0 
        ? `?${new URLSearchParams(queryParams).toString()}` 
        : '';
      return fetchApi(`/leaderboards/overall${query}`);
    },
    getPlotData: (params?: {
      targetSparsity?: NumericRange;
      targetAuxMemory?: NumericRange;
    }): Promise<DatasetRanking[]> => {
      const queryParams: Record<string, string> = {};
      
      // Handle sparsity range
      if (params?.targetSparsity) {
        if (params.targetSparsity.min !== undefined) {
          queryParams.targetSparsityMin = params.targetSparsity.min.toString();
        }
        if (params.targetSparsity.max !== undefined) {
          queryParams.targetSparsityMax = params.targetSparsity.max.toString();
        }
      }
      
      // Handle aux memory range
      if (params?.targetAuxMemory) {
        if (params.targetAuxMemory.min !== undefined) {
          queryParams.targetAuxMemoryMin = params.targetAuxMemory.min.toString();
        }
        if (params.targetAuxMemory.max !== undefined) {
          queryParams.targetAuxMemoryMax = params.targetAuxMemory.max.toString();
        }
      }
      
      const query = Object.keys(queryParams).length > 0
        ? `?${new URLSearchParams(queryParams).toString()}`
        : '';
      return fetchApi(`/leaderboards/plot-data${query}`);
    },
    getOverview: (): Promise<OverviewStats> => fetchApi('/leaderboards/overview'),
    getAvailableSparsityValues: (): Promise<number[]> => fetchApi('/leaderboards/filters/sparsity'),
    getAvailableAuxMemoryValues: (): Promise<number[]> => fetchApi('/leaderboards/filters/aux-memory'),
  },
};
