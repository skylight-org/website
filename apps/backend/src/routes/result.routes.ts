import { Router } from 'express';
import { ResultController } from '../controllers/result.controller';
import { MockResultRepository } from '../repositories/mock/MockResultRepository';

const router = Router();
const resultRepository = new MockResultRepository();
const resultController = new ResultController(resultRepository);

router.get('/', resultController.getAll);
router.get('/configuration/:configurationId', resultController.getByConfigurationId);
router.get('/dataset/:datasetId', resultController.getByDatasetId);

export default router;

