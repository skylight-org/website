import type { Request, Response } from 'express';
import type { NumericRange } from '@sky-light/shared-types';
import { LeaderboardService } from '../services/LeaderboardService';

export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  public getDatasetLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { datasetId } = req.params;
      const {
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
        Object.keys(filters).length > 0 ? filters : undefined
      );

      // Debug: Log first entry to check average_local_error in metricValues
      if (leaderboard.length > 0) {
        console.log('DEBUG DatasetLeaderboardController: First leaderboard entry');
        console.log('  - metricValues:', leaderboard[0].metricValues);
        console.log('  - Has average_local_error?', 'average_local_error' in leaderboard[0].metricValues);
      }

      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dataset leaderboard' });
    }
  };

  public getOverallLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        experimentalRunId,
        benchmarkId,
        targetSparsityMin,
        targetSparsityMax,
        targetAuxMemoryMin,
        targetAuxMemoryMax,
        llmId,
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

      const leaderboard = await this.leaderboardService.getOverallLeaderboard(
        benchmarkId as string | undefined,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      // Debug: Log first entry to check avgLocalError
      if (leaderboard.length > 0) {
        console.log('DEBUG LeaderboardController: First leaderboard entry');
        console.log('  - avgLocalError:', leaderboard[0].avgLocalError);
        console.log('  - avgSparsity:', leaderboard[0].avgSparsity);
      }

      res.json(leaderboard);
    } catch (error) {
      console.error('Error in getOverallLeaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch overall leaderboard', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getOverviewStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.leaderboardService.getOverviewStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
  };

  public getAvailableSparsityValues = async (req: Request, res: Response): Promise<void> => {
    try {
      const values = await this.leaderboardService.getAvailableSparsityValues();
      res.json(values);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sparsity values' });
    }
  };

  public getAvailableAuxMemoryValues = async (req: Request, res: Response): Promise<void> => {
    try {
      const values = await this.leaderboardService.getAvailableAuxMemoryValues();
      res.json(values);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch aux memory values' });
    }
  };
}

