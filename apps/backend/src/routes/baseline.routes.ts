import { Router } from 'express';
import { BaselineController } from '../controllers/baseline.controller';

export function createBaselineRoutes(controller: BaselineController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);

  return router;
}

