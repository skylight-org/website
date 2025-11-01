import type { Request, Response } from 'express';
import type { IResultRepository } from '../repositories/interfaces/IResultRepository';

export class ResultController {
  constructor(private resultRepository: IResultRepository) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const results = await this.resultRepository.findAll();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  };

  getByConfigurationId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { configurationId } = req.params;
      const results = await this.resultRepository.findByConfigurationId(configurationId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch configuration results' });
    }
  };

  getByDatasetId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { datasetId } = req.params;
      const { experimentalRunId } = req.query;
      
      const results = experimentalRunId
        ? await this.resultRepository.findByDatasetAndRun(datasetId, experimentalRunId as string)
        : await this.resultRepository.findByDatasetId(datasetId);
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dataset results' });
    }
  };
}

