import { useMemo } from 'react';
import type { CombinedViewResult } from '@sky-light/shared-types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

type PlotProps = {
  sparsities: number[];
  results: CombinedViewResult[];
};

const GROUP_COLORS = ['#fbbf24', '#22c55e', '#3b82f6', '#ec4899', '#a855f7', '#10b981'];

type GroupRow = {
  sparsity: number;
  label: string;
  [baselineName: string]: number | string;
};

type GroupedData = {
  data: GroupRow[];
  baselineNames: string[];
};

// Build data grouped by sparsity, with one bar per baseline in each group.
// This matches the layout of benchmark_gaps_single_plot.png / benchmark_err_single_plot.png.
function buildGapQualityData(
  results: CombinedViewResult[],
  sparsities: number[]
): GroupedData {
  // Exclude dense from plotted baselines
  const baselineNames = results
    .map(r => r.baselineName)
    .filter(name => name.toLowerCase() !== 'dense');

  const data: GroupRow[] = sparsities.map(sparsity => {
    const row: GroupRow = {
      sparsity,
      label: sparsityLabel(sparsity),
    };

    baselineNames.forEach(baselineName => {
      const result = results.find(r => r.baselineName === baselineName);
      const rawValue = result?.avgValuesPerSparsity[sparsity];
      if (rawValue === undefined || rawValue === null) {
        // Leave as undefined so Recharts simply omits the bar
        return;
      }
      // Convert relative gap (%) into quality where dense = 100
      const quality = 100 + rawValue;
      row[baselineName] = Number(quality.toFixed(2));
    });

    return row;
  });

  return { data, baselineNames };
}

function buildErrorData(
  results: CombinedViewResult[],
  sparsities: number[]
): GroupedData {
  const baselineNames = results
    .map(r => r.baselineName)
    .filter(name => name.toLowerCase() !== 'dense');

  const data: GroupRow[] = sparsities.map(sparsity => {
    const row: GroupRow = {
      sparsity,
      label: sparsityLabel(sparsity),
    };

    baselineNames.forEach(baselineName => {
      const result = results.find(r => r.baselineName === baselineName);
      const value = result?.avgValuesPerSparsity[sparsity];
      if (value === undefined || value === null) {
        return;
      }
      row[baselineName] = Number(value.toFixed(2));
    });

    return row;
  });

  return { data, baselineNames };
}

function sparsityLabel(sparsity: number): string {
  if (!Number.isFinite(sparsity) || sparsity <= 0) {
    return `${sparsity.toFixed(1)}% sparsity`;
  }

  const factor = Math.round(100 / sparsity);
  return `${factor}×`;
}

/** Plot for overall benchmark (gap / quality) metric */
export function GapSummaryPlot({ sparsities, results }: PlotProps) {
  const { data: gapData, baselineNames } = useMemo(
    () => buildGapQualityData(results, sparsities),
    [results, sparsities]
  );

  if (!gapData.length || baselineNames.length === 0) return null;

  const allValues: number[] = [];
  gapData.forEach(row => {
    baselineNames.forEach(name => {
      const v = row[name] as number | undefined;
      if (typeof v === 'number') {
        allValues.push(v);
      }
    });
  });
  const minVal = allValues.length ? Math.min(...allValues) : 0;
  const ymin = Math.max(0, minVal - 5);
  const ymax = 105;

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-semibold text-white mb-2">
        Relative model quality (higher is better), (Ŝ / S × 100)
      </h3>
      <p className="text-base text-gray-400 mb-4">
        Bars show relative model quality. S is score of dense model and Ŝ is score of sparse model on the benchmark.
      </p>

      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={gapData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="label"
              stroke="#9CA3AF"
              interval={0}
              label={{
                value: 'Factor of reduction in KV Cache reads',
                position: 'insideBottom',
                offset: -10,
                fill: '#9CA3AF',
              }}
            />
            <YAxis
              stroke="#9CA3AF"
              domain={[ymin, ymax]}
              label={{
                value: 'Relative model quality (% of dense)',
                angle: -90,
                position: 'insideLeft',
                fill: '#9CA3AF',
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                color: '#F9FAFB',
              }}
              formatter={(value, name) => [`${(value as number).toFixed(2)}%`, String(name)]}
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8 }} />
            <ReferenceLine
              y={100}
              stroke="#FFFFFF"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={{
                value: 'Dense (Full Attention)',
                position: 'insideTopRight',
                fill: '#E5E7EB',
                fontSize: 12,
              }}
            />
            {baselineNames.map((baselineName, idx) => (
              <Bar
                key={baselineName}
                dataKey={baselineName}
                name={baselineName}
                fill={GROUP_COLORS[idx % GROUP_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Plot for average_local_error metric */
export function ErrorSummaryPlot({ sparsities, results }: PlotProps) {
  const { data: errorData, baselineNames } = useMemo(
    () => buildErrorData(results, sparsities),
    [results, sparsities]
  );

  if (!errorData.length || baselineNames.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-semibold text-white mb-2">
        Relative error in attention layer output (lower is better), ( ‖Ô - O‖ / ‖O‖ x 100)
      </h3>
      <p className="text-base text-gray-400 mb-4">
        Bars show the average relative error in the attention layer output compared to
        dense full attention for each sparsity level. Ô is the output vector of the attention module with sparse attention and O is the output vector of the dense attention module.
      </p>

      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={errorData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="label"
              stroke="#9CA3AF"
              interval={0}
              label={{
                value: 'Factor of reduction in KV Cache reads',
                position: 'insideBottom',
                offset: -10,
                fill: '#9CA3AF',
              }}
            />
            <YAxis
              stroke="#9CA3AF"
              domain={[0, 100]}
              label={{
                value: 'Relative error (%)',
                angle: -90,
                position: 'insideLeft',
                fill: '#9CA3AF',
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                color: '#F9FAFB',
              }}
              formatter={(value, name) => [`${(value as number).toFixed(2)}%`, String(name)]}
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8 }} />
            <ReferenceLine
              y={0}
              stroke="#FFFFFF"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            {baselineNames.map((baselineName, idx) => (
              <Bar
                key={baselineName}
                dataKey={baselineName}
                name={baselineName}
                fill={GROUP_COLORS[idx % GROUP_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

