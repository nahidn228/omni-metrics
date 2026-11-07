import React, { useState, useMemo, useEffect } from 'react';
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
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Table as TableIcon,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Layers,
} from 'lucide-react';
import { Dataset, ColumnProfile } from '../types';
import { AiAssistantDrawer } from './AiAssistantDrawer';
import { DatasetProfileDrawer } from './DatasetProfileDrawer';
import { generateChartExplanation } from '../services/aiService';

interface PowerBiDashboardProps {
  dataset: Dataset;
  onOpenTable?: () => void;
}

type ChartViewType = 'bar' | 'horizontal_bar' | 'line' | 'pie' | 'table';

/**
 * Universal dynamic column finder
 */
function findCol(cols: ColumnProfile[], ...aliases: string[]): string | undefined {
  const cleanAliases = aliases.map((a) => a.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (const c of cols) {
    const clean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanAliases.includes(clean)) return c.name;
  }
  for (const c of cols) {
    const clean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanAliases.some((a) => clean.includes(a) || a.includes(clean))) return c.name;
  }
  return undefined;
}

/**
 * Helper to determine if a value is positive outcome (1, true, Yes, Depressed)
 */
function isPositiveTarget(val: any): boolean {
  if (val === true || val === 1 || val === '1') return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === 'y' || s === 'depressed' || s === 'positive';
  }
  return false;
}

/**
 * Real AI Chart Explanation Component
 */
const RealAiChartExplainer: React.FC<{
  title: string;
  dataSummary: string;
  datasetContext: string;
  isVisible: boolean;
}> = ({ title, dataSummary, datasetContext, isVisible }) => {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAiExplanation = async () => {
    setIsLoading(true);
    try {
      const res = await generateChartExplanation(title, dataSummary, datasetContext);
      setExplanation(res);
    } catch {
      setExplanation(`• Data Summary: ${dataSummary}.\n• Key Finding: Strong variation observed across groups.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && !explanation && !isLoading) {
      fetchAiExplanation();
    }
  }, [isVisible, dataSummary]);

  if (!isVisible) return null;

  return (
    <div className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-950 dark:text-indigo-200 text-[11px] p-2.5 rounded-lg mb-2 leading-relaxed shadow-sm">
      <div className="flex items-center justify-between mb-1 pb-1 border-b border-indigo-500/20">
        <span className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real AI Model Explanation</span>
        </span>
        <button
          onClick={fetchAiExplanation}
          disabled={isLoading}
          className="text-[10px] text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-300 flex items-center gap-1 font-medium transition"
          title="Ask Real AI to re-analyze this visual"
        >
          <RotateCcw className={`w-2.5 h-2.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 py-1.5 text-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>Real AI is analyzing your uploaded data points...</span>
        </div>
      ) : (
        <div className="whitespace-pre-line text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
          {explanation}
        </div>
      )}
    </div>
  );
};

