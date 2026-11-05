import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParseResult {
  fileName: string;
  fileSize: number;
  data: Record<string, any>[];
  fields: string[];
  sheetNames?: string[];
}

export interface ParseOptions {
  sheetName?: string;
  onProgress?: (percent: number) => void;
}

/**
 * Coerces string values into proper primitives (number, boolean, date, null)
 */
export function cleanAndCoerceRow(row: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, rawVal] of Object.entries(row)) {
    if (key === undefined || key === null || key.trim() === '') continue;
    const cleanKey = key.trim();

    if (rawVal === null || rawVal === undefined || rawVal === '' || rawVal === 'NA' || rawVal === 'N/A' || rawVal === 'null') {
      cleaned[cleanKey] = null;
      continue;
    }

    if (typeof rawVal === 'number' || typeof rawVal === 'boolean') {
      cleaned[cleanKey] = rawVal;
      continue;
    }

    const strVal = String(rawVal).trim();

    // Check boolean
    const lower = strVal.toLowerCase();
    if (lower === 'true') {
      cleaned[cleanKey] = true;
      continue;
    }
    if (lower === 'false') {
      cleaned[cleanKey] = false;
      continue;
    }

    // Check pure number
    if (/^-?\d+(\.\d+)?$/.test(strVal)) {
      const num = Number(strVal);
      if (!isNaN(num)) {
        cleaned[cleanKey] = num;
        continue;
      }
    }

    // Standard string
    cleaned[cleanKey] = strVal;
  }

  return cleaned;
}

/**
 * Parse CSV / TSV file
 */
export function parseCSVFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const totalSize = file.size;

    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      worker: true,
      chunk: (_results, parser) => {
        // approximate progress
        if (onProgress && (parser as any).streamer?.cursor) {
          const cursor = (parser as any).streamer.cursor;
          const pct = Math.min(99, Math.round((cursor / totalSize) * 100));
          onProgress(pct);
        }
      },
      complete: (results) => {
        if (onProgress) onProgress(100);
        const rows = results.data.map(cleanAndCoerceRow);
        const fields = results.meta.fields?.map(f => f.trim()).filter(Boolean) || 
          (rows.length > 0 ? Object.keys(rows[0]) : []);

        resolve({
          fileName: file.name,
          fileSize: file.size,
          data: rows,
          fields,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parse CSV from URL/Fetch (e.g. sample dataset)
 */
export async function parseCSVUrl(
  url: string,
  fileName = 'dataset.csv',
  onProgress?: (percent: number) => void
): Promise<ParseResult> {
  if (onProgress) onProgress(10);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load dataset: ${response.statusText}`);
  if (onProgress) onProgress(40);
  const text = await response.text();
  if (onProgress) onProgress(70);

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        if (onProgress) onProgress(100);
        const rows = results.data.map(cleanAndCoerceRow);
        const fields = results.meta.fields?.map(f => f.trim()).filter(Boolean) || 
          (rows.length > 0 ? Object.keys(rows[0]) : []);

        resolve({
          fileName,
          fileSize: new Blob([text]).size,
          data: rows,
          fields,
        });
      },
      error: (err: any) => reject(err),
    });
  });
}

/**
 * Parse Excel file (.xlsx, .xls)
 */
export async function parseExcelFile(
  file: File,
  sheetName?: string,
  onProgress?: (percent: number) => void
): Promise<ParseResult> {
  if (onProgress) onProgress(20);
  const buffer = await file.arrayBuffer();
  if (onProgress) onProgress(50);

  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const targetSheetName = sheetName && sheetNames.includes(sheetName) ? sheetName : sheetNames[0];
  const worksheet = workbook.Sheets[targetSheetName];

  if (onProgress) onProgress(80);
  const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });
  const rows = rawJson.map(cleanAndCoerceRow);
  const fields = rows.length > 0 ? Object.keys(rows[0]) : [];

  if (onProgress) onProgress(100);

  return {
    fileName: file.name,
    fileSize: file.size,
    data: rows,
    fields,
    sheetNames,
  };
}

/**
 * Universal file parser router
 */
export async function parseAnyFile(
  file: File,
  options?: ParseOptions
): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file, options?.sheetName, options?.onProgress);
  } else {
    // csv, tsv, txt
    return parseCSVFile(file, options?.onProgress);
  }
}
