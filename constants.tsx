
import { Asset } from './types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'Vanguard Global Equity',
    type: 'Equity',
    value: 12500000,
    change24h: 1.2,
    changeQuarter: -4.5,
    riskProfile: 'Medium',
    performanceData: [
      { month: 'Jan', value: 12000000 },
      { month: 'Feb', value: 12200000 },
      { month: 'Mar', value: 12500000 },
      { month: 'Apr', value: 12300000 },
      { month: 'May', value: 12100000 },
      { month: 'Jun', value: 12500000 },
    ]
  },
  {
    id: '2',
    name: 'BlackRock Core Bond',
    type: 'Fixed Income',
    value: 8400000,
    change24h: -0.1,
    changeQuarter: 2.1,
    riskProfile: 'Low',
    performanceData: [
      { month: 'Jan', value: 8100000 },
      { month: 'Feb', value: 8200000 },
      { month: 'Mar', value: 8250000 },
      { month: 'Apr', value: 8300000 },
      { month: 'May', value: 8350000 },
      { month: 'Jun', value: 8400000 },
    ]
  },
  {
    id: '3',
    name: 'Manhattan Commercial REIT',
    type: 'Real Estate',
    value: 25000000,
    change24h: -0.5,
    changeQuarter: -12.4,
    riskProfile: 'High',
    performanceData: [
      { month: 'Jan', value: 28000000 },
      { month: 'Feb', value: 27500000 },
      { month: 'Mar', value: 27000000 },
      { month: 'Apr', value: 26500000 },
      { month: 'May', value: 26000000 },
      { month: 'Jun', value: 25000000 },
    ]
  }
];

export const ICONS = {
  Document: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Chat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
};
