import type { Request, Response } from 'express';
import { BaselineRankingService } from '../services/BaselineRankingService';

export class BaselineRankingController {
  constructor(private baselineRankingService: BaselineRankingService) {}

  public getAll = async (req: Request, res: Response): Promise<void> => {
    process.stdout.write('📊 [BaselineRankingController] GET /api/v1/baseline-rankings - Request received\n');
    try {
      const rankings = await this.baselineRankingService.calculateBaselineAverageRanks();
      process.stdout.write(`📊 [BaselineRankingController] Successfully calculated ${rankings.length} baseline rankings\n`);
      res.json(rankings);
    } catch (error) {
      process.stderr.write(`Error in getAll baseline rankings: ${error}\n`);
      console.error('Error in getAll baseline rankings:', error);
      res.status(500).json({ 
        error: 'Failed to fetch baseline rankings',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

