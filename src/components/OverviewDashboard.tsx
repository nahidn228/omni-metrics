import React from 'react';
import { ChartCard } from './ChartCard';
import { ChartConfig, ColumnProfile, FilterState } from '../types';
import { StoryFilterPills } from './StoryFilterPills';

interface OverviewDashboardProps {
  configs: ChartConfig[];
  rows: Record<string, any>[];
  columns: ColumnProfile[];
  onConfigChange: (index: number, newConfig: ChartConfig) => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalCount: number;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  configs,
  rows,
  columns,
  onConfigChange,
  filters,
  onFilterChange,
  totalCount,
}) => {
  const isStudentDataset = columns.some((c) => c.name.toLowerCase() === 'depression');

  return (
    <div className="space-y-4">
      {/* Story Presets Slicers (available for student well-being dataset) */}
      {isStudentDataset && (
        <StoryFilterPills
          currentFilters={filters}
          onApplyPreset={onFilterChange}
          totalCount={totalCount}
          filteredCount={rows.length}
        />
      )}

      {/* Grid of Dynamic Interactive Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configs.map((cfg, index) => (
          <ChartCard
            key={cfg.id}
            config={cfg}
            rows={rows}
            columns={columns}
            onConfigChange={(newCfg) => onConfigChange(index, newCfg)}
          />
        ))}
      </div>
    </div>
  );
};
