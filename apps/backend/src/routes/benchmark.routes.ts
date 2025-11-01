import { Router } from 'express';
import { BenchmarkController } from '../controllers/benchmark.controller';

export function createBenchmarkRoutes(controller: BenchmarkController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.get('/:id/datasets', controller.getDatasets);

  return router;
}

