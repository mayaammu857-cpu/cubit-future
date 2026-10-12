import React from 'react';
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
  Award,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';

export const StudentProfile: React.FC = () => {
  const { student } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
          <User className="w-6 h-6 text-brand-orange" />
          My Student Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official academic enrollment record and registered academy credentials
        </p>
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
          <p className="text-xs text-slate-500 font-medium mb-4">{student?.courseName}</p>

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
              Academic & Enrollment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Enrolled Course:</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand-orange" />
                  {student?.courseName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Assigned Batch:</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-orange" />
                  {student?.batchName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Enrollment Date:</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-navy" />
                  {student?.enrollmentDate}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Attendance Record:</span>
                <span className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {student?.attendanceRate || 94}% Overall (High Standing)
                </span>
              </div>
            </div>
          </div>

          {/* Personal & Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-brand-navy flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-brand-orange" />
              Contact & Guardian Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Registered Email:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {student?.email}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Student Phone:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {student?.phone}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Guardian Name:</span>
                <span className="font-semibold text-slate-800">
                  {student?.guardianName || 'Ramesh Kumar'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Guardian Phone:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {student?.guardianPhone || '+91 98765 43211'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block mb-1">Residential Address:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  {student?.address || 'Flat 402, Green Valley Enclave, Bengaluru, KA'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
