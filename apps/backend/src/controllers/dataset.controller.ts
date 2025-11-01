import type { Request, Response } from 'express';
import type { IDatasetRepository } from '../repositories/interfaces/IDatasetRepository';

export class DatasetController {
  constructor(private datasetRepository: IDatasetRepository) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const datasets = await this.datasetRepository.findAll();
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch datasets' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dataset = await this.datasetRepository.findById(id);
      
      if (!dataset) {
        res.status(404).json({ error: 'Dataset not found' });
        return;
      }

      res.json(dataset);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dataset' });
    }
  };
}

