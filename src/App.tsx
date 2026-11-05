import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { InsightsPanel } from './components/InsightsPanel';
import { FilterBar } from './components/FilterBar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ChartBuilder } from './components/ChartBuilder';
import { StatisticsView } from './components/StatisticsView';
import { DataTableView } from './components/DataTableView';
import { FileUploadModal } from './components/FileUploadModal';
import { StoryMode } from './components/StoryMode';
import { RiskSimulator } from './components/RiskSimulator';
import { AssessmentGuideView } from './components/AssessmentGuideView';
import { Dataset, FilterState, ChartConfig, AppTab } from './types';
import { analyzeDataset, generateRecommendedCharts } from './utils/analyzer';
import { applyFilters } from './utils/dataTransforms';
import { parseCSVUrl, ParseResult } from './utils/fileParser';
import {
  Upload,
  Sparkles,
  Zap,
  BarChart3,
  Cpu,
  Loader2,
  BookOpen,
} from 'lucide-react';

export function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('story');
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Global filters
  const [filters, setFilters] = useState<FilterState>({
    categoricals: {},
    numerics: {},
    searchQuery: '',
  });

  // Load sample dataset on mount if none loaded
  useEffect(() => {
    handleLoadSample(false);
  }, []);

  const handleDataLoaded = (result: ParseResult) => {
    const analyzed = analyzeDataset(
      result.fileName.replace(/\.[^/.]+$/, ''),
      result.fileName,
      result.fileSize,
      result.data,
      result.fields
    );

    setDataset(analyzed);
    setChartConfigs(generateRecommendedCharts(analyzed.columns, analyzed.correlations));
    setFilters({
      categoricals: {},
      numerics: {},
      searchQuery: '',
    });

    const isStudent = analyzed.columns.some((c) => c.name.toLowerCase() === 'depression');
    setActiveTab(isStudent ? 'story' : 'overview');
  };

  const handleLoadSample = async (openModalOnError = true) => {
    try {
      setIsLoadingSample(true);
      const result = await parseCSVUrl(
        '/student_lifestyle_100k.csv',
        'student_lifestyle_100k.csv'
      );
      handleDataLoaded(result);
    } catch (err) {
      console.warn('Auto sample load fallback:', err);
      if (openModalOnError) {
        setIsUploadOpen(true);
      }
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Filtered rows for all charts and data tables
  const filteredRows = useMemo(() => {
    if (!dataset) return [];
    return applyFilters(dataset.rawRows, filters);
  }, [dataset, filters]);

  const handleChartConfigChange = (index: number, newConfig: ChartConfig) => {
    setChartConfigs((prev) => {
      const next = [...prev];
      next[index] = newConfig;
      return next;
    });
  };

  const handleAddChart = (newConfig: ChartConfig) => {
    setChartConfigs((prev) => [newConfig, ...prev]);
    setActiveTab('overview');
  };

  const handleApplyFilterPreset = (presetFilters: Partial<FilterState>) => {
    setFilters((prev) => ({
      categoricals: presetFilters.categoricals ?? prev.categoricals,
      numerics: presetFilters.numerics ?? prev.numerics,
      searchQuery: presetFilters.searchQuery ?? prev.searchQuery,
    }));
  };

  const isStudentDataset = dataset?.columns.some((c) => c.name.toLowerCase() === 'depression');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        dataset={dataset}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={() => handleLoadSample(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoadingSample={isLoadingSample}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {isLoadingSample && !dataset ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Loading Dataset</h3>
              <p className="text-xs text-slate-400 mt-1">
                Parsing 100,000 records and running statistical inference...
              </p>
            </div>
          </div>
        ) : !dataset ? (
          /* Empty / Welcome State */
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CMP7227 Data Visualisation Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Student Well-Being & Lifestyle{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400">
                Data Storytelling
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Explore 100,000 university student records with interactive risk modeling, 12-minute presenter tools, and comprehensive statistical inference.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleLoadSample(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-xl shadow-indigo-600/30 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Launch Student Story Walkthrough (100k)</span>
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-6 py-3 rounded-xl transition text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Another Dataset</span>
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 text-left w-full">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">100,000 Verified Records</h4>
                <p className="text-xs text-slate-400">
                  Full dataset verification satisfying CMP7227 Assessment 1 criteria.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Interactive Storytelling</h4>
                <p className="text-xs text-slate-400">
                  Structured into 7 narrative acts with dual audience perspectives (Executive & Technical).
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Predictive Risk Simulator</h4>
                <p className="text-xs text-slate-400">
                  Live slider what-if calculations for student wellness and early warnings.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Dashboard Workspace */
          <div className="space-y-6">
            {/* Tab 1: Story Mode Walkthrough */}
            {activeTab === 'story' && isStudentDataset && (
              <StoryMode
                dataset={dataset}
                onNavigateTab={setActiveTab}
                onApplyFilterPreset={handleApplyFilterPreset}
              />
            )}

            {/* Tab 2: Interactive Risk Simulator */}
            {activeTab === 'simulator' && isStudentDataset && (
              <RiskSimulator dataset={dataset} onNavigateTab={setActiveTab} />
            )}

            {/* Tab 3: Assessment 1 Guide & Video Script */}
            {activeTab === 'guide' && (
              <AssessmentGuideView onNavigateTab={setActiveTab} />
            )}

            {/* Tab 4: Overview Dashboard (with KPIs, Insights, Filters, and Charts) */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Top KPI Metric Cards */}
                <KpiCards
                  totalRows={dataset.rowCount}
                  filteredRowsCount={filteredRows.length}
                  columns={dataset.columns}
                />

                {/* Global Slicers & Filter Bar */}
                <FilterBar
                  columns={dataset.columns}
                  filters={filters}
                  onFilterChange={setFilters}
                  filteredCount={filteredRows.length}
                  totalCount={dataset.rowCount}
                />

                {/* Smart Insights Drawer */}
                <InsightsPanel insights={dataset.insights} />

                {/* Main Visualizations Grid */}
                <OverviewDashboard
                  configs={chartConfigs}
                  rows={filteredRows}
                  columns={dataset.columns}
                  onConfigChange={handleChartConfigChange}
                  filters={filters}
                  onFilterChange={setFilters}
                  totalCount={dataset.rowCount}
                />
              </div>
            )}

            {/* Tab 5: Chart Studio (No-Code Builder) */}
            {activeTab === 'builder' && (
              <div className="space-y-6">
                <FilterBar
                  columns={dataset.columns}
                  filters={filters}
                  onFilterChange={setFilters}
                  filteredCount={filteredRows.length}
                  totalCount={dataset.rowCount}
                />
                <ChartBuilder
                  columns={dataset.columns}
                  rows={filteredRows}
                  onAddChart={handleAddChart}
                />
              </div>
            )}

            {/* Tab 6: Deep Statistics & Correlation Matrix */}
            {activeTab === 'statistics' && (
              <div className="space-y-6">
                <FilterBar
                  columns={dataset.columns}
                  filters={filters}
                  onFilterChange={setFilters}
                  filteredCount={filteredRows.length}
                  totalCount={dataset.rowCount}
                />
                <StatisticsView
                  columns={dataset.columns}
                  correlations={dataset.correlations}
                  rows={filteredRows}
                />
              </div>
            )}

            {/* Tab 7: Data Explorer Table */}
            {activeTab === 'table' && (
              <div className="space-y-6">
                <FilterBar
                  columns={dataset.columns}
                  filters={filters}
                  onFilterChange={setFilters}
                  filteredCount={filteredRows.length}
                  totalCount={dataset.rowCount}
                />
                <DataTableView
                  rows={filteredRows}
                  columns={dataset.columns}
                  fileName={dataset.name}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Universal Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />
    </div>
  );
}

export default App;
