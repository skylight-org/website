import { Router } from 'express';
import { LLMController } from '../controllers/llm.controller';

export function createLLMRoutes(controller: LLMController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);

  return router;
}

