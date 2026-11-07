import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Users,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Moon,
  Activity,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { AppTab } from '../types';

interface ResearchGuideViewProps {
  onNavigateTab: (tab: AppTab) => void;
}

export const ResearchGuideView: React.FC<ResearchGuideViewProps> = ({ onNavigateTab }) => {
  const [activeSection, setActiveSection] = useState<'discoveries' | 'recommendations' | 'methodology'>('discoveries');

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Student Well-Being & Lifestyle Intelligence Guide
                </h2>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Evidence-Based Research
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive reference guide for students, counselors, educators, and institutional analysts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('powerbi')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveSection('discoveries')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSection === 'discoveries'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            🔍 The 6 Core Discoveries
          </button>
          <button
            onClick={() => setActiveSection('recommendations')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSection === 'recommendations'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            🌱 Practical Recommendations
          </button>
          <button
            onClick={() => setActiveSection('methodology')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSection === 'methodology'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            🔬 Statistical Methodology
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSection === 'discoveries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">1. The Stress Tipping Point</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stress is not linear. Students with stress levels 2 to 6 show ~9% depression. At level 8, depression quadruples to <strong>41.8%</strong>, reaching <strong>100%</strong> at level 10. Once perceived stress breaches level 7, mental resilience collapses rapidly.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">2. The 2.5 CGPA Cliff</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Students earning above 2.5 GPA maintain low depression rates (~5.8%). But students under 2.5 GPA jump to <strong>20.97%</strong> depression (over 3.5x higher). Academic struggle is the single clearest observable signal of psychological distress.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Moon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">3. Sleep Deficit Acceleration</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sleeping less than 5 hours per night nearly doubles depression risk (18.9% vs ~9.2%). Sleep duration has a strong inverse correlation with stress (r = -0.28). Chronic sleep restriction diminishes emotional regulation and amplifies academic panic.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">4. Physical Activity Buffer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Physical activity exhibits a Pearson correlation of <strong>r = -0.30</strong> with stress, acting as the highest-leverage natural shield against mental distress. Students engaging in regular physical movement report significantly lower baseline stress.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">5. Cross-Faculty Universality</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Disproving common assumptions, depression rates are virtually identical across all 5 faculties: Arts (10.15%), Business (10.19%), Engineering (10.07%), Medical (9.95%), and Science (9.95%). Student well-being is an institution-wide reality.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">6. Compound Risk Interaction</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When risk factors compound (Sleep &lt; 6h + GPA &lt; 2.5 + Stress &ge; 7), depression jumps to <strong>37.25%</strong>. Conversely, the "Thriving Cohort" (Sleep &ge; 7h + GPA &ge; 3.0 + Activity &ge; 60m) exhibits only <strong>5.04%</strong> depression.
            </p>
          </div>
        </div>
      )}

      {activeSection === 'recommendations' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>For Universities, Counselors & Educators</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Automated Academic Early Warning:</strong>
                    Trigger proactive tutoring outreach the moment midterm GPA slips below 2.7, preventing the 3.5x depression spike at &lt; 2.5.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Restorative Exam Policies:</strong>
                    Discourage all-nighter cramming during exam periods and mandate restorative study hall quiet hours.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Free Recreation & Gym Credits:</strong>
                    Incorporate physical recreation directly into the academic timetable to leverage the -0.30 natural stress buffer.
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <span>For Students & Families</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Protect the 7-Hour Sleep Baseline:</strong>
                    Prioritize at least 7 hours of restorative sleep over late-night study sessions; sleep debt is the fastest biological accelerant of anxiety.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">45-Minute Daily Movement:</strong>
                    Even brisk walking or active sports significantly lowers biological stress hormones.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Seek Academic Support Early:</strong>
                    Do not wait until final exams if struggling with coursework; early tutoring prevents academic panic.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'methodology' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Dataset Integrity & Analytical Framework</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The dataset comprises 100,000 anonymized student observations across 11 multidimensional features. With 0% missingness and balanced demographic representation across all 5 faculties, the sample size provides statistical power ($p &lt; 0.0001$) across all bivariate Pearson correlation matrices, point-biserial tests, and logistic interaction models.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Sample Size</span>
              <span className="text-white font-bold text-sm">N = 100,000</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Features</span>
              <span className="text-white font-bold text-sm">11 Dimensions</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Completeness</span>
              <span className="text-emerald-400 font-bold text-sm">100.0% Clean</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Prevalence</span>
              <span className="text-rose-400 font-bold text-sm">10.06% True</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

