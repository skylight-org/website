import type { Request, Response } from 'express';
import type { BaselineService } from '../services/BaselineService';

export class BaselineController {
  constructor(private baselineService: BaselineService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const baselines = await this.baselineService.getAll();
      res.json(baselines);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch baselines' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const baseline = await this.baselineService.getById(id);
      
      if (!baseline) {
        res.status(404).json({ error: 'Baseline not found' });
        return;
      }

      res.json(baseline);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch baseline' });
    }
  };
}

