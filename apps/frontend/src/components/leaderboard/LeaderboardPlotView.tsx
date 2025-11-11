import { useMemo, useState } from 'react';
import { usePlotData } from '../../hooks/useLeaderboard';
import { useLLMs } from '../../hooks/useLLMs';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { MultiSelectFilter } from '../common/MultiSelectFilter';
import { calculateParetoFrontier, Point } from '../../utils/pareto';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ZAxis,
} from 'recharts';

// Generate a color palette for the chart lines
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F',
  '#FFBB28', '#FF8042', '#A4DE6C', '#D0ED57', '#a4de6c',
];

export function LeaderboardPlotView() {
  const [selectedLlms, setSelectedLlms] = useState<string[]>([]);
  const { data: plotData, isLoading, error } = usePlotData();
  useLLMs();

  // Process data for plotting
  const { series, paretoSeries } = useMemo(() => {
    if (!plotData) return { series: [], paretoSeries: [] };

    const groupedData = new Map<string, Point[]>();

    plotData.forEach(item => {
      const key = `${item.baseline.name} (Aux: ${item.targetAuxMemory ?? 'N/A'})`;
      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key)!.push({
        x: item.targetSparsity || 0,
        y: item.score,
        ...item, // Keep original data for tooltip
      });
    });

    const series = Array.from(groupedData.entries()).map(([name, data]) => ({
      name,
      data,
    }));

    const paretoSeries = series.map(s => ({
      ...s,
      data: calculateParetoFrontier(s.data),
    }));

    return { series, paretoSeries };
  }, [plotData]);

  // Handle LLM filter
  const llmsInPlot = useMemo(() => {
    return Array.from(new Set(plotData?.map(d => d.llm.name) || []));
  }, [plotData]);
  
  const filteredSeries = useMemo(() => {
    if (selectedLlms.length === 0) return series;
    return series.filter(s => {
      const firstPoint = s.data[0];
      return firstPoint && selectedLlms.includes((firstPoint as any).llm.name);
    });
  }, [series, selectedLlms]);
  
  const filteredParetoSeries = useMemo(() => {
    if (selectedLlms.length === 0) return paretoSeries;
    return paretoSeries.filter(s => {
      const firstPoint = s.data[0];
      return firstPoint && selectedLlms.includes((firstPoint as any).llm.name);
    });
  }, [paretoSeries, selectedLlms]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load plot data" />;

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Performance vs. Density</h2>
      
      <div className="mb-4">
        <MultiSelectFilter
          label="Filter by Model"
          options={llmsInPlot}
          selectedValues={selectedLlms}
          onChange={setSelectedLlms}
        />
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="x"
            name="Density"
            unit="%"
            stroke="#9CA3AF"
            domain={[0, 100]}
            label={{ value: 'Density (%)', position: 'insideBottom', offset: -15, fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            label={{ value: 'Overall Score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              color: '#F9FAFB',
            }}
            formatter={(_value, _name, props) => {
              const { payload } = props;
              return (
                <div>
                  <p>{`Score: ${payload.y.toFixed(2)}`}</p>
                  <p>{`Density: ${payload.x.toFixed(2)}%`}</p>
                  <p>{`Model: ${payload.llm.name}`}</p>
                  <p>{`Baseline: ${payload.baseline.name}`}</p>
                </div>
              );
            }}
          />
          <Legend />

          {/* All data points as scatter plot */}
          {filteredSeries.map((s, i) => (
            <Scatter key={s.name} data={s.data} fill={COLORS[i % COLORS.length]} name={s.name} opacity={0.5} />
          ))}

          {/* Pareto frontier as lines */}
          {filteredParetoSeries.map((s, i) => (
            <Line
              key={`${s.name}-pareto`}
              type="monotone"
              data={s.data}
              dataKey="y"
              name={`${s.name} (Pareto)`}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
          <ZAxis dataKey="z" range={[0, 0]} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
