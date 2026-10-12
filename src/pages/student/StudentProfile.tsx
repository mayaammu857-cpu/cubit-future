import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Layers,
  Calendar,
  MapPin,
  Heart,
  ShieldCheck,
  Edit3,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { studentApi } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const StudentProfile: React.FC = () => {
  const { student, refreshStudentData } = useAuth();
  const { addNotification } = useNotifications();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    bloodGroup: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        phone: student.phone || '',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        address: student.address || '',
        bloodGroup: student.bloodGroup || 'B+',
        dateOfBirth: student.dateOfBirth || '',
      });
    }
  }, [student]);

  const handleOpenEdit = () => {
    if (student) {
      setFormData({
        phone: student.phone || '',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        address: student.address || '',
        bloodGroup: student.bloodGroup || 'B+',
        dateOfBirth: student.dateOfBirth || '',
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setSaving(true);
    try {
      const studentIdentifier = student.id || student.studentId;
      await studentApi.update(studentIdentifier, {
        phone: formData.phone.trim(),
        guardianName: formData.guardianName.trim(),
        guardianPhone: formData.guardianPhone.trim(),
        address: formData.address.trim(),
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
      });

      await refreshStudentData();
      addNotification('success', 'Contact and personal information updated successfully!');
      setIsEditModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update contact details.';
      addNotification('error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
            <User className="w-6 h-6 text-brand-orange" />
            My Student Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official academic enrollment record and registered academy credentials
          </p>
        </div>

        <button
          onClick={handleOpenEdit}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-[#FF7700] text-white text-xs font-bold shadow-md shadow-brand-orange/20 transition-all hover-lift self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" />
          <span>Update Contact Details</span>
        </button>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-dark to-brand-navy border-2 border-brand-orange/40 flex items-center justify-center text-3xl font-black text-brand-orange shadow-lg">
              {student?.name?.charAt(0) || 'A'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white ring-1 ring-emerald-300" />
          </div>

          <h2 className="text-xl font-bold text-brand-navy">{student?.name || 'Arjun Kumar'}</h2>
          <span className="inline-block px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/40 text-brand-orange font-extrabold text-xs tracking-wider my-2">
            {student?.studentId || 'CF-STU-0001'}
          </span>
          <p className="text-xs text-slate-500 font-medium mb-4">{student?.courseName || 'Enrolled Program'}</p>

          <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Account Status:</span>
            <Badge status={student?.status || 'ACTIVE'} type="studentStatus" />
          </div>
        </div>

        {/* Right Columns: Academic & Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Enrollment Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-brand-navy flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-brand-orange" />
              Academic &amp; Enrollment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Enrolled Course:</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand-orange" />
                  {student?.courseName || 'General Program'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Assigned Batch:</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-orange" />
                  {student?.batchName || 'Regular Batch'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Enrollment Date:</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-navy" />
                  {student?.enrollmentDate || '2026-01-15'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Attendance Record:</span>
                <span className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {student?.attendanceRate || 95}% Overall (High Standing)
                </span>
              </div>
            </div>
          </div>

          {/* Personal & Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <User className="w-5 h-5 text-brand-orange" />
                Contact &amp; Guardian Information
              </h3>
              <button
                onClick={handleOpenEdit}
                className="text-xs font-semibold text-brand-orange hover:text-[#E06000] flex items-center gap-1 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Registered Email:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  {student?.email || 'student@cubitfuture.com'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Student Phone / Mobile:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  {student?.phone || <span className="text-amber-600 italic">Not added yet</span>}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Guardian Name:</span>
                <span className="font-semibold text-slate-800">
                  {student?.guardianName || <span className="text-slate-400 italic">Self / Guardian</span>}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Guardian Contact Number:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  {student?.guardianPhone || <span className="text-slate-400 italic">Not specified</span>}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Date of Birth:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  {student?.dateOfBirth || '2002-05-15'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Blood Group:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  {student?.bloodGroup || 'B+'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block mb-1">Residential Address:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  {student?.address || 'Kerala, India'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Contact Details Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Contact & Personal Information"
        subtitle="Ensure your contact numbers and address are kept up-to-date for academy notices"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Phone / Mobile *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Guardian Full Name
              </label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Guardian Contact Phone
              </label>
              <input
                type="tel"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+91 98765 43211"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Kochi, Kerala"
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange focus:outline-none transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-orange hover:bg-[#FF7700] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-orange/20 disabled:opacity-60"
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
