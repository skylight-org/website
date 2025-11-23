import { Router } from 'express';
import type { CombinedViewController } from '../controllers/combined-view.controller';

/**
 * Combined view routes
 */
export function createCombinedViewRoutes(controller: CombinedViewController): Router {
  const router = Router();

  // Get overall score table
  router.get('/overall-score', controller.getOverallScoreTable);

  // Get local error table
  router.get('/local-error', controller.getLocalErrorTable);

  // Get both tables
  router.get('/all', controller.getBothTables);

  return router;
}

