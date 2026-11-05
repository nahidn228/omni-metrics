import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ZAxis,
} from 'recharts';
import {
  Maximize2,
  Minimize2,
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  HelpCircle,
} from 'lucide-react';
import { ChartConfig, ColumnProfile } from '../types';
import { prepareChartData } from '../utils/dataTransforms';

interface ChartCardProps {
  config: ChartConfig;
  rows: Record<string, any>[];
  columns: ColumnProfile[];
  onConfigChange?: (newConfig: ChartConfig) => void;
}

const PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#e11d48', // Rose
];

export const ChartCard: React.FC<ChartCardProps> = ({
  config,
  rows,
  columns,
  onConfigChange,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeType, setActiveType] = useState(config.type);

  const { data, keys, isSampled } = prepareChartData(
    rows,
    { ...config, type: activeType },
    columns
  );

  const switchType = (type: ChartConfig['type']) => {
    setActiveType(type);
    if (onConfigChange) {
      onConfigChange({ ...config, type });
    }
  };

  const renderChart = (height: number) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex h-64 flex-col items-center justify-center text-slate-500">
          <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No data available for the selected dimensions</p>
        </div>
      );
    }

    if (activeType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
              formatter={(value: any) => [Number(value).toLocaleString(), 'Count']}
            />
            <Legend verticalAlign="bottom" height={36} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={height > 300 ? 60 : 45}
              outerRadius={height > 300 ? 110 : 80}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="x"
              name={config.xKey}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => Number(v).toFixed(1)}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={config.yKey || 'Y'}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => Number(v).toFixed(1)}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
              formatter={(val: any, name: any) => [
                Number(val).toFixed(2),
                name === 'x' ? config.xKey : config.yKey,
              ]}
            />
            <Scatter name="Data Points" data={data} fill="#6366f1" opacity={0.65} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey={config.xKey}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              angle={-25}
              textAnchor="end"
              height={40}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
            {keys.length > 1 && <Legend verticalAlign="top" height={36} />}
            {keys.map((k, idx) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={PALETTE[idx % PALETTE.length]}
                strokeWidth={2.5}
                dot={{ r: 3, fill: PALETTE[idx % PALETTE.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
            <defs>
              {keys.map((k, idx) => (
                <linearGradient key={`grad-${k}`} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE[idx % PALETTE.length]} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={PALETTE[idx % PALETTE.length]} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey={config.xKey}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              angle={-25}
              textAnchor="end"
              height={40}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
            {keys.length > 1 && <Legend verticalAlign="top" height={36} />}
            {keys.map((k, idx) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                stroke={PALETTE[idx % PALETTE.length]}
                fill={`url(#grad-${k})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'radar') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart outerRadius={90} data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey={config.xKey} stroke="#94a3b8" fontSize={11} />
            <PolarRadiusAxis stroke="#64748b" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
            {keys.map((k, idx) => (
              <Radar
                key={k}
                name={k}
                dataKey={k}
                stroke={PALETTE[idx % PALETTE.length]}
                fill={PALETTE[idx % PALETTE.length]}
                fillOpacity={0.4}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar Chart
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey={config.xKey}
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            angle={data.length > 7 ? -25 : 0}
            textAnchor={data.length > 7 ? 'end' : 'middle'}
            height={data.length > 7 ? 40 : 25}
          />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
          />
          {keys.length > 1 && <Legend verticalAlign="top" height={36} />}
          {keys.map((k, idx) => (
            <Bar
              key={k}
              dataKey={k}
              fill={PALETTE[idx % PALETTE.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      <div className="flex flex-col bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-xl p-4 shadow-lg hover:border-slate-600 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
              {config.title}
            </h3>
            {config.description && (
              <p className="text-xs text-slate-400 mt-0.5">{config.description}</p>
            )}
            {isSampled && (
              <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                ⚡ Sampled for optimal 60fps rendering
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Chart Type switcher */}
            {activeType !== 'scatter' && (
              <div className="flex items-center bg-slate-900/60 rounded-lg p-0.5 border border-slate-700/60">
                <button
                  onClick={() => switchType('bar')}
                  className={`p-1 rounded text-xs transition-colors ${
                    activeType === 'bar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => switchType('line')}
                  className={`p-1 rounded text-xs transition-colors ${
                    activeType === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Line Chart"
                >
                  <LineIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => switchType('pie')}
                  className={`p-1 rounded text-xs transition-colors ${
                    activeType === 'pie' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Donut / Pie Chart"
                >
                  <PieIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Full Screen View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chart Body */}
        <div className="w-full flex-1 min-h-[260px]">{renderChart(260)}</div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">{config.title}</h2>
                <p className="text-sm text-slate-400">{config.description}</p>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 py-6">{renderChart(500)}</div>
          </div>
        </div>
      )}
    </>
  );
};

