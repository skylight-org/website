import { Router } from 'express';
import { BaselineRankingController } from '../controllers/baseline-ranking.controller';

export function createBaselineRankingRoutes(controller: BaselineRankingController): Router {
  const router = Router();

  router.get('/', controller.getAll);

  return router;
}

