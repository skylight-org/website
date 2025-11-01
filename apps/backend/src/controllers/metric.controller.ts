import type { Request, Response } from 'express';
import type { IMetricRepository } from '../repositories/interfaces/IMetricRepository';
import type { IDatasetMetricRepository } from '../repositories/interfaces/IDatasetMetricRepository';

export class MetricController {
  constructor(
    private metricRepository: IMetricRepository,
    private datasetMetricRepository: IDatasetMetricRepository
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.metricRepository.findAll();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const metric = await this.metricRepository.findById(id);
      
      if (!metric) {
        res.status(404).json({ error: 'Metric not found' });
        return;
      }

      res.json(metric);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metric' });
    }
  };

  getByDatasetId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { datasetId } = req.params;
      
      // Get dataset-metric links
      const datasetMetrics = await this.datasetMetricRepository.findByDatasetId(datasetId);
      
      // Fetch full metric details
      const metrics = await Promise.all(
        datasetMetrics.map(dm => this.metricRepository.findById(dm.metricId))
      );
      
      // Filter out undefined and attach weights
      const metricsWithWeights = metrics
        .filter(m => m !== undefined)
        .map((m, idx) => ({
          ...m!,
          weight: datasetMetrics[idx].weight,
          isPrimary: datasetMetrics[idx].isPrimary,
        }));

      res.json(metricsWithWeights);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dataset metrics' });
    }
  };
}

