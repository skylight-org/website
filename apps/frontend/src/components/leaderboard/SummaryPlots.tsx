import { useMemo, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
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
  LabelList,
} from 'recharts';

type PlotProps = {
  sparsities: number[];
  results: CombinedViewResult[];
};

// Warm color palette aligned with theme
const GROUP_COLORS = [
  '#fcd754', // Gold (theme accent)
  '#f97316', // Orange
  '#ef4444', // Red/Coral
  '#84cc16', // Lime green
  '#22c55e', // Green
  '#b45309', // Amber/Brown
];

type GroupRow = {
  sparsity: number;
  label: string;
  [baselineName: string]: number | string;
};

type GroupedData = {
  data: GroupRow[];
  baselineNames: string[];
};

function downloadChartAsPng(container: HTMLDivElement | null, fileName: string) {
  if (!container) return;

  try {
    const pixelRatio = window.devicePixelRatio || 2;

    htmlToImage
      .toPng(container, {
        pixelRatio,
        cacheBust: true,
        filter: node =>
          !(node instanceof HTMLElement && node.dataset && node.dataset.exportIgnore === 'true'),
        backgroundColor: '#020617',
      })
      .then(pngDataUrl => {
      const link = document.createElement('a');
        link.href = pngDataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      });
  } catch (err) {
    // Swallow errors – export is a convenience feature
    console.error('Failed to export chart as PNG', err);
  }
}

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
  const chartRef = useRef<HTMLDivElement | null>(null);

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
  // Round down to nearest 10 for clean tick values
  const ymin = Math.max(0, Math.floor((minVal - 5) / 10) * 10);
  const ymax = 105; // Extra space above 100 for the Dense label

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">
            Relative model quality (higher is better), (Ŝ / S × 100)
          </h3>
          <p className="text-base text-gray-400">
            Bars show relative model quality. S is score of dense model and Ŝ is score of sparse model on the benchmark.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            downloadChartAsPng(chartRef.current, 'skylight_overall_quality.png')
          }
          data-export-ignore="true"
          className="inline-flex items-center justify-center rounded-md border border-dark-border bg-dark-bg px-3 py-2 text-sm font-medium text-gray-200 hover:bg-dark-surface-hover hover:text-white transition-colors"
        >
          Download PNG
        </button>
      </div>

      <div ref={chartRef} className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={gapData} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
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
              allowDataOverflow={false}
              tickCount={6}
              label={{
                value: 'Relative model quality (% of dense)',
                angle: -90,
                position: 'insideLeft',
                fill: '#9CA3AF',
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                color: '#F9FAFB',
                fontSize: 13,
                padding: '6px 10px',
                lineHeight: '1.2',
              }}
              itemStyle={{ padding: '1px 0', margin: 0 }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.15)' }}
              offset={120}
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
                dy: -18,
              }}
            />
            {baselineNames.map((baselineName, idx) => (
              <Bar
                key={baselineName}
                dataKey={baselineName}
                name={baselineName}
                fill={GROUP_COLORS[idx % GROUP_COLORS.length]}
              >
                <LabelList
                  dataKey={baselineName}
                  position="inside"
                  angle={-90}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  fill="#020617"
                  style={{ fontSize: 11, fontWeight: 600, textAnchor: 'middle' }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Plot for average_local_error metric */
export function ErrorSummaryPlot({ sparsities, results }: PlotProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const { data: errorData, baselineNames } = useMemo(
    () => buildErrorData(results, sparsities),
    [results, sparsities]
  );

  if (!errorData.length || baselineNames.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">
            Relative error in attention layer output (lower is better), ( ‖Ô - O‖ / ‖O‖ x 100)
          </h3>
          <p className="text-base text-gray-400">
            Bars show the average relative error in the attention layer output compared to
            dense full attention for each sparsity level. Ô is the output vector of the attention module with sparse attention and O is the output vector of the dense attention module.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            downloadChartAsPng(chartRef.current, 'skylight_attention_error.png')
          }
          data-export-ignore="true"
          className="inline-flex items-center justify-center rounded-md border border-dark-border bg-dark-bg px-3 py-2 text-sm font-medium text-gray-200 hover:bg-dark-surface-hover hover:text-white transition-colors"
        >
          Download PNG
        </button>
      </div>

      <div ref={chartRef} className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={errorData} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
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
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                color: '#F9FAFB',
                fontSize: 13,
                padding: '6px 10px',
                lineHeight: '1.2',
              }}
              itemStyle={{ padding: '1px 0', margin: 0 }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.15)' }}
              offset={120}
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
              >
                <LabelList
                  dataKey={baselineName}
                  position="inside"
                  angle={-90}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  fill="#020617"
                  style={{ fontSize: 11, fontWeight: 600, textAnchor: 'middle' }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

