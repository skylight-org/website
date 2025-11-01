import { Router } from 'express';
import { DatasetController } from '../controllers/dataset.controller';

export function createDatasetRoutes(controller: DatasetController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);

  return router;
}

