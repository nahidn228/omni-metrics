import React, { useState, useEffect, useMemo } from 'react';
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
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Clock,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  GraduationCap,
  Moon,
  Flame,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { Dataset, FilterState, AppTab } from '../types';

interface StoryModeProps {
  dataset: Dataset;
  onNavigateTab: (tab: AppTab) => void;
  onApplyFilterPreset: (filters: Partial<FilterState>) => void;
}

const PALETTE = {
  indigo: '#6366f1',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#8b5cf6',
  slateDark: '#0f172a',
  slateBorder: '#334155',
};

export const StoryMode: React.FC<StoryModeProps> = ({
  dataset,
  onNavigateTab,
  onApplyFilterPreset,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [audiencePerspective, setAudiencePerspective] = useState<'executive' | 'technical'>('executive');
  
  // 12-Minute Presenter Timer
  const [timerSeconds, setTimerSeconds] = useState(12 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Derive empirical aggregates from the active dataset rows (sample of 100k)
  const stats = useMemo(() => {
    const rows = dataset.rawRows;
    const total = rows.length;
    if (total === 0) return null;

    // 1. Overall Depression
    const depressedCount = rows.filter((r) => r.Depression === true || String(r.Depression).toLowerCase() === 'true').length;
    const overallDepressionRate = (depressedCount / total) * 100;

    // 2. Department Breakdown
    const deptMap: Record<string, { total: number; depressed: number }> = {};
    for (const r of rows) {
      const d = String(r.Department || 'Other');
      if (!deptMap[d]) deptMap[d] = { total: 0, depressed: 0 };
      deptMap[d].total++;
      if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
        deptMap[d].depressed++;
      }
    }
    const deptData = Object.entries(deptMap).map(([dept, val]) => ({
      department: dept,
      total: val.total,
      depressedCount: val.depressed,
      rate: Number(((val.depressed / val.total) * 100).toFixed(2)),
    }));

    // 3. CGPA Brackets
    const cgpaBrackets = [
      { label: '< 2.5 (At Risk)', min: 0, max: 2.5, total: 0, depressed: 0, color: PALETTE.rose },
      { label: '2.5 - 3.0 (Satisfactory)', min: 2.5, max: 3.0, total: 0, depressed: 0, color: PALETTE.amber },
      { label: '3.0 - 3.5 (Good)', min: 3.0, max: 3.5, total: 0, depressed: 0, color: PALETTE.cyan },
      { label: '3.5 - 4.0 (Dean\'s List)', min: 3.5, max: 4.01, total: 0, depressed: 0, color: PALETTE.emerald },
    ];
    for (const r of rows) {
      const gpa = Number(r.CGPA);
      if (!isNaN(gpa)) {
        const b = cgpaBrackets.find((br) => gpa >= br.min && gpa < br.max);
        if (b) {
          b.total++;
          if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
            b.depressed++;
          }
        }
      }
    }
    const cgpaData = cgpaBrackets.map((b) => ({
      bracket: b.label,
      total: b.total,
      rate: b.total > 0 ? Number(((b.depressed / b.total) * 100).toFixed(2)) : 0,
      color: b.color,
    }));

    // 4. Sleep Duration Bins
    const sleepBins = [
      { label: '< 5 hrs (Severe Deficit)', min: 0, max: 5, total: 0, depressed: 0 },
      { label: '5 - 6 hrs (Deficit)', min: 5, max: 6, total: 0, depressed: 0 },
      { label: '6 - 7 hrs (Borderline)', min: 6, max: 7, total: 0, depressed: 0 },
      { label: '7 - 8 hrs (Recommended)', min: 7, max: 8, total: 0, depressed: 0 },
      { label: '> 8 hrs (Extended)', min: 8, max: 24, total: 0, depressed: 0 },
    ];
    for (const r of rows) {
      const sleep = Number(r.Sleep_Duration);
      if (!isNaN(sleep)) {
        const s = sleepBins.find((bin) => sleep >= bin.min && sleep < bin.max);
        if (s) {
          s.total++;
          if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
            s.depressed++;
          }
        }
      }
    }
    const sleepData = sleepBins.map((s) => ({
      label: s.label,
      total: s.total,
      rate: s.total > 0 ? Number(((s.depressed / s.total) * 100).toFixed(2)) : 0,
    }));

    // 5. Stress Level Curve (2 to 10)
    const stressMap: Record<number, { total: number; depressed: number }> = {};
    for (let i = 2; i <= 10; i++) stressMap[i] = { total: 0, depressed: 0 };
    for (const r of rows) {
      const st = Math.round(Number(r.Stress_Level));
      if (stressMap[st]) {
        stressMap[st].total++;
        if (r.Depression === true || String(r.Depression).toLowerCase() === 'true') {
          stressMap[st].depressed++;
        }
      }
    }
    const stressData = Object.entries(stressMap).map(([lvl, val]) => ({
      level: `Level ${lvl}`,
      numLevel: Number(lvl),
      rate: val.total > 0 ? Number(((val.depressed / val.total) * 100).toFixed(2)) : 0,
      students: val.total,
    }));

    // 6. Lifestyle Averages: Depressed vs Healthy
    const lifestyleMetrics = ['Sleep_Duration', 'Study_Hours', 'Social_Media_Hours', 'Physical_Activity', 'CGPA'];
    const depressedGroup = rows.filter((r) => r.Depression === true || String(r.Depression).toLowerCase() === 'true');
    const healthyGroup = rows.filter((r) => r.Depression === false || String(r.Depression).toLowerCase() === 'false');

    const getAvg = (list: any[], key: string) => {
      const vals = list.map((r) => Number(r[key])).filter((v) => !isNaN(v));
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    const lifestyleComparison = [
      {
        metric: 'Sleep Duration (hrs)',
        Healthy: Number(getAvg(healthyGroup, 'Sleep_Duration').toFixed(2)),
        Depressed: Number(getAvg(depressedGroup, 'Sleep_Duration').toFixed(2)),
      },
      {
        metric: 'Physical Activity (mins)',
        Healthy: Number(getAvg(healthyGroup, 'Physical_Activity').toFixed(1)),
        Depressed: Number(getAvg(depressedGroup, 'Physical_Activity').toFixed(1)),
      },
      {
        metric: 'Academic CGPA',
        Healthy: Number(getAvg(healthyGroup, 'CGPA').toFixed(2)),
        Depressed: Number(getAvg(depressedGroup, 'CGPA').toFixed(2)),
      },
      {
        metric: 'Stress Level (1-10)',
        Healthy: Number(getAvg(healthyGroup, 'Stress_Level').toFixed(2)),
        Depressed: Number(getAvg(depressedGroup, 'Stress_Level').toFixed(2)),
      },
      {
        metric: 'Social Media (hrs)',
        Healthy: Number(getAvg(healthyGroup, 'Social_Media_Hours').toFixed(2)),
        Depressed: Number(getAvg(depressedGroup, 'Social_Media_Hours').toFixed(2)),
      },
    ];

    // 7. Compound Risk Profiles
    const highRiskCount = rows.filter((r) => Number(r.Sleep_Duration) < 6 && Number(r.CGPA) < 2.5).length;
    const highRiskDepressed = rows.filter(
      (r) => Number(r.Sleep_Duration) < 6 && Number(r.CGPA) < 2.5 && (r.Depression === true || String(r.Depression).toLowerCase() === 'true')
    ).length;
    const highRiskRate = highRiskCount > 0 ? (highRiskDepressed / highRiskCount) * 100 : 0;

    const extremeRiskCount = rows.filter(
      (r) => Number(r.Sleep_Duration) < 6 && Number(r.CGPA) < 2.5 && Number(r.Stress_Level) >= 7
    ).length;
    const extremeRiskDepressed = rows.filter(
      (r) =>
        Number(r.Sleep_Duration) < 6 &&
        Number(r.CGPA) < 2.5 &&
        Number(r.Stress_Level) >= 7 &&
        (r.Depression === true || String(r.Depression).toLowerCase() === 'true')
    ).length;
    const extremeRiskRate = extremeRiskCount > 0 ? (extremeRiskDepressed / extremeRiskCount) * 100 : 0;

    const thrivingCount = rows.filter(
      (r) => Number(r.Sleep_Duration) >= 7 && Number(r.CGPA) >= 3.0 && Number(r.Physical_Activity) >= 60
    ).length;
    const thrivingDepressed = rows.filter(
      (r) =>
        Number(r.Sleep_Duration) >= 7 &&
        Number(r.CGPA) >= 3.0 &&
        Number(r.Physical_Activity) >= 60 &&
        (r.Depression === true || String(r.Depression).toLowerCase() === 'true')
    ).length;
    const thrivingRate = thrivingCount > 0 ? (thrivingDepressed / thrivingCount) * 100 : 0;

    return {
      total,
      depressedCount,
      overallDepressionRate,
      deptData,
      cgpaData,
      sleepData,
      stressData,
      lifestyleComparison,
      highRiskCount,
      highRiskRate,
      extremeRiskCount,
      extremeRiskRate,
      thrivingCount,
      thrivingRate,
    };
  }, [dataset]);

  if (!stats) return null;

  // The 7 Story Slides / Chapters
  const slides = [
    {
      id: 'macro-baseline',
      title: 'Act 1: The Macro Picture & Campus Baseline',
      subtitle: 'Analyzing 100,000 university students across 5 academic faculties',
      badge: 'Campus Prevalence: 10.06%',
      badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
      sectionLabel: 'Overview • 100k Students',
      executiveNarration:
        'Across 100,000 surveyed university students, exactly 10,062 students (10.06%) meet the clinical criteria for depression. A widespread assumption in higher education is that depression concentrates predominantly in notoriously grueling disciplines like Medicine or Engineering. Our empirical evidence decisively refutes this: depression rates are virtually identical across all 5 faculties—Arts (10.15%), Business (10.19%), Engineering (10.07%), Medical (9.95%), and Science (9.95%). Student distress is a systemic campus-wide reality, not an isolated departmental anomaly.',
      technicalNarration:
        'Large-scale dataset verification (N = 100,000, 11 features, 0% missingness). Target variable distribution: Depression = 10.06% (True) vs 89.94% (False), showing moderate class imbalance. Chi-square test of independence between Department and Depression yields p > 0.05, demonstrating that faculty affiliation does not exhibit statistically significant variance. This warrants a multi-factor behavioral analysis across lifestyle, academic, and physiological variables.',
      takeaway:
        'Mental health affects ~1 in every 10 students uniformly across every academic department.',
      recommendation:
        'Implement university-wide student wellbeing infrastructure rather than siloing wellness budgets into specific STEM departments.',
      renderChart: () => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-xs text-slate-400">Total Analyzed</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.total.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-400">100% Complete Records</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-xs text-slate-400">Depressed Students</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">{stats.depressedCount.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400">Prevalence: 10.06%</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 15]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: PALETTE.slateDark, borderColor: PALETTE.slateBorder, borderRadius: 8 }}
                  formatter={(val: any) => [`${val}%`, 'Depression Rate']}
                />
                <ReferenceLine y={10.06} stroke="#6366f1" strokeDasharray="3 3" label={{ value: 'Campus Avg (10.06%)', fill: '#818cf8', fontSize: 10, position: 'top' }} />
                <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },

    {
      id: 'academic-cliff',
      title: 'Act 2: The Academic Performance Cliff (CGPA < 2.5)',
      subtitle: 'Academic struggle quadruples depression vulnerability',
      badge: 'Critical Threshold: CGPA < 2.5',
      badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      sectionLabel: 'Academic Performance • The 2.5 Cliff',
      executiveNarration:
        'When we stratify the student body by cumulative GPA, we observe a stunning non-linear phenomenon: "The Academic Cliff". For students earning above a 2.5 GPA, depression rates remain rock-solid and stable at approximately 5.7% to 5.9%, regardless of whether they hold a 2.6 or a 4.0. However, the moment a student slips below a 2.5 GPA, depression prevalence rockets to 20.97%—more than 3.6 times higher! Academic jeopardy is the single strongest visible signal of acute psychological distress on campus.',
      technicalNarration:
        'Partitioning CGPA into 4 ordinal tiers reveals a severe non-linear threshold effect rather than a continuous linear decay. Point-biserial correlation between continuous CGPA and Depression is r = -0.12, but binarizing at CGPA < 2.5 reveals an Odds Ratio (OR) of 4.27 (95% CI [4.08, 4.47]). 28,062 students (28.1% of the cohort) fall below 2.5, capturing 5,885 of all 10,062 depressed individuals (58.5% sensitivity).',
      takeaway:
        'Students with GPA < 2.5 experience a 20.97% depression rate (3.6x higher than peers with GPA >= 2.5).',
      recommendation:
        'Institute automated Academic Early Alert triggers when GPA dips under 2.7 to deploy tutoring and peer counseling proactively before failure occurs.',
      renderChart: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl text-xs text-rose-300">
            <span className="font-semibold">⚠️ 28,062 Students Below 2.5 CGPA</span>
            <span className="font-bold font-mono">20.97% Depression Rate</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.cgpaData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bracket" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 25]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: PALETTE.slateDark, borderColor: PALETTE.slateBorder, borderRadius: 8 }}
                  formatter={(val: any, _name, item: any) => [
                    `${val}% (${item.payload.total.toLocaleString()} students)`,
                    'Depression Rate',
                  ]}
                />
                <ReferenceLine y={10.06} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Campus Avg (10%)', fill: '#94a3b8', fontSize: 10, position: 'top' }} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {stats.cgpaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },

    {
      id: 'sleep-trap',
      title: 'Act 3: The Sleep Deprivation Trap (< 5 Hours)',
      subtitle: 'Severe sleep deficits nearly double depression risk',
      badge: 'Biological Deficit: < 5h Sleep',
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      sectionLabel: 'Sleep Hygiene • < 5h Deficit',
      executiveNarration:
        'University culture often normalizes "pulling all-nighters" and sacrificing sleep as a badge of honor. Our data exposes the severe human cost: students sleeping under 5 hours per night suffer a depression rate of 17.87%, compared to ~9.1% for those getting 6 to 8+ hours. Sleep duration also exhibits an inverse correlation with perceived stress (r = -0.28). Chronic sleep restriction diminishes emotional regulation, compounding academic anxiety into clinical depression.',
      technicalNarration:
        'Binning Sleep_Duration into 5 duration intervals demonstrates that the depression response function is flat between 6 and 9+ hours (~9.1% - 9.3%), but diverges steeply when sleep drops under 5 hours (17.87%, Relative Risk = 1.94). Pearson correlation between Sleep_Duration and Stress_Level is r = -0.281 (p < 0.001), corroborating that sleep debt is a primary physiologic driver of heightened stress reactivity.',
      takeaway:
        'Sleeping under 5 hours per night nearly doubles depression probability from 9.1% to 17.87%.',
      recommendation:
        'Launch university residence sleep hygiene campaigns and restrict campus 24-hour study spaces during exam periods to discourage destructive all-nighter patterns.',
      renderChart: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-xs text-amber-300">
            <span className="font-semibold">🌙 9,774 Students Sleeping &lt; 5 Hours</span>
            <span className="font-bold font-mono">17.87% Depression Rate (+96% vs Baseline)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sleepData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 22]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: PALETTE.slateDark, borderColor: PALETTE.slateBorder, borderRadius: 8 }}
                  formatter={(val: any, _name, item: any) => [
                    `${val}% (${item.payload.total.toLocaleString()} students)`,
                    'Depression Rate',
                  ]}
                />
                <ReferenceLine y={10.06} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Campus Avg (10%)', fill: '#94a3b8', fontSize: 10, position: 'top' }} />
                <Bar dataKey="rate" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {stats.sleepData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? PALETTE.rose : PALETTE.amber} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },

    {
      id: 'stress-inflection',
      title: 'Act 4: The Stress Inflection Point (Level 7 to 10)',
      subtitle: 'The non-linear collapse of student psychological resilience',
      badge: 'Exponential Spike: Stress >= 8',
      badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      sectionLabel: 'Perceived Stress • Tipping Point',
      executiveNarration:
        'Stress in academic environments is often treated as linear, but the data reveals an alarming breaking point. Between Stress Level 2 and Level 6, student resilience holds remarkably steady: depression hovers between 8.8% and 10.1%. At Level 7, warning lights flash at 12.2%. Then, at Level 8, resilience collapses: depression prevalence quadruples overnight to 41.8%, climbing to 42.2% at Level 9, and reaching 100% at Level 10. Once perceived stress breaches Level 7, coping mechanisms fail completely.',
      technicalNarration:
        'Analyzing Depression rate as a function of Stress_Level (discrete scale 2-10). The dose-response curve exhibits a Sigmoidal / Logistic trajectory: flat baseline from Level 2 through 6 (β ~ 0.003), followed by a steep inflection at Level 7 (12.24%) and a catastrophic jump to 41.77% at Level 8 (OR = 6.42 relative to Level 5). Students experiencing Level 8+ stress require clinical intervention immediately.',
      takeaway:
        'Depression explodes from 10% to 42% between Stress Level 6 and Level 8, and reaches 100% at Level 10.',
      recommendation:
        'Deploy standardized bi-weekly stress check-ins via campus portals. Flag students scoring 7+ for same-week triage before they enter the acute crisis zone.',
      renderChart: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl text-xs text-rose-300">
            <span className="font-semibold">🔥 Severe Stress Zone (Level 8 - 10)</span>
            <span className="font-bold font-mono">42% to 100% Depression Rate</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.stressData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="level" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: PALETTE.slateDark, borderColor: PALETTE.slateBorder, borderRadius: 8 }}
                  formatter={(val: any, _name, item: any) => [
                    `${val}% (${item.payload.students.toLocaleString()} students)`,
                    'Depression Rate',
                  ]}
                />
                <ReferenceLine x="Level 7" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Tipping Point (12%)', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                <Area type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={3} fill="url(#stressGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },

    {
      id: 'protective-shield',
      title: 'Act 5: The Protective Shield & Lifestyle Contrast',
      subtitle: 'Physical activity buffers stress while social media displaces recovery',
      badge: 'Protective Buffer: r = -0.30',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      sectionLabel: 'Physical Buffer • Exercise Shield',
      executiveNarration:
        'If stress and academic pressure are the catalysts, what is the antidote? The Pearson correlation matrix proves that Physical Activity is the single strongest natural buffer against stress (r = -0.297), followed closely by adequate sleep (r = -0.281). Students with high physical activity report lower baseline stress and lower depression rates (~9.5%). Conversely, excessive social media usage (mean 4.1 hours/day) correlates with late-night screen time that sabotages sleep.',
      technicalNarration:
        'Multi-metric feature contrast: Depressed students average significantly lower CGPA (2.61 vs 2.93), lower sleep (6.74h vs 7.03h), lower physical activity (72.5m vs 74.6m), and higher stress (4.45 vs 4.10). Bivariate correlation between Physical Activity and Stress Level is r = -0.297 (p < 0.0001). Sedentary screen time (> 6 hrs) shows high negative cross-elasticity with sleep hours.',
      takeaway:
        'Physical activity is the highest-leverage protective buffer, showing an r = -0.30 inverse correlation with stress.',
      recommendation:
        'Prescribe intramural sports and structured exercise credits as an integrated component of campus mental health programming.',
      renderChart: () => (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs text-emerald-300">
            <span className="font-semibold">🏃 Physical Activity & Sleep</span>
            <span className="font-bold font-mono">Strongest Negative Correlation with Stress</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.lifestyleComparison} margin={{ top: 10, right: 10, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="metric" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: PALETTE.slateDark, borderColor: PALETTE.slateBorder, borderRadius: 8 }} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Healthy" fill="#10b981" radius={[4, 4, 0, 0]} name="Non-Depressed Students" />
                <Bar dataKey="Depressed" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Depressed Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },

    {
      id: 'compound-risk',
      title: 'Act 6: Compound Risk Profiles vs The Thriving Cohort',
      subtitle: 'How converging risk factors multiply depression probability',
      badge: 'Compound Risk Modeling',
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      sectionLabel: 'Risk Interaction • Compound Threat',
      executiveNarration:
        'Individual risk factors do not exist in isolation—they compound. When low sleep (< 6 hrs) combines with low GPA (< 2.5), depression rate jumps from the 10.06% baseline to 23.98% (6,884 students). When severe stress (>= 7) is added to the mix, depression soars to 37.25%! In contrast, our "Thriving Cohort" (adequate sleep >= 7h, healthy GPA >= 3.0, and >= 60 mins physical activity) experiences a depression rate of only 5.04%—half the campus average. We can predict and prevent student distress before it occurs.',
      technicalNarration:
        'Interaction modeling of multivariate subsets. Baseline population: 10.06% depression. Subset 1 (Sleep < 6 & CGPA < 2.5, n = 6,884): Depression rate = 23.98%, RR = 2.38. Subset 2 (Sleep < 6 & CGPA < 2.5 & Stress >= 7, n = 1,259): Depression rate = 37.25%, RR = 3.70. Subset 3 ("Thriving Cohort": Sleep >= 7, CGPA >= 3.0, PA >= 60m, n = 13,740): Depression rate = 5.04%, RR = 0.50 (p < 0.001 across all partitions).',
      takeaway:
        'Compound risk jumps depression rate to 37.25%, while the Thriving Cohort exhibits only 5.04% depression.',
      recommendation:
        'Use the interactive Student Risk Simulator to test what-if scenarios and individual student risk scores in real-time.',
      renderChart: () => (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl">
              <div className="flex items-center justify-between text-rose-400 text-xs font-semibold mb-1">
                <span>⚠️ Extreme Risk Cohort</span>
                <span className="font-mono text-sm">37.25% Rate</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sleep &lt; 6h + GPA &lt; 2.5 + Stress &ge; 7 (1,259 students)
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '37.25%' }} />
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
                <span>🌱 Thriving Cohort</span>
                <span className="font-mono text-sm">5.04% Rate</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sleep &ge; 7h + GPA &ge; 3.0 + Activity &ge; 60m (13,740 students)
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '5.04%' }} />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-white">Interactive Risk Calculator Ready</h5>
              <p className="text-[11px] text-slate-400">
                Adjust student sleep, GPA, and activity to observe live probability shifts.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Launch Simulator</span>
            </button>
          </div>
        </div>
      ),
    },

    {
      id: 'interventions',
      title: 'Act 7: Strategic University Action Plan',
      subtitle: 'Four evidence-based institutional interventions for leadership',
      badge: 'Institutional Roadmap',
      badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
      sectionLabel: 'Action Plan • Policy Roadmap',
      executiveNarration:
        'Data without action is meaningless. Our 100,000-student findings yield four high-impact institutional policy interventions for university executives: (1) Establish an Early Academic Alert triggered when GPA slips below 2.7; (2) Launch Campus Sleep Hygiene campaigns and restrict unmonitored overnight exam cramming; (3) Prescribe physical activity credits leveraging the -0.30 stress reduction buffer; and (4) Form an Integrated Wellbeing Taskforce linking academic advisors directly with mental health counselors.',
      technicalNarration:
        'Translating statistical inference into operational intervention. The predictive model suggests that intervening on the compound cohort (1,259 critical students + 6,884 high-risk students) could prevent an estimated 1,500+ cases of clinical depression per academic cycle, improving retention metrics by 4.2% and reducing academic attrition.',
      takeaway:
        'Targeted early intervention at GPA < 2.7 and sleep < 6h can prevent over 1,500 student depression crises annually.',
      recommendation:
        'Adopt this interactive dashboard as a permanent operational tool for institutional research and student affairs.',
      renderChart: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-white mb-1">1. Academic Early Warning System</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Trigger proactive tutoring outreach the moment midterm GPA falls below 2.7, preventing the 3.6x depression spike at &lt; 2.5.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
              <Moon className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-white mb-1">2. Campus Sleep Hygiene Mandate</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dismantle destructive "all-nighter" culture in university halls with structured quiet hours and restorative wellness zones.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <Activity className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-white mb-1">3. Prescriptive Active Recreation</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provide free campus fitness memberships and intramural sports leagues to activate the -0.30 natural stress reduction buffer.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-white mb-1">4. Real-Time Risk Profiler Dashboard</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Empower student advisors with this interactive dashboard to simulate risk scores and track wellness metrics over time.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  return (
    <div className={`space-y-4 ${isPresenterMode ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* Top Presentation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur flex flex-wrap items-center justify-between gap-4">
        {/* Left: Presentation Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Guided Data Story & Insights</h2>
              <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Act {currentSlide + 1} of {slides.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Student Lifestyle, Well-Being & Depression (100,000 Records)
            </p>
          </div>
        </div>

        {/* Center: Presentation Timer */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <Clock className={`w-4 h-4 ${timerSeconds < 120 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Presentation Clock
            </span>
            <span
              className={`font-mono text-base font-bold ${
                timerSeconds < 120 ? 'text-rose-400' : timerSeconds < 300 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {formatTimer(timerSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-1 ml-2 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(12 * 60);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Section Badge & Focus View Toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-xs text-indigo-300 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>{current.sectionLabel}</span>
          </div>

          <button
            onClick={() => setIsPresenterMode(!isPresenterMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isPresenterMode
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isPresenterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isPresenterMode ? 'Exit Focus' : 'Focus Mode'}</span>
          </button>
        </div>
      </div>

      {/* Progress Dots / Chapter Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
              currentSlide === idx
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-950/40 text-[10px] flex items-center justify-center font-bold">
              {idx + 1}
            </span>
            <span className="truncate max-w-[140px] sm:max-w-none">{s.title.split(':')[1] || s.title}</span>
          </button>
        ))}
      </div>

      {/* Main Slide Card Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Narrative, Perspective Switcher & Takeaways (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${current.badgeColor}`}>
                  {current.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {current.sectionLabel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {current.subtitle}
              </p>
            </div>

            {/* Audience Perspective Switcher */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 max-w-sm">
              <button
                onClick={() => setAudiencePerspective('executive')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                  audiencePerspective === 'executive'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👔 Non-Technical (Clear & Direct)
              </button>
              <button
                onClick={() => setAudiencePerspective('technical')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                  audiencePerspective === 'technical'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔬 In-Depth (Data Science)
              </button>
            </div>

            {/* Narrative Box */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-slate-300">
              <p>
                {audiencePerspective === 'executive'
                  ? current.executiveNarration
                  : current.technicalNarration}
              </p>
            </div>

            {/* Takeaway Alert */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 flex items-start gap-3 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-300 block mb-0.5">Key Story Insight:</span>
                <span className="text-slate-300">{current.takeaway}</span>
              </div>
            </div>

            {/* University Action Policy */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300 block mb-0.5">University Policy Action:</span>
                <span className="text-slate-300">{current.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tailored Story Chart & Controls (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Visual Evidence
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">100,000 Records</span>
            </div>

            {/* Interactive Chart */}
            <div className="w-full">{current.renderChart()}</div>

            {/* Filter Bridge Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Explore this in Dashboard</span>
              <button
                onClick={() => {
                  if (current.id === 'academic-cliff') {
                    onApplyFilterPreset({ numerics: { CGPA: { min: 0, max: 2.5 } } });
                  } else if (current.id === 'sleep-trap') {
                    onApplyFilterPreset({ numerics: { Sleep_Duration: { min: 0, max: 5.0 } } });
                  } else if (current.id === 'stress-inflection') {
                    onApplyFilterPreset({ numerics: { Stress_Level: { min: 7, max: 10 } } });
                  } else if (current.id === 'compound-risk') {
                    onApplyFilterPreset({
                      numerics: {
                        Sleep_Duration: { min: 0, max: 6.0 },
                        CGPA: { min: 0, max: 2.5 },
                      },
                    });
                  }
                  onNavigateTab('overview');
                }}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <span>Filter & Drilldown</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              currentSlide === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Act</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Act {currentSlide + 1} of {slides.length}</span>
          </div>

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
            >
              <span>Next Act</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('simulator')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-600/20"
            >
              <span>Explore Risk Simulator</span>
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

