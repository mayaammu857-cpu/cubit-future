import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Layers,
  GraduationCap,
  CheckCircle,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { counsellorApi, batchApi } from '../../services/api';
import { Counsellor, Batch } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';

export const CounsellorManagement: React.FC = () => {
  const { addNotification } = useNotifications();

  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState<Counsellor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    assignedBatches: [] as string[],
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cnsData, batchData] = await Promise.all([
        counsellorApi.getAll(),
        batchApi.getAll(),
      ]);
      setCounsellors(cnsData);
      setBatches(batchData);
    } catch {
      addNotification('error', 'Failed to load counsellor roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCounsellors = useMemo(() => {
    return counsellors.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [counsellors, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingCounsellor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      assignedBatches: [],
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cns: Counsellor) => {
    setEditingCounsellor(cns);
    setFormData({
      name: cns.name,
      email: cns.email,
      phone: cns.phone,
      assignedBatches: cns.assignedBatches,
      status: cns.status,
    });
    setIsModalOpen(true);
  };

  const toggleBatch = (batchId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedBatches.includes(batchId);
      return {
        ...prev,
        assignedBatches: exists
          ? prev.assignedBatches.filter((b) => b !== batchId)
          : [...prev.assignedBatches, batchId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCounsellor) {
        await counsellorApi.update(editingCounsellor.id, formData);
        addNotification('success', `Counsellor profile for ${formData.name} updated.`);
      } else {
        await counsellorApi.create(formData);
        addNotification('success', `Counsellor ${formData.name} successfully registered.`);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      addNotification('error', err?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove counsellor record for ${name}?`)) {
      try {
        await counsellorApi.delete(id);
        addNotification('info', `Counsellor ${name} deleted.`);
        await fetchData();
      } catch {
        addNotification('error', 'Failed to remove counsellor.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-brand-orange" />
            Counsellor & Academic Mentor Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign student cohorts, track counseling load, and manage role-specific counseling privileges
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-[#e55f00] text-white font-bold text-xs rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" /> Add Academic Counsellor
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
            placeholder="Search counsellor name, email, or mobile..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
          />
        </div>

        <div className="w-full md:w-auto">
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

      {/* Counsellors Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Counsellor</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Allocated Batches</th>
                <th className="py-3.5 px-5">Mentored Students</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading counsellor directory...
                  </td>
                </tr>
              ) : filteredCounsellors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No counsellors found.
                  </td>
                </tr>
              ) : (
                filteredCounsellors.map((cns) => {
                  const assignedBatchNames = batches
                    .filter((b) => cns.assignedBatches.includes(b.id))
                    .map((b) => b.name);

                  return (
                    <tr key={cns.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs shadow-sm">
                            {cns.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{cns.name}</p>
                            <p className="text-[11px] text-slate-400">Enrolled {cns.createdAt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="font-medium text-slate-800">{cns.email}</p>
                        <p className="text-[11px] text-slate-500">{cns.phone}</p>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {assignedBatchNames.length > 0 ? (
                            assignedBatchNames.map((name) => (
                              <span
                                key={name}
                                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                              >
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No batches assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-brand-navy">
                        {cns.assignedStudentCount || 0} Students
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            cns.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cns.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {cns.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(cns)}
                            className="p-1.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition"
                            title="Edit Counsellor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cns.id, cns.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Counsellor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Provisioning / Editing Counsellor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCounsellor ? 'Edit Counsellor Profile' : 'Add Academic Counsellor'}
        subtitle="Configure mentorship scope and batch assignment"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Counsellor Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="counsellor@cubitfuture.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98222 33445"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Assigned Batches (Select Student Cohorts)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-48 overflow-y-auto p-1">
              {batches.map((b) => (
                <label
                  key={b.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedBatches.includes(b.id)}
                    onChange={() => toggleBatch(b.id)}
                    className="rounded text-brand-orange focus:ring-brand-orange"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">{b.name}</span>
                    <span className="text-[10px] text-slate-400">{b.courseName}</span>
                  </div>
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
              {actionLoading ? 'Saving...' : editingCounsellor ? 'Update Counsellor' : 'Create Counsellor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
