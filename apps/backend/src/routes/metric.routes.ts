import { Router } from 'express';
import { MetricController } from '../controllers/metric.controller';

export function createMetricRoutes(controller: MetricController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.get('/dataset/:datasetId', controller.getByDatasetId);

  return router;
}

