import React from 'react';
import { Database, Columns3, CheckCircle2, TrendingUp, Activity, BarChart2 } from 'lucide-react';
import { ColumnProfile } from '../types';
import { formatMetricNumber } from '../utils/dataTransforms';

interface KpiCardsProps {
  totalRows: number;
  filteredRowsCount: number;
  columns: ColumnProfile[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalRows,
  filteredRowsCount,
  columns,
}) => {
  const numericCols = columns.filter(c => c.type === 'numeric' && !c.name.toLowerCase().includes('id'));
  const totalCells = totalRows * columns.length;
  const totalNulls = columns.reduce((acc, c) => acc + c.nullCount, 0);
  const completeness = totalCells > 0 ? ((totalCells - totalNulls) / totalCells) * 100 : 100;

  // Pick top 3-4 interesting numeric columns
  const featuredMetrics = numericCols.slice(0, 4);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
      {/* 1. Total Rows */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Rows</span>
          <Database className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatMetricNumber(filteredRowsCount)}
          </div>
          {filteredRowsCount !== totalRows && (
            <p className="text-xs text-indigo-400 mt-0.5">
              Filtered from {formatMetricNumber(totalRows)}
            </p>
          )}
        </div>
      </div>

      {/* 2. Columns */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Columns</span>
          <Columns3 className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {columns.length}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {numericCols.length} numeric, {columns.length - numericCols.length} cat
          </p>
        </div>
      </div>

      {/* 3. Completeness */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Data Quality</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {completeness.toFixed(1)}%
          </div>
          <p className="text-xs text-emerald-400 mt-0.5">
            {totalNulls === 0 ? 'No missing cells' : `${totalNulls.toLocaleString()} missing`}
          </p>
        </div>
      </div>

      {/* 4+ Featured Numeric Metrics */}
      {featuredMetrics.map((col, idx) => {
        const colors = [
          { text: 'text-amber-400', bar: 'bg-amber-500' },
          { text: 'text-purple-400', bar: 'bg-purple-500' },
          { text: 'text-rose-400', bar: 'bg-rose-500' },
          { text: 'text-blue-400', bar: 'bg-blue-500' },
        ];
        const color = colors[idx % colors.length];

        return (
          <div
            key={col.name}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider truncate max-w-[110px]" title={col.name}>
                Avg {col.name.replace(/_/g, ' ')}
              </span>
              <TrendingUp className={`w-4 h-4 ${color.text}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {col.mean !== undefined ? col.mean.toFixed(2) : '-'}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Min: {col.min !== undefined ? col.min.toFixed(1) : '-'}</span>
                <span>Max: {col.max !== undefined ? col.max.toFixed(1) : '-'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

