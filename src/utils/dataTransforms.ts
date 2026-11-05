import { ChartConfig, ColumnProfile, FilterState } from '../types';

/**
 * Filter dataset rows based on active FilterState
 */
export function applyFilters(
  rows: Record<string, any>[],
  filters: FilterState
): Record<string, any>[] {
  const { categoricals, numerics, searchQuery } = filters;
  const hasCatFilter = Object.values(categoricals).some(arr => arr.length > 0);
  const hasNumFilter = Object.keys(numerics).length > 0;
  const query = searchQuery.trim().toLowerCase();

  if (!hasCatFilter && !hasNumFilter && !query) {
    return rows;
  }

  return rows.filter((row) => {
    // 1. Text search
    if (query) {
      const match = Object.values(row).some(
        val => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      );
      if (!match) return false;
    }

    // 2. Categorical filters
    for (const [col, selectedVals] of Object.entries(categoricals)) {
      if (selectedVals.length > 0) {
        const val = String(row[col] ?? '');
        if (!selectedVals.includes(val)) {
          return false;
        }
      }
    }

    // 3. Numeric range filters
    for (const [col, range] of Object.entries(numerics)) {
      const val = Number(row[col]);
      if (isNaN(val) || val < range.min || val > range.max) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculates aggregate value for an array of numbers
 */
function aggregateValues(values: number[], method: ChartConfig['aggregation']): number {
  if (values.length === 0) return 0;

  switch (method) {
    case 'count':
      return values.length;
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'median': {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    default:
      return values.length;
  }
}

/**
 * Format large numbers for display
 */
export function formatMetricNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
  if (Number.isInteger(val)) return val.toLocaleString();
  return val.toFixed(2);
}

/**
 * Prepare data specifically for Recharts visualizations
 */
export function prepareChartData(
  rows: Record<string, any>[],
  config: ChartConfig,
  columnProfiles: ColumnProfile[]
): {
  data: any[];
  keys: string[];
  isSampled?: boolean;
} {
  const { xKey, yKey, groupKey, aggregation, type, bins } = config;
  const xProfile = columnProfiles.find(c => c.name === xKey);

  // --- SCATTER PLOT ---
  if (type === 'scatter') {
    // Intelligently sample if rows > 1500 to keep SVG snappy
    const MAX_POINTS = 1500;
    const isSampled = rows.length > MAX_POINTS;
    let sample = rows;

    if (isSampled) {
      const step = Math.ceil(rows.length / MAX_POINTS);
      sample = rows.filter((_, idx) => idx % step === 0).slice(0, MAX_POINTS);
    }

    const scatterData = sample
      .filter(r => r[xKey] !== null && r[yKey || ''] !== null)
      .map((r, i) => ({
        id: i,
        x: Number(r[xKey]),
        y: Number(r[yKey || '']),
        group: groupKey ? String(r[groupKey]) : 'All',
      }));

    return {
      data: scatterData,
      keys: ['x', 'y'],
      isSampled,
    };
  }

  // --- HISTOGRAM ON NUMERIC X ---
  if (xProfile?.type === 'numeric' && (!yKey || bins)) {
    const numBins = bins || 10;
    const values = rows.map(r => Number(r[xKey])).filter(v => !isNaN(v));
    if (values.length === 0) return { data: [], keys: ['count'] };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins || 1;

    const binBuckets = Array.from({ length: numBins }, (_, i) => {
      const bMin = min + i * binWidth;
      const bMax = i === numBins - 1 ? max : min + (i + 1) * binWidth;
      return {
        bin: `${bMin.toFixed(1)} - ${bMax.toFixed(1)}`,
        count: 0,
        bMin,
        bMax,
      };
    });

    for (const v of values) {
      const idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
      if (idx >= 0 && idx < numBins) {
        binBuckets[idx].count++;
      }
    }

    return {
      data: binBuckets,
      keys: ['count'],
    };
  }

  // --- PIE / DONUT CHART ---
  if (type === 'pie') {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const val = String(r[xKey] ?? 'Unknown');
      counts[val] = (counts[val] || 0) + 1;
    }

    let entries = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Group overflow into "Other" if > 8 items
    if (entries.length > 8) {
      const top7 = entries.slice(0, 7);
      const otherVal = entries.slice(7).reduce((acc, curr) => acc + curr.value, 0);
      entries = [...top7, { name: 'Other', value: otherVal }];
    }

    return {
      data: entries,
      keys: ['value'],
    };
  }

  // --- BAR / LINE / AREA / RADAR (Grouped & Aggregated) ---
  const groups: Record<string, Record<string, number[]>> = {};
  const allSubGroups = new Set<string>();

  for (const r of rows) {
    const xVal = String(r[xKey] ?? 'Unknown');
    const subGroup = groupKey ? String(r[groupKey] ?? 'Other') : 'value';
    allSubGroups.add(subGroup);

    if (!groups[xVal]) groups[xVal] = {};
    if (!groups[xVal][subGroup]) groups[xVal][subGroup] = [];

    const numVal = yKey ? Number(r[yKey]) : 1;
    if (!isNaN(numVal)) {
      groups[xVal][subGroup].push(numVal);
    }
  }

  const subGroupKeys = Array.from(allSubGroups);

  const data = Object.entries(groups).map(([xVal, subGroups]) => {
    const item: Record<string, any> = { [xKey]: xVal };

    for (const subKey of subGroupKeys) {
      const values = subGroups[subKey] || [];
      const agg = yKey ? aggregateValues(values, aggregation) : values.length;
      item[subKey] = Number(agg.toFixed(2));
    }

    return item;
  });

  // Sort descending by primary metric if not time
  if (subGroupKeys.length === 1) {
    data.sort((a, b) => (b[subGroupKeys[0]] || 0) - (a[subGroupKeys[0]] || 0));
  }

  // Limit categories to top 20 for legible chart
  const slicedData = data.slice(0, 20);

  return {
    data: slicedData,
    keys: subGroupKeys,
  };
}

/**
 * Trigger CSV file download in the browser
 */
export function exportToCSV(rows: Record<string, any>[], filename = 'export.csv') {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);

  const csvRows = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

