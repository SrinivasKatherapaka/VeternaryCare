import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bell, CheckCircle, AlertTriangle, Info, ArrowRight, ShieldAlert, Filter, Sparkles, Send } from 'lucide-react';
import { SystemNotification } from '../types';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [testTitle, setTestTitle] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testSeverity, setTestSeverity] = useState('HIGH');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/notifications')
      .then(res => {
        if (res.data.success) setNotifications(res.data.notifications);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTestAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/notifications', {
        title: testTitle,
        message: testMessage,
        severity: testSeverity,
        category: 'MANUAL_ESCALATION',
        escalation_tier: 'TIER_3_OFFICER',
        action_url: '/dashboard'
      });
      setShowBroadcastModal(false);
      setTestTitle('');
      setTestMessage('');
      fetchNotifications();
    } catch (err) {
      console.error('Error sending alert', err);
    }
  };

  const filtered = severityFilter
    ? notifications.filter(n => n.severity === severityFilter)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const criticalCount = notifications.filter(n => n.severity === 'CRITICAL').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Pillar 8: Real-time Alerting & Escalation System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Alert Center & Multi-Tier Escalations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Real-time regulatory alerts triggering automated technician &rarr; DVM &rarr; compliance officer escalation paths for low-confidence AI extractions, controlled substance safe discrepancies, and expiring VCPRs.
          </p>
        </div>

        <button
          onClick={() => setShowBroadcastModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch Test Alert</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Unread Alerts</p>
            <p className="text-2xl font-bold text-cyan-400 mt-0.5">{unreadCount}</p>
            <p className="text-[10px] text-slate-400">Real-time alerts active</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Critical Incidents</p>
            <p className="text-2xl font-bold text-rose-400 mt-0.5">{criticalCount}</p>
            <p className="text-[10px] text-rose-300">Tier 3 Officer Escalations</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Escalation SLA</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">&lt; 15 min</p>
            <p className="text-[10px] text-slate-400">Automated notification SLA</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filter by Severity:</span>
        </div>

        <div className="flex gap-2">
          {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                severityFilter === sev
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sev === '' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Loading alert center...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center border border-slate-800 bg-slate-900/60">
            <p className="text-emerald-400 font-bold text-sm">🎉 No Active Alerts</p>
            <p className="text-xs text-slate-400 mt-1">All compliance alerts have been resolved or acknowledged.</p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              className={`glass-panel rounded-2xl p-5 border transition ${
                notif.is_read
                  ? 'border-slate-800 bg-slate-900/40 opacity-75'
                  : notif.severity === 'CRITICAL'
                  ? 'border-rose-500/50 bg-rose-950/20 shadow-lg shadow-rose-500/5'
                  : notif.severity === 'HIGH'
                  ? 'border-amber-500/50 bg-amber-950/20 shadow-lg shadow-amber-500/5'
                  : 'border-cyan-800/60 bg-slate-900/80 shadow-lg'
              } flex flex-col md:flex-row items-start justify-between gap-4`}
            >
              <div className="flex items-start space-x-3.5 flex-1">
                <div className="mt-1">
                  {notif.severity === 'CRITICAL' ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                  ) : notif.severity === 'HIGH' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Info className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{notif.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {notif.category}
                    </span>
                    {notif.escalation_tier && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {notif.escalation_tier}
                      </span>
                    )}
                    {!notif.is_read && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-900 text-rose-200">
                        NEW UNREAD
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">
                    Logged: {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {notif.action_url && (
                  <button
                    onClick={() => navigate(notif.action_url!)}
                    className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold rounded-lg border border-cyan-500/40 transition flex items-center gap-1"
                  >
                    <span>Inspect Target</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                  >
                    Mark Acknowledged
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Test Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Dispatch Regulatory Compliance Alert</span>
              </h2>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleSendTestAlert} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unannounced DEA Audit Notice"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Severity Level</label>
                <select
                  value={testSeverity}
                  onChange={(e) => setTestSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Tier 3 Compliance Officer)</option>
                  <option value="HIGH">HIGH (Tier 2 Attending DVM)</option>
                  <option value="MEDIUM">MEDIUM (Tier 1 Veterinary Tech)</option>
                  <option value="LOW">LOW (Informational)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe compliance issue, affected drug/control, or inspection directive..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
