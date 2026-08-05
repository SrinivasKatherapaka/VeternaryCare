import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ModelMetricsChart } from '../components/ModelMetricsChart';
import { BarChart3, Cpu, Activity, RefreshCw, AlertTriangle } from 'lucide-react';

export const ReportsAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/analytics')
      .then(res => {
        if (res.data.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-cyan-400 font-semibold text-xs">Loading AI Model Observability...</div>;
  }

  const { performance, latencyHistory, confidenceDistribution, overrideCategoryBreakdown } = data;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          <span>Observability & Model Performance Dashboard</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time AI metrics tracking Gemini 2.5 Pro / Flash latency, confidence distributions, reviewer override frequencies, and model drift.
        </p>
      </div>

      {/* Observability Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Acceptance Rate</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2 font-display">{performance.acceptanceRate}%</p>
          <p className="text-xs text-slate-400 mt-1">Accepted without reviewer override</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Human Override Rate</p>
          <p className="text-3xl font-extrabold text-rose-400 mt-2 font-display">{performance.overrideRate}%</p>
          <p className="text-xs text-slate-400 mt-1">Adjusted by compliance reviewer</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Inference Latency</p>
          <p className="text-3xl font-extrabold text-cyan-400 mt-2 font-display">{performance.avgLatencyMs} ms</p>
          <p className="text-xs text-slate-400 mt-1">p50 Server-side @google/genai call</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Drift Index</p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-2 font-display">{performance.driftIndex}</p>
          <p className="text-xs text-slate-400 mt-1">Well within safe operational threshold (&lt;0.15)</p>
        </div>
      </div>

      {/* Recharts Performance Visualizer */}
      <ModelMetricsChart
        latencyData={latencyHistory}
        confidenceData={confidenceDistribution}
      />

      {/* Override Category Analysis */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Reviewer Override Frequency & Root Cause Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overrideCategoryBreakdown.map((item: any) => (
            <div key={item.category} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                {item.category}
              </span>
              <p className="text-lg font-extrabold text-white mt-2">{item.count} Overrides</p>
              <p className="text-xs text-slate-400 font-semibold">Primary Rationale:</p>
              <p className="text-xs text-slate-300 italic">"{item.primaryReason}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
