import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { PuppyPawLogo } from './PuppyPawLogo';
import { Bell, Building2, User, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
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
    <header className="h-16 border-b border-stone-800/80 bg-stone-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Tenant Indicator */}
      <div className="flex items-center space-x-4">
        <PuppyPawLogo size="md" />
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-stone-850/80 rounded-full border border-stone-700/60 text-xs text-stone-300">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-white">{tenant?.name || 'Apex Veterinary Emergency'}</span>
          <span className="text-amber-400/80 font-mono text-[10px]">({tenant?.license_number || 'VET-LIC-884920'})</span>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center space-x-4">
        {/* Role Switcher Demo Control */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-amber-950/60 border border-amber-600/40 rounded-lg text-xs text-amber-300 hover:bg-amber-900/60 transition shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-medium">Active Role: {user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-amber-500/30 rounded-xl shadow-2xl z-50 py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90 border-b border-stone-800 pb-2 mb-1">
                Switch Role (Live RBAC Demo)
              </div>
              {roles.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-stone-800 flex items-center justify-between ${
                    user?.role === r.role ? 'text-amber-300 font-bold bg-amber-950/40' : 'text-stone-300'
                  }`}
                >
                  <span>{r.label}</span>
                  {user?.role === r.role && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 hover:text-amber-300 transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* User Avatar & Logout */}
        <div className="flex items-center space-x-3 border-l border-stone-800 pl-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-700 flex items-center justify-center text-stone-950 font-black text-xs shadow-md">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.full_name}</p>
            <p className="text-[10px] text-stone-400 leading-tight">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
