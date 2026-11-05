import React from 'react';
import { Sparkles, TrendingUp, GitFork, AlertCircle, ArrowUpRight } from 'lucide-react';
import { DatasetInsight } from '../types';

interface InsightsPanelProps {
  insights: DatasetInsight[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  const getIcon = (type: DatasetInsight['type']) => {
    switch (type) {
      case 'correlation':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'group_diff':
        return <GitFork className="w-4 h-4 text-purple-400" />;
      case 'distribution':
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-200">
          Automated Dataset Insights & Highlights
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex flex-col justify-between bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {getIcon(insight.type)}
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {insight.title}
                  </span>
                </div>
                {insight.metric && (
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/20">
                    {insight.metric}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

