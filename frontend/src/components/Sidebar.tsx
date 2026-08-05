import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  FileCheck,
  History,
  FileText,
  AlertTriangle,
  PackageCheck,
  BarChart3,
  Bell,
  Users,
  Sliders
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/controls', label: 'Control Library', icon: FileCheck },
    { to: '/evidence-mapping', label: 'Evidence Ingestion', icon: FileText },
    { to: '/control-gaps', label: 'Control Gaps', icon: AlertTriangle },
    { to: '/risks-issues', label: 'Risk Register', icon: ShieldAlert },
    { to: '/decision-history', label: 'Decision History', icon: History },
    { to: '/audit-packs', label: 'Audit Packs', icon: PackageCheck },
    { to: '/reports-analytics', label: 'AI Observability', icon: BarChart3 },
    { to: '/notifications', label: 'Alert Center', icon: Bell },
    { to: '/users-roles', label: 'User RBAC Matrix', icon: Users },
    { to: '/audit-logs-settings', label: 'Master Settings', icon: Sliders }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="py-4">
        <div className="px-6 mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>
        <nav className="space-y-1 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/30 to-sky-600/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Compliance Badge Footer */}
      <div className="p-4 border-t border-slate-800/80 m-3 bg-slate-950/40 rounded-xl">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Regulatory Standards</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {['AAHA', 'AVMA', 'DEA II-V', 'OSHA', 'VCPR'].map(badge => (
            <span key={badge} className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-cyan-300 rounded font-mono border border-slate-700">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};
