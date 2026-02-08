import { useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

const DATA = [
  { entropy: 0, topk: 5, sampling: 85, vattention: 6 },
  { entropy: 10, topk: 8, sampling: 75, vattention: 8 },
  { entropy: 20, topk: 15, sampling: 65, vattention: 12 },
  { entropy: 30, topk: 25, sampling: 55, vattention: 16 },
  { entropy: 40, topk: 40, sampling: 45, vattention: 20 },
  { entropy: 50, topk: 60, sampling: 38, vattention: 24 },
  { entropy: 60, topk: 75, sampling: 32, vattention: 26 },
  { entropy: 70, topk: 85, sampling: 28, vattention: 28 },
  { entropy: 80, topk: 92, sampling: 25, vattention: 29 },
  { entropy: 90, topk: 96, sampling: 23, vattention: 30 },
  { entropy: 100, topk: 98, sampling: 22, vattention: 30 },
];

const COLORS = {
  topK: '#a8a29e',     // Stone-400
  sampling: '#f97316', // Orange-500
  vAttention: '#fcd754', // Gold
};

export function AttentionErrorPlot() {
  const chartRef = useRef<HTMLDivElement | null>(null);

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
          link.download = 'attention_error_plot.png';
          link.href = dataUrl;
          link.click();
        });
    }
  };

  return (
    <div className="overflow-x-auto" role="region" aria-label="Attention error comparison plot" tabIndex={0}>
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 shadow-lg flex flex-col min-w-[600px]" ref={chartRef}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl font-semibold text-white text-center flex-grow">Failure Modes of Approximation</h3>
          <button
            onClick={downloadChart}
            className="text-xs text-gray-400 hover:text-white border border-dark-border rounded px-3 py-1.5 transition-colors"
            data-export-ignore="true"
          >
            Export PNG
          </button>
        </div>
        <p className="text-base text-gray-400 mb-6 text-center">
          Top-K fails on flat distributions; Sampling fails on spiky ones. vAttention bridges the gap.
        </p>

        <div className="h-[460px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA} margin={{ top: 12, right: 36, left: 14, bottom: 34 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
              <XAxis
                dataKey="entropy"
                stroke="#9CA3AF"
                type="number"
                domain={[0, 100]}
                tick={false} // Abstract conceptual plot
                label={{ value: 'Attention Distribution Flatness (Entropy) →', position: 'insideBottom', offset: -22, fill: '#9CA3AF', fontSize: 16 }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={false}
                label={{ value: 'Approximation Error', angle: -90, position: 'insideLeft', fill: '#9CA3AF', dy: 95, fontSize: 16 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333333', borderRadius: '0.5rem' }}
                itemStyle={{ fontSize: '1.05rem' }}
                formatter={(val: number) => val.toFixed(0)}
                labelFormatter={() => ''}
              />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: '1.05rem', paddingBottom: '24px' }} iconType="circle" />

              {/* Annotations for distribution types */}
              <ReferenceLine x={10} stroke="none" label={{ value: 'Spiky (Peaked)', position: 'insideBottomLeft', fill: '#525252', fontSize: 15, angle: -90, dx: 28, dy: -64 }} />
              <ReferenceLine x={90} stroke="none" label={{ value: 'Flat (Uniform)', position: 'insideBottomRight', fill: '#525252', fontSize: 15, angle: -90, dx: -28, dy: -64 }} />

              <Line
                name="Top-K Only"
                type="monotone"
                dataKey="topk"
                stroke={COLORS.topK}
                strokeWidth={4}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 7 }}
              />
              <Line
                name="Sampling Only"
                type="monotone"
                dataKey="sampling"
                stroke={COLORS.sampling}
                strokeWidth={4}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 7 }}
              />
              <Line
                name="vAttention (Hybrid)"
                type="monotone"
                dataKey="vattention"
                stroke={COLORS.vAttention}
                strokeWidth={7}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

