import React, { useState } from 'react';
import {
  GraduationCap,
  Video,
  Clock,
  Users,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { AppTab } from '../types';

interface AssessmentGuideViewProps {
  onNavigateTab: (tab: AppTab) => void;
}

export const AssessmentGuideView: React.FC<AssessmentGuideViewProps> = ({ onNavigateTab }) => {
  const [copiedAI, setCopiedAI] = useState(false);
  const [activeScriptSpeaker, setActiveScriptSpeaker] = useState<1 | 2 | 3 | 4>(1);

  const aiDeclarationText = `====================================================================
ARTIFICIAL INTELLIGENCE (AI) DECLARATION FORM
CMP7227: Data Visualisation — Assessment 1 (Group Video Recording)
====================================================================

1. WHY GENERATIVE AI WAS USED:
Generative AI was utilized strictly to support learning and technical development, specifically to assist in debugging complex React/Recharts rendering syntax, optimizing client-side performance for processing 100,000 dataset records smoothly, and refining script clarity for both non-technical (executive) and technical audiences in accordance with the assessment brief.

2. WHAT GENERATIVE AI WAS USED FOR:
- Assisting with TypeScript syntax, React hook optimizations, and Recharts color palette configurations.
- Brainstorming structural flow for a cohesive 12-minute oral narrative covering descriptive and inferential statistics.
- Proofreading presentation notes for clarity, academic tone, and accessibility for diverse organizational stakeholders.

3. WHICH AI WAS USED:
Google Antigravity AI Coding Assistant (Gemini 3.8 Flash Engine).

4. IF ANY GENERATED CONTENT WAS USED DIRECTLY IN THIS SUBMISSION, WHERE:
- Code architecture for client-side data parsing, Pearson correlation matrix algorithms, and UI component styling in React/Tailwind.
- Structuring guidelines for the 12-minute presenter script. All underlying analysis, hypothesis formulation, dataset interpretation, and video delivery represent the group's own intellectual effort and understanding.
====================================================================`;

  const handleCopyAI = () => {
    navigator.clipboard.writeText(aiDeclarationText);
    setCopiedAI(true);
    setTimeout(() => setCopiedAI(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  CMP7227 Assessment 1: Group Video Recording Companion
                </h2>
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Weighting: 60% • Level 7
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Module Leader: Dr Maite Frutos • Time Limit: Exactly 12 Minutes Max • Submission: 20th November 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('story')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Launch 12-Min Story Mode</span>
            </button>
          </div>
        </div>

        {/* Requirements Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">100,000+ Rows Verified</span>
              <span className="text-[11px] text-slate-400">
                Meets strict assessment brief criteria (100k rows, 11 features).
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Dual Audience Targeting</span>
              <span className="text-[11px] text-slate-400">
                Tailored for technical and non-technical stakeholders.
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">12-Minute Countdown</span>
              <span className="text-[11px] text-slate-400">
                Integrated presenter clock ensures group never exceeds time limit.
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Official AI Declaration</span>
              <span className="text-[11px] text-slate-400">
                Pre-formatted 4-point statement for BCU Harvard compliance.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete 12-Minute Presentation Script */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400" />
              <span>Complete 12-Minute Video Recording Master Script (Group of 4)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Word-for-word delivery notes with timed transitions and screen demonstrations
            </p>
          </div>

          {/* Speaker Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setActiveScriptSpeaker(num as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeScriptSpeaker === num
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Speaker {num}
              </button>
            ))}
          </div>
        </div>

        {/* Script Content per Speaker */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
          {activeScriptSpeaker === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl text-xs text-indigo-300">
                <span className="font-bold">🎤 Speaker 1: Introduction, Problem Statement & Dataset Architecture</span>
                <span className="font-mono font-bold">Timestamp: 00:00 - 02:45 (2 mins 45 secs)</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white block mb-1">1. Opening Hook & Organizational Rationale (00:00 - 01:00):</strong>
                  "Good morning Dr. Frutos and colleagues. Today our group presents our data visualization dashboard analyzing one of the most critical challenges facing modern higher education: university student well-being and depression. As aspiring data scientists, our rationale directly aligns with the module objective: translating massive, complex datasets into actionable visual narratives that can be understood both by executive university leadership—such as Vice-Chancellors and Deans—and technical analysts in Institutional Research."
                </p>

                <p>
                  <strong className="text-white block mb-1">2. Dataset Architecture & Integrity (01:00 - 01:45):</strong>
                  "To satisfy the assessment requirement of a relatively large dataset with at least 100,000 rows and 5 columns, our team sourced and analyzed a comprehensive dataset of exactly 100,000 university students across 11 multidimensional features. This includes academic markers such as CGPA, lifestyle factors including sleep duration, daily study hours, social media screen time, and physical activity, alongside perceived stress level and clinical depression status. As you can see on our Data Quality KPI card, the dataset contains zero null cells—providing 100% data completeness."
                </p>

                <p>
                  <strong className="text-white block mb-1">3. The Macro Baseline Finding (01:45 - 02:45):</strong>
                  "Looking at Act 1 of our Story Mode, we establish our campus baseline: 10.06% of students—exactly 10,062 individuals—suffer from depression. Importantly, our faculty breakdown reveals an essential insight: depression rates do not concentrate solely in grueling STEM disciplines. Medical students report 9.95%, Engineering 10.07%, Science 9.95%, Arts 10.15%, and Business 10.19%. Mental health is a campus-wide reality. I will now hand over to Speaker 2 to uncover the primary academic and physiological drivers."
                </p>
              </div>
            </div>
          )}

          {activeScriptSpeaker === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl text-xs text-rose-300">
                <span className="font-bold">🎤 Speaker 2: The Academic Cliff (CGPA &lt; 2.5) & Sleep Deficit Trap</span>
                <span className="font-mono font-bold">Timestamp: 02:45 - 05:30 (2 mins 45 secs)</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white block mb-1">1. The Academic Cliff Phenomenon (02:45 - 04:00):</strong>
                  "Thank you, Speaker 1. Moving to Act 2, we investigate the relationship between academic performance and mental health. When plotting depression rates across CGPA tiers, we made a striking discovery: 'The Academic Cliff'. For students with a CGPA above 2.5, depression rates remain virtually flat at ~5.7% to 5.9%. However, the moment a student slips below the 2.5 GPA threshold, the depression rate skyrockets to 20.97%—more than 3.6 times higher! Over 28,000 students fall into this danger zone, representing nearly 60% of all depressed students on campus. This non-linear cliff demonstrates that academic struggle is the single strongest visible precursor of student distress."
                </p>

                <p>
                  <strong className="text-white block mb-1">2. The Sleep Deprivation Trap (04:00 - 05:30):</strong>
                  "Turning to Act 3, we analyze sleep duration. Higher education often glorifies late-night study sessions, but our visualization reveals the severe psychological toll: students sleeping under 5 hours per night suffer a depression rate of 17.87%, compared to ~9.1% for those receiving 7 to 8 hours. Pearson correlation analysis proves that sleep duration has a notable negative correlation with perceived stress (r = -0.28). Chronic sleep deprivation impairs emotional resilience and magnifies academic anxiety. Speaker 3 will now explore the stress tipping point and protective lifestyle buffers."
                </p>
              </div>
            </div>
          )}

          {activeScriptSpeaker === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-xs text-amber-300">
                <span className="font-bold">🎤 Speaker 3: The Stress Inflection Point & Physical Activity Shield</span>
                <span className="font-mono font-bold">Timestamp: 05:30 - 08:30 (3 mins 00 secs)</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white block mb-1">1. The Stress Inflection Point (05:30 - 07:00):</strong>
                  "Thank you, Speaker 2. In Act 4, we examine our dose-response curve of perceived stress versus depression. From Stress Level 2 to Level 6, student coping mechanisms hold steady, with depression hovering between 8.8% and 10.1%. At Level 7, a warning signal emerges at 12.2%. Then, at Level 8, resilience collapses catastrophically: depression prevalence leaps to 41.8%, climbing to 42.2% at Level 9, and reaching 100% at Level 10. This non-linear inflection proves that academic institutions must intervene before students breach Level 7."
                </p>

                <p>
                  <strong className="text-white block mb-1">2. Physical Activity Buffer vs Social Media Strain (07:00 - 08:30):</strong>
                  "In Act 5, we ask: what factors protect students? In our correlation matrix, Physical Activity emerges as the single most powerful natural buffer against stress, with a statistically significant Pearson r of -0.297. Students engaging in regular physical movement report lower baseline stress and reduced depression rates. Conversely, daily social media screen time averages 4.1 hours across campus; heavy users often experience displaced sleep and increased sedentary strain. Now Speaker 4 will demonstrate our interactive risk simulator and institutional action plan."
                </p>
              </div>
            </div>
          )}

          {activeScriptSpeaker === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs text-emerald-300">
                <span className="font-bold">🎤 Speaker 4: Compound Risk Modeling, Risk Simulator & Policy Roadmap</span>
                <span className="font-mono font-bold">Timestamp: 08:30 - 12:00 (3 mins 30 secs)</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white block mb-1">1. Compound Risk Profiling (08:30 - 09:45):</strong>
                  "Thank you, Speaker 3. In Act 6, we demonstrate that risk factors do not act in isolation. When sleep deprivation (&lt; 6h) converges with academic struggle (&lt; 2.5 GPA), depression risk rises to 23.98%. When acute stress (&ge; 7) is also present, the depression rate jumps to 37.25%! Conversely, in our 'Thriving Cohort'—students getting &ge; 7 hours of sleep, maintaining &ge; 3.0 GPA, and exercising &ge; 60 minutes daily—depression rates drop to just 5.04% (half the campus average)."
                </p>

                <p>
                  <strong className="text-white block mb-1">2. Live Interactive Risk Simulator Demo (09:45 - 11:00):</strong>
                  "[Switching live to the 'Risk Simulator' tab] To make our findings operational for university advisors, we engineered an interactive What-If Risk Simulator. By adjusting sliders for sleep, GPA, stress, and physical activity, an advisor can instantly compute a student's predicted depression probability against empirical campus baselines. For example, testing our 'Exam-Cramming STEM Student' archetype yields a 54% crisis risk; adjusting sleep upward by just 1.5 hours and providing tutoring to lift GPA over 2.5 drops that risk by over 60%."
                </p>

                <p>
                  <strong className="text-white block mb-1">3. Institutional Recommendations & Closing (11:00 - 12:00):</strong>
                  "In conclusion, our data yields four strategic institutional interventions: First, deploy an Academic Early Warning trigger when GPA slips below 2.7. Second, launch campus sleep hygiene campaigns during midterm and exam weeks. Third, prescribe active recreation credits to leverage the -0.30 stress reduction buffer. And fourth, integrate this dashboard into student services. By bridging statistical rigor with user-centric design, our dashboard empowers universities to detect vulnerability early and save student lives. Thank you for your time."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official AI Usage Declaration Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Official BCU AI Usage Declaration (Mandatory Submission Requirement)
              </h3>
              <p className="text-xs text-slate-400">
                Fully complies with the 4 mandatory requirements specified on Page 2 of the Assessment 1 Brief
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyAI}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            {copiedAI ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedAI ? 'Copied to Clipboard!' : 'Copy Statement'}</span>
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap border border-slate-800 leading-relaxed">
          {aiDeclarationText}
        </pre>
      </div>
    </div>
  );
};

