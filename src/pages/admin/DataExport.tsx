import React, { useState } from 'react';
import {
  Download,
  Database,
  Users,
  GraduationCap,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { studentApi, batchApi, courseApi, examApi, marksApi } from '../../services/api';

export const DataExport: React.FC = () => {
  const { addNotification } = useNotifications();
  const [downloading, setDownloading] = useState<string | null>(null);

  const exportDatasets = [
    {
      id: 'students',
      title: 'Full Student Directory Dataset',
      desc: 'All candidate demographic details, emails, phones, course IDs, attendance metrics, and registration dates.',
      format: 'CSV (UTF-8)',
      icon: Users,
    },
    {
      id: 'exams',
      title: 'Examinations Master Ledger',
      desc: 'All assessment schedules, subjects, total marks, durations, and passing thresholds.',
      format: 'CSV (UTF-8)',
      icon: GraduationCap,
    },
    {
      id: 'marks',
      title: 'Individual Marks & Percentiles Ledger',
      desc: 'Candidate marks obtained, sectional accuracy, result status (PASSED/EXCELLENT), and rank data.',
      format: 'CSV (UTF-8)',
      icon: Database,
    },
    {
      id: 'batches',
      title: 'Batches & Cohort Metrics',
      desc: 'All batch codes, starting dates, enrolled student counts, and active exam counts.',
      format: 'CSV (UTF-8)',
      icon: Layers,
    },
    {
      id: 'courses',
      title: 'Academic Programs & Curriculum',
      desc: 'Course codes, duration in months, and enrolled candidate volume.',
      format: 'CSV (UTF-8)',
      icon: Database,
    },
  ];

  const handleTriggerExport = async (datasetId: string, title: string) => {
    setDownloading(datasetId);
    try {
      let headers: string[] = [];
      let rows: (string | number)[][] = [];

      if (datasetId === 'students') {
        const res = await studentApi.getAll({ limit: 500 });
        headers = ['ID', 'StudentID', 'Name', 'Email', 'Phone', 'Course', 'Batch', 'Status', 'AttendanceRate', 'AverageScore'];
        rows = res.data.map((s) => [
          s.id,
          s.studentId,
          `"${s.name}"`,
          s.email,
          s.phone,
          `"${s.courseName}"`,
          `"${s.batchName}"`,
          s.status,
          s.attendanceRate,
          s.averageScore,
        ]);
      } else if (datasetId === 'batches') {
        const res = await batchApi.getAll();
        headers = ['ID', 'BatchName', 'Code', 'CourseName', 'StartDate', 'StudentCount', 'Status'];
        rows = res.map((b) => [b.id, `"${b.name}"`, b.code, `"${b.courseName}"`, b.startDate, b.studentCount, b.status]);
      } else if (datasetId === 'courses') {
        const res = await courseApi.getAll();
        headers = ['ID', 'CourseName', 'Code', 'DurationMonths', 'Status'];
        rows = res.map((c) => [c.id, `"${c.name}"`, c.code, c.durationMonths, c.status]);
      } else if (datasetId === 'exams') {
        const res = await examApi.getMyResults();
        headers = ['ID', 'ExamName', 'Subject', 'Date', 'MaxMarks'];
        rows = res.map((e) => [e.id, `"${e.examName}"`, `"${e.subject}"`, e.examDate, e.maxMarks]);
      } else {
        const res = await marksApi.getAll();
        headers = ['ID', 'ExamName', 'Subject', 'StudentID', 'StudentName', 'MarksObtained', 'MaxMarks', 'Percentage', 'Status'];
        rows = res.map((m) => [m.id, `"${m.examName}"`, `"${m.subject}"`, m.studentId, `"${m.studentName}"`, m.marksObtained, m.maxMarks, m.percentage, m.resultStatus]);
      }

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Cubit_Future_${datasetId}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification('success', `Export downloaded: ${title}`);
    } catch {
      addNotification('error', `Failed to export dataset ${datasetId}.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2">
            <Download className="w-6 h-6 text-brand-orange" />
            Enterprise Data Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bulk export raw database ledgers, student profiles, and assessment records with compliance security
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Authorized Super Admin Export Channel
        </span>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportDatasets.map((ds) => {
          const Icon = ds.icon;
          const isPending = downloading === ds.id;

          return (
            <div
              key={ds.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-brand-navy/5 text-brand-navy">
                    <Icon className="w-6 h-6 text-brand-orange" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {ds.format}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{ds.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{ds.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Ready for instant download</span>
                <button
                  onClick={() => handleTriggerExport(ds.id, ds.title)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-brand-orange" />
                  {isPending ? 'Generating...' : 'Download CSV'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
