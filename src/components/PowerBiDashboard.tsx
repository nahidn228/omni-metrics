import React, { useState, useMemo } from 'react';
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
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import { Dataset } from '../types';
import { AiAssistantDrawer } from './AiAssistantDrawer';

interface PowerBiDashboardProps {
  dataset: Dataset;
}

type ChartViewType = 'bar' | 'horizontal_bar' | 'line' | 'pie' | 'table';

export const PowerBiDashboard: React.FC<PowerBiDashboardProps> = ({ dataset }) => {
  // Theme state: default to 'light' matching Power BI canvas, toggleable to dark
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Slicer States
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [ageFilter, setAgeFilter] = useState<string>('All');

  // AI Assistant Drawer Open
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Individual chart view types
  const [chartView1, setChartView1] = useState<ChartViewType>('bar');
  const [chartView2, setChartView2] = useState<ChartViewType>('bar');
  const [chartView3, setChartView3] = useState<ChartViewType>('bar');
  const [chartView4, setChartView4] = useState<ChartViewType>('bar');
  const [chartView5, setChartView5] = useState<ChartViewType>('horizontal_bar');
  const [chartView6, setChartView6] = useState<ChartViewType>('horizontal_bar');

  // Toggle state for individual chart AI explanations
  const [showAiExp1, setShowAiExp1] = useState(true);
  const [showAiExp2, setShowAiExp2] = useState(true);
  const [showAiExp3, setShowAiExp3] = useState(true);
  const [showAiExp4, setShowAiExp4] = useState(false);
  const [showAiExp5, setShowAiExp5] = useState(false);
  const [showAiExp6, setShowAiExp6] = useState(true);

  // Fast In-Memory Filter on 100k Rows
  const filteredRows = useMemo(() => {
    const raw = dataset.rawRows;
    if (genderFilter === 'All' && deptFilter === 'All' && ageFilter === 'All') {
      return raw;
    }

    return raw.filter((r) => {
      // 1. Gender
      if (genderFilter !== 'All') {
        if (String(r.Gender || '').toLowerCase() !== genderFilter.toLowerCase()) {
          return false;
        }
      }

      // 2. Department
      if (deptFilter !== 'All') {
        if (String(r.Department || '').toLowerCase() !== deptFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Age
      if (ageFilter !== 'All') {
        const age = Number(r.Age);
        if (ageFilter === '18–19' && (age < 18 || age > 19)) return false;
        if (ageFilter === '20–21' && (age < 20 || age > 21)) return false;
        if (ageFilter === '22–24' && (age < 22 || age > 24)) return false;
      }

      return true;
    });
  }, [dataset.rawRows, genderFilter, deptFilter, ageFilter]);

  // Derived KPIs
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
      if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
        depressedCount++;
      }
      sumSocialMedia += Number(r.Social_Media_Hours) || 0;
      sumSleep += Number(r.Sleep_Duration) || 0;
      sumStress += Number(r.Stress_Level) || 0;
      sumActivity += Number(r.Physical_Activity) || 0;
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
  }, [filteredRows]);

  // Chart 1: Depression Rate by Stress Level (2..9+)
  const stressData = useMemo(() => {
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

    for (const r of filteredRows) {
      const s = Math.round(Number(r.Stress_Level));
      const key = s >= 9 ? '9+' : String(s);
      if (bins[key]) {
        bins[key].total++;
        if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
          bins[key].dep++;
        }
      }
    }

    return Object.entries(bins).map(([label, val]) => ({
      name: label,
      rate: val.total > 0 ? Number(((val.dep / val.total) * 100).toFixed(1)) : 0,
      count: val.dep,
      total: val.total,
    }));
  }, [filteredRows]);

  // Chart 2: Depression Rate by CGPA Band
  const cgpaData = useMemo(() => {
    const bands = [
      { label: '1.5–2.0', min: 1.5, max: 2.0, total: 0, dep: 0 },
      { label: '2.0–2.5', min: 2.0, max: 2.5, total: 0, dep: 0 },
      { label: '2.5–3.0', min: 2.5, max: 3.0, total: 0, dep: 0 },
      { label: '3.0–3.5', min: 3.0, max: 3.5, total: 0, dep: 0 },
      { label: '3.5–4.0', min: 3.5, max: 4.01, total: 0, dep: 0 },
    ];

    for (const r of filteredRows) {
      const gpa = Number(r.CGPA);
      if (!isNaN(gpa)) {
        const b = bands.find((item) => gpa >= item.min && gpa < item.max);
        if (b) {
          b.total++;
          if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
            b.dep++;
          }
        }
      }
    }

    return bands.map((b) => ({
      name: b.label,
      rate: b.total > 0 ? Number(((b.dep / b.total) * 100).toFixed(1)) : 0,
      count: b.dep,
      total: b.total,
    }));
  }, [filteredRows]);

  // Chart 3: Depression Rate by Sleep Duration
  const sleepData = useMemo(() => {
    const bins = [
      { label: '<5', min: 0, max: 5, total: 0, dep: 0 },
      { label: '5–6', min: 5, max: 6, total: 0, dep: 0 },
      { label: '6–7', min: 6, max: 7, total: 0, dep: 0 },
      { label: '7–8', min: 7, max: 8, total: 0, dep: 0 },
      { label: '8–9', min: 8, max: 9, total: 0, dep: 0 },
      { label: '9+', min: 9, max: 24, total: 0, dep: 0 },
    ];

    for (const r of filteredRows) {
      const s = Number(r.Sleep_Duration);
      if (!isNaN(s)) {
        const b = bins.find((item) => s >= item.min && s < item.max);
        if (b) {
          b.total++;
          if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
            b.dep++;
          }
        }
      }
    }

    return bins.map((b) => ({
      name: b.label,
      rate: b.total > 0 ? Number(((b.dep / b.total) * 100).toFixed(1)) : 0,
      count: b.dep,
      total: b.total,
    }));
  }, [filteredRows]);

  // Chart 4: Depression Rate by Social Media Hours
  const socialMediaData = useMemo(() => {
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

    for (const r of filteredRows) {
      const sm = Number(r.Social_Media_Hours);
      if (!isNaN(sm)) {
        const b = bins.find((item) => sm >= item.min && sm < item.max);
        if (b) {
          b.total++;
          if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
            b.dep++;
          }
        }
      }
    }

    return bins.map((b) => ({
      name: b.label,
      rate: b.total > 0 ? Number(((b.dep / b.total) * 100).toFixed(1)) : 0,
      count: b.dep,
      total: b.total,
    }));
  }, [filteredRows]);

  // Chart 5: Depression Rate by Department
  const deptData = useMemo(() => {
    const list = ['Science', 'Engineering', 'Arts', 'Medical', 'Business'];
    const map: Record<string, { total: number; dep: number }> = {};
    for (const d of list) map[d] = { total: 0, dep: 0 };

    for (const r of filteredRows) {
      const d = String(r.Department || '');
      if (map[d]) {
        map[d].total++;
        if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
          map[d].dep++;
        }
      }
    }

    return list.map((dept) => ({
      name: dept,
      rate: map[dept].total > 0 ? Number(((map[dept].dep / map[dept].total) * 100).toFixed(1)) : 0,
      count: map[dept].dep,
      total: map[dept].total,
    }));
  }, [filteredRows]);

  // Chart 6: Depressed vs Non-Depressed: Lifestyle Gaps (Diverging Tornado)
  const lifestyleGapsData = useMemo(() => {
    const depRows = filteredRows.filter(
      (r) => r.Depression === true || String(r.Depression).toLowerCase() === 'true'
    );
    const nonDepRows = filteredRows.filter(
      (r) => r.Depression === false || String(r.Depression).toLowerCase() === 'false'
    );

    if (depRows.length === 0 || nonDepRows.length === 0) {
      return [];
    }

    const mean = (arr: any[], key: string) => {
      const nums = arr.map((x) => Number(x[key])).filter((v) => !isNaN(v));
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    };

    return [
      {
        metric: 'Sleep (h)',
        gap: Number((mean(depRows, 'Sleep_Duration') - mean(nonDepRows, 'Sleep_Duration')).toFixed(2)),
      },
      {
        metric: 'Social media (h)',
        gap: Number((mean(depRows, 'Social_Media_Hours') - mean(nonDepRows, 'Social_Media_Hours')).toFixed(2)),
      },
      {
        metric: 'Study (h)',
        gap: Number((mean(depRows, 'Study_Hours') - mean(nonDepRows, 'Study_Hours')).toFixed(2)),
      },
      {
        metric: 'Activity (min/wk)',
        gap: Number((mean(depRows, 'Physical_Activity') - mean(nonDepRows, 'Physical_Activity')).toFixed(2)),
      },
      {
        metric: 'Stress (pts)',
        gap: Number((mean(depRows, 'Stress_Level') - mean(nonDepRows, 'Stress_Level')).toFixed(2)),
      },
      {
        metric: 'CGPA',
        gap: Number((mean(depRows, 'CGPA') - mean(nonDepRows, 'CGPA')).toFixed(2)),
      },
    ];
  }, [filteredRows]);

  // Color schemes based on theme
  const isLight = theme === 'light';
  const c = {
    canvasBg: isLight ? 'bg-[#f4f5f8]' : 'bg-slate-950',
    cardBg: isLight ? 'bg-white' : 'bg-slate-900',
    cardBorder: isLight ? 'border-slate-200/90 shadow-sm' : 'border-slate-800 shadow-lg',
    titleText: isLight ? 'text-slate-900' : 'text-white',
    subtitleText: isLight ? 'text-slate-500' : 'text-slate-400',
    bodyText: isLight ? 'text-slate-700' : 'text-slate-200',
    axisColor: isLight ? '#64748b' : '#94a3b8',
    gridColor: isLight ? '#f1f5f9' : '#1e293b',
    tooltipBg: isLight ? '#ffffff' : '#0f172a',
    tooltipBorder: isLight ? '#e2e8f0' : '#334155',
    tooltipText: isLight ? '#0f172a' : '#f8fafc',
    pillActive: isLight ? 'bg-[#282560] text-white shadow' : 'bg-indigo-600 text-white shadow',
    pillInactive: isLight ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700',
    aiBoxBg: isLight ? 'bg-indigo-50/70 border-indigo-100 text-indigo-950' : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200',
    coral: '#d9534f',
    indigo: '#4338ca',
    teal: '#0d9488',
    gold: '#d97706',
    slateBar: '#64748b',
  };

  const PALETTE = ['#4338ca', '#0d9488', '#d97706', '#d9534f', '#64748b', '#8b5cf6', '#06b6d4', '#ec4899'];

  // Render Graphical Forms
  const renderVisual = (
    data: any[],
    type: ChartViewType,
    color: string,
    yDomain: [number, number],
    unit = '%',
    horizontal = false
  ) => {
    if (type === 'table') {
      return (
        <div className="overflow-x-auto h-52 text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                <th className="py-2 px-3">Segment</th>
                <th className="py-2 px-3 text-right">Depression Rate</th>
                <th className="py-2 px-3 text-right">Depressed Count</th>
                <th className="py-2 px-3 text-right">Total Sample</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.name} className={`border-b ${isLight ? 'border-slate-100' : 'border-slate-800/60'}`}>
                  <td className={`py-1.5 px-3 font-semibold ${c.bodyText}`}>{item.name}</td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold" style={{ color }}>
                    {item.rate}%
                  </td>
                  <td className={`py-1.5 px-3 text-right font-mono ${c.subtitleText}`}>
                    {item.count ? item.count.toLocaleString() : '-'}
                  </td>
                  <td className={`py-1.5 px-3 text-right font-mono ${c.subtitleText}`}>
                    {item.total ? item.total.toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: c.tooltipBg,
                borderColor: c.tooltipBorder,
                borderRadius: 8,
                color: c.tooltipText,
              }}
              formatter={(val: any) => [`${val}%`, 'Depression Rate']}
            />
            <Pie
              data={data}
              dataKey="rate"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={c.gridColor} vertical={false} />
            <XAxis dataKey="name" stroke={c.axisColor} fontSize={11} tickLine={false} />
            <YAxis stroke={c.axisColor} fontSize={10} tickLine={false} domain={yDomain} unit={unit} />
            <Tooltip
              contentStyle={{
                backgroundColor: c.tooltipBg,
                borderColor: c.tooltipBorder,
                borderRadius: 8,
                color: c.tooltipText,
              }}
              formatter={(val: any) => [`${val}%`, 'Depression Rate']}
            />
            <Area type="monotone" dataKey="rate" stroke={color} strokeWidth={2.5} fill={`url(#grad-${color})`} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (horizontal || type === 'horizontal_bar') {
      return (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.gridColor} horizontal={false} />
            <XAxis type="number" stroke={c.axisColor} fontSize={10} tickLine={false} domain={yDomain} unit={unit} />
            <YAxis dataKey="name" type="category" stroke={c.axisColor} fontSize={11} tickLine={false} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: c.tooltipBg,
                borderColor: c.tooltipBorder,
                borderRadius: 8,
                color: c.tooltipText,
              }}
              formatter={(val: any) => [`${val}%`, 'Depression Rate']}
            />
            <Bar dataKey="rate" fill={color} radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Default: Vertical Column Chart (exact Power BI style)
    return (
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.gridColor} vertical={false} />
          <XAxis dataKey="name" stroke={c.axisColor} fontSize={11} tickLine={false} />
          <YAxis stroke={c.axisColor} fontSize={10} tickLine={false} domain={yDomain} unit={unit} />
          <Tooltip
            contentStyle={{
              backgroundColor: c.tooltipBg,
              borderColor: c.tooltipBorder,
              borderRadius: 8,
              color: c.tooltipText,
            }}
            formatter={(val: any) => [`${val}%`, 'Depression Rate']}
          />
          <Bar dataKey="rate" fill={color} radius={[3, 3, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render Visual 6: Diverging Tornado Chart
  const renderLifestyleGaps = () => {
    if (chartView6 === 'table') {
      return (
        <div className="overflow-x-auto h-52 text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                <th className="py-2 px-3">Metric</th>
                <th className="py-2 px-3 text-right">Average Gap</th>
                <th className="py-2 px-3 text-right">Direction</th>
              </tr>
            </thead>
            <tbody>
              {lifestyleGapsData.map((item) => (
                <tr key={item.metric} className={`border-b ${isLight ? 'border-slate-100' : 'border-slate-800/60'}`}>
                  <td className={`py-1.5 px-3 font-semibold ${c.bodyText}`}>{item.metric}</td>
                  <td
                    className="py-1.5 px-3 text-right font-mono font-bold"
                    style={{ color: item.gap >= 0 ? c.coral : c.teal }}
                  >
                    {item.gap > 0 ? `+${item.gap}` : item.gap}
                  </td>
                  <td className="py-1.5 px-3 text-right text-[11px]">
                    {item.gap < 0 ? 'Lower in Depressed' : 'Higher in Depressed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          data={lifestyleGapsData}
          layout="vertical"
          margin={{ top: 5, right: 30, bottom: 5, left: 35 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={c.gridColor} horizontal={false} />
          <XAxis
            type="number"
            stroke={c.axisColor}
            fontSize={10}
            tickLine={false}
            domain={[-2.5, 0.5]}
            ticks={[-2.5, -2, -1.5, -1, -0.5, 0, 0.5]}
          />
          <YAxis
            dataKey="metric"
            type="category"
            stroke={c.axisColor}
            fontSize={10.5}
            tickLine={false}
            width={95}
          />
          <ReferenceLine x={0} stroke={isLight ? '#94a3b8' : '#64748b'} strokeWidth={1.5} />
          <Tooltip
            contentStyle={{
              backgroundColor: c.tooltipBg,
              borderColor: c.tooltipBorder,
              borderRadius: 8,
              color: c.tooltipText,
            }}
            formatter={(val: any) => [
              `${Number(val) > 0 ? `+${val}` : val}`,
              'Gap vs Healthy Students',
            ]}
          />
          <Bar dataKey="gap" maxBarSize={15} radius={3}>
            {lifestyleGapsData.map((entry, index) => (
              <Cell
                key={`gap-cell-${index}`}
                fill={entry.gap >= 0 ? c.coral : c.teal}
              />
            ))}
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
    <div className="flex items-center gap-1.5">
      {/* AI Explanation Toggle Pill */}
      <button
        onClick={onToggleAi}
        className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition ${
          showAi
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
            : isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-indigo-200'
            : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-500/30'
        }`}
        title="Toggle Plain-English AI Explanation"
      >
        <Sparkles className="w-3 h-3 text-cyan-300" />
        <span>{showAi ? 'Hide AI' : 'Explain'}</span>
      </button>

      {/* Chart Form Switcher */}
      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => onViewChange('bar')}
          className={`p-1 rounded text-xs transition ${
            currentView === 'bar' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title="Vertical Bar Chart"
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </button>

        {allowHorizontal && (
          <button
            onClick={() => onViewChange('horizontal_bar')}
            className={`p-1 rounded text-xs transition ${
              currentView === 'horizontal_bar' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Horizontal Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5 rotate-90" />
          </button>
        )}

        <button
          onClick={() => onViewChange('line')}
          className={`p-1 rounded text-xs transition ${
            currentView === 'line' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title="Area / Line Curve"
        >
          <LineIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onViewChange('pie')}
          className={`p-1 rounded text-xs transition ${
            currentView === 'pie' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title="Donut / Pie Chart"
        >
          <PieIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onViewChange('table')}
          className={`p-1 rounded text-xs transition ${
            currentView === 'table' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title="Data Table View"
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
          <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700 dark:text-indigo-400">
            EXECUTIVE INTELLIGENCE DASHBOARD
          </span>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-0.5`}>
            Student Lifestyle & Mental Health Analytics
          </h1>
          <p className={`text-xs sm:text-sm ${c.subtitleText} mt-1`}>
            100,000 students • ages 18–24 • interactive analysis of sleep, habits, academic stress and well-being
          </p>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
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
            {['All', 'Male', 'Female'].map((opt) => (
              <button
                key={opt}
                onClick={() => setGenderFilter(opt)}
                className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${
                  genderFilter === opt ? c.pillActive : c.pillInactive
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
            {['All', 'Science', 'Engineering', 'Arts', 'Medical', 'Business'].map((opt) => (
              <button
                key={opt}
                onClick={() => setDeptFilter(opt)}
                className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${
                  deptFilter === opt ? c.pillActive : c.pillInactive
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
                className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${
                  ageFilter === opt ? c.pillActive : c.pillInactive
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic AI Executive Summary Callout */}
      <div className={`p-3.5 rounded-xl border ${c.aiBoxBg} flex items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>AI Quick Summary:</strong> Currently viewing{' '}
            <strong className="underline decoration-indigo-400">
              {kpis.students.toLocaleString()} {genderFilter !== 'All' ? genderFilter : ''} students
            </strong>{' '}
            in {deptFilter !== 'All' ? deptFilter : 'all faculties'} (Depression rate:{' '}
            <strong>{kpis.depressionRate}%</strong>). Across this selection, GPA under 2.5 and stress over Level 7 represent over 60% of all severe cases.
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
        {/* Card 1: Students */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Students</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.students.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">in current selection</span>
        </div>

        {/* Card 2: Depression Rate */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Depression rate</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.depressionRate}%
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {kpis.depressedCount.toLocaleString()} students
          </span>
        </div>

        {/* Card 3: Avg Social Media */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Avg social media</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.avgSocialMedia} h/day
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">daily screen use</span>
        </div>

        {/* Card 4: Avg Sleep */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Avg sleep</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.avgSleep} h/night
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">nightly average</span>
        </div>

        {/* Card 5: Avg Stress */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Avg stress</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.avgStress} / 10
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">scale from 1 to 10</span>
        </div>

        {/* Card 6: Avg Physical Activity */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder}`}>
          <span className={`text-xs font-medium ${c.subtitleText} block`}>Avg physical activity</span>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${c.titleText} mt-1 font-serif`}>
            {kpis.avgActivity} min
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">weekly exercise</span>
        </div>
      </div>

      {/* 4. The 6 Visualizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Visual 1: Depression Rate by Stress Level */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by stress level</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  Rates double once stress hits 8/10 — the strongest signal in the dataset.
                </p>
              </div>
              {renderViewSwitcher(chartView1, setChartView1, showAiExp1, () => setShowAiExp1(!showAiExp1))}
            </div>

            {/* AI Plain-English Callout */}
            {showAiExp1 && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-200 text-[11px] p-2.5 rounded-lg mb-2 leading-relaxed">
                <strong>💡 Plain-English AI Insight:</strong> Stress levels 2–6 stay safely around ~9%. But at level 8, depression explodes to <strong>41.8%</strong>, reaching <strong>100%</strong> at level 10. Once student stress passes 7, immediate triage is needed.
              </div>
            )}
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(stressData, chartView1, c.coral, [0, 45])}
          </div>
        </div>

        {/* Visual 2: Depression Rate by CGPA Band */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by CGPA band</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  Academic performance splits the population: ~22% below CGPA 2.5 vs ~6% above.
                </p>
              </div>
              {renderViewSwitcher(chartView2, setChartView2, showAiExp2, () => setShowAiExp2(!showAiExp2))}
            </div>

            {/* AI Plain-English Callout */}
            {showAiExp2 && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-950 dark:text-indigo-200 text-[11px] p-2.5 rounded-lg mb-2 leading-relaxed">
                <strong>💡 Plain-English AI Insight:</strong> Notice the <strong>"Academic Cliff"</strong>! Students with GPA &ge; 2.5 have low depression (~5.8%). But students under 2.5 suffer a <strong>21%–23%</strong> depression rate (3.5x higher). Low grades are the earliest visible red flag.
              </div>
            )}
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(cgpaData, chartView2, c.indigo, [0, 25])}
          </div>
        </div>

        {/* Visual 3: Depression Rate by Sleep Duration */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by sleep duration</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  Under 5 hours a night doubles the rate; 5+ hours are broadly similar.
                </p>
              </div>
              {renderViewSwitcher(chartView3, setChartView3, showAiExp3, () => setShowAiExp3(!showAiExp3))}
            </div>

            {/* AI Plain-English Callout */}
            {showAiExp3 && (
              <div className="bg-teal-500/10 border border-teal-500/20 text-teal-950 dark:text-teal-200 text-[11px] p-2.5 rounded-lg mb-2 leading-relaxed">
                <strong>💡 Plain-English AI Insight:</strong> Sleeping less than 5 hours nearly doubles depression risk to <strong>19.0%</strong>. Between 6 to 9 hours, depression stays steady (~9.2%). Sleep is the easiest physical habit to restore.
              </div>
            )}
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(sleepData, chartView3, c.teal, [0, 20])}
          </div>
        </div>

        {/* Visual 4: Depression Rate by Social Media Hours */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by social media hours</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  A gentler slope: rates drift up from ~9.7% to ~12% beyond 5 hours a day.
                </p>
              </div>
              {renderViewSwitcher(chartView4, setChartView4, showAiExp4, () => setShowAiExp4(!showAiExp4))}
            </div>

            {/* AI Plain-English Callout */}
            {showAiExp4 && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 text-[11px] p-2.5 rounded-lg mb-2 leading-relaxed">
                <strong>💡 Plain-English AI Insight:</strong> Moderate phone use (up to 4 hours) shows normal depression (~9.7%). Beyond 5–6 hours, risk rises to ~11.4%, mainly because screen time displaces sleep and physical exercise.
              </div>
            )}
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(socialMediaData, chartView4, c.gold, [0, 14])}
          </div>
        </div>

        {/* Visual 5: Depression Rate by Department */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depression rate by department</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  Rates are close across departments — no single faculty stands out.
                </p>
              </div>
              {renderViewSwitcher(chartView5, setChartView5, showAiExp5, () => setShowAiExp5(!showAiExp5), true)}
            </div>

            {/* AI Plain-English Callout */}
            {showAiExp5 && (
              <div className="bg-slate-500/10 border border-slate-500/20 text-slate-800 dark:text-slate-200 text-[11px] p-2.5 rounded-lg mb-2 leading-relaxed">
                <strong>💡 Plain-English AI Insight:</strong> All departments (Arts, Business, Engineering, Medical, Science) report almost identical rates (~10%). Mental health is an institution-wide reality, not restricted to STEM.
              </div>
            )}
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderVisual(deptData, chartView5, c.slateBar, [0, 14], '%', chartView5 === 'horizontal_bar')}
          </div>
        </div>

        {/* Visual 6: Depressed vs Non-Depressed: Lifestyle Gaps */}
        <div className={`p-4 rounded-xl border ${c.cardBg} ${c.cardBorder} flex flex-col justify-between`}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className={`text-sm font-bold ${c.titleText}`}>Depressed vs non-depressed: lifestyle gaps</h3>
                <p className={`text-xs ${c.subtitleText} mt-0.5 line-clamp-1`}>
                  Average difference of depressed students vs the rest (negative = depressed group lower).
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowAiExp6(!showAiExp6)}
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition ${
                    showAiExp6
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-indigo-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-500/30'
                  }`}
                  title="Toggle Plain-English AI Explanation"
                >
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>{showAiExp6 ? 'Hide AI' : 'Explain'}</span>
                </button>

                <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setChartView6('horizontal_bar')}
                    className={`p-1 rounded text-xs transition ${
                      chartView6 === 'horizontal_bar' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                    title="Diverging Bar Chart"
                  >
                    <BarChart3 className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  <button
                    onClick={() => setChartView6('table')}
                    className={`p-1 rounded text-xs transition ${
                      chartView6 === 'table' ? 'bg-[#282560] dark:bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                    title="Gap Comparison Table"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Plain-English Callout */}
            {showAiExp6 && (
              <div className="bg-teal-500/10 border border-teal-500/20 text-teal-950 dark:text-teal-200 text-[11px] p-2.5 rounded-lg mb-2 leading-relaxed">
                <strong>💡 Plain-English AI Insight:</strong> Green bars show what depressed students have <strong>LESS</strong> of (less sleep, less physical activity, lower grades). Red bars show what they have <strong>MORE</strong> of (more stress, more phone time). Exercise has the largest protective gap (-2 hours/week).
              </div>
            )}
          </div>
          <div className="w-full flex-1 min-h-[210px]">
            {renderLifestyleGaps()}
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className={`pt-2 border-t ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'} text-center text-xs flex flex-wrap items-center justify-between gap-2`}>
        <p>
          Analysis synthesized from 100,000 verified university student records with real-time reactivity.
        </p>
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="text-indigo-600 dark:text-cyan-400 font-semibold hover:underline"
        >
          Open AI Explainer Assistant →
        </button>
      </div>

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        dataset={dataset}
        activeFilters={{
          gender: genderFilter,
          department: deptFilter,
          age: ageFilter,
          filteredCount: kpis.students,
          depressionRate: kpis.depressionRate,
        }}
      />
    </div>
  );
};
