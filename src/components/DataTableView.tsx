import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
} from 'lucide-react';
import { ColumnProfile } from '../types';
import { exportToCSV } from '../utils/dataTransforms';

interface DataTableViewProps {
  rows: Record<string, any>[];
  columns: ColumnProfile[];
  fileName?: string;
}

export const DataTableView: React.FC<DataTableViewProps> = ({
  rows,
  columns,
  fileName = 'dataset',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map((c) => c.name));
  const [showColPicker, setShowColPicker] = useState(false);

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortCol(null);
        setSortDir('asc');
      }
    } else {
      setSortCol(colName);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const sortedRows = useMemo(() => {
    if (!sortCol) return rows;

    return [...rows].sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [rows, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const currentRows = sortedRows.slice(startIdx, startIdx + pageSize);

  const toggleColumn = (colName: string) => {
    if (visibleColumns.includes(colName)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter((c) => c !== colName));
      }
    } else {
      setVisibleColumns([...visibleColumns, colName]);
    }
  };

  const handleExport = () => {
    exportToCSV(sortedRows, `${fileName}_filtered.csv`);
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg space-y-4">
      {/* Top Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-300">
            Showing{' '}
            <span className="font-semibold text-white">
              {rows.length === 0 ? 0 : (startIdx + 1).toLocaleString()}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-white">
              {Math.min(startIdx + pageSize, sortedRows.length).toLocaleString()}
            </span>{' '}
            of <span className="font-semibold text-white">{sortedRows.length.toLocaleString()}</span> entries
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Column Visibility Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Columns ({visibleColumns.length}/{columns.length})</span>
            </button>

            {showColPicker && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 z-30 max-h-60 overflow-y-auto">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Toggle Columns
                </div>
                {columns.map((c) => (
                  <label
                    key={c.name}
                    className="flex items-center gap-2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(c.name)}
                      onChange={() => toggleColumn(c.name)}
                      className="accent-indigo-500 rounded"
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-slate-700/80 rounded-lg max-h-[550px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-900 sticky top-0 z-10">
            <tr className="border-b border-slate-700">
              <th className="py-2.5 px-3 font-semibold text-slate-400 w-12 text-center">#</th>
              {columns
                .filter((c) => visibleColumns.includes(c.name))
                .map((c) => {
                  const isSorted = sortCol === c.name;
                  return (
                    <th
                      key={c.name}
                      onClick={() => handleSort(c.name)}
                      className="py-2.5 px-3 font-semibold text-slate-300 hover:text-white cursor-pointer select-none transition group"
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate">{c.name}</span>
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-indigo-400" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>
                  );
                })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {currentRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="py-8 text-center text-slate-400"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              currentRows.map((row, rIdx) => (
                <tr key={startIdx + rIdx} className="hover:bg-slate-800/50 transition">
                  <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                    {startIdx + rIdx + 1}
                  </td>
                  {columns
                    .filter((c) => visibleColumns.includes(c.name))
                    .map((c) => {
                      const val = row[c.name];
                      const isNull = val === null || val === undefined || val === '';

                      return (
                        <td
                          key={c.name}
                          className="py-2 px-3 text-slate-200 font-mono text-xs whitespace-nowrap"
                        >
                          {isNull ? (
                            <span className="text-slate-500 italic">null</span>
                          ) : typeof val === 'boolean' ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                val
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {String(val)}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="text-xs text-slate-400">
          Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
          <span className="font-semibold text-white">{totalPages}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

