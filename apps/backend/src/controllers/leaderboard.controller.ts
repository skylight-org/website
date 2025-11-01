import type { Request, Response } from 'express';
import { LeaderboardService } from '../services/LeaderboardService';

export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  getDatasetLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { datasetId } = req.params;
      const { experimentalRunId } = req.query;

      const leaderboard = await this.leaderboardService.getDatasetLeaderboard(
        datasetId,
        experimentalRunId as string | undefined
      );

      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dataset leaderboard' });
    }
  };

  getOverallLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { experimentalRunId, benchmarkId, llmId } = req.query;

      const leaderboard = await this.leaderboardService.getOverallLeaderboard(
        experimentalRunId as string | undefined,
        benchmarkId as string | undefined,
        llmId as string | undefined
      );

      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch overall leaderboard' });
    }
  };

  getOverviewStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.leaderboardService.getOverviewStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
  };
}

