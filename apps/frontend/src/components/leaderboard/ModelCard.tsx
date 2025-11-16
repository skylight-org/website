import { useNavigate } from 'react-router-dom';
import type { LLM, Baseline } from '@sky-light/shared-types';

interface BaselineConfig {
  baseline: Baseline;
  overallScore: number;
  averageRank: number;
  datasetCount: number;
  sparsity?: number;
  auxMemory?: number;
}

interface ModelStats {
  llm: LLM;
  configurations: BaselineConfig[];
  allConfigurations: BaselineConfig[];
  totalDatasets: number;
  averageScore: number;
}

interface ModelCardProps {
  modelStats: ModelStats;
}

export function ModelCard({ modelStats }: ModelCardProps) {
  const navigate = useNavigate();
  const { llm, configurations } = modelStats;

  const handleClick = () => {
    // Navigate to model detail page
    navigate(`/models/${llm.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="block bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-accent-gold transition-colors cursor-pointer"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{llm.name}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{llm.provider}</span>
          {llm.parameterCount && (
            <span className="flex items-center gap-1">
              <span className="text-gray-500">•</span>
              {formatParameterCount(llm.parameterCount)} params
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Sparse Attention Configurations</div>
        {configurations.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-2">
            No configurations match current filter
          </div>
        ) : (
          configurations.slice(0, 3).map((config, idx) => (
          <div 
            key={`${llm.id}-${config.baseline.id}-${idx}`}
            className="flex items-center justify-between py-2 border-b border-dark-border last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold w-6 ${
                idx === 0 ? 'text-yellow-400' :
                idx === 1 ? 'text-gray-300' :
                idx === 2 ? 'text-orange-400' :
                'text-gray-500'
              }`}>
                {idx + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-white">{config.baseline.name}</span>
                <div className="text-xs text-gray-400">
                  {config.sparsity !== undefined && (
                    <span>Density: {config.sparsity.toFixed(1)}%</span>
                  )}
                  {config.sparsity !== undefined && config.auxMemory !== undefined && (
                    <span className="mx-1">•</span>
                  )}
                  {config.auxMemory !== undefined && (
                    <span>Aux Memory: {config.auxMemory % 1 === 0 ? config.auxMemory.toFixed(0) : config.auxMemory.toFixed(1)} bits</span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-300">
              {config.overallScore.toFixed(1)}
            </span>
          </div>
        )))}
        {configurations.length > 3 && (
          <div className="text-xs text-gray-400 text-center pt-1">
            +{configurations.length - 3} more configurations
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-center">
        <div className="flex gap-4 text-sm">
          <div>
            <span className="font-semibold text-white">{configurations.length}</span>
            <span className="text-gray-400"> config{configurations.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <span className="text-xs text-accent-gold hover:underline">
          View details →
        </span>
      </div>
    </div>
  );
}

function formatParameterCount(count: number): string {
  if (count >= 1e9) {
    return `${(count / 1e9).toFixed(1)}B`;
  } else if (count >= 1e6) {
    return `${(count / 1e6).toFixed(1)}M`;
  } else if (count >= 1e3) {
    return `${(count / 1e3).toFixed(1)}K`;
  }
  return count.toString();
}
