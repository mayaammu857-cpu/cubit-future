import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Save,
  CheckCircle,
  XCircle,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { rolesPermissionsApi } from '../../services/api';
import { RolePermission } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

export const RolesPermissions: React.FC = () => {
  const { addNotification } = useNotifications();
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPerms = async () => {
      setLoading(true);
      try {
        const data = await rolesPermissionsApi.getAll();
        setPermissions(data);
      } finally {
        setLoading(false);
      }
    };
    fetchPerms();
  }, []);

  const handleToggle = (
    moduleKey: string,
    roleKey: 'admin' | 'counsellor' | 'student',
    action: 'view' | 'create' | 'edit' | 'export' | 'delete'
  ) => {
    setPermissions((prev) =>
      prev.map((item) => {
        if (item.module === moduleKey) {
          return {
            ...item,
            [roleKey]: {
              ...item[roleKey],
              [action]: !item[roleKey][action],
            },
          };
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await rolesPermissionsApi.saveAll(permissions);
      addNotification('success', 'Security permissions matrix saved & enforced across RBAC gateway.');
    } catch {
      addNotification('error', 'Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <Lock className="w-6 h-6 text-brand-orange" />
            Role-Based Access Control (RBAC) & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforce granular access boundaries for Super Admins, Campus Admins, Counsellors, and Students
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-[#e55f00] text-white font-bold text-xs rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Rules...' : 'Save Permissions Matrix'}
        </button>
      </div>

      {/* Permission Scope Notice */}
      <div className="p-4 bg-brand-navy text-white rounded-2xl border border-brand-orange/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-brand-orange flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold">Super Admin Root Privilege Rule</h4>
            <p className="text-[11px] text-slate-300">
              Super Admin retains immutable full permissions (View, Create, Edit, Export, Delete) across all modules.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-orange text-white">
          Root Enforced
        </span>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">System Module</th>
                <th className="py-3.5 px-5 text-center bg-purple-50/50">Super Admin</th>
                <th className="py-3.5 px-5 text-center bg-blue-50/50">Campus Admin</th>
                <th className="py-3.5 px-5 text-center bg-amber-50/50">Counsellor</th>
                <th className="py-3.5 px-5 text-center">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading security rules...
                  </td>
                </tr>
              ) : (
                permissions.map((p) => (
                  <tr key={p.module} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900">{p.moduleLabel}</p>
                      <p className="text-[11px] text-slate-400 font-mono">module: {p.module}</p>
                    </td>

                    {/* Super Admin (Immutable) */}
                    <td className="py-4 px-5 text-center bg-purple-50/30">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Full Access (V, C, E, X, D)
                      </span>
                    </td>

                    {/* Admin */}
                    <td className="py-4 px-5 text-center bg-blue-50/30">
                      <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
                        {(['view', 'create', 'edit', 'export', 'delete'] as const).map((act) => (
                          <button
                            key={act}
                            type="button"
                            onClick={() => handleToggle(p.module, 'admin', act)}
                            className={`px-1.5 py-0.5 rounded uppercase font-bold transition ${
                              p.admin[act]
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Toggle Admin ${act}`}
                          >
                            {act[0]}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Counsellor */}
                    <td className="py-4 px-5 text-center bg-amber-50/30">
                      <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
                        {(['view', 'create', 'edit', 'export', 'delete'] as const).map((act) => (
                          <button
                            key={act}
                            type="button"
                            onClick={() => handleToggle(p.module, 'counsellor', act)}
                            className={`px-1.5 py-0.5 rounded uppercase font-bold transition ${
                              p.counsellor[act]
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Toggle Counsellor ${act}`}
                          >
                            {act[0]}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Student */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
                        {(['view', 'create', 'edit', 'export', 'delete'] as const).map((act) => (
                          <button
                            key={act}
                            type="button"
                            onClick={() => handleToggle(p.module, 'student', act)}
                            className={`px-1.5 py-0.5 rounded uppercase font-bold transition ${
                              p.student[act]
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Toggle Student ${act}`}
                          >
                            {act[0]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