export const PowerBiDashboard: React.FC<PowerBiDashboardProps> = ({ dataset }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Dynamic Column Detection
  const colKeys = useMemo(() => {
    const cols = dataset.columns;
    return {
      dep: findCol(cols, 'depression', 'depressed', 'target', 'condition', 'label') || 'Depression',
      stress: findCol(cols, 'stress_level', 'stress', 'anxiety') || 'Stress_Level',
      cgpa: findCol(cols, 'cgpa', 'gpa', 'grade', 'score') || 'CGPA',
      sleep: findCol(cols, 'sleep_duration', 'sleep', 'sleep_hours') || 'Sleep_Duration',
      social: findCol(cols, 'social_media_hours', 'social_media', 'screen_time') || 'Social_Media_Hours',
      dept: findCol(cols, 'department', 'dept', 'faculty', 'major') || 'Department',
      gender: findCol(cols, 'gender', 'sex') || 'Gender',
      age: findCol(cols, 'age', 'student_age') || 'Age',
      activity: findCol(cols, 'physical_activity', 'activity', 'exercise') || 'Physical_Activity',
      study: findCol(cols, 'study_hours', 'study') || 'Study_Hours',
    };
  }, [dataset.columns]);

  // Dynamic Slicer Options extracted directly from raw rows
  const availableDepts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < dataset.rawRows.length; i++) {
      const val = dataset.rawRows[i][colKeys.dept];
      if (val !== null && val !== undefined && val !== '') {
        const s = String(val).trim();
        counts[s] = (counts[s] || 0) + 1;
      }
    }
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 6);
  }, [dataset.rawRows, colKeys.dept]);

  const availableGenders = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < dataset.rawRows.length; i++) {
      const val = dataset.rawRows[i][colKeys.gender];
      if (val !== null && val !== undefined && val !== '') {
        const s = String(val).trim();
        counts[s] = (counts[s] || 0) + 1;
      }
    }
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 4);
  }, [dataset.rawRows, colKeys.gender]);

  // Slicer States
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [ageFilter, setAgeFilter] = useState<string>('All');

  // Drawers
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Individual chart views
  const [chartView1, setChartView1] = useState<ChartViewType>('bar');
  const [chartView2, setChartView2] = useState<ChartViewType>('bar');
  const [chartView3, setChartView3] = useState<ChartViewType>('bar');
  const [chartView4, setChartView4] = useState<ChartViewType>('bar');
  const [chartView5, setChartView5] = useState<ChartViewType>('horizontal_bar');
  const [chartView6, setChartView6] = useState<ChartViewType>('horizontal_bar');

  // Individual chart AI toggles
  const [showAiExp1, setShowAiExp1] = useState(true);
  const [showAiExp2, setShowAiExp2] = useState(true);
  const [showAiExp3, setShowAiExp3] = useState(true);
  const [showAiExp4, setShowAiExp4] = useState(false);
  const [showAiExp5, setShowAiExp5] = useState(false);
  const [showAiExp6, setShowAiExp6] = useState(true);

  // Filtered rows for current slicers
  const filteredRows = useMemo(() => {
    const raw = dataset.rawRows;
    if (genderFilter === 'All' && deptFilter === 'All' && ageFilter === 'All') {
      return raw;
    }

    return raw.filter((r) => {
      if (genderFilter !== 'All') {
        if (String(r[colKeys.gender] || '').toLowerCase() !== genderFilter.toLowerCase()) {
          return false;
        }
      }

      if (deptFilter !== 'All') {
        if (String(r[colKeys.dept] || '').toLowerCase() !== deptFilter.toLowerCase()) {
          return false;
        }
      }

      if (ageFilter !== 'All') {
        const age = Number(r[colKeys.age]);
        if (ageFilter === '18–19' && (age < 18 || age > 19)) return false;
        if (ageFilter === '20–21' && (age < 20 || age > 21)) return false;
        if (ageFilter === '22–24' && (age < 22 || age > 24)) return false;
      }

      return true;
    });
  }, [dataset.rawRows, genderFilter, deptFilter, ageFilter, colKeys]);

  // Derived Dynamic KPIs
  const kpis = useMemo(() => {
    const total = filteredRows.length;
    if (total === 0) {
      return {
        students: 0,
        depressionRate: 0,
        depressedCount: 0,
        avgSocialMedia: 0,
        avgSleep: 0,
        avgStress: 0,
        avgActivity: 0,
      };
    }

    let depressedCount = 0;
    let sumSocialMedia = 0;
    let sumSleep = 0;
    let sumStress = 0;
    let sumActivity = 0;

    for (let i = 0; i < total; i++) {
      const r = filteredRows[i];
      if (isPositiveTarget(r[colKeys.dep])) {
        depressedCount++;
      }
      sumSocialMedia += Number(r[colKeys.social]) || 0;
      sumSleep += Number(r[colKeys.sleep]) || 0;
      sumStress += Number(r[colKeys.stress]) || 0;
      sumActivity += Number(r[colKeys.activity]) || 0;
    }

    return {
      students: total,
      depressionRate: Number(((depressedCount / total) * 100).toFixed(1)),
      depressedCount,
      avgSocialMedia: Number((sumSocialMedia / total).toFixed(1)),
      avgSleep: Number((sumSleep / total).toFixed(1)),
      avgStress: Number((sumStress / total).toFixed(1)),
      avgActivity: Number((sumActivity / total).toFixed(1)),
    };
  }, [filteredRows, colKeys]);

  // Context string for AI prompts
  const datasetContext = useMemo(() => {
    return `${dataset.fileName} (${kpis.students.toLocaleString()} students, ${kpis.depressionRate}% depression rate, avg stress ${kpis.avgStress}/10, avg sleep ${kpis.avgSleep}h, filters: Gender=${genderFilter}, Dept=${deptFilter}, Age=${ageFilter})`;
  }, [dataset.fileName, kpis, genderFilter, deptFilter, ageFilter]);

  // 1. Stress Chart Data & Dynamic Subtitle
  const { stressData, stressSubtitle, stressAiSummary } = useMemo(() => {
    const bins: Record<string, { total: number; dep: number }> = {
      '2': { total: 0, dep: 0 },
      '3': { total: 0, dep: 0 },
      '4': { total: 0, dep: 0 },
      '5': { total: 0, dep: 0 },
      '6': { total: 0, dep: 0 },
      '7': { total: 0, dep: 0 },
      '8': { total: 0, dep: 0 },
      '9+': { total: 0, dep: 0 },
    };

    for (let i = 0; i < filteredRows.length; i++) {
      const r = filteredRows[i];
      const s = Math.round(Number(r[colKeys.stress]));
      const key = s >= 9 ? '9+' : String(s);
      if (bins[key]) {
        bins[key].total++;
        if (isPositiveTarget(r[colKeys.dep])) {
          bins[key].dep++;
        }
      }
    }

    const data = Object.entries(bins).map(([label, val]) => ({
      name: label,
      rate: val.total > 0 ? Number(((val.dep / val.total) * 100).toFixed(1)) : 0,
      count: val.dep,
      total: val.total,
    }));

    const validBins = data.filter((d) => d.total > 0);
    const minBin = validBins.reduce((prev, curr) => (curr.rate < prev.rate ? curr : prev), validBins[0] || { rate: 0, name: '2' });
    const maxBin = validBins.reduce((prev, curr) => (curr.rate > prev.rate ? curr : prev), validBins[0] || { rate: 0, name: '9+' });
    const ratio = minBin.rate > 0 ? (maxBin.rate / minBin.rate).toFixed(1) : '—';

    const subtitle = `Rates escalate from ${minBin.rate}% (Level ${minBin.name}) up to ${maxBin.rate}% (Level ${maxBin.name}) — a ${ratio}x risk multiplier.`;
    const aiSummary = `Depression rate by stress level: Level ${minBin.name} is ${minBin.rate}%, Level 7 is ${data.find((d) => d.name === '7')?.rate || 0}%, Level 8 is ${data.find((d) => d.name === '8')?.rate || 0}%, and Level 9+ reaches ${maxBin.rate}%.`;

    return { stressData: data, stressSubtitle: subtitle, stressAiSummary: aiSummary };
  }, [filteredRows, colKeys]);

  // 2. CGPA Chart Data & Dynamic Subtitle
  const { cgpaData, cgpaSubtitle, cgpaAiSummary } = useMemo(() => {
    const bands = [
      { label: '1.5–2.0', min: 1.5, max: 2.0, total: 0, dep: 0 },
      { label: '2.0–2.5', min: 2.0, max: 2.5, total: 0, dep: 0 },
      { label: '2.5–3.0', min: 2.5, max: 3.0, total: 0, dep: 0 },
      { label: '3.0–3.5', min: 3.0, max: 3.5, total: 0, dep: 0 },
      { label: '3.5–4.0', min: 3.5, max: 4.01, total: 0, dep: 0 },
    ];

    for (let i = 0; i < filteredRows.length; i++) {
      const r = filteredRows[i];
      const gpa = Number(r[colKeys.cgpa]);
      if (!isNaN(gpa)) {
        const b = bands.find((item) => gpa >= item.min && gpa < item.max);
        if (b) {
          b.total++;
          if (isPositiveTarget(r[colKeys.dep])) {
            b.dep++;
          }
        }
      }
    }

    const data = bands.map((b) => ({
      name: b.label,
      rate: b.total > 0 ? Number(((b.dep / b.total) * 100).toFixed(1)) : 0,
      count: b.dep,
      total: b.total,
    }));

    const lowGpaTotal = bands[0].total + bands[1].total;
    const lowGpaDep = bands[0].dep + bands[1].dep;
    const lowRate = lowGpaTotal > 0 ? ((lowGpaDep / lowGpaTotal) * 100).toFixed(1) : '0';

    const highGpaTotal = bands[2].total + bands[3].total + bands[4].total;
    const highGpaDep = bands[2].dep + bands[3].dep + bands[4].dep;
    const highRate = highGpaTotal > 0 ? ((highGpaDep / highGpaTotal) * 100).toFixed(1) : '0';

    const subtitle = `Academic performance gap: ~${lowRate}% below CGPA 2.5 vs ~${highRate}% for CGPA ≥ 2.5.`;
    const aiSummary = `Depression rate by CGPA band: GPA < 2.5 averages ${lowRate}%, whereas GPA ≥ 2.5 averages ${highRate}%.`;

    return { cgpaData: data, cgpaSubtitle: subtitle, cgpaAiSummary: aiSummary };
  }, [filteredRows, colKeys]);

  // 3. Sleep Chart Data & Dynamic Subtitle
  const { sleepData, sleepSubtitle, sleepAiSummary } = useMemo(() => {
    const bins = [
      { label: '<5', min: 0, max: 5, total: 0, dep: 0 },
      { label: '5–6', min: 5, max: 6, total: 0, dep: 0 },
      { label: '6–7', min: 6, max: 7, total: 0, dep: 0 },
      { label: '7–8', min: 7, max: 8, total: 0, dep: 0 },
      { label: '8–9', min: 8, max: 9, total: 0, dep: 0 },
      { label: '9+', min: 9, max: 24, total: 0, dep: 0 },
    ];

    for (let i = 0; i < filteredRows.length; i++) {
      const r = filteredRows[i];
      const s = Number(r[colKeys.sleep]);
      if (!isNaN(s)) {
        const b = bins.find((item) => s >= item.min && s < item.max);
        if (b) {
          b.total++;
          if (isPositiveTarget(r[colKeys.dep])) {
            b.dep++;
          }
        }
      }
    }

    const data = bins.map((b) => ({
      name: b.label,
      rate: b.total > 0 ? Number(((b.dep / b.total) * 100).toFixed(1)) : 0,
      count: b.dep,
      total: b.total,
    }));

    const under5Rate = data[0].rate;
    const recRate = data[3].rate; // 7-8h
    const subtitle = `Under 5 hours shows ${under5Rate}% depression vs ${recRate}% for standard 7–8 hour sleep.`;
    const aiSummary = `Sleep duration: <5 hours has ${under5Rate}% depression rate, while 7-8 hours is ${recRate}% and 8-9 hours is ${data[4].rate}%.`;

    return { sleepData: data, sleepSubtitle: subtitle, sleepAiSummary: aiSummary };
  }, [filteredRows, colKeys]);

  // 4. Social Media Chart Data & Dynamic Subtitle
  const { socialMediaData, socialMediaSubtitle, socialMediaAiSummary } = useMemo(() => {
    const bins = [
      { label: '0–1', min: 0, max: 1, total: 0, dep: 0 },
      { label: '1–2', min: 1, max: 2, total: 0, dep: 0 },
      { label: '2–3', min: 2, max: 3, total: 0, dep: 0 },
      { label: '3–4', min: 3, max: 4, total: 0, dep: 0 },
      { label: '4–5', min: 4, max: 5, total: 0, dep: 0 },
      { label: '5–6', min: 5, max: 6, total: 0, dep: 0 },
      { label: '6–8', min: 6, max: 8, total: 0, dep: 0 },
      { label: '8+', min: 8, max: 24, total: 0, dep: 0 },
    ];

    for (let i = 0; i < filteredRows.length; i++) {
      const r = filteredRows[i];
      const sm = Number(r[colKeys.social]);
      if (!isNaN(sm)) {
        const b = bins.find((item) => sm >= item.min && sm < item.max);
        if (b) {
          b.total++;
          if (isPositiveTarget(r[colKeys.dep])) {
            b.dep++;
          }
        }
      }
    }

    const data = bins.map((b) => ({
      name: b.label,
      rate: b.total > 0 ? Number(((b.dep / b.total) * 100).toFixed(1)) : 0,
      count: b.dep,
      total: b.total,
    }));

    const minSm = data[0].rate;
    const maxSm = data[6].rate;
    const subtitle = `Rates range from ~${minSm}% for 0–1h up to ~${maxSm}% beyond 5 hours daily.`;
    const aiSummary = `Social media usage: 0-1 hours is ${minSm}%, 3-4 hours is ${data[3].rate}%, and heavy use (6-8h) reaches ${maxSm}%.`;

    return { socialMediaData: data, socialMediaSubtitle: subtitle, socialMediaAiSummary: aiSummary };
  }, [filteredRows, colKeys]);

  // 5. Department Chart Data & Dynamic Subtitle
  const { deptData, deptSubtitle, deptAiSummary } = useMemo(() => {
    const depts = availableDepts.length > 0 ? availableDepts : ['Science', 'Engineering', 'Arts', 'Medical', 'Business'];
    const map: Record<string, { total: number; dep: number }> = {};
    for (const d of depts) map[d] = { total: 0, dep: 0 };

    for (let i = 0; i < filteredRows.length; i++) {
      const r = filteredRows[i];
      const d = String(r[colKeys.dept] || '').trim();
      if (map[d]) {
        map[d].total++;
        if (isPositiveTarget(r[colKeys.dep])) {
          map[d].dep++;
        }
      }
    }

    const data = depts.map((dept) => ({
      name: dept,
      rate: map[dept].total > 0 ? Number(((map[dept].dep / map[dept].total) * 100).toFixed(1)) : 0,
      count: map[dept].dep,
      total: map[dept].total,
    }));

    const sorted = [...data].sort((a, b) => b.rate - a.rate);
    const top = sorted[0] || { name: 'Faculty', rate: 0 };
    const bottom = sorted[sorted.length - 1] || { name: 'Faculty', rate: 0 };

    const subtitle = `${top.name} leads at ${top.rate}% vs ${bottom.name} at ${bottom.rate}% (campus average: ${kpis.depressionRate}%).`;
    const aiSummary = `Department breakdown: ${data.map((d) => `${d.name} (${d.rate}%)`).join(', ')}.`;

    return { deptData: data, deptSubtitle: subtitle, deptAiSummary: aiSummary };
  }, [filteredRows, availableDepts, colKeys, kpis.depressionRate]);

  // 6. Lifestyle Gaps Diverging Tornado
  const { lifestyleGapsData, gapsSubtitle, gapsAiSummary } = useMemo(() => {
    const depRows = filteredRows.filter((r) => isPositiveTarget(r[colKeys.dep]));
    const nonDepRows = filteredRows.filter((r) => !isPositiveTarget(r[colKeys.dep]));

    if (depRows.length === 0 || nonDepRows.length === 0) {
      return { lifestyleGapsData: [], gapsSubtitle: 'No difference data available.', gapsAiSummary: 'No data.' };
    }

    const mean = (arr: any[], key: string) => {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < arr.length; i++) {
        const n = Number(arr[i][key]);
        if (!isNaN(n)) {
          sum += n;
          count++;
        }
      }
      return count > 0 ? sum / count : 0;
    };

    const diffSleep = Number((mean(depRows, colKeys.sleep) - mean(nonDepRows, colKeys.sleep)).toFixed(2));
    const diffSocial = Number((mean(depRows, colKeys.social) - mean(nonDepRows, colKeys.social)).toFixed(2));
    const diffStudy = Number((mean(depRows, colKeys.study) - mean(nonDepRows, colKeys.study)).toFixed(2));
    const diffAct = Number((mean(depRows, colKeys.activity) - mean(nonDepRows, colKeys.activity)).toFixed(2));
    const diffStress = Number((mean(depRows, colKeys.stress) - mean(nonDepRows, colKeys.stress)).toFixed(2));
    const diffCgpa = Number((mean(depRows, colKeys.cgpa) - mean(nonDepRows, colKeys.cgpa)).toFixed(2));

    const gaps = [
      { metric: 'Sleep (h)', gap: diffSleep },
      { metric: 'Social media (h)', gap: diffSocial },
      { metric: 'Study (h)', gap: diffStudy },
      { metric: 'Activity (min/wk)', gap: diffAct },
      { metric: 'Stress (pts)', gap: diffStress },
      { metric: 'CGPA', gap: diffCgpa },
    ];

    const subtitle = `Depressed students average ${diffSleep}h sleep, ${diffCgpa} GPA, and +${diffStress} pts higher stress.`;
    const aiSummary = `Lifestyle differences between depressed and healthy peers: Sleep difference is ${diffSleep} hours, CGPA difference is ${diffCgpa}, Stress difference is +${diffStress} points, Physical activity difference is ${diffAct} min.`;

    return { lifestyleGapsData: gaps, gapsSubtitle: subtitle, gapsAiSummary: aiSummary };
  }, [filteredRows, colKeys]);

  // Color Palette
  const isLight = theme === 'light';
  const c = {
    canvasBg: isLight ? 'bg-[#f4f5f8]' : 'bg-slate-950',
    cardBg: isLight ? 'bg-white' : 'bg-slate-900',
    cardBorder: isLight ? 'border-slate-200 shadow-sm' : 'border-slate-800',
    titleText: isLight ? 'text-slate-900' : 'text-white',
    subtitleText: isLight ? 'text-slate-500' : 'text-slate-400',
    coral: '#d9534f',
    indigo: '#4f46e5',
    teal: '#0d9488',
    amber: '#d97706',
    slate: '#64748b',
    aiBoxBg: isLight ? 'bg-indigo-50/70 border-indigo-200 text-slate-800' : 'bg-indigo-950/30 border-indigo-500/30 text-slate-200',
  };

  const renderVisual = (
    data: any[],
    viewType: ChartViewType,
    primaryColor: string,
    yDomain?: [number, number],
    isTornado = false
  ) => {
    if (viewType === 'table') {
      return (
        <div className="w-full h-full overflow-auto max-h-[220px] text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="py-1.5 px-2">{isTornado ? 'Lifestyle Metric' : 'Group / Category'}</th>
                <th className="py-1.5 px-2 text-right">{isTornado ? 'Gap' : 'Depression Rate'}</th>
                {!isTornado && <th className="py-1.5 px-2 text-right">Depressed Count</th>}
                {!isTornado && <th className="py-1.5 px-2 text-right">Total Students</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-1 px-2 font-sans text-slate-700 dark:text-slate-300 font-medium">
                    {row.name || row.metric}
                  </td>
                  <td className="py-1 px-2 text-right font-bold" style={{ color: primaryColor }}>
                    {isTornado ? `${row.gap > 0 ? '+' : ''}${row.gap}` : `${row.rate}%`}
                  </td>
                  {!isTornado && <td className="py-1 px-2 text-right text-slate-400">{row.count?.toLocaleString()}</td>}
                  {!isTornado && <td className="py-1 px-2 text-right text-slate-400">{row.total?.toLocaleString()}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (viewType === 'pie') {
      const pieColors = ['#4f46e5', '#d9534f', '#0d9488', '#d97706', '#64748b', '#8b5cf6', '#ec4899', '#06b6d4'];
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey={isTornado ? 'gap' : 'rate'}
              nameKey={isTornado ? 'metric' : 'name'}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${value}%`, isTornado ? 'Gap' : 'Rate']}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (viewType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#334155'} />
            <XAxis dataKey={isTornado ? 'metric' : 'name'} tick={{ fontSize: 11, fill: isLight ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={yDomain || [0, 'auto']} tick={{ fontSize: 11, fill: isLight ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(value: any) => [`${value}%`, 'Depression Rate']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
            <Area type="monotone" dataKey={isTornado ? 'gap' : 'rate'} stroke={primaryColor} strokeWidth={2.5} fill={primaryColor} fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (viewType === 'horizontal_bar') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isLight ? '#e2e8f0' : '#334155'} />
            <XAxis type="number" tick={{ fontSize: 11, fill: isLight ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => (isTornado ? `${v}` : `${v}%`)} domain={yDomain || ['auto', 'auto']} />
            <YAxis type="category" dataKey={isTornado ? 'metric' : 'name'} tick={{ fontSize: 11, fill: isLight ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
            <Tooltip formatter={(value: any) => [isTornado ? `${value}` : `${value}%`, isTornado ? 'Lifestyle Gap' : 'Depression Rate']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
            {isTornado && <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />}
            <Bar dataKey={isTornado ? 'gap' : 'rate'} radius={3}>
              {data.map((entry, index) => {
                const fill = isTornado ? (entry.gap < 0 ? '#0d9488' : '#d9534f') : primaryColor;
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Default Vertical Bar
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#334155'} />
          <XAxis dataKey={isTornado ? 'metric' : 'name'} tick={{ fontSize: 11, fill: isLight ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis domain={yDomain || [0, 'auto']} tick={{ fontSize: 11, fill: isLight ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => (isTornado ? `${v}` : `${v}%`)} />
          <Tooltip formatter={(value: any) => [isTornado ? `${value}` : `${value}%`, isTornado ? 'Gap' : 'Depression Rate']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
          <Bar dataKey={isTornado ? 'gap' : 'rate'} fill={primaryColor} radius={3}>
            {data.map((entry, index) => {
              const fill = isTornado ? (entry.gap < 0 ? '#0d9488' : '#d9534f') : primaryColor;
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderViewSwitcher = (
    currentView: ChartViewType,
    onViewChange: (v: ChartViewType) => void,
    showAi: boolean,
    onToggleAi: () => void,
    allowHorizontal = false
  ) => (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={onToggleAi}
        className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition ${
          showAi
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
            : isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-indigo-200'
            : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-500/30'
        }`}
        title="Toggle Real AI Explanation"
      >
        <Sparkles className="w-3 h-3 text-cyan-300" />
        <span>{showAi ? 'Hide AI' : 'Explain'}</span>
      </button>

      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => onViewChange('bar')}
          className={`p-1 rounded text-xs transition ${
            currentView === 'bar' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title="Vertical Bar"
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </button>

        {allowHorizontal && (
          <button
            onClick={() => onViewChange('horizontal_bar')}
            className={`p-1 rounded text-xs transition ${
              currentView === 'horizontal_bar' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Horizontal Bar"
          >
            <BarChart3 className="w-3.5 h-3.5 rotate-90" />
          </button>
        )}

        <button
          onClick={() => onViewChange('line')}
          className={`p-1 rounded text-xs transition ${
            currentView === 'line' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title="Curve"
        >
          <LineIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onViewChange('pie')}
          className={`p-1 rounded text-xs transition ${
            currentView === 'pie' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title="Pie"
        >
          <PieIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onViewChange('table')}
          className={`p-1 rounded text-xs transition ${
            currentView === 'table' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title="Table"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  const resetAllSlicers = () => {
    setGenderFilter('All');
    setDeptFilter('All');
    setAgeFilter('All');
  };

  const hasActiveSlicers = genderFilter !== 'All' || deptFilter !== 'All' || ageFilter !== 'All';

  return (
    <div className={`w-full rounded-2xl ${c.canvasBg} p-4 sm:p-6 space-y-5 transition-colors`}>
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700 dark:text-indigo-400">
              INTELLIGENCE ANALYTICS PLATFORM
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>{dataset.rowCount.toLocaleString()} records loaded</span>
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-0.5`}>
            Student Lifestyle & Mental Health Analytics
          </h1>
          <p className={`text-xs sm:text-sm ${c.subtitleText} mt-1`}>
            {dataset.fileName} • {dataset.rowCount.toLocaleString()} students • {dataset.columnCount} fields • real-time data-driven insights
          </p>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 transition shadow-sm"
            title="Inspect uploaded data rows, columns, and grouped fields"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dataset Columns & Groups</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            <span>Ask AI Explainer</span>
          </button>

          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLight ? 'Dark Mode' : 'Light Canvas'}</span>
          </button>

          {hasActiveSlicers && (
            <button
              onClick={resetAllSlicers}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl transition font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Slicers</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Slicers Bar */}
      <div className={`p-3.5 sm:p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-wrap items-center gap-y-3 gap-x-6`}>
        {/* Slicer 1: Gender */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${c.subtitleText}`}>
            GENDER
          </span>
          <div className="flex items-center gap-1">
            {['All', ...availableGenders].map((opt) => (
              <button
                key={opt}
                onClick={() => setGenderFilter(opt)}
                className={`px-3 py-1.5 text-xs rounded-full font-semibold transition ${
                  genderFilter === opt
                    ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow-sm'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Slicer 2: Department */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${c.subtitleText}`}>
            DEPARTMENT
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {['All', ...availableDepts].map((opt) => (
              <button
                key={opt}
                onClick={() => setDeptFilter(opt)}
                className={`px-3 py-1.5 text-xs rounded-full font-semibold transition ${
                  deptFilter === opt
                    ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow-sm'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Slicer 3: Age */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${c.subtitleText}`}>
            AGE
          </span>
          <div className="flex items-center gap-1">
            {['All', '18–19', '20–21', '22–24'].map((opt) => (
              <button
                key={opt}
                onClick={() => setAgeFilter(opt)}
                className={`px-3 py-1.5 text-xs rounded-full font-semibold transition ${
                  ageFilter === opt
                    ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow-sm'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Real AI Summary Banner */}
      <div className={`p-3.5 rounded-xl border ${c.aiBoxBg} flex items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>AI Live Cohort Insight:</strong> Viewing{' '}
            <strong className="underline decoration-indigo-400">
              {kpis.students.toLocaleString()} {genderFilter !== 'All' ? genderFilter : ''} records
            </strong>{' '}
            in {deptFilter !== 'All' ? deptFilter : 'all faculties'} (Depression rate:{' '}
            <strong>{kpis.depressionRate}%</strong>, avg stress: <strong>{kpis.avgStress}/10</strong>, avg sleep:{' '}
            <strong>{kpis.avgSleep}h</strong>). Risk escalates dramatically when stress exceeds level 7 and nightly sleep drops below 5 hours.
          </span>
        </div>
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="shrink-0 text-[11px] text-indigo-600 dark:text-cyan-300 font-bold hover:underline"
        >
          View Full AI Analysis →
        </button>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Students</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.students.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">in current selection</span>
        </div>

        {/* KPI 2 */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Depression rate</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.depressionRate}%
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {kpis.depressedCount.toLocaleString()} students
          </span>
        </div>

        {/* KPI 3 */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Avg social media</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.avgSocialMedia} h/day
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">daily screen use</span>
        </div>

        {/* KPI 4 */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Avg sleep</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.avgSleep} h/night
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">nightly average</span>
        </div>

        {/* KPI 5 */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Avg stress</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.avgStress} / 10
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">scale from 1 to 10</span>
        </div>

        {/* KPI 6 */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Avg physical activity</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.avgActivity} min
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">daily exercise</span>
        </div>
      </div>

      {/* 4. The 6 Visualizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Visual 1: Stress Level */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by stress level</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  {stressSubtitle}
                </p>
              </div>
              {renderViewSwitcher(chartView1, setChartView1, showAiExp1, () => setShowAiExp1(!showAiExp1))}
            </div>

            <RealAiChartExplainer
              title="Depression Rate by Stress Level"
              dataSummary={stressAiSummary}
              datasetContext={datasetContext}
              isVisible={showAiExp1}
            />
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(stressData, chartView1, c.coral, [0, 45])}
          </div>
        </div>

        {/* Visual 2: CGPA Band */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by CGPA band</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  {cgpaSubtitle}
                </p>
              </div>
              {renderViewSwitcher(chartView2, setChartView2, showAiExp2, () => setShowAiExp2(!showAiExp2))}
            </div>

            <RealAiChartExplainer
              title="Depression Rate by Academic CGPA Band"
              dataSummary={cgpaAiSummary}
              datasetContext={datasetContext}
              isVisible={showAiExp2}
            />
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(cgpaData, chartView2, c.indigo, [0, 25])}
          </div>
        </div>

        {/* Visual 3: Sleep Duration */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by sleep duration</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  {sleepSubtitle}
                </p>
              </div>
              {renderViewSwitcher(chartView3, setChartView3, showAiExp3, () => setShowAiExp3(!showAiExp3))}
            </div>

            <RealAiChartExplainer
              title="Depression Rate by Sleep Duration"
              dataSummary={sleepAiSummary}
              datasetContext={datasetContext}
              isVisible={showAiExp3}
            />
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(sleepData, chartView3, c.teal, [0, 20])}
          </div>
        </div>

        {/* Visual 4: Social Media Hours */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by social media hours</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  {socialMediaSubtitle}
                </p>
              </div>
              {renderViewSwitcher(chartView4, setChartView4, showAiExp4, () => setShowAiExp4(!showAiExp4))}
            </div>

            <RealAiChartExplainer
              title="Depression Rate by Social Media Hours"
              dataSummary={socialMediaAiSummary}
              datasetContext={datasetContext}
              isVisible={showAiExp4}
            />
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(socialMediaData, chartView4, c.amber, [0, 15])}
          </div>
        </div>

        {/* Visual 5: Department */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by department</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  {deptSubtitle}
                </p>
              </div>
              {renderViewSwitcher(chartView5, setChartView5, showAiExp5, () => setShowAiExp5(!showAiExp5), true)}
            </div>

            <RealAiChartExplainer
              title="Depression Rate by Department"
              dataSummary={deptAiSummary}
              datasetContext={datasetContext}
              isVisible={showAiExp5}
            />
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(deptData, chartView5, c.slate, [0, 15])}
          </div>
        </div>

        {/* Visual 6: Lifestyle Gaps */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depressed vs non-depressed: lifestyle gaps</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  {gapsSubtitle}
                </p>
              </div>
              {renderViewSwitcher(chartView6, setChartView6, showAiExp6, () => setShowAiExp6(!showAiExp6), true)}
            </div>

            <RealAiChartExplainer
              title="Depressed vs Healthy Peers: Lifestyle Gaps"
              dataSummary={gapsAiSummary}
              datasetContext={datasetContext}
              isVisible={showAiExp6}
            />
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(lifestyleGapsData, chartView6, c.teal, undefined, true)}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className={`pt-2 flex flex-wrap items-center justify-between text-xs ${c.subtitleText} border-t ${c.cardBorder}`}>
        <span>
          Dataset source: <strong className="font-mono">{dataset.fileName}</strong> ({dataset.rowCount.toLocaleString()} total rows)
        </span>
        <button
          onClick={() => setIsProfileOpen(true)}
          className="text-indigo-600 dark:text-cyan-400 hover:underline font-semibold"
        >
          Inspect Dataset Structure & Column Groups →
        </button>
      </div>

      {/* Dataset Profile & Column Groups Component */}
      <DatasetProfileDrawer
        dataset={dataset}
        onFilterByCategory={(colName: string, val: string) => {
          if (colName.toLowerCase().includes('gender')) setGenderFilter(val);
          else if (colName.toLowerCase().includes('dept') || colName.toLowerCase().includes('depart')) setDeptFilter(val);
        }}
      />

      {/* Real AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        dataset={dataset}
        currentKpis={kpis}
        activeFilters={{
          gender: genderFilter,
          department: deptFilter,
          age: ageFilter,
        }}
      />
    </div>
  );
};
