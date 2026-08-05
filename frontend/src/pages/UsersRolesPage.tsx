import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Shield, UserCheck } from 'lucide-react';
import { User, UserRole } from '../types';

export const UsersRolesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => {
        if (res.data.success) setUsers(res.data.users);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await api.patch(`/users/${userId}`, { role: newRole });
      if (res.data.success) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const roles: UserRole[] = ['COMPLIANCE_OFFICER', 'CONTROL_OWNER', 'AUDITOR', 'EXECUTIVE_REVIEWER', 'CLINICAL_STAFF'];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-cyan-400" />
          <span>User Management, Scope Provisioning & Permission Matrix</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Role-Aware Access Control (RBAC) across 5 primary roles: Compliance Officer, Control Owner, Auditor, Executive Reviewer, and Clinical Staff.
        </p>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Full Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Assigned RBAC Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-cyan-400">Loading user matrix...</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <span>{u.full_name}</span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono font-semibold focus:border-cyan-500 focus:outline-none"
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        ACTIVE
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {u.is_active ? 'Online Now' : 'Recent'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix Reference */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Role Permission Capabilities Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Clinical Ingestion</th>
                <th className="py-2 px-3">Human AI Review</th>
                <th className="py-2 px-3">Risk Escalation</th>
                <th className="py-2 px-3">Audit Pack Export</th>
                <th className="py-2 px-3">RBAC Provisioning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-400">COMPLIANCE_OFFICER</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Full (Accept/Override)</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Full (PDF/JSON)</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Admin</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-sky-400">CONTROL_OWNER</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Review Assigned</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Manage Assigned</td>
                <td className="py-2.5 px-3 text-slate-500">✗ Read Only</td>
                <td className="py-2.5 px-3 text-slate-500">✗ Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-400">AUDITOR</td>
                <td className="py-2.5 px-3 text-slate-500">✗ View Only</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Spot Check Audit</td>
                <td className="py-2.5 px-3 text-slate-500">✗ View Only</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Full Export</td>
                <td className="py-2.5 px-3 text-slate-500">✗ Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-purple-400">EXECUTIVE_REVIEWER</td>
                <td className="py-2.5 px-3 text-slate-500">✗ View Only</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Executive Sign-off</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Sealed PDF</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Admin</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-400">CLINICAL_STAFF</td>
                <td className="py-2.5 px-3 text-emerald-400">✓ Upload Only</td>
                <td className="py-2.5 px-3 text-slate-500">✗ Restricted</td>
                <td className="py-2.5 px-3 text-slate-500">✗ Restricted</td>
                <td className="py-2.5 px-3 text-slate-500">✗ Restricted</td>
                <td className="py-2.5 px-3 text-slate-500">✗ Restricted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
