export type DataType = 'numeric' | 'categorical' | 'boolean' | 'date' | 'id';

export interface ColumnProfile {
  name: string;
  type: DataType;
  totalCount: number;
  nullCount: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean)[];
  // Numeric stats
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  sum?: number;
  stdDev?: number;
  q1?: number;
  q3?: number;
  histogram?: { bin: string; count: number; min: number; max: number }[];
  // Categorical stats
  topValues?: { value: string; count: number; percentage: number }[];
}

export interface DatasetInsight {
  id: string;
  type: 'correlation' | 'distribution' | 'outlier' | 'summary' | 'group_diff';
  title: string;
  description: string;
  metric?: string;
  significance: 'high' | 'medium' | 'low';
  score?: number;
}

export interface CorrelationItem {
  colA: string;
  colB: string;
  correlation: number;
}

export interface Dataset {
  name: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
  rawRows: Record<string, any>[];
  correlations: CorrelationItem[];
  insights: DatasetInsight[];
}

export interface FilterState {
  categoricals: Record<string, string[]>; // colName -> selected values
  numerics: Record<string, { min: number; max: number }>; // colName -> range
  searchQuery: string;
}

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar';
export type AggregationType = 'count' | 'avg' | 'sum' | 'min' | 'max' | 'median';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  xKey: string;
  yKey?: string;
  groupKey?: string;
  aggregation: AggregationType;
  bins?: number;
  description?: string;
}

export type AppTab = 'powerbi' | 'story' | 'simulator' | 'overview' | 'builder' | 'statistics' | 'table' | 'guide';


