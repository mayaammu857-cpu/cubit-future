import React, { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  CheckCircle,
  Printer,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { ReportType } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { studentApi, batchApi, courseApi } from '../../services/api';

export const ReportsPage: React.FC = () => {
  const { addNotification } = useNotifications();

  const [selectedReport, setSelectedReport] = useState<ReportType>('ENROLMENT');
  const [dateRange, setDateRange] = useState('30d');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [generating, setGenerating] = useState(false);

  const reportCatalog = [
    {
      id: 'ENROLMENT' as ReportType,
      title: 'Student Enrolment Ledger',
      desc: 'Chronological candidate onboarding volume, program distributions, and cohort intake statistics.',
      icon: Users,
    },
    {
      id: 'DIRECTORY' as ReportType,
      title: 'Complete Student Directory',
      desc: 'Comprehensive register of enrolled students, guardian contacts, emails, and address records.',
      icon: Users,
    },
    {
      id: 'EXAM_RESULTS' as ReportType,
      title: 'Examination Results Ledger',
      desc: 'Sectional marks, percentages, accuracy metrics, and percentile distributions across exam series.',
      icon: GraduationCap,
    },
    {
      id: 'COURSE_PERFORMANCE' as ReportType,
      title: 'Program Academic Performance',
      desc: 'Curriculum-wise benchmark averages, retention rates, and module pass percentages.',
      icon: Layers,
    },
    {
      id: 'BATCH_PERFORMANCE' as ReportType,
      title: 'Batch Performance Comparison',
      desc: 'Comparative evaluation between morning and evening cohorts with attendance telemetry.',
      icon: Layers,
    },
    {
      id: 'PASS_FAIL' as ReportType,
      title: 'Pass / Distinction / Remedial Audit',
      desc: 'Students qualifying above 80% honors threshold vs candidates requiring counseling support.',
      icon: CheckCircle,
    },
    {
      id: 'GOOGLE_SHEETS_SYNC' as ReportType,
      title: 'Google Sheets Ingestion Audit',
      desc: 'Spreadsheet connection health, last synchronization timestamps, and biometric ingestion logs.',
      icon: FileSpreadsheet,
    },
    {
      id: 'STAFF_ACCOUNTS' as ReportType,
      title: 'Faculty & Counsellor Roster',
      desc: 'Administrative access privileges, last login security telemetry, and batch mentorship scope.',
      icon: FileText,
    },
  ];

  const handleExportCSV = async () => {
    setGenerating(true);
    try {
      const students = await studentApi.getAll({ limit: 500 });
      let headers = ['Student ID', 'Name', 'Email', 'Phone', 'Course', 'Batch', 'Status', 'Attendance', 'Average Score'];
      let rows = students.data.map((s) => [
        s.studentId,
        `"${s.name}"`,
        s.email,
        s.phone,
        `"${s.courseName}"`,
        `"${s.batchName}"`,
        s.status,
        `${s.attendanceRate}%`,
        `${s.averageScore}%`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Cubit_Future_${selectedReport}_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification('success', `${selectedReport} CSV export downloaded successfully!`);
    } catch {
      addNotification('error', 'Failed to generate report export.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-orange" />
            Executive Reports & Analytics Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise academic ledger exports, cohort audit certificates, and regulatory summaries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:border-brand-navy transition"
          >
            <Printer className="w-4 h-4 text-brand-navy" /> Print Report
          </button>
          <button
            onClick={handleExportCSV}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-[#e55f00] text-white font-bold text-xs rounded-xl shadow-md shadow-brand-orange/20 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Exporting...' : 'Export Clean CSV'}
          </button>
        </div>
      </div>

      {/* Filter Parameters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-orange" /> Report Scope & Data Filters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Timeline Duration</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter (90 Days)</option>
              <option value="year">Full Academic Year 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Program Filter</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            >
              <option value="">All Programs</option>
              <option value="Banking">Banking & Financial Services</option>
              <option value="SSC">SSC Ultimate Mission</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Batch Filter</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            >
              <option value="">All Cohorts</option>
              <option value="Batch 14">Morning Achievers Batch 14</option>
              <option value="Batch 15">Evening Champions Batch 15</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Enrolment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive / Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Types Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCatalog.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;

          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-white to-orange-50/40 border-brand-orange shadow-md shadow-brand-orange/10'
                  : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isSelected
                        ? 'bg-brand-orange text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-brand-orange uppercase bg-orange-100 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{rep.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{rep.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-navy">
                <span>Configure Export</span>
                <span className="text-brand-orange">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
