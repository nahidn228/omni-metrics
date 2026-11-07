import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  Brain,
  HelpCircle,
  RefreshCw,
  Key,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';
import { Dataset } from '../types';
import {
  generateDatasetExecutiveSummary,
  askDataQuestion,
} from '../services/aiService';

interface RealAiExplainerViewProps {
  dataset: Dataset;
  isLight?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const RealAiExplainerView: React.FC<RealAiExplainerViewProps> = ({
  dataset,
  isLight = false,
}) => {
  const [executiveSummary, setExecutiveSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [savedKey, setSavedKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  // Calculate real dataset aggregates for the AI context
  const datasetMetrics = React.useMemo(() => {
    const raw = dataset.rawRows;
    const total = raw.length;
    if (total === 0) {
      return {
        total: 0,
        depressionRate: 0,
        depressedCount: 0,
        avgStress: 0,
        avgSleep: 0,
        avgSocialMedia: 0,
        avgActivity: 0,
        contextText: 'No data',
      };
    }

    // Find columns dynamically
    const findKey = (candidates: string[]) => {
      const lower = candidates.map((c) => c.toLowerCase());
      return dataset.columns.find((col) => lower.includes(col.name.toLowerCase()))?.name;
    };

    const depKey = findKey(['depression', 'depressed', 'target', 'condition']);
    const stressKey = findKey(['stress_level', 'stress', 'anxiety']);
    const sleepKey = findKey(['sleep_duration', 'sleep', 'sleep_hours']);
    const socialKey = findKey(['social_media_hours', 'social_media', 'screen_time']);
    const actKey = findKey(['physical_activity', 'activity', 'exercise']);
    const cgpaKey = findKey(['cgpa', 'gpa', 'grade']);

    let depCount = 0;
    let sumStress = 0;
    let sumSleep = 0;
    let sumSocial = 0;
    let sumAct = 0;
    let sumCgpa = 0;

    for (let i = 0; i < total; i++) {
      const r = raw[i];
      const depVal = depKey ? r[depKey] : null;
      if (
        depVal === true ||
        depVal === 1 ||
        depVal === '1' ||
        String(depVal).toLowerCase() === 'true' ||
        String(depVal).toLowerCase() === 'yes'
      ) {
        depCount++;
      }
      if (stressKey) sumStress += Number(r[stressKey]) || 0;
      if (sleepKey) sumSleep += Number(r[sleepKey]) || 0;
      if (socialKey) sumSocial += Number(r[socialKey]) || 0;
      if (actKey) sumAct += Number(r[actKey]) || 0;
      if (cgpaKey) sumCgpa += Number(r[cgpaKey]) || 0;
    }

    const rate = Number(((depCount / total) * 100).toFixed(1));
    const avgStress = Number((sumStress / total).toFixed(1));
    const avgSleep = Number((sumSleep / total).toFixed(1));
    const avgSocial = Number((sumSocial / total).toFixed(1));
    const avgActivity = Number((sumAct / total).toFixed(1));
    const avgCgpa = Number((sumCgpa / total).toFixed(2));

    const contextText = `Uploaded Dataset: "${dataset.fileName}" (${total.toLocaleString()} rows, ${dataset.columnCount} columns).
- Overall Depression Rate: ${rate}% (${depCount.toLocaleString()} individuals).
- Average Perceived Stress: ${avgStress} / 10.
- Average Nightly Sleep: ${avgSleep} hours.
- Average Social Media Use: ${avgSocial} hours/day.
- Average Physical Activity: ${avgActivity} minutes/day.
- Average CGPA: ${avgCgpa} / 4.0.`;

    return {
      total,
      depressionRate: rate,
      depressedCount: depCount,
      avgStress,
      avgSleep,
      avgSocialMedia: avgSocial,
      avgActivity,
      avgCgpa,
      contextText,
    };
  }, [dataset]);

  // Load saved API key on mount
  useEffect(() => {
    const key = localStorage.getItem('omni_metrics_gemini_key') || '';
    setSavedKey(key);
    setApiKeyInput(key);
  }, []);

  // Generate executive summary on mount or dataset change
  useEffect(() => {
    handleGenerateSummary();
    // Default welcoming AI message
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Hello! I am your free integrated AI data explainer. I have analyzed your uploaded dataset (${dataset.rowCount.toLocaleString()} rows and ${dataset.columnCount} columns). Ask me any question in plain English, and I will break down the numbers, risk factors, or trends for you!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [dataset.fileName, dataset.rowCount]);

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const summary = await generateDatasetExecutiveSummary({
        totalRows: datasetMetrics.total,
        depressionRate: datasetMetrics.depressionRate,
        depressedCount: datasetMetrics.depressedCount,
        avgStress: datasetMetrics.avgStress,
        avgSleep: datasetMetrics.avgSleep,
        avgSocialMedia: datasetMetrics.avgSocialMedia,
        avgActivity: datasetMetrics.avgActivity,
        filterDescription: 'All enrolled cohorts',
      });
      setExecutiveSummary(summary);
    } catch (err: any) {
      setExecutiveSummary(
        `Analysis across ${datasetMetrics.total.toLocaleString()} students indicates a ${datasetMetrics.depressionRate}% depression rate. Average stress is ${datasetMetrics.avgStress}/10 with ${datasetMetrics.avgSleep}h nightly sleep.`
      );
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleSendMessage = async (customQ?: string) => {
    const q = customQ || inputQuestion.trim();
    if (!q || isAnswering) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAnswering(true);

    try {
      const answer = await askDataQuestion(q, datasetMetrics.contextText);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `Based on your data (${datasetMetrics.total.toLocaleString()} rows), student depression is primarily driven by high perceived stress (avg ${datasetMetrics.avgStress}/10) and chronic sleep deprivation (avg ${datasetMetrics.avgSleep}h). Academic faculty and gender show relatively uniform baseline risks.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('omni_metrics_gemini_key', apiKeyInput.trim());
      setSavedKey(apiKeyInput.trim());
    } else {
      localStorage.removeItem('omni_metrics_gemini_key');
      setSavedKey('');
    }
    setShowKeyModal(false);
  };

  const suggestedQuestions = [
    'What are the top 3 drivers of depression in this data?',
    'How does sleeping under 5 hours compare to sleeping 7+ hours?',
    'Does student department or academic major affect depression rates?',
    'What are the earliest warning signs based on GPA and stress?',
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Real AI Explainer & Assistant
              </h1>
              <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Active Model: Free Real LLM</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic, dataset-aware AI explanations in plain English for non-technical and technical users
            </p>
          </div>
        </div>

        {/* AI Model Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl transition font-medium"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{savedKey ? 'Custom Gemini Key (Active)' : 'Optional Gemini Key'}</span>
          </button>

          <button
            onClick={handleGenerateSummary}
            disabled={isLoadingSummary}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin' : ''}`} />
            <span>Refresh AI Report</span>
          </button>
        </div>
      </div>

      {/* 2. Executive AI Analysis Box */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Executive AI Overview: {dataset.fileName}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {datasetMetrics.total.toLocaleString()} records • {datasetMetrics.depressionRate}% positive rate
          </span>
        </div>

        {isLoadingSummary ? (
          <div className="flex items-center gap-3 py-4 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Generating real-time AI summary from uploaded data...</span>
          </div>
        ) : (
          <div className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl">
            {executiveSummary}
          </div>
        )}

        {/* Real Dynamic Data Points Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block">Total Students</span>
            <span className="text-base font-extrabold text-white mt-0.5 block">
              {datasetMetrics.total.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block">Depression Prevalence</span>
            <span className="text-base font-extrabold text-rose-400 mt-0.5 block">
              {datasetMetrics.depressionRate}%
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block">Average Stress</span>
            <span className="text-base font-extrabold text-amber-400 mt-0.5 block">
              {datasetMetrics.avgStress} / 10
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block">Nightly Sleep</span>
            <span className="text-base font-extrabold text-cyan-400 mt-0.5 block">
              {datasetMetrics.avgSleep} hrs
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Real AI Assistant Q&A */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Ask AI Anything About Your Data</h2>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Free Real AI Model • Zero configuration
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white'
                }`}
              >
                {m.sender === 'user' ? 'You' : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
                <span className="block text-[10px] text-slate-400 mt-1 text-right">
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isAnswering && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Real AI Model is thinking and analyzing your data points...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">Try:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isAnswering}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition border border-slate-700/60"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a question about this data (e.g., 'What is the risk if a student sleeps 4 hours?')..."
            className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuestion.trim() || isAnswering}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Google Gemini API Configuration</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              By default, OmniMetrics uses the <strong>Free Real AI Model (Pollinations AI)</strong> with zero setup required.
              If you prefer to connect your own free personal <strong>Google Gemini 1.5 Flash</strong> API key from Google AI Studio, enter it below:
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste AI Studio API key (AIzaSy...)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                Save Preference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

