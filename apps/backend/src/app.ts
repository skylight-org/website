import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
import { getSupabaseClient } from './config/database';

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
import { createLLMRoutes } from './routes/llm.routes';
import { createMetricRoutes } from './routes/metric.routes';
import { createResultRoutes } from './routes/result.routes';

export async function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Initialize database client and repositories
  console.log('🔗 Connecting to database...');
  const supabase = await getSupabaseClient();
  
  // Initialize repositories (Dependency Injection)
  const baselineRepo = new PostgresBaselineRepository(supabase);
  const benchmarkRepo = new PostgresBenchmarkRepository(supabase);
  const datasetRepo = new PostgresDatasetRepository(supabase);
  const configRepo = new PostgresConfigurationRepository(supabase);
  const llmRepo = new PostgresLLMRepository(supabase);
  const metricRepo = new PostgresMetricRepository(supabase);
  const datasetMetricRepo = new PostgresDatasetMetricRepository(supabase);
  const resultRepo = new PostgresResultRepository(supabase);
  const experimentalRunRepo = new PostgresExperimentalRunRepository(supabase);
  
  console.log('✅ Database connected successfully');

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
  const llmController = new LLMController(llmRepo);
  const metricController = new MetricController(metricRepo, datasetMetricRepo);
  const resultController = new ResultController(resultRepo);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/leaderboards', createLeaderboardRoutes(leaderboardController));
  app.use('/api/v1/baselines', createBaselineRoutes(baselineController));
  app.use('/api/v1/benchmarks', createBenchmarkRoutes(benchmarkController));
  app.use('/api/v1/datasets', createDatasetRoutes(datasetController));
  app.use('/api/v1/llms', createLLMRoutes(llmController));
  app.use('/api/v1/metrics', createMetricRoutes(metricController));
  app.use('/api/v1/results', createResultRoutes(resultController));

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
