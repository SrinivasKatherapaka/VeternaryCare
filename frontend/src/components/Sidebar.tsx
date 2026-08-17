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
        { to: '/dashboard', label: '1. Executive Command', icon: LayoutDashboard },
        { to: '/clinical', label: '2. Clinical Operations', icon: Stethoscope },
        { to: '/controls', label: '3. Control Library', icon: FileCheck },
        { to: '/evidence-mapping', label: '4. AI Evidence Ingestion', icon: FileText }
      ]
    },
    {
      title: 'RISK & LINEAGE',
      items: [
        { to: '/control-gaps', label: '5. Control Gap Engine', icon: AlertTriangle },
        { to: '/risks-issues', label: '6. Risk Register', icon: ShieldAlert },
        { to: '/decision-history', label: '7. Decision Lineage', icon: History },
        { to: '/audit-packs', label: '8. Audit Pack Exporter', icon: PackageCheck }
      ]
    },
    {
      title: 'INTELLIGENCE & ADMIN',
      items: [
        { to: '/notifications', label: '9. Alerting & Escalation', icon: Bell },
        { to: '/reports-analytics', label: '10. AI Observability', icon: BarChart3 },
        { to: '/users-roles', label: '11. RBAC Matrix', icon: Users },
        { to: '/audit-logs-settings', label: '12. Master Settings', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="py-4 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="px-3">
            <div className="px-3 mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
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
                        ? 'bg-gradient-to-r from-cyan-600/30 to-sky-600/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
      <div className="p-3.5 border-t border-slate-800/80 m-3 bg-slate-950/60 rounded-xl">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Regulatory Standards</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {['AAHA', 'DEA II-V', 'OSHA', 'VCPR', 'State Board'].map(badge => (
            <span key={badge} className="px-1.5 py-0.5 text-[8px] bg-slate-800/80 text-cyan-300 rounded font-mono border border-slate-700">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};
