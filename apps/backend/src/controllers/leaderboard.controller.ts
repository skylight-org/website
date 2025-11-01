import type { Request, Response } from 'express';
import type { NumericRange } from '@sky-light/shared-types';
import { LeaderboardService } from '../services/LeaderboardService';

export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  getDatasetLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { datasetId } = req.params;
      const { 
        experimentalRunId, 
        targetSparsityMin,
        targetSparsityMax,
        targetAuxMemoryMin,
        targetAuxMemoryMax,
        llmId 
      } = req.query;

      const filters: {
        targetSparsity?: NumericRange;
        targetAuxMemory?: NumericRange;
        llmId?: string;
      } = {};

      // Parse sparsity range
      if (targetSparsityMin || targetSparsityMax) {
        filters.targetSparsity = {
          min: targetSparsityMin ? parseFloat(targetSparsityMin as string) : undefined,
          max: targetSparsityMax ? parseFloat(targetSparsityMax as string) : undefined,
        };
      }

      // Parse aux memory range
      if (targetAuxMemoryMin || targetAuxMemoryMax) {
        filters.targetAuxMemory = {
          min: targetAuxMemoryMin ? parseInt(targetAuxMemoryMin as string, 10) : undefined,
          max: targetAuxMemoryMax ? parseInt(targetAuxMemoryMax as string, 10) : undefined,
        };
      }

      if (llmId) {
        filters.llmId = llmId as string;
      }

      const leaderboard = await this.leaderboardService.getDatasetLeaderboard(
        datasetId,
        experimentalRunId as string | undefined,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dataset leaderboard' });
    }
  };

  getOverallLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        experimentalRunId, 
        benchmarkId, 
        llmId,
        targetSparsityMin,
        targetSparsityMax,
        targetAuxMemoryMin,
        targetAuxMemoryMax
      } = req.query;

      const filters: {
        targetSparsity?: NumericRange;
        targetAuxMemory?: NumericRange;
      } = {};

      // Parse sparsity range
      if (targetSparsityMin || targetSparsityMax) {
        filters.targetSparsity = {
          min: targetSparsityMin ? parseFloat(targetSparsityMin as string) : undefined,
          max: targetSparsityMax ? parseFloat(targetSparsityMax as string) : undefined,
        };
      }

      // Parse aux memory range
      if (targetAuxMemoryMin || targetAuxMemoryMax) {
        filters.targetAuxMemory = {
          min: targetAuxMemoryMin ? parseInt(targetAuxMemoryMin as string, 10) : undefined,
          max: targetAuxMemoryMax ? parseInt(targetAuxMemoryMax as string, 10) : undefined,
        };
      }

      const leaderboard = await this.leaderboardService.getOverallLeaderboard(
        experimentalRunId as string | undefined,
        benchmarkId as string | undefined,
        llmId as string | undefined,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.json(leaderboard);
    } catch (error) {
      console.error('Error in getOverallLeaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch overall leaderboard', details: error instanceof Error ? error.message : 'Unknown error' });
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

  getAvailableSparsityValues = async (req: Request, res: Response): Promise<void> => {
    try {
      const values = await this.leaderboardService.getAvailableSparsityValues();
      res.json(values);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sparsity values' });
    }
  };

  getAvailableAuxMemoryValues = async (req: Request, res: Response): Promise<void> => {
    try {
      const values = await this.leaderboardService.getAvailableAuxMemoryValues();
      res.json(values);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch aux memory values' });
    }
  };
}

