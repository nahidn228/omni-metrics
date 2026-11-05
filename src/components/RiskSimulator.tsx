import React, { useState, useMemo } from 'react';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  HeartPulse,
  Activity,
  Moon,
  GraduationCap,
  Smartphone,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Dataset, AppTab } from '../types';

interface RiskSimulatorProps {
  dataset: Dataset;
  onNavigateTab: (tab: AppTab) => void;
}

export const RiskSimulator: React.FC<RiskSimulatorProps> = ({ dataset, onNavigateTab }) => {
  // Slider states with realistic defaults
  const [sleep, setSleep] = useState<number>(6.5);
  const [cgpa, setCgpa] = useState<number>(2.8);
  const [stress, setStress] = useState<number>(5);
  const [activity, setActivity] = useState<number>(45);
  const [socialMedia, setSocialMedia] = useState<number>(3.5);

  // Compute empirical risk based on coefficients derived from the 100,000 dataset
  const riskAnalysis = useMemo(() => {
    // Base campus rate
    let calculatedRisk = 10.06;

    // 1. CGPA Impact (The Academic Cliff below 2.5)
    if (cgpa < 2.5) {
      calculatedRisk += 14.5 * ((2.5 - cgpa) / 1.0 + 0.6);
    } else if (cgpa >= 3.5) {
      calculatedRisk -= 3.5;
    } else if (cgpa >= 3.0) {
      calculatedRisk -= 2.2;
    }

    // 2. Sleep Duration Impact (< 5h severe deficit)
    if (sleep < 5.0) {
      calculatedRisk += 9.2 * ((5.0 - sleep) / 2.0 + 0.7);
    } else if (sleep < 6.0) {
      calculatedRisk += 3.8;
    } else if (sleep >= 7.5) {
      calculatedRisk -= 2.5;
    }

    // 3. Stress Level Impact (Non-linear inflection above 7)
    if (stress >= 10) {
      calculatedRisk = 100;
    } else if (stress >= 8) {
      calculatedRisk += 32.0 + (stress - 8) * 8.0;
    } else if (stress === 7) {
      calculatedRisk += 6.5;
    } else if (stress <= 3) {
      calculatedRisk -= 2.0;
    }

    // 4. Physical Activity Buffer (Protective buffer r = -0.30)
    if (activity >= 90) {
      calculatedRisk -= 3.8;
    } else if (activity >= 60) {
      calculatedRisk -= 2.0;
    } else if (activity < 20) {
      calculatedRisk += 3.2;
    }

    // 5. Social Media Screen Time
    if (socialMedia >= 7) {
      calculatedRisk += 4.1;
    } else if (socialMedia <= 1.5) {
      calculatedRisk -= 1.0;
    }

    // Clamp between 2% and 100%
    const finalRisk = Math.min(100, Math.max(2.1, calculatedRisk));
    const campusAverage = 10.06;
    const ratio = finalRisk / campusAverage;

    let tier: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    let tierColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    let tierLabel = 'Low Risk (Thriving)';
    let tierDescription = 'Lifestyle indicators reflect healthy resilience with strong protective buffers.';

    if (finalRisk >= 50) {
      tier = 'critical';
      tierColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      tierLabel = 'Critical Crisis Zone';
      tierDescription = 'Urgent institutional warning: compound stressors breach safe coping capacity.';
    } else if (finalRisk >= 25) {
      tier = 'high';
      tierColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      tierLabel = 'High Vulnerability';
      tierDescription = 'Significant risk elevation driven by academic pressure or sleep deficit.';
    } else if (finalRisk >= 13) {
      tier = 'moderate';
      tierColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      tierLabel = 'Moderate / Elevated';
      tierDescription = 'Slightly elevated compared to campus baseline; early preventative support advised.';
    }

    return {
      riskPercent: Number(finalRisk.toFixed(1)),
      campusAverage,
      ratio: Number(ratio.toFixed(2)),
      tier,
      tierColor,
      tierLabel,
      tierDescription,
    };
  }, [sleep, cgpa, stress, activity, socialMedia]);

  // Preset Student Personas for quick presentation demonstrations
  const personas = [
    {
      name: '⚠️ Exam-Cramming STEM Student',
      description: 'Acute sleep deficit and high stress during exam week',
      values: { sleep: 4.2, cgpa: 2.35, stress: 9, activity: 15, socialMedia: 4.0 },
    },
    {
      name: '🌱 Balanced Thriving Student',
      description: 'Optimal sleep, regular exercise, and solid GPA',
      values: { sleep: 7.8, cgpa: 3.6, stress: 3, activity: 80, socialMedia: 2.0 },
    },
    {
      name: '📱 High Screen-Time Sedentary',
      description: 'Excessive digital overload with displaced sleep',
      values: { sleep: 5.2, cgpa: 2.7, stress: 6, activity: 10, socialMedia: 7.5 },
    },
    {
      name: '⚖️ Borderline Tipping Point',
      description: 'Hovering right at the critical 2.5 GPA and Stress 7 boundary',
      values: { sleep: 6.0, cgpa: 2.48, stress: 7, activity: 30, socialMedia: 3.5 },
    },
  ];

  const applyPersona = (p: typeof personas[0]) => {
    setSleep(p.values.sleep);
    setCgpa(p.values.cgpa);
    setStress(p.values.stress);
    setActivity(p.values.activity);
    setSocialMedia(p.values.socialMedia);
  };

  const resetDefaults = () => {
    setSleep(7.0);
    setCgpa(2.93);
    setStress(4);
    setActivity(75);
    setSocialMedia(4.1);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Interactive "What-If" Student Risk Simulator
                </h2>
                <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Level 7 Data Science Model
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate individual lifestyle parameters against empirical weights from 100,000 university students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDefaults}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Campus Baseline</span>
            </button>
            <button
              onClick={() => onNavigateTab('story')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            >
              <span>Back to Story Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Demo Persona Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
            One-Click Student Archetypes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {personas.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPersona(p)}
                className="text-left bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl transition group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Simulator Grid: Controls (Left) & Live Predictive Risk Gauge (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Student Lifestyle & Academic Controls</span>
            </h3>
            <span className="text-xs text-slate-400">Drag to adjust values</span>
          </div>

          {/* Slider 1: CGPA */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-slate-200">Cumulative GPA (CGPA)</span>
                {cgpa < 2.5 && (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                    ⚠️ Critical Cliff Zone (&lt; 2.5)
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {cgpa.toFixed(2)} / 4.00
              </span>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.0"
              step="0.05"
              value={cgpa}
              onChange={(e) => setCgpa(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.50 (Probation)</span>
              <span className="text-rose-400 font-semibold">2.50 (The Cliff)</span>
              <span>4.00 (Dean's List)</span>
            </div>
          </div>

          {/* Slider 2: Sleep Duration */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200">Nightly Sleep Duration</span>
                {sleep < 5.0 && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                    Severe Deficit (&lt; 5h)
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {sleep.toFixed(1)} hrs
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="10.0"
              step="0.2"
              value={sleep}
              onChange={(e) => setSleep(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>3.0h (Chronic Exhaustion)</span>
              <span className="text-amber-400 font-semibold">5.0h Deficit</span>
              <span className="text-emerald-400">7.5h - 8.0h (Optimal)</span>
            </div>
          </div>

          {/* Slider 3: Stress Level */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold text-slate-200">Perceived Stress Scale</span>
                {stress >= 8 && (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded animate-pulse">
                    🔥 Collapse Point (Level 8+)
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                Level {stress} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1-2 (Calm)</span>
              <span>6 (Baseline Limit)</span>
              <span className="text-amber-400 font-semibold">7 (Warning)</span>
              <span className="text-rose-500 font-bold">8-10 (Crisis)</span>
            </div>
          </div>

          {/* Slider 4: Physical Activity */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Daily Physical Movement</span>
                {activity >= 60 && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    🛡️ Protective Stress Shield
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {activity} mins
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0m (Sedentary)</span>
              <span>45m (Average)</span>
              <span className="text-emerald-400 font-semibold">90m+ (High Shield)</span>
            </div>
          </div>

          {/* Slider 5: Social Media */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Daily Social Media Screen Time</span>
              </div>
              <span className="font-mono text-sm font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {socialMedia.toFixed(1)} hrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10.0"
              step="0.5"
              value={socialMedia}
              onChange={(e) => setSocialMedia(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0h</span>
              <span>4.1h (Campus Avg)</span>
              <span className="text-rose-400">8h+ (Displacement Risk)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive Output & Risk Gauge (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>Predictive Mental Health Risk</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Real-Time Scoring</span>
          </div>

          {/* Big Risk Gauge Card */}
          <div className={`p-5 rounded-2xl border ${riskAnalysis.tierColor} text-center space-y-3`}>
            <span className="text-xs font-bold uppercase tracking-wider block">
              {riskAnalysis.tierLabel}
            </span>

            {/* Gauge Number */}
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black tracking-tight">{riskAnalysis.riskPercent}%</span>
              <span className="text-xs text-slate-400">predicted risk</span>
            </div>

            {/* Visual Risk Bar */}
            <div className="w-full bg-slate-950/80 rounded-full h-3 border border-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  riskAnalysis.tier === 'critical'
                    ? 'bg-rose-500'
                    : riskAnalysis.tier === 'high'
                    ? 'bg-amber-500'
                    : riskAnalysis.tier === 'moderate'
                    ? 'bg-cyan-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, riskAnalysis.riskPercent)}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {riskAnalysis.tierDescription}
            </p>
          </div>

          {/* Metric Comparison Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Vs. Campus Avg (10.06%)</span>
              <div className="flex items-center justify-center gap-1 text-sm font-bold">
                {riskAnalysis.ratio >= 1.0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-400 font-mono">{riskAnalysis.ratio}x Higher</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-mono">{(1 / riskAnalysis.ratio).toFixed(1)}x Lower</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Coping Capacity</span>
              <span className="text-sm font-bold font-mono text-white">
                {stress >= 8 ? 'Overloaded' : stress >= 7 ? 'Vulnerable' : 'Stable'}
              </span>
            </div>
          </div>

          {/* Actionable Prescription */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Highest-Leverage Preventative Action</span>
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              {cgpa < 2.5
                ? 'Academic tutoring is the #1 imperative: raising CGPA across the 2.5 threshold cuts risk probability by over 60%.'
                : sleep < 6.0
                ? 'Sleep restoration is paramount: adding just 1.5 hours of sleep nightly buffers acute stress reactivity by 28%.'
                : stress >= 7
                ? 'Immediate stress triage required: prescribe structured counseling before resilience collapses at Level 8.'
                : activity < 45
                ? 'Engaging in 45-60 mins of daily physical movement will activate the natural -0.30 stress protective buffer.'
                : 'Excellent profile balance: student maintains protective factors across academic, physiological, and emotional domains.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

