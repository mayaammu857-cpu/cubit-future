import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  Layers,
  Phone,
  Mail,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { teachersApi, batchesApi } from '../../services/api';
import { Teacher, Batch } from '../../types';
import { Modal } from '../../components/common/Modal';

export const AdminTeachers: React.FC = () => {
  const { addNotification } = useNotifications();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Quantitative Aptitude');
  const [assignedBatches, setAssignedBatches] = useState<string[]>([]);
  const [password, setPassword] = useState('Teacher@2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, bRes] = await Promise.all([
        teachersApi.listTeachers(),
        batchesApi.getAll(),
      ]);
      setTeachers(tRes.teachers || []);
      setBatches(bRes || []);
    } catch {
      addNotification('error', 'Could not load faculty list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addNotification('warning', 'Please fill required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      let cleanEmail = email.trim();
      if (cleanEmail.includes('@')) {
        const afterAt = cleanEmail.split('@')[1];
        if (afterAt && !afterAt.includes('.')) {
          cleanEmail = `${cleanEmail}.com`;
        }
      }

      await teachersApi.createTeacher({
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        specialization,
        assignedBatches,
        password,
      });
      addNotification('success', `Faculty account for ${name} created successfully!`);
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      await fetchData();
    } catch (err: any) {
      let msg = 'Failed to create faculty member.';
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        msg = detail.map((d: any) => d.msg || d.message).join(' | ');
      } else if (typeof detail === 'string') {
        msg = detail;
      } else if (err?.message) {
        msg = err.message;
      }
      addNotification('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBatchAssignment = (bId: string) => {
    if (assignedBatches.includes(bId)) {
      setAssignedBatches(assignedBatches.filter((id) => id !== bId));
    } else {
      setAssignedBatches([...assignedBatches, bId]);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Faculty &amp; Teachers Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create teacher accounts, configure mentor credentials, and assign cohort batches
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] hover:from-[#E55F00] hover:to-[#EA7D29] text-white text-xs font-bold shadow-lg shadow-brand-orange/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#070E28] border border-[#162758] flex items-center justify-between">
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
          />
        </div>

        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          Total Faculty Members: {teachers.length}
        </span>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-3xl bg-[#070E28] border border-[#162758] flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-sm">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  {t.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{t.name}</h3>
                <p className="text-[11px] text-brand-orange font-medium mt-0.5">{t.specialization || 'Academic Faculty'}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{t.email}</span>
                </p>
                {t.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{t.phone}</span>
                  </p>
                )}
              </div>

              {/* Assigned Batches */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Cohort Batches:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {t.assignedBatches && t.assignedBatches.length > 0 ? (
                    t.assignedBatches.map((bId) => {
                      const bMatch = batches.find((b) => b.id === bId);
                      return (
                        <span
                          key={bId}
                          className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white"
                        >
                          {bMatch ? bMatch.name : bId}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-slate-500">No batches assigned yet</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[10px]">ID: {t.id}</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Full Teacher Access
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Faculty Member"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Faculty Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Prof. Sarah Mathews"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Email Address *</label>
              <input
                type="email"
                required
                placeholder="teacher@cubitfuture.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Mobile Phone</label>
              <input
                type="text"
                placeholder="+91 98222 33445"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Subject Specialization</label>
            <input
              type="text"
              placeholder="e.g. Quantitative Aptitude & Financial Reasoning"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Initial Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-orange font-mono"
            />
          </div>

          {/* Batch Assignment Selector */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
            <label className="block text-[11px] text-brand-orange font-bold uppercase tracking-wider">
              Assign Cohort Batches
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {batches.map((b) => {
                const isChecked = assignedBatches.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'bg-brand-orange/20 border-brand-orange/60 text-white font-bold'
                        : 'bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBatchAssignment(b.id)}
                      className="accent-[#FF9500]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold hover:bg-white/15 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] text-white text-xs font-bold shadow-md shadow-brand-orange/20 transition"
            >
              {isSubmitting ? 'Creating...' : 'Create Teacher Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTeachers;
