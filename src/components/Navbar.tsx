import React from 'react';
import {
  BarChart2,
  Upload,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Layers,
  Database,
  BookOpen,
  Sliders,
  GraduationCap,
  LayoutDashboard,
} from 'lucide-react';
import { Dataset, AppTab } from '../types';

interface NavbarProps {
  dataset: Dataset | null;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isLoadingSample?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataset,
  onOpenUpload,
  onLoadSample,
  activeTab,
  setActiveTab,
  isLoadingSample,
}) => {
  const isStudentDataset = dataset?.columns.some((c) => c.name.toLowerCase() === 'depression');

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  OmniMetrics
                </span>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                  v2.4 Public
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Student Well-Being & Lifestyle Analytics Platform
              </p>
            </div>
          </div>

          {/* Active Dataset Pill (if loaded) */}
          {dataset && (
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-slate-200 truncate max-w-[180px]">
                {dataset.fileName}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-mono">
                {dataset.rowCount.toLocaleString()} rows
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-mono">
                {dataset.columnCount} cols
              </span>
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {!dataset && (
              <button
                onClick={onLoadSample}
                disabled={isLoadingSample}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Load Sample (100k)</span>
                <span className="sm:hidden">Sample</span>
              </button>
            )}

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition shadow-md shadow-indigo-600/30"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{dataset ? 'Change File' : 'Upload CSV / Excel'}</span>
            </button>

            {dataset && (
              <button
                onClick={() => window.print()}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-lg transition"
                title="Print / Save PDF Report"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (if dataset loaded) */}
        {dataset && (
          <div className="flex items-center space-x-1 border-t border-slate-800/80 pt-1 pb-1 overflow-x-auto">
            {/* Primary Executive Dashboard */}
            <button
              onClick={() => setActiveTab('powerbi')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'powerbi'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>📊 Executive Dashboard</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded">
                Live
              </span>
            </button>

            {/* Story Mode Tab */}
            {isStudentDataset && (
              <button
                onClick={() => setActiveTab('story')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'story'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                    : 'text-indigo-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>📖 Guided Data Story</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-indigo-500/30 text-indigo-200 rounded">
                  Interactive
                </span>
              </button>
            )}

            {/* Risk Simulator Tab */}
            {isStudentDataset && (
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'simulator'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>🎛️ Risk Simulator</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dynamic Visual Grid</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'builder'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chart Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'statistics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Deep Correlations & Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data Explorer ({dataset.rowCount.toLocaleString()})</span>
            </button>

            {/* Research Guide Tab */}
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>📘 Research Guide & Insights</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
