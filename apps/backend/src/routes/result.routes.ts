import { Router } from 'express';
import { ResultController } from '../controllers/result.controller';

export function createResultRoutes(controller: ResultController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/configuration/:configurationId', controller.getByConfigurationId);
  router.get('/dataset/:datasetId', controller.getByDatasetId);

  return router;
}

