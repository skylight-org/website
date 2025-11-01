import express from 'express';
import cors from 'cors';

// Repositories
import { MockBaselineRepository } from './repositories/mock/MockBaselineRepository';
import { MockBenchmarkRepository } from './repositories/mock/MockBenchmarkRepository';
import { MockDatasetRepository } from './repositories/mock/MockDatasetRepository';
import { MockConfigurationRepository } from './repositories/mock/MockConfigurationRepository';
import { MockLLMRepository } from './repositories/mock/MockLLMRepository';
import { MockMetricRepository } from './repositories/mock/MockMetricRepository';
import { MockDatasetMetricRepository } from './repositories/mock/MockDatasetMetricRepository';
import { MockResultRepository } from './repositories/mock/MockResultRepository';
import { MockExperimentalRunRepository } from './repositories/mock/MockExperimentalRunRepository';

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

  // Initialize repositories (Dependency Injection)
  const baselineRepo = new MockBaselineRepository();
  const benchmarkRepo = new MockBenchmarkRepository();
  const datasetRepo = new MockDatasetRepository();
  const configRepo = new MockConfigurationRepository();
  const llmRepo = new MockLLMRepository();
  const metricRepo = new MockMetricRepository();
  const datasetMetricRepo = new MockDatasetMetricRepository();
  const resultRepo = new MockResultRepository();
  const experimentalRunRepo = new MockExperimentalRunRepository();

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
