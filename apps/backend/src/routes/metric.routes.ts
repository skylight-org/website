import { Router } from 'express';
import { MetricController } from '../controllers/metric.controller';
import { MockMetricRepository } from '../repositories/mock/MockMetricRepository';
import { MockDatasetMetricRepository } from '../repositories/mock/MockDatasetMetricRepository';

const router = Router();
const metricRepository = new MockMetricRepository();
const datasetMetricRepository = new MockDatasetMetricRepository();
const metricController = new MetricController(metricRepository, datasetMetricRepository);

router.get('/', metricController.getAll);
router.get('/:id', metricController.getById);
router.get('/dataset/:datasetId', metricController.getByDatasetId);

export default router;

