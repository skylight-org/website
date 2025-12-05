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
  Label
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
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 shadow-lg w-full flex flex-col">
      <h3 className="text-xl font-semibold text-white mb-2 text-center">Failure Modes of Approximation</h3>
      <p className="text-sm text-gray-400 mb-6 text-center">
        Top-K fails on flat distributions; Sampling fails on spiky ones. vAttention bridges the gap.
      </p>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DATA} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
            <XAxis 
              dataKey="entropy" 
              stroke="#9CA3AF"
              type="number"
              domain={[0, 100]}
              tick={false} // Abstract conceptual plot
              label={{ value: 'Attention Distribution Flatness (Entropy) →', position: 'insideBottom', offset: -15, fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              tick={false}
              label={{ value: 'Approximation Error', angle: -90, position: 'insideLeft', fill: '#9CA3AF', dy: 60, fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333333', borderRadius: '0.5rem' }}
              itemStyle={{ fontSize: '0.85rem' }}
              formatter={(val: number) => val.toFixed(0)}
              labelFormatter={() => ''}
            />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: '0.85rem', paddingBottom: '20px' }} iconType="circle" />
            
            {/* Annotations for distribution types */}
            <ReferenceLine x={10} stroke="none" label={{ value: 'Spiky (Peaked)', position: 'insideBottomLeft', fill: '#525252', fontSize: 12, angle: -90, dx: 20, dy: -50 }} />
            <ReferenceLine x={90} stroke="none" label={{ value: 'Flat (Uniform)', position: 'insideBottomRight', fill: '#525252', fontSize: 12, angle: -90, dx: -20, dy: -50 }} />

            <Line
              name="Top-K Only"
              type="monotone"
              dataKey="topk"
              stroke={COLORS.topK}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              name="Sampling Only"
              type="monotone"
              dataKey="sampling"
              stroke={COLORS.sampling}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              name="vAttention (Hybrid)"
              type="monotone"
              dataKey="vattention"
              stroke={COLORS.vAttention}
              strokeWidth={5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


