import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

interface Props {
  latencyData: any[];
  confidenceData: any[];
}

export const ModelMetricsChart: React.FC<Props> = ({ latencyData, confidenceData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Latency History Chart */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
          Gemini 2.5 Pro Inference Latency (ms)
        </h4>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={latencyData}>
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} unit="ms" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="p50_ms" stroke="#38bdf8" fillOpacity={1} fill="url(#latencyGrad)" name="p50 Latency (ms)" />
              <Area type="monotone" dataKey="p95_ms" stroke="#818cf8" fillOpacity={0.1} fill="#818cf8" name="p95 Latency (ms)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confidence Distribution Chart */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
          AI Extraction Confidence Score Distribution
        </h4>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} name="Documents Processed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
