import React, { useState } from 'react';
import { ColumnProfile, CorrelationItem } from '../types';
import { calculateCorrelation } from '../utils/analyzer';

interface StatisticsViewProps {
  columns: ColumnProfile[];
  correlations: CorrelationItem[];
  rows: Record<string, any>[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  columns,
  correlations,
  rows,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'numeric' | 'categorical'>('all');
  const numericCols = columns.filter((c) => c.type === 'numeric');

  const filteredColumns = columns.filter((c) => {
    if (filterType === 'numeric') return c.type === 'numeric';
    if (filterType === 'categorical') return c.type === 'categorical' || c.type === 'boolean';
    return true;
  });

  // Color generator for correlation cell (-1 to +1)
  const getCorrelationColor = (r: number) => {
    if (r === 1) return 'bg-indigo-600/40 text-indigo-200';
    if (r >= 0.5) return 'bg-blue-600/50 text-blue-100 font-bold';
    if (r >= 0.2) return 'bg-blue-500/20 text-blue-200';
    if (r <= -0.5) return 'bg-rose-600/50 text-rose-100 font-bold';
    if (r <= -0.2) return 'bg-rose-500/20 text-rose-200';
    return 'bg-slate-800/40 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* 1. Correlation Matrix Heatmap */}
      {numericCols.length > 1 && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Pearson Correlation Matrix Heatmap
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Measures linear dependency between numeric variables (-1.0 = Strong Inverse, +1.0 = Strong Direct)
              </p>
            </div>
            {/* Heatmap Legend */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-500/60 inline-block"></span> -1.0 (Inverse)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-800 inline-block"></span> 0.0 (Neutral)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500/60 inline-block"></span> +1.0 (Direct)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left font-semibold text-slate-400 border-b border-slate-700">
                    Feature
                  </th>
                  {numericCols.map((c) => (
                    <th
                      key={c.name}
                      className="p-2 font-semibold text-slate-300 border-b border-slate-700 truncate max-w-[100px]"
                      title={c.name}
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {numericCols.map((rowCol) => (
                  <tr key={rowCol.name} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="p-2 text-left font-medium text-slate-300 truncate max-w-[120px]">
                      {rowCol.name}
                    </td>
                    {numericCols.map((colCol) => {
                      const r =
                        rowCol.name === colCol.name
                          ? 1.0
                          : calculateCorrelation(rows, rowCol.name, colCol.name);

                      return (
                        <td
                          key={colCol.name}
                          className={`p-2 font-mono transition-colors ${getCorrelationColor(r)}`}
                          title={`${rowCol.name} vs ${colCol.name}: r = ${r.toFixed(3)}`}
                        >
                          {r.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Top Correlated Pairs */}
      {correlations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Strongest Relationships
            </h4>
            <div className="space-y-2">
              {correlations.slice(0, 6).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs bg-slate-900/60 border border-slate-700/50 p-2 rounded-lg"
                >
                  <div className="truncate pr-2">
                    <span className="font-medium text-slate-200">{c.colA}</span>
                    <span className="text-slate-500 mx-1.5">↔</span>
                    <span className="font-medium text-slate-200">{c.colB}</span>
                  </div>
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                      c.correlation > 0
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    r = {c.correlation > 0 ? `+${c.correlation}` : c.correlation}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Categorical Top Distributions
            </h4>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {columns
                .filter((c) => (c.type === 'categorical' || c.type === 'boolean') && c.topValues)
                .map((col) => (
                  <div
                    key={col.name}
                    className="text-xs bg-slate-900/60 border border-slate-700/50 p-2 rounded-lg"
                  >
                    <div className="font-medium text-slate-200 mb-1">{col.name}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {col.topValues?.slice(0, 4).map((v) => (
                        <span
                          key={v.value}
                          className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                        >
                          {v.value}: <span className="text-indigo-400 font-semibold">{v.percentage.toFixed(1)}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Comprehensive Column Statistical Profiling Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Column Statistical Profiling
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Summary statistics, quartile distributions, and cardinality for all attributes
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded transition ${
                filterType === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({columns.length})
            </button>
            <button
              onClick={() => setFilterType('numeric')}
              className={`px-2.5 py-1 rounded transition ${
                filterType === 'numeric' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Numeric ({numericCols.length})
            </button>
            <button
              onClick={() => setFilterType('categorical')}
              className={`px-2.5 py-1 rounded transition ${
                filterType === 'categorical' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Categorical ({columns.length - numericCols.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Unique</th>
                <th className="py-2.5 px-3">Missing</th>
                <th className="py-2.5 px-3 text-right">Min</th>
                <th className="py-2.5 px-3 text-right">Q1 (25%)</th>
                <th className="py-2.5 px-3 text-right">Median</th>
                <th className="py-2.5 px-3 text-right">Mean</th>
                <th className="py-2.5 px-3 text-right">Q3 (75%)</th>
                <th className="py-2.5 px-3 text-right">Max</th>
                <th className="py-2.5 px-3 text-right">Std Dev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredColumns.map((c) => (
                <tr key={c.name} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3 font-semibold text-slate-200">{c.name}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                        c.type === 'numeric'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : c.type === 'boolean'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300 font-mono">
                    {c.uniqueCount.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-slate-300 font-mono">
                    {c.nullCount === 0 ? '0%' : `${((c.nullCount / c.totalCount) * 100).toFixed(1)}%`}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {c.min !== undefined ? c.min.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {c.q1 !== undefined ? c.q1.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-200 font-medium">
                    {c.median !== undefined ? c.median.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-indigo-300 font-semibold">
                    {c.mean !== undefined ? c.mean.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {c.q3 !== undefined ? c.q3.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {c.max !== undefined ? c.max.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-400">
                    {c.stdDev !== undefined ? c.stdDev.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

