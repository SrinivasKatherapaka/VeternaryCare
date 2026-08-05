import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { SystemNotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <Bell className="w-7 h-7 text-cyan-400" />
          <span>Real-time Alerting & Notification Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Severity-based notifications for overdue control tests, expired VCPRs, controlled drug log discrepancies, and low confidence evidence extractions.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-cyan-400 text-xs font-semibold">Loading alert center...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No active notifications.</div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`glass-panel rounded-xl p-5 border ${notif.is_read ? 'border-slate-800 bg-slate-900/40 opacity-70' : 'border-cyan-800/60 bg-slate-900/80'} shadow-lg flex items-start justify-between gap-4`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {notif.severity === 'CRITICAL' ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  ) : notif.severity === 'WARNING' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Info className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{notif.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {notif.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 shrink-0 transition"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
