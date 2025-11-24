import type { Request, Response } from 'express';
import type { CombinedViewService } from '../services/CombinedViewService';

/**
 * Controller for combined view endpoints
 */
export class CombinedViewController {
  // Cache for the two tables
  private overallScoreTable: any[] | null = null;
  private localErrorTable: any[] | null = null;
  private sparsities: number[] | null = null;

  constructor(private combinedViewService: CombinedViewService) {}

  /**
   * Initialize tables on server startup
   */
  async initializeTables(): Promise<void> {
    console.log('🔄 Initializing combined view tables...');
    
    try {
      // Generate both tables in parallel
      const [overallScoreResults, localErrorResults] = await Promise.all([
        this.combinedViewService.computeCombinedRanking('overall_score'),
        this.combinedViewService.computeCombinedRanking('average_local_error')
      ]);

      // Extract sparsities from the first result
      const sparsitySet = new Set<number>();
      if (overallScoreResults.length > 0) {
        Object.keys(overallScoreResults[0].avgValuesPerSparsity).forEach(key => {
          sparsitySet.add(parseFloat(key));
        });
      }
      if (localErrorResults.length > 0) {
        Object.keys(localErrorResults[0].avgValuesPerSparsity).forEach(key => {
          sparsitySet.add(parseFloat(key));
        });
      }

      this.sparsities = Array.from(sparsitySet).sort((a, b) => a - b);
      this.overallScoreTable = overallScoreResults;
      this.localErrorTable = localErrorResults;

      console.log('✅ Combined view tables initialized successfully');
      console.log(`   - Overall Score table: ${overallScoreResults.length} baselines`);
      console.log(`   - Local Error table: ${localErrorResults.length} baselines`);
      console.log(`   - Sparsity levels: ${this.sparsities.join(', ')}%`);
    } catch (error) {
      console.error('❌ Error initializing combined view tables:', error);
      throw error;
    }
  }

  /**
   * Get overall score table
   */
  getOverallScoreTable = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.overallScoreTable) {
        res.status(503).json({ 
          error: 'Tables not initialized yet. Please try again in a moment.' 
        });
        return;
      }

      res.json({
        metric: 'overall_score',
        sparsities: this.sparsities,
        results: this.overallScoreTable
      });
    } catch (error) {
      console.error('Error getting overall score table:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get local error table
   */
  getLocalErrorTable = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.localErrorTable) {
        res.status(503).json({ 
          error: 'Tables not initialized yet. Please try again in a moment.' 
        });
        return;
      }

      res.json({
        metric: 'average_local_error',
        sparsities: this.sparsities,
        results: this.localErrorTable
      });
    } catch (error) {
      console.error('Error getting local error table:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get both tables
   */
  getBothTables = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.overallScoreTable || !this.localErrorTable) {
        res.status(503).json({ 
          error: 'Tables not initialized yet. Please try again in a moment.' 
        });
        return;
      }

      res.json({
        sparsities: this.sparsities,
        overallScore: {
          metric: 'overall_score',
          results: this.overallScoreTable
        },
        localError: {
          metric: 'average_local_error',
          results: this.localErrorTable
        }
      });
    } catch (error) {
      console.error('Error getting both tables:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

