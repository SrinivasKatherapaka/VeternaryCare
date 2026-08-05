import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, Bell, Building2, User, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, tenant, logout, switchRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const roles: { role: UserRole; label: string }[] = [
    { role: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
    { role: 'CONTROL_OWNER', label: 'Control Owner' },
    { role: 'AUDITOR', label: 'Auditor' },
    { role: 'EXECUTIVE_REVIEWER', label: 'Executive Reviewer' },
    { role: 'CLINICAL_STAFF', label: 'Clinical Staff' }
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Tenant Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-cyan-400 font-extrabold text-lg tracking-tight">
          <ShieldCheck className="w-7 h-7 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            VET-COMPLIANCE AI
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/60 text-xs text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">{tenant?.name || 'Apex Veterinary Emergency'}</span>
          <span className="text-slate-400 font-mono text-[10px]">({tenant?.license_number || 'VET-LIC-884920'})</span>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center space-x-4">
        {/* Role Switcher Demo Control */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-950/60 border border-cyan-700/50 rounded-lg text-xs text-cyan-300 hover:bg-cyan-900/60 transition"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-medium">Active Role: {user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-1">
                Switch Role (Live RBAC Demo)
              </div>
              {roles.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center justify-between ${user?.role === r.role ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-300'}`}
                >
                  <span>{r.label}</span>
                  {user?.role === r.role && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* User Avatar & Logout */}
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
