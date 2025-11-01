import type { Request, Response } from 'express';
import type { IBenchmarkRepository } from '../repositories/interfaces/IBenchmarkRepository';
import type { IDatasetRepository } from '../repositories/interfaces/IDatasetRepository';

export class BenchmarkController {
  constructor(
    private benchmarkRepository: IBenchmarkRepository,
    private datasetRepository: IDatasetRepository
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const benchmarks = await this.benchmarkRepository.findAll();
      res.json(benchmarks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch benchmarks' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const benchmark = await this.benchmarkRepository.findById(id);
      
      if (!benchmark) {
        res.status(404).json({ error: 'Benchmark not found' });
        return;
      }

      res.json(benchmark);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch benchmark' });
    }
  };

  getDatasets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const datasets = await this.datasetRepository.findByBenchmarkId(id);
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch datasets' });
    }
  };
}

