import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Sparkles, AlertTriangle, Loader2, X } from 'lucide-react';
import { parseAnyFile, parseCSVUrl, ParseResult } from '../utils/fileParser';
import * as XLSX from 'xlsx';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (result: ParseResult) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Multi-sheet Excel handling
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!['csv', 'tsv', 'xlsx', 'xls', 'txt'].includes(ext || '')) {
      setError('Please upload a valid CSV (.csv) or Excel (.xlsx, .xls) file.');
      return;
    }

    // Check if Excel with multiple sheets
    if (ext === 'xlsx' || ext === 'xls') {
      try {
        setIsLoading(true);
        setLoadingStatus('Inspecting Excel workbook sheets...');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        if (workbook.SheetNames.length > 1) {
          setExcelFile(file);
          setAvailableSheets(workbook.SheetNames);
          setSelectedSheet(workbook.SheetNames[0]);
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        setError(`Failed to read Excel file: ${err.message}`);
        setIsLoading(false);
        return;
      }
    }

    // Process single file
    try {
      setIsLoading(true);
      setLoadingStatus(`Parsing ${file.name}...`);
      const result = await parseAnyFile(file, {
        onProgress: (p) => setLoadingProgress(p),
      });
      setIsLoading(false);
      onDataLoaded(result);
      onClose();
    } catch (err: any) {
      setError(`Failed to parse file: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleExcelSheetConfirm = async () => {
    if (!excelFile || !selectedSheet) return;
    try {
      setIsLoading(true);
      setLoadingStatus(`Loading sheet "${selectedSheet}"...`);
      const result = await parseAnyFile(excelFile, {
        sheetName: selectedSheet,
        onProgress: (p) => setLoadingProgress(p),
      });
      setIsLoading(false);
      setExcelFile(null);
      setAvailableSheets([]);
      onDataLoaded(result);
      onClose();
    } catch (err: any) {
      setError(`Failed to parse Excel sheet: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setError(null);
    setIsLoading(true);
    setLoadingStatus('Loading 100,000 record Student Lifestyle dataset...');
    setLoadingProgress(20);

    try {
      const result = await parseCSVUrl(
        '/student_lifestyle_100k.csv',
        'student_lifestyle_100k.csv',
        (p) => setLoadingProgress(p)
      );
      setIsLoading(false);
      onDataLoaded(result);
      onClose();
    } catch (err: any) {
      setError(`Failed to load sample dataset: ${err.message}`);
      setIsLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Upload Dataset
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload any CSV, TSV, or Excel (.xlsx, .xls) file to generate an instant dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Multi-Sheet Selector for Excel */}
        {availableSheets.length > 1 ? (
          <div className="space-y-4 my-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700">
            <h4 className="text-sm font-semibold text-white">Select Excel Worksheet</h4>
            <p className="text-xs text-slate-400">
              This Excel file contains multiple sheets. Please choose which one to analyze:
            </p>
            <div className="space-y-2">
              {availableSheets.map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    selectedSheet === s
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="excelSheet"
                    value={s}
                    checked={selectedSheet === s}
                    onChange={() => setSelectedSheet(s)}
                    className="accent-indigo-500"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setExcelFile(null);
                  setAvailableSheets([]);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleExcelSheetConfirm}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow"
              >
                Analyze Selected Sheet
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Drop Zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-indigo-500/50 bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.xlsx,.xls,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs text-slate-300 font-medium">{loadingStatus}</p>
                  <div className="w-48 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-200"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-500/20">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click to browse or drag & drop file here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports .CSV, .XLSX, .XLS, .TSV (handles up to 100k+ rows)
                  </p>
                </>
              )}
            </div>

            {/* Quick Sample Dataset Option */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">
                  Quick Demo Testing
                </span>
                <span className="text-[11px] text-slate-500">
                  Student Lifestyle & Depression dataset (100k rows)
                </span>
              </div>

              <button
                onClick={handleLoadSample}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample (100k)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

