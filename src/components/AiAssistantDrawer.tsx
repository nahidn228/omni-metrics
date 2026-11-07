import React, { useState } from 'react';
import {
  Sparkles,
  X,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  HeartPulse,
  GraduationCap,
  Moon,
  Activity,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Dataset } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset;
  activeFilters: {
    gender: string;
    department: string;
    age: string;
    filteredCount: number;
    depressionRate: number;
  };
}

interface QAPair {
  question: string;
  category: 'General' | 'Academics' | 'Sleep & Stress' | 'Action Plan';
  icon: React.ReactNode;
  answer: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  dataset,
  activeFilters,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  if (!isOpen) return null;

  const { gender, department, age, filteredCount, depressionRate } = activeFilters;

  const qaList: QAPair[] = [
    {
      question: 'What is the #1 strongest trigger of depression in this data?',
      category: 'General',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      answer:
        'The #1 strongest signal is acute stress (levels 8 to 10), where depression skyrockets to over 41.8% (and 100% at level 10). The second strongest early warning signal is dropping below a 2.5 CGPA, where depression jumps from ~5.8% to 20.97% (more than 3.5x higher).',
    },
    {
      question: 'Does academic performance (grades) really affect mental health?',
      category: 'Academics',
      icon: <GraduationCap className="w-4 h-4 text-indigo-400" />,
      answer:
        'Yes, dramatically! Notice "The Academic Cliff" at 2.5 CGPA. For students with a 2.5 GPA or higher, depression rates are remarkably low and steady (~5.7% to 5.9%), whether they have a 2.6 or 4.0. But the moment GPA dips below 2.5, depression jumps to 20.97%. Academic struggle is the most visible red flag for counselors.',
    },
    {
      question: 'How much does sleep protect against depression?',
      category: 'Sleep & Stress',
      icon: <Moon className="w-4 h-4 text-amber-400" />,
      answer:
        'Sleeping under 5 hours per night nearly doubles depression risk (18.9% vs ~9.2% for those sleeping 6 to 9 hours). Sleep duration also directly lowers stress (correlation r = -0.28). Ensuring students get at least 6.5–7 hours of sleep is the fastest physiological lever to improve student well-being.',
    },
    {
      question: 'Does social media screen time cause depression?',
      category: 'General',
      icon: <MessageSquare className="w-4 h-4 text-cyan-400" />,
      answer:
        'Social media has a moderate relationship. Up to 4 hours per day, depression rates remain relatively stable around 9.6%–9.7%. However, when screen time exceeds 5 to 6 hours daily, depression rate drifts up to 11.4%. The primary danger is that heavy nighttime screen time displaces sleep.',
    },
    {
      question: 'Are Medical and Engineering students more depressed than others?',
      category: 'Academics',
      icon: <HelpCircle className="w-4 h-4 text-emerald-400" />,
      answer:
        'Surprisingly, NO! This is one of the most important myths busted by the 100,000-student dataset. Depression rates are virtually identical across all 5 faculties: Arts (10.15%), Business (10.19%), Engineering (10.07%), Medical (9.95%), and Science (9.95%). Mental health is a campus-wide reality, not restricted to STEM.',
    },
    {
      question: 'What is the single best healthy habit a student can adopt?',
      category: 'Action Plan',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      answer:
        'Regular physical movement! Physical activity exhibits a strong inverse correlation (r = -0.30) with perceived stress. Depressed students average 2 hours less exercise per week. Just 45–60 minutes of daily physical activity acts as an active biological buffer against academic anxiety.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Data Explainer & Assistant</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Free & Instant
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Clear, simple plain-English explanations for any user
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Active Selection Summary Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <span>Live View Summary</span>
              </span>
              <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {filteredCount.toLocaleString()} students
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Currently analyzing{' '}
              <strong>
                {gender === 'All' ? 'All Genders' : gender} students
              </strong>{' '}
              in{' '}
              <strong>
                {department === 'All' ? 'All Departments' : department}
              </strong>{' '}
              {age !== 'All' ? `(Ages ${age})` : '(All Ages 18–24)'}.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[11px]">Depression Rate</span>
                <span className="text-base font-bold text-rose-400 font-mono mt-0.5 block">
                  {depressionRate}%
                </span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[11px]">Campus Benchmark</span>
                <span className="text-base font-bold text-slate-300 font-mono mt-0.5 block">
                  10.1%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Plain-English Guide */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>The 3 Big Takeaways in Plain English</span>
            </h3>

            <div className="space-y-2.5">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-start gap-3 text-xs">
                <span className="w-6 h-6 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-white block mb-0.5">Stress has a breaking point:</strong>
                  <span className="text-slate-300">
                    Normal stress (levels 2–6) has ~9% depression. At level 8, it quadruples to 42%, and at level 10 it reaches 100%.
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-start gap-3 text-xs">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-white block mb-0.5">Grades below 2.5 are a red flag:</strong>
                  <span className="text-slate-300">
                    Students with CGPA &ge; 2.5 have low depression (~5.8%). Students below 2.5 suffer a 21% depression rate (3.5x higher).
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-start gap-3 text-xs">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-white block mb-0.5">Sleep & Exercise are the medicine:</strong>
                  <span className="text-slate-300">
                    Sleeping &lt; 5 hours doubles depression risk. Regular exercise is the #1 natural buffer that reduces stress by 30%.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions (Click to Expand) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Common Questions & Answers</span>
            </h3>

            <div className="space-y-2">
              {qaList.map((item) => {
                const isSelected = selectedQuestion === item.question;
                return (
                  <div
                    key={item.question}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden transition"
                  >
                    <button
                      onClick={() =>
                        setSelectedQuestion(isSelected ? null : item.question)
                      }
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span className="text-xs font-bold text-slate-200">
                          {item.question}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isSelected ? 'rotate-90 text-white' : ''
                        }`}
                      />
                    </button>

                    {isSelected && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/40">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center">
          <p className="text-[11px] text-slate-400">
            OmniMetrics Intelligence Engine • Instant, automated synthesis across 100,000 records
          </p>
        </div>
      </div>
    </div>
  );
};
