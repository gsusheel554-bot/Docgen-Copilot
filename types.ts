
export interface Asset {
  id: string;
  name: string;
  type: 'Equity' | 'Fixed Income' | 'Real Estate' | 'Private Equity';
  value: number;
  change24h: number;
  changeQuarter: number;
  riskProfile: 'Low' | 'Medium' | 'High';
  performanceData: { month: string; value: number }[];
}

export interface Metric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  confidence: 'Strong' | 'Incomplete';
  source: string;
}

export interface Risk {
  impact: 'High' | 'Medium' | 'Low';
  description: string;
  mitigation: string;
}

export interface BulletPoint {
  text: string;
  sourceSnippet: string;
  pageNumber: number;
}

export interface ExecutiveSummary {
  bullets: BulletPoint[];
  metrics: Metric[];
  risks: Risk[];
  sourceReference: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any; // For tables or charts
  sources?: string[];
}

export type AppView = 'drafting' | 'copilot' | 'dashboard';
