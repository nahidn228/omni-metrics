import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { ColumnProfile, FilterState } from '../types';

interface FilterBarProps {
  columns: ColumnProfile[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  columns,
  filters,
  onFilterChange,
  filteredCount,
  totalCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filterable categoricals (unique values between 2 and 20)
  const filterableCats = columns.filter(
    (c) => (c.type === 'categorical' || c.type === 'boolean') && c.uniqueCount <= 25 && c.uniqueCount > 1
  );

  // Filterable numerics (first 4 numeric columns)
  const filterableNums = columns
    .filter((c) => c.type === 'numeric' && !c.name.toLowerCase().includes('id') && c.min !== undefined && c.max !== undefined)
    .slice(0, 4);

  const activeCategoricalCount = Object.values(filters.categoricals).reduce(
    (acc, vals) => acc + (vals.length > 0 ? 1 : 0),
    0
  );
  const activeNumericCount = Object.keys(filters.numerics).length;
  const totalActiveFilters = activeCategoricalCount + activeNumericCount + (filters.searchQuery ? 1 : 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleCategoryToggle = (columnName: string, value: string) => {
    const current = filters.categoricals[columnName] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const nextCats = { ...filters.categoricals };
    if (updated.length === 0) {
      delete nextCats[columnName];
    } else {
      nextCats[columnName] = updated;
    }

    onFilterChange({
      ...filters,
      categoricals: nextCats,
    });
  };

  const handleNumericChange = (columnName: string, min: number, max: number) => {
    onFilterChange({
      ...filters,
      numerics: {
        ...filters.numerics,
        [columnName]: { min, max },
      },
    });
  };

  const removeNumericFilter = (columnName: string) => {
    const nextNums = { ...filters.numerics };
    delete nextNums[columnName];
    onFilterChange({
      ...filters,
      numerics: nextNums,
    });
  };

  const resetAllFilters = () => {
    onFilterChange({
      categoricals: {},
      numerics: {},
      searchQuery: '',
    });
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 shadow-md">
      {/* Top row: Search, Filter toggle, and Count status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all records..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              totalActiveFilters > 0
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {totalActiveFilters > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {totalActiveFilters}
              </span>
            )}
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>
        </div>

        {/* Status and Reset */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{filteredCount.toLocaleString()}</span> of{' '}
            <span>{totalCount.toLocaleString()}</span> rows
          </div>

          {totalActiveFilters > 0 && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md transition"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Drawer */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-4">
          {/* Categoricals */}
          {filterableCats.length > 0 && (
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
                Categorical Filters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filterableCats.map((col) => {
                  const selected = filters.categoricals[col.name] || [];
                  const options = col.topValues || [];

                  return (
                    <div
                      key={col.name}
                      className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-2.5"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-200">{col.name}</span>
                        {selected.length > 0 && (
                          <button
                            onClick={() => {
                              const next = { ...filters.categoricals };
                              delete next[col.name];
                              onFilterChange({ ...filters, categoricals: next });
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {options.map((opt) => {
                          const isChecked = selected.includes(opt.value);
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleCategoryToggle(col.name, opt.value)}
                              className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                                isChecked
                                  ? 'bg-indigo-600 text-white border-indigo-500 font-medium'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-200'
                              }`}
                            >
                              {opt.value} ({opt.count.toLocaleString()})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Numerics */}
          {filterableNums.length > 0 && (
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
                Numeric Range Sliders
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {filterableNums.map((col) => {
                  const min = col.min ?? 0;
                  const max = col.max ?? 100;
                  const currentRange = filters.numerics[col.name] || { min, max };

                  return (
                    <div
                      key={col.name}
                      className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-2.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-200">{col.name}</span>
                        {filters.numerics[col.name] && (
                          <button
                            onClick={() => removeNumericFilter(col.name)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>{currentRange.min.toFixed(1)}</span>
                        <span>{currentRange.max.toFixed(1)}</span>
                      </div>

                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={(max - min) / 100 || 1}
                        value={currentRange.max}
                        onChange={(e) =>
                          handleNumericChange(col.name, currentRange.min, Number(e.target.value))
                        }
                        className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

