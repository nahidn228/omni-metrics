import React from 'react';
import { FilterState } from '../types';
import { Sparkles, AlertTriangle, Moon, GraduationCap, Flame, ShieldCheck, RotateCcw } from 'lucide-react';

interface StoryFilterPillsProps {
  onApplyPreset: (newFilters: FilterState) => void;
  currentFilters: FilterState;
  totalCount: number;
  filteredCount: number;
}

export const StoryFilterPills: React.FC<StoryFilterPillsProps> = ({
  onApplyPreset,
  currentFilters,
  totalCount,
  filteredCount,
}) => {
  const isAll =
    Object.keys(currentFilters.categoricals).length === 0 &&
    Object.keys(currentFilters.numerics).length === 0 &&
    !currentFilters.searchQuery;

  const presets = [
    {
      id: 'all',
      label: '🌐 All 100k Students',
      active: isAll,
      badge: 'Baseline',
      apply: () =>
        onApplyPreset({
          categoricals: {},
          numerics: {},
          searchQuery: '',
        }),
    },
    {
      id: 'high-risk',
      label: '⚠️ High Risk Cohort',
      active:
        currentFilters.numerics['Sleep_Duration']?.max === 6 &&
        currentFilters.numerics['CGPA']?.max === 2.5,
      badge: 'Sleep < 6h & GPA < 2.5',
      apply: () =>
        onApplyPreset({
          categoricals: {},
          numerics: {
            Sleep_Duration: { min: 0, max: 6.0 },
            CGPA: { min: 0, max: 2.5 },
          },
          searchQuery: '',
        }),
    },
    {
      id: 'academic-cliff',
      label: '📉 Academic Struggle',
      active: currentFilters.numerics['CGPA']?.max === 2.5 && !currentFilters.numerics['Sleep_Duration'],
      badge: 'GPA < 2.5 (21% Rate)',
      apply: () =>
        onApplyPreset({
          categoricals: {},
          numerics: {
            CGPA: { min: 0, max: 2.5 },
          },
          searchQuery: '',
        }),
    },
    {
      id: 'severe-stress',
      label: '🔥 Severe Stress Zone',
      active: currentFilters.numerics['Stress_Level']?.min === 8,
      badge: 'Stress ≥ 8 (42%+ Rate)',
      apply: () =>
        onApplyPreset({
          categoricals: {},
          numerics: {
            Stress_Level: { min: 8, max: 10 },
          },
          searchQuery: '',
        }),
    },
    {
      id: 'sleep-deficit',
      label: '🌙 Sleep Deprived',
      active: currentFilters.numerics['Sleep_Duration']?.max === 5 && !currentFilters.numerics['CGPA'],
      badge: '< 5 hrs (+96% Risk)',
      apply: () =>
        onApplyPreset({
          categoricals: {},
          numerics: {
            Sleep_Duration: { min: 0, max: 5.0 },
          },
          searchQuery: '',
        }),
    },
    {
      id: 'thriving',
      label: '🌱 Thriving Cohort',
      active:
        currentFilters.numerics['Sleep_Duration']?.min === 7 &&
        currentFilters.numerics['CGPA']?.min === 3.0,
      badge: 'Sleep ≥ 7h & GPA ≥ 3.0',
      apply: () =>
        onApplyPreset({
          categoricals: {},
          numerics: {
            Sleep_Duration: { min: 7.0, max: 12.0 },
            CGPA: { min: 3.0, max: 4.0 },
          },
          searchQuery: '',
        }),
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold text-slate-200">Story Quick Slicers:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={preset.apply}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              preset.active
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            <span>{preset.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded ${
                preset.active ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {preset.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

