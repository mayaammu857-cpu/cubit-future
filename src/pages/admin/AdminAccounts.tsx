import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  UserPlus,
  KeyRound,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { adminAccountApi } from '../../services/api';
import { AdminAccount, Role } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const AdminAccounts: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: Role;
    permissions: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    permissions: ['students.manage', 'exams.manage'],
    status: 'ACTIVE',
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminAccountApi.getAll();
      setAdmins(data);
    } catch {
      addNotification('error', 'Failed to load administrative accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const q = search.toLowerCase();
      const matchQuery =
        !search ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone && a.phone.includes(q));
      const matchRole = !roleFilter || a.role === roleFilter;
      const matchStatus = !statusFilter || a.status === statusFilter;
      return matchQuery && matchRole && matchStatus;
    });
  }, [admins, search, roleFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'ADMIN',
      permissions: ['students.manage', 'exams.manage'],
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (adm: AdminAccount) => {
    setEditingAdmin(adm);
    setFormData({
      name: adm.name,
      email: adm.email,
      phone: adm.phone || '',
      role: adm.role,
      permissions: adm.permissions,
      status: adm.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingAdmin) {
        await adminAccountApi.update(editingAdmin.id, formData);
        addNotification('success', `Admin profile for ${formData.name} updated.`);
      } else {
        await adminAccountApi.create(formData);
        addNotification('success', `Authorized Admin account created for ${formData.email}.`);
      }
      setIsModalOpen(false);
      await fetchAdmins();
    } catch (err: any) {
      addNotification('error', err?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke and delete admin account for ${name}?`)) {
      try {
        await adminAccountApi.delete(id);
        addNotification('info', `Admin account for ${name} removed.`);
        await fetchAdmins();
      } catch {
        addNotification('error', 'Failed to delete account.');
      }
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      const res = await adminAccountApi.resetPassword(id);
      addNotification('success', res.message);
    } catch {
      addNotification('error', 'Failed to dispatch password reset.');
    }
  };

  const togglePermission = (perm: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter((p) => p !== perm) : [...prev.permissions, perm],
      };
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-orange" />
            Administrative Accounts Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized portal management personnel, security privileges & password governance
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-[#e55f00] text-white font-bold text-xs rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" /> Provision New Admin Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or contact..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Campus Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Admin Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-5">System Role</th>
                <th className="py-3.5 px-5">Permissions Scope</th>
                <th className="py-3.5 px-5">Last Login</th>
                <th className="py-3.5 px-5">Account Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading administrative accounts...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No administrative accounts found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {adm.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{adm.name}</p>
                          <p className="text-[11px] text-slate-500">{adm.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          adm.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {adm.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'CAMPUS ADMIN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {adm.permissions.map((p) => (
                          <span
                            key={p}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {adm.lastLogin || 'Never'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          adm.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            adm.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(adm.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Send Password Reset"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(adm)}
                          className="p-1.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {adm.email !== user?.email && (
                          <button
                            onClick={() => handleDelete(adm.id, adm.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Provisioning / Editing */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAdmin ? 'Edit Administrator Profile' : 'Provision New Administrator'}
        subtitle="Manage credential authority and RBAC permissions"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Staff Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Rajesh Pillai"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@cubitfuture.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 text-slate-800"
              >
                <option value="ADMIN">Campus Administrator</option>
                <option value="SUPER_ADMIN">Super Administrator (Full Root Authority)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40 text-slate-800"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Assigned Permissions</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'students.manage', label: 'Manage Students & Profiles' },
                { id: 'exams.manage', label: 'Manage Exams & Scorecards' },
                { id: 'batches.manage', label: 'Create & Edit Batches' },
                { id: 'reports.view', label: 'Export Reports & Analytics' },
                { id: 'google_sheets.sync', label: 'Trigger Google Sheets Sync' },
                { id: 'settings.manage', label: 'Configure System Settings' },
              ].map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(p.id)}
                    onChange={() => togglePermission(p.id)}
                    className="rounded text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-[11px] text-slate-700 font-medium">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-md shadow-brand-orange/20 transition disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingAdmin ? 'Update Account' : 'Provision Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
