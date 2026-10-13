import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  Calendar,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Eye,
  BookOpen,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
  Shield,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { monitoringApi } from '../../services/monitoringApi';
import { coursesApi, batchesApi } from '../../services/api';
import { StudentMonitoringMetric, MonitoringStats } from '../../types/monitoring';
import { Course, Batch } from '../../types';
import { StudentDossierModal } from '../../components/monitoring/StudentDossierModal';
import { QuickInterventionModal } from '../../components/monitoring/QuickInterventionModal';

export const AdminStudentMonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [metrics, setMetrics] = useState<StudentMonitoringMetric[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Modals
  const [selectedMetric, setSelectedMetric] = useState<StudentMonitoringMetric | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [res, crsRes, bRes] = await Promise.all([
        monitoringApi.getMonitoringOverview({
          batchId: batchFilter || undefined,
          riskLevel: riskFilter !== 'ALL' ? riskFilter : undefined,
          search: search || undefined,
        }),
        coursesApi.getAll(),
        batchesApi.getAll(),
      ]);
      setMetrics(res.metrics);
      setStats(res.stats);
      setCourses(crsRes || []);
      setBatches(bRes || []);
    } catch {
      addNotification('error', 'Could not load executive monitoring telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchFilter, riskFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredMetrics = useMemo(() => {
    return metrics.filter((m) => {
      if (courseFilter && m.student.courseId !== courseFilter) return false;
      if (batchFilter && m.student.batchId !== batchFilter) return false;
      if (riskFilter !== 'ALL' && m.riskLevel !== riskFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.student.name.toLowerCase().includes(q) ||
        m.student.studentId.toLowerCase().includes(q) ||
        m.student.email.toLowerCase().includes(q)
      );
    });
  }, [metrics, courseFilter, batchFilter, riskFilter, search]);

  const criticalAspirants = useMemo(() => {
    return metrics.filter((m) => m.riskLevel === 'CRITICAL' || m.riskLevel === 'MODERATE');
  }, [metrics]);

  const handleExportCsv = () => {
    const headers = [
      'Student ID',
      'Name',
      'Email',
      'Phone',
      'Course',
      'Batch',
      'Risk Level',
      'Risk Score',
      'Attendance %',
      'Average Score %',
      'Overdue Tasks',
      'Weekly Study Hours',
      'Last Active',
    ];
    const rows = filteredMetrics.map((m) => [
      m.student.studentId,
      `"${m.student.name}"`,
      m.student.email,
      m.student.phone,
      `"${m.student.courseName}"`,
      `"${m.student.batchName}"`,
      m.riskLevel,
      m.riskScore,
      `${m.attendance.rate}%`,
      `${m.academics.averageScore}%`,
      m.tasks.overdue,
      m.weeklyStudyHours,
      `"${m.lastActive}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cubit_Future_Executive_Monitoring_Dossier_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('success', 'Executive student monitoring audit exported.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-purple-400" />
              EXECUTIVE OVERSIGHT
            </span>
            <span className="text-xs text-slate-400">Academy-Wide Student Health Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Student Monitoring &amp; Risk Oversight Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Academy-wide radar: attendance deficits, performance bottlenecks, dropout risk indicators, and intervention tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : 'text-slate-400'}`} />
            <span>Sync Live Telemetry</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Executive Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* Academy KPI Pulse Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#040817] border border-[#101C3D] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Enrolled
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{stats?.totalMonitored || 0}</span>
            <span className="text-[10px] text-slate-400">students</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#040817] border border-[#101C3D] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Live In Portal
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-400">{stats?.onlineNow || 0}</span>
            <span className="text-[10px] text-slate-400">active now</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#040817] border-2 border-red-500/40 bg-red-500/5 flex flex-col justify-between shadow-lg shadow-red-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
            Critical Risk Flags
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-red-400">{stats?.criticalRiskCount || 0}</span>
            <span className="text-[10px] text-red-300 font-semibold">at risk</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#040817] border border-[#101C3D] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mean Attendance
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-2xl font-black ${
                (stats?.avgAttendance || 0) < 75 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {stats?.avgAttendance || 0}%
            </span>
            <span className="text-[10px] text-slate-400">benchmark: 75%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#040817] border border-[#101C3D] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Academy Mean Score
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-blue-400">{stats?.avgScore || 0}%</span>
            <span className="text-[10px] text-slate-400">mock exams</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#040817] border border-[#101C3D] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
            Interventions Logged
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-purple-300">
              {stats?.totalInterventionsThisMonth || 0}
            </span>
            <span className="text-[10px] text-slate-400">actions taken</span>
          </div>
        </div>
      </div>

      {/* Early Warning Radar Section */}
      {criticalAspirants.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#040817] to-[#0A1338] border border-red-500/30 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                Dropout &amp; Low Attendance Warning Radar
              </h3>
              <p className="text-[11px] text-red-300/80">
                {criticalAspirants.length} student(s) require immediate academy counselor or faculty intervention.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {criticalAspirants.map((m) => (
              <div
                key={m.studentId}
                className="p-4 rounded-2xl bg-[#040817] border border-white/10 hover:border-red-500/40 transition flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                      {m.student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs group-hover:text-purple-300 transition">
                        {m.student.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {m.student.studentId} • {m.student.batchName}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      m.riskLevel === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {m.riskLevel} ({m.riskScore})
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  {m.riskFactors.slice(0, 2).map((rf, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="truncate">{rf}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className={m.attendance.rate < 75 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      Att: {m.attendance.rate}%
                    </span>
                    <span className={m.academics.averageScore < 60 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      Avg: {m.academics.averageScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedMetric(m);
                        setIsDossierOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] transition"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMetric(m);
                        setIsInterventionOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#040817] border border-[#101C3D] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Risk Level Filter Pills */}
          <div className="flex items-center rounded-xl bg-white/5 p-1 border border-white/10">
            {[
              { id: 'ALL', label: 'All Students' },
              { id: 'CRITICAL', label: 'Critical 🚨' },
              { id: 'MODERATE', label: 'Warning ⚠️' },
              { id: 'SAFE', label: 'Healthy ✅' },
            ].map((rf) => (
              <button
                key={rf.id}
                onClick={() => setRiskFilter(rf.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  riskFilter === rf.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {/* Course Selector */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="" className="bg-[#040817]">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#040817]">
                {c.name}
              </option>
            ))}
          </select>

          {/* Batch Selector */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="" className="bg-[#040817]">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#040817]">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-3xl border border-[#101C3D] bg-[#040817] shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#08122E] text-slate-300 uppercase text-[10px] font-bold border-b border-white/10">
            <tr>
              <th className="p-4">Student &amp; Program</th>
              <th className="p-4">Live State</th>
              <th className="p-4">Risk Index</th>
              <th className="p-4">Attendance</th>
              <th className="p-4">Exam Performance</th>
              <th className="p-4">Assignments</th>
              <th className="p-4">AI Learning Telemetry</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredMetrics.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-slate-500" />
                    <p className="font-bold text-white text-sm">No students matched this filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMetrics.map((m) => (
                <tr key={m.studentId} className="hover:bg-white/[0.02] transition">
                  {/* Student */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {m.student.name.charAt(0)}
                      </div>
                      <div>
                        <p
                          className="font-bold text-white hover:text-purple-300 cursor-pointer"
                          onClick={() => {
                            setSelectedMetric(m);
                            setIsDossierOpen(true);
                          }}
                        >
                          {m.student.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {m.student.studentId} • {m.student.batchName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          m.onlineStatus === 'ONLINE'
                            ? 'bg-emerald-400 animate-pulse'
                            : m.onlineStatus === 'STUDYING'
                            ? 'bg-blue-400 animate-ping'
                            : m.onlineStatus === 'AWAY'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-white">{m.onlineStatus}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{m.lastActive}</span>
                  </td>

                  {/* Risk */}
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        m.riskLevel === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                          : m.riskLevel === 'MODERATE'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {m.riskLevel === 'CRITICAL' && '🚨'}
                      {m.riskLevel === 'MODERATE' && '⚠️'}
                      {m.riskLevel === 'SAFE' && '✅'}
                      <span>{m.riskLevel} ({m.riskScore})</span>
                    </span>
                  </td>

                  {/* Attendance */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-xs ${
                          m.attendance.rate < 75 ? 'text-red-400' : 'text-white'
                        }`}
                      >
                        {m.attendance.rate}%
                      </span>
                      {m.attendance.rate < 75 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                          ALERT
                        </span>
                      )}
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          m.attendance.rate < 75 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, m.attendance.rate)}%` }}
                      />
                    </div>
                  </td>

                  {/* Performance */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs">{m.academics.averageScore}%</span>
                      {m.academics.scoreTrend[m.academics.scoreTrend.length - 1] >= m.academics.scoreTrend[0] ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Rank #{m.academics.rankInBatch}
                    </span>
                  </td>

                  {/* Tasks */}
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                      {m.tasks.completed}/{m.tasks.assigned} done
                    </span>
                    {m.tasks.overdue > 0 && (
                      <span className="text-[10px] font-bold text-red-400 block mt-1">
                        {m.tasks.overdue} overdue
                      </span>
                    )}
                  </td>

                  {/* AI Doubt Radar */}
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                      <span className="text-white font-semibold text-[11px]">
                        {m.aiRadar.doubtsAskedThisWeek} doubts
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block max-w-[130px]" title={m.academics.weakestTopic}>
                      Weak: {m.academics.weakestTopic}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedMetric(m);
                          setIsDossierOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1 transition"
                        title="View Complete Academic Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dossier</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMetric(m);
                          setIsInterventionOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs flex items-center gap-1 transition"
                        title="Direct WhatsApp Alert / Intervention"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Alert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Dossier Modal */}
      <StudentDossierModal
        isOpen={isDossierOpen}
        onClose={() => {
          setIsDossierOpen(false);
          setSelectedMetric(null);
        }}
        metric={selectedMetric}
        onTriggerIntervention={(m) => {
          setIsDossierOpen(false);
          setSelectedMetric(m);
          setIsInterventionOpen(true);
        }}
        onRefresh={fetchData}
      />

      {/* Quick Intervention Modal */}
      <QuickInterventionModal
        isOpen={isInterventionOpen}
        onClose={() => {
          setIsInterventionOpen(false);
          setSelectedMetric(null);
        }}
        metric={selectedMetric}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminStudentMonitoringPage;
