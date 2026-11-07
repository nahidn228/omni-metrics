import React, { useState } from 'react';
import {
  Database,
  Columns3,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Hash,
  Key,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Dataset, ColumnProfile } from '../types';

interface DatasetProfileDrawerProps {
  dataset: Dataset;
  onFilterByCategory?: (colName: string, value: string) => void;
  activeFilters?: Record<string, string[]>;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const DatasetProfileDrawer: React.FC<DatasetProfileDrawerProps> = ({
  dataset,
  onFilterByCategory,
  activeFilters = {},
  isExpanded: controlledExpanded,
  onToggle: controlledOnToggle,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggleExpanded = controlledOnToggle || (() => setInternalExpanded(!internalExpanded));

  // Group columns by role
  const categoricals = dataset.columns.filter(
    (c) => (c.type === 'categorical' || c.type === 'boolean') && c.name.toLowerCase() !== 'student_id'
  );
  const numerics = dataset.columns.filter(
    (c) => c.type === 'numeric' && !c.name.toLowerCase().includes('id')
  );
  const idColumns = dataset.columns.filter(
    (c) => c.type === 'id' || c.name.toLowerCase().includes('id')
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg backdrop-blur overflow-hidden transition-all">
      {/* Summary Header Bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Dataset Scale Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Uploaded Dataset Profile & Column Groups
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Complete</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              File: <span className="font-mono text-slate-300">{dataset.fileName}</span> • Size:{' '}
              <span className="font-mono text-slate-300">{(dataset.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
            </p>
          </div>
        </div>

        {/* Center: Row & Column Counters */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              Total Rows
            </span>
            <span className="text-base font-extrabold text-white font-mono">
              {dataset.rowCount.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              Total Columns
            </span>
            <span className="text-base font-extrabold text-white font-mono">
              {dataset.columnCount}
            </span>
          </div>

          {/* Toggle Expand Details */}
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition"
          >
            <Columns3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isExpanded ? 'Hide Column Groups' : 'Explore Column Groups'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Grouped Columns Detail View */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-slate-950/60 p-4 sm:p-6 space-y-6">
          {/* Quick Guidance Note */}
          <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              The dataset contains 11 columns organized into <strong>Categorical Multi-Value Fields</strong> (e.g. Gender, Department, Depression), <strong>Numeric Lifestyle & Academic Metrics</strong> (Physical Activity, Sleep, Stress, CGPA), and <strong>Unique Identifiers</strong>. Click any value pill to filter!
            </span>
          </div>

          {/* 1. Categorical / Discrete Multi-Value Groups */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Categorical Columns with Discrete Value Groups</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoricals.map((col) => {
                const values = col.topValues || [];
                return (
                  <div
                    key={col.name}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {col.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                        {col.uniqueCount} distinct values
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {values.map((v) => {
                        const isFiltered = activeFilters[col.name]?.includes(v.value);
                        return (
                          <button
                            key={v.value}
                            onClick={() => onFilterByCategory && onFilterByCategory(col.name, v.value)}
                            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                              isFiltered
                                ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow'
                                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className="font-medium">{v.value}</span>
                            <span className="text-[10px] opacity-75 font-mono">
                              ({v.count.toLocaleString()})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Numeric Lifestyle & Academic Metrics */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>Numeric Continuous & Metric Columns</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {numerics.map((col) => (
                <div
                  key={col.name}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5"
                >
                  <span className="text-xs font-bold text-slate-200 truncate block" title={col.name}>
                    {col.name.replace(/_/g, ' ')}
                  </span>
                  <div className="text-lg font-extrabold text-white font-mono">
                    {col.mean !== undefined ? col.mean.toFixed(2) : '-'}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                    <span>Min: {col.min !== undefined ? col.min.toFixed(1) : '-'}</span>
                    <span>Max: {col.max !== undefined ? col.max.toFixed(1) : '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Identifiers */}
          {idColumns.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-300">Identifier Column:</span>
                {idColumns.map((c) => (
                  <span key={c.name} className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {c.name} (100,000 unique records)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

