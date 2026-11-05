import React, { useState } from 'react';
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Layers,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { AggregationType, ChartConfig, ChartType, ColumnProfile } from '../types';
import { ChartCard } from './ChartCard';

interface ChartBuilderProps {
  columns: ColumnProfile[];
  rows: Record<string, any>[];
  onAddChart: (config: ChartConfig) => void;
}

export const ChartBuilder: React.FC<ChartBuilderProps> = ({
  columns,
  rows,
  onAddChart,
}) => {
  const numerics = columns.filter((c) => c.type === 'numeric');
  const categoricals = columns.filter((c) => c.type === 'categorical' || c.type === 'boolean');

  const defaultX = categoricals[0]?.name || columns[0]?.name || '';
  const defaultY = numerics[0]?.name || '';

  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('Custom Visual Analysis');
  const [xKey, setXKey] = useState(defaultX);
  const [yKey, setYKey] = useState<string>(defaultY);
  const [aggregation, setAggregation] = useState<AggregationType>('avg');
  const [groupKey, setGroupKey] = useState<string>('');

  const currentConfig: ChartConfig = {
    id: `custom-${Date.now()}`,
    title: title || `${aggregation.toUpperCase()} of ${yKey || 'Count'} by ${xKey}`,
    type: chartType,
    xKey,
    yKey: yKey || undefined,
    groupKey: groupKey || undefined,
    aggregation,
    description: groupKey ? `Grouped by ${groupKey}` : undefined,
  };

  const handleSaveToDashboard = () => {
    onAddChart(currentConfig);
  };

  const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'bar', label: 'Bar', icon: <BarChart3 className="w-4 h-4" /> },
    { type: 'line', label: 'Line', icon: <LineIcon className="w-4 h-4" /> },
    { type: 'area', label: 'Area', icon: <Layers className="w-4 h-4" /> },
    { type: 'pie', label: 'Pie/Donut', icon: <PieIcon className="w-4 h-4" /> },
    { type: 'scatter', label: 'Scatter', icon: <ScatterIcon className="w-4 h-4" /> },
    { type: 'radar', label: 'Radar', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Configuration Panel */}
      <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg space-y-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Chart Designer Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build custom visualizations for any dimension or metric
          </p>
        </div>

        {/* 1. Chart Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Chart Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            placeholder="e.g. Study Hours vs CGPA Analysis"
          />
        </div>

        {/* 2. Chart Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Visual Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {chartTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => setChartType(item.type)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                  chartType === item.type
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. X-Axis (Category or Dimension) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            X-Axis Dimension
          </label>
          <select
            value={xKey}
            onChange={(e) => setXKey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Y-Axis (Metric) - If not pie */}
        {chartType !== 'pie' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Y-Axis Value (Metric)
            </label>
            <select
              value={yKey}
              onChange={(e) => setYKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Count of Records --</option>
              {numerics.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (Numeric)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 5. Aggregation Method - If Y-Axis is chosen and not scatter */}
        {yKey && chartType !== 'scatter' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Aggregation Method
            </label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as AggregationType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="avg">Average (Mean)</option>
              <option value="sum">Sum (Total)</option>
              <option value="count">Count</option>
              <option value="median">Median</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </select>
          </div>
        )}

        {/* 6. Group By / Color Series (Categorical) */}
        {chartType !== 'pie' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Breakdown / Color Group (Optional)
            </label>
            <select
              value={groupKey}
              onChange={(e) => setGroupKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- None --</option>
              {categoricals.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-slate-700">
          <button
            onClick={handleSaveToDashboard}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Pin This Chart to Main Dashboard</span>
          </button>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="lg:col-span-7 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Live Interactive Preview
          </span>
          <span className="text-xs text-indigo-400 font-medium">
            Updates in real-time
          </span>
        </div>

        <ChartCard config={currentConfig} rows={rows} columns={columns} />
      </div>
    </div>
  );
};

