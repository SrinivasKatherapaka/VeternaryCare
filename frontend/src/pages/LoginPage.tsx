import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PuppyPawLogo } from '../components/PuppyPawLogo';
import { Lock, UserCheck, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('officer@vetcare.org');
  const [loading, setLoading] = useState(false);

  const rolesPreset = [
    { email: 'officer@vetcare.org', title: 'Dr. Sarah Jenkins, DVM', role: 'Compliance Officer' },
    { email: 'owner@vetcare.org', title: 'Marcus Vance, LVT', role: 'Control Owner' },
    { email: 'auditor@vetcare.org', title: 'Elena Rostova, CPA/CISA', role: 'Auditor' },
    { email: 'exec@vetcare.org', title: 'Dr. Arthur Pendelton', role: 'Executive Reviewer' },
    { email: 'staff@vetcare.org', title: 'Rachel Torres, RVT', role: 'Clinical Staff' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl -top-40 -left-40 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -bottom-40 -right-40 pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-slate-800 bg-slate-900/80 shadow-2xl z-10">
        <div className="flex items-center justify-center mb-6">
          <PuppyPawLogo size="lg" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">User Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-lg text-xs font-bold transition shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Compliance Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Role Selectors for Evaluation */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            Instant Evaluation Roles (1-Click Login)
          </p>
          <div className="space-y-2">
            {rolesPreset.map(r => (
              <button
                key={r.email}
                onClick={async () => {
                  setEmail(r.email);
                  setLoading(true);
                  await login(r.email);
                  navigate('/dashboard');
                }}
                className="w-full p-2.5 bg-slate-950/80 hover:bg-slate-800/80 rounded-lg border border-slate-800 flex items-center justify-between text-left text-xs transition"
              >
                <div>
                  <p className="font-semibold text-white">{r.title}</p>
                  <p className="text-[10px] text-slate-400">{r.email}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                  {r.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
