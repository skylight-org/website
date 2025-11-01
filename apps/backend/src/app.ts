import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
import { getSupabaseClient, isSupabaseConfigured } from './config/database';

// Mock Repositories
import { MockBaselineRepository } from './repositories/mock/MockBaselineRepository';
import { MockBenchmarkRepository } from './repositories/mock/MockBenchmarkRepository';
import { MockDatasetRepository } from './repositories/mock/MockDatasetRepository';
import { MockConfigurationRepository } from './repositories/mock/MockConfigurationRepository';
import { MockLLMRepository } from './repositories/mock/MockLLMRepository';
import { MockMetricRepository } from './repositories/mock/MockMetricRepository';
import { MockDatasetMetricRepository } from './repositories/mock/MockDatasetMetricRepository';
import { MockResultRepository } from './repositories/mock/MockResultRepository';
import { MockExperimentalRunRepository } from './repositories/mock/MockExperimentalRunRepository';

// PostgreSQL Repositories
import { PostgresBaselineRepository } from './repositories/postgres/PostgresBaselineRepository';
import { PostgresBenchmarkRepository } from './repositories/postgres/PostgresBenchmarkRepository';
import { PostgresDatasetRepository } from './repositories/postgres/PostgresDatasetRepository';
import { PostgresConfigurationRepository } from './repositories/postgres/PostgresConfigurationRepository';
import { PostgresLLMRepository } from './repositories/postgres/PostgresLLMRepository';
import { PostgresMetricRepository } from './repositories/postgres/PostgresMetricRepository';
import { PostgresDatasetMetricRepository } from './repositories/postgres/PostgresDatasetMetricRepository';
import { PostgresResultRepository } from './repositories/postgres/PostgresResultRepository';
import { PostgresExperimentalRunRepository } from './repositories/postgres/PostgresExperimentalRunRepository';

// Repository Interfaces
import { IBaselineRepository } from './repositories/interfaces/IBaselineRepository';
import { IBenchmarkRepository } from './repositories/interfaces/IBenchmarkRepository';
import { IDatasetRepository } from './repositories/interfaces/IDatasetRepository';
import { IConfigurationRepository } from './repositories/interfaces/IConfigurationRepository';
import { ILLMRepository } from './repositories/interfaces/ILLMRepository';
import { IMetricRepository } from './repositories/interfaces/IMetricRepository';
import { IDatasetMetricRepository } from './repositories/interfaces/IDatasetMetricRepository';
import { IResultRepository } from './repositories/interfaces/IResultRepository';
import { IExperimentalRunRepository } from './repositories/interfaces/IExperimentalRunRepository';

// Services
import { RankingService } from './services/RankingService';
import { AggregationService } from './services/AggregationService';
import { LeaderboardService } from './services/LeaderboardService';

// Controllers
import { LeaderboardController } from './controllers/leaderboard.controller';
import { BaselineController } from './controllers/baseline.controller';
import { BenchmarkController } from './controllers/benchmark.controller';
import { DatasetController } from './controllers/dataset.controller';
import { LLMController } from './controllers/llm.controller';
import { MetricController } from './controllers/metric.controller';
import { ResultController } from './controllers/result.controller';

// Routes
import { createLeaderboardRoutes } from './routes/leaderboard.routes';
import { createBaselineRoutes } from './routes/baseline.routes';
import { createBenchmarkRoutes } from './routes/benchmark.routes';
import { createDatasetRoutes } from './routes/dataset.routes';
import llmRoutes from './routes/llm.routes';
import metricRoutes from './routes/metric.routes';
import resultRoutes from './routes/result.routes';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Determine which repositories to use based on configuration
  const useSupabase = isSupabaseConfigured();
  
  // Initialize repositories (Dependency Injection)
  let baselineRepo: IBaselineRepository;
  let benchmarkRepo: IBenchmarkRepository;
  let datasetRepo: IDatasetRepository;
  let configRepo: IConfigurationRepository;
  let llmRepo: ILLMRepository;
  let metricRepo: IMetricRepository;
  let datasetMetricRepo: IDatasetMetricRepository;
  let resultRepo: IResultRepository;
  let experimentalRunRepo: IExperimentalRunRepository;

  if (useSupabase) {
    // Use PostgreSQL repositories with Supabase
    console.log('🔗 Connecting to Supabase database...');
    const supabase = getSupabaseClient();
    
    baselineRepo = new PostgresBaselineRepository(supabase);
    benchmarkRepo = new PostgresBenchmarkRepository(supabase);
    datasetRepo = new PostgresDatasetRepository(supabase);
    configRepo = new PostgresConfigurationRepository(supabase);
    llmRepo = new PostgresLLMRepository(supabase);
    metricRepo = new PostgresMetricRepository(supabase);
    datasetMetricRepo = new PostgresDatasetMetricRepository(supabase);
    resultRepo = new PostgresResultRepository(supabase);
    experimentalRunRepo = new PostgresExperimentalRunRepository(supabase);
    
    console.log('✓ Using Supabase PostgreSQL database');
  } else {
    // Use Mock repositories for development
    console.log('⚠️  Supabase credentials not configured');
    console.log('ℹ️  Using mock in-memory database');
    console.log('ℹ️  Set SUPABASE_URL and SUPABASE_KEY to use real database');
    
    baselineRepo = new MockBaselineRepository();
    benchmarkRepo = new MockBenchmarkRepository();
    datasetRepo = new MockDatasetRepository();
    configRepo = new MockConfigurationRepository();
    llmRepo = new MockLLMRepository();
    metricRepo = new MockMetricRepository();
    datasetMetricRepo = new MockDatasetMetricRepository();
    resultRepo = new MockResultRepository();
    experimentalRunRepo = new MockExperimentalRunRepository();
  }

  // Initialize services
  const rankingService = new RankingService(
    baselineRepo,
    llmRepo,
    datasetRepo,
    metricRepo,
    datasetMetricRepo,
    configRepo,
    resultRepo
  );
  
  const aggregationService = new AggregationService(
    datasetRepo,
    rankingService
  );
  
  const leaderboardService = new LeaderboardService(
    configRepo,
    datasetRepo,
    benchmarkRepo,
    baselineRepo,
    llmRepo,
    resultRepo,
    experimentalRunRepo,
    rankingService,
    aggregationService
  );

  // Initialize controllers
  const leaderboardController = new LeaderboardController(leaderboardService);
  const baselineController = new BaselineController(baselineRepo);
  const benchmarkController = new BenchmarkController(benchmarkRepo, datasetRepo);
  const datasetController = new DatasetController(datasetRepo);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/leaderboards', createLeaderboardRoutes(leaderboardController));
  app.use('/api/v1/baselines', createBaselineRoutes(baselineController));
  app.use('/api/v1/benchmarks', createBenchmarkRoutes(benchmarkController));
  app.use('/api/v1/datasets', createDatasetRoutes(datasetController));
  app.use('/api/v1/llms', llmRoutes);
  app.use('/api/v1/metrics', metricRoutes);
  app.use('/api/v1/results', resultRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
