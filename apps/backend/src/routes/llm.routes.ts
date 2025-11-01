import { Router } from 'express';
import { LLMController } from '../controllers/llm.controller';
import { MockLLMRepository } from '../repositories/mock/MockLLMRepository';

const router = Router();
const llmRepository = new MockLLMRepository();
const llmController = new LLMController(llmRepository);

router.get('/', llmController.getAll);
router.get('/:id', llmController.getById);

export default router;

