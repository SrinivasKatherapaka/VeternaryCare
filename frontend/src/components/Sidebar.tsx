import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  FileCheck,
  FileText,
  AlertTriangle,
  ShieldAlert,
  History,
  PackageCheck,
  Bell,
  BarChart3,
  Users,
  Sliders
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { to: '/dashboard', label: 'Executive Command', icon: LayoutDashboard },
        { to: '/clinical', label: 'Clinical Operations', icon: Stethoscope },
        { to: '/controls', label: 'Control Library', icon: FileCheck },
        { to: '/evidence-mapping', label: 'AI Evidence Ingestion', icon: FileText }
      ]
    },
    {
      title: 'RISK & LINEAGE',
      items: [
        { to: '/control-gaps', label: 'Control Gap Engine', icon: AlertTriangle },
        { to: '/risks-issues', label: 'Risk Register', icon: ShieldAlert },
        { to: '/decision-history', label: 'Decision Lineage', icon: History },
        { to: '/audit-packs', label: 'Audit Pack Exporter', icon: PackageCheck }
      ]
    },
    {
      title: 'INTELLIGENCE & ADMIN',
      items: [
        { to: '/notifications', label: 'Alerting & Escalation', icon: Bell },
        { to: '/reports-analytics', label: 'AI Observability', icon: BarChart3 },
        { to: '/users-roles', label: 'RBAC Matrix', icon: Users },
        { to: '/audit-logs-settings', label: 'Master Settings', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-stone-800/80 bg-stone-900/70 backdrop-blur-md flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="py-4 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="px-3">
            <div className="px-3 mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-500/80">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/10 text-amber-300 border border-amber-500/40 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'text-stone-400 hover:text-amber-200 hover:bg-stone-800/60'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Compliance Badge Footer */}
      <div className="p-3.5 border-t border-stone-800/80 m-3 bg-stone-950/80 rounded-xl border border-amber-500/10">
        <p className="text-[9px] text-amber-400/90 font-bold uppercase tracking-wider">Regulatory Standards</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {['AAHA', 'DEA II-V', 'OSHA', 'VCPR', 'State Board'].map(badge => (
            <span key={badge} className="px-1.5 py-0.5 text-[8px] bg-stone-800/90 text-amber-300 rounded font-mono border border-amber-500/20">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};
