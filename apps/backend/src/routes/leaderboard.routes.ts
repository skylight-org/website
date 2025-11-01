import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboard.controller';

export function createLeaderboardRoutes(controller: LeaderboardController): Router {
  const router = Router();

  router.get('/dataset/:datasetId', controller.getDatasetLeaderboard);
  router.get('/overall', controller.getOverallLeaderboard);
  router.get('/overview', controller.getOverviewStats);
  router.get('/filters/sparsity', controller.getAvailableSparsityValues);
  router.get('/filters/aux-memory', controller.getAvailableAuxMemoryValues);

  return router;
}

