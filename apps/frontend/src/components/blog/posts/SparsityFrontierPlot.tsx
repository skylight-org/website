import { useMemo, useRef, useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import type { CombinedViewResult } from '@sky-light/shared-types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

type PlotProps = {
  sparsities: number[];
  gapResults: CombinedViewResult[];
  errorResults: CombinedViewResult[];
};

// Define color scheme aligned with site theme (warm/gold/orange)
const COLORS = {
  topK: '#a16207',     // Yellow-700 (Oracle Top-K) - Dark Gold/Bronze
  topP: '#b45309',     // Amber-700 (Oracle Top-P) - Dark Amber
  pqCache: '#ea580c',  // Orange-600 (PQCache) - Deep Orange
  vAttnK: '#fcd754',   // Gold (vAttention Oracle Top-K) - Theme Accent (Bright)
  vAttnPQ: '#ef4444',  // Red-500 (vAttention PQCache) - Bright Red
};

// Specific baselines to show with styling configuration
const TARGET_BASELINES = [
  { 
    id: 'oracle-top-k', 
    label: 'Oracle Top-K', 
    color: COLORS.topK, 
    strokeDasharray: '5 5',
    strokeWidth: 4 // 2x thicker (was 2)
  },
  { 
    id: 'oracle-top-p', 
    label: 'Oracle Top-P', 
    color: COLORS.topP, 
    strokeDasharray: '5 5',
    strokeWidth: 4 // 2x thicker
  },
  { 
    id: 'PQCache', 
    label: 'PQCache', 
    color: COLORS.pqCache, 
    strokeDasharray: '5 5',
    strokeWidth: 4 // 2x thicker
  },
  { 
    id: 'vAttention (oracle-top-k)', 
    label: 'vAttention (Oracle Top-K)', 
    color: COLORS.vAttnK, 
    strokeDasharray: '0', 
    strokeWidth: 6 // Thicker line for emphasis (was 3)
  },
  { 
    id: 'vAttention (PQcache)', 
    label: 'vAttention (PQCache)', 
    color: COLORS.vAttnPQ, 
    strokeDasharray: '0', 
    strokeWidth: 6 // Thicker line for emphasis (was 3)
  },
];

// Helper to normalize strings for comparison (remove spaces, hyphens, brackets, lowercase)
function normalize(str: string): string {
  return str.toLowerCase().replace(/[\s\-\[\]\(\)]/g, '');
}

export function SparsityFrontierPlot({ sparsities, gapResults, errorResults }: PlotProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 640);
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  const { gapData, errorData } = useMemo(() => {
    // X-axis is "Fraction of KV cache reads"
    const sortedSparsities = [...sparsities].sort((a, b) => a - b);

    const buildData = (results: CombinedViewResult[], isGap: boolean) => {
      return sortedSparsities.map(sparsity => {
        const row: any = {
          name: `${sparsity}%`,
          xValue: sparsity, 
        };

        TARGET_BASELINES.forEach(target => {
          const targetNorm = normalize(target.id);
          
          // Use exact match on normalized strings first
          let result = results.find(r => normalize(r.baselineName) === targetNorm);

          // If no exact normalized match, try contains (useful if id is substring)
          if (!result) {
            result = results.find(r => normalize(r.baselineName).includes(targetNorm));
          }
          
          if (result && result.avgValuesPerSparsity[sparsity] !== undefined) {
            // For Gap: 100 + relative gap = quality.
            // For Error: raw value is fine (lower is better).
            row[target.label] = isGap 
              ? 100 + result.avgValuesPerSparsity[sparsity]
              : result.avgValuesPerSparsity[sparsity];
          }
        });
        return row;
      });
    };

    return {
      gapData: buildData(gapResults, true),
      errorData: buildData(errorResults, false)
    };
  }, [sparsities, gapResults, errorResults]);

  const downloadChart = () => {
    if (chartRef.current) {
       htmlToImage.toPng(chartRef.current, { 
         backgroundColor: '#020617',
         filter: (node) => {
           // Exclude elements with data-export-ignore attribute
           if (node instanceof HTMLElement && node.getAttribute('data-export-ignore')) {
             return false;
           }
           return true;
         }
       })
         .then(dataUrl => {
           const link = document.createElement('a');
           link.download = 'vattention_frontiers.png';
           link.href = dataUrl;
           link.click();
         });
    }
  };

  const axisFontSize = isMobile ? 10 : 12;
  const labelOffset = isMobile ? -10 : -15;
  const chartDotRadius = isMobile ? 2.5 : 4;
  const chartActiveDotRadius = isMobile ? 5 : 7;
  const legendFontSize = isMobile ? '0.6rem' : '0.75rem';
  const legendPaddingBottom = isMobile ? '4px' : '10px';
  const denseLabel = isMobile
    ? undefined
    : { value: 'Dense', fill: '#737373', fontSize: 10 };

  return (
    // Increased padding (p-6) and max-width to make it wider
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 shadow-lg h-full flex flex-col w-full" ref={chartRef}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base sm:text-xl font-semibold text-white tracking-wide">Sparsity Frontier: Quality vs Error</h3>
        <button 
          onClick={downloadChart}
          className="text-[10px] sm:text-xs text-gray-400 hover:text-white border border-dark-border rounded px-3 py-1.5 transition-colors"
          data-export-ignore="true"
        >
          Export PNG
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:h-[450px]">
        {/* Left: Performance Pareto */}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium text-gray-300 mb-4 text-center uppercase tracking-wider text-xs">Relative Accuracy (Higher is Better)</h4>
          <div className="h-[240px] sm:h-[260px] md:h-auto flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gapData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: axisFontSize }}
                  label={{ value: 'KV Cache Reads (%)', position: 'insideBottom', offset: labelOffset, fill: '#9CA3AF', fontSize: axisFontSize }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  domain={['auto', 102]} 
                  tick={{ fill: '#9CA3AF', fontSize: axisFontSize }}
                  label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', dy: 50, fontSize: axisFontSize }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333333', borderRadius: '0.5rem' }}
                  itemStyle={{ fontSize: '0.85rem' }}
                  labelStyle={{ color: '#fcd754', marginBottom: '0.5rem' }}
                  formatter={(val: number) => val.toFixed(1) + '%'}
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ fontSize: legendFontSize, paddingBottom: legendPaddingBottom }}
                  iconType="circle"
                  iconSize={isMobile ? 8 : 10}
                />
                <ReferenceLine y={100} stroke="#525252" strokeDasharray="3 3" label={denseLabel} />
                
                {TARGET_BASELINES.map(target => (
                  <Line
                    key={target.label}
                    type="monotone"
                    dataKey={target.label}
                    stroke={target.color}
                    strokeWidth={isMobile ? Math.max(2, (target.strokeWidth || 2) - 2) : (target.strokeWidth || 2)}
                    strokeDasharray={target.strokeDasharray}
                    dot={{ r: chartDotRadius, fill: target.color, strokeWidth: 0 }}
                    activeDot={{ r: chartActiveDotRadius, stroke: '#fff', strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Error Pareto */}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium text-gray-300 mb-4 text-center uppercase tracking-wider text-xs">Relative Error (Lower is Better)</h4>
          <div className="h-[240px] sm:h-[260px] md:h-auto flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={errorData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: axisFontSize }}
                  label={{ value: 'KV Cache Reads (%)', position: 'insideBottom', offset: labelOffset, fill: '#9CA3AF', fontSize: axisFontSize }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  domain={[0, 'auto']} 
                  tick={{ fill: '#9CA3AF', fontSize: axisFontSize }}
                  label={{ value: 'Error', angle: -90, position: 'insideLeft', fill: '#9CA3AF', dy: 30, fontSize: axisFontSize }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333333', borderRadius: '0.5rem' }}
                  itemStyle={{ fontSize: '0.85rem' }}
                  labelStyle={{ color: '#fcd754', marginBottom: '0.5rem' }}
                  formatter={(val: number) => val.toFixed(2)}
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ fontSize: legendFontSize, paddingBottom: legendPaddingBottom }}
                  iconType="circle"
                  iconSize={isMobile ? 8 : 10}
                />
                <ReferenceLine y={0} stroke="#525252" strokeDasharray="3 3" />
                
                {TARGET_BASELINES.map(target => (
                  <Line
                    key={target.label}
                    type="monotone"
                    dataKey={target.label}
                    stroke={target.color}
                    strokeWidth={isMobile ? Math.max(2, (target.strokeWidth || 2) - 2) : (target.strokeWidth || 2)}
                    strokeDasharray={target.strokeDasharray}
                    dot={{ r: chartDotRadius, fill: target.color, strokeWidth: 0 }}
                    activeDot={{ r: chartActiveDotRadius, stroke: '#fff', strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <p className="text-xs text-center text-gray-500 mt-6 font-mono">
        Solid lines: vAttention methods &mdash; Dashed lines: Standard baselines
      </p>
    </div>
  );
}

