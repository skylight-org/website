import type { Request, Response } from 'express';
import type { ILLMRepository } from '../repositories/interfaces/ILLMRepository';

export class LLMController {
  constructor(private llmRepository: ILLMRepository) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const llms = await this.llmRepository.findAll();
      res.json(llms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch LLMs' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const llm = await this.llmRepository.findById(id);
      
      if (!llm) {
        res.status(404).json({ error: 'LLM not found' });
        return;
      }

      res.json(llm);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch LLM' });
    }
  };
}

