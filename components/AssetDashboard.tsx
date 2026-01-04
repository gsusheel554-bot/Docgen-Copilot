
import React from 'react';
import { MOCK_ASSETS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AssetDashboard: React.FC = () => {
  const chartData = MOCK_ASSETS.map(a => ({
    name: a.name.split(' ')[0],
    value: a.changeQuarter
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Institutional Dashboard</h2>
        <p className="text-slate-500 mt-1">Real-time overview of aggregated asset performance and risk.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assets Under Management</p>
          <p className="text-3xl font-bold text-slate-900">$45.9M</p>
          <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
            <span>↑ 4.2% from last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Drafts</p>
          <p className="text-3xl font-bold text-slate-900">12</p>
          <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
            <span>3 pending review</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Weighted Avg</p>
          <p className="text-3xl font-bold text-slate-900">Med-Low</p>
          <div className="mt-4 flex items-center text-amber-600 text-sm font-medium">
            <span>Stable volatility</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex justify-between items-center">
            Quarterly Asset Shift (%)
            <span className="text-xs font-normal text-slate-400">By Asset Class</span>
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                 cursor={{fill: '#f8fafc'}}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Asset Inventory</h3>
          <div className="space-y-4">
            {MOCK_ASSETS.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${asset.type === 'Equity' ? 'bg-blue-500' : asset.type === 'Fixed Income' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    {asset.type[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{asset.name}</h4>
                    <p className="text-xs text-slate-400">{asset.type} • Risk: {asset.riskProfile}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${(asset.value / 1000000).toFixed(1)}M</p>
                  <p className={`text-xs font-medium ${asset.changeQuarter < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {asset.changeQuarter}% Q/Q
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;
