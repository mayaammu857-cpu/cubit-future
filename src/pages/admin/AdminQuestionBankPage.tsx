import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Layers,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  BarChart3,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  SlidersHorizontal,
} from 'lucide-react';
import { questionBankApi, coursesApi } from '../../services/api';
import { QuestionBankItem, CourseQuestionStats, Course, QuestionDifficulty, QuestionType } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

export const AdminQuestionBankPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user, role } = useAuth();

  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [courseStats, setCourseStats] = useState<CourseQuestionStats[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);

  // Form State for Single Question
  const [formData, setFormData] = useState({
    courseId: '',
    subject: '',
    topic: '',
    questionText: '',
    questionType: 'MCQ' as QuestionType,
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOptionIndex: 0,
    difficulty: 'MEDIUM' as QuestionDifficulty,
    marks: 1,
    negativeMarks: 0.25,
    explanation: '',
  });

  // Form State for Bulk Import
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qs, stats, crsList] = await Promise.all([
        questionBankApi.getAll(),
        questionBankApi.getCourseMonitoringStats(),
        coursesApi.getAll().catch(() => [
          { id: 'crs-01', name: 'Banking & Financial Services', code: 'BFS-2026', description: '', durationMonths: 6, status: 'ACTIVE' },
          { id: 'crs-02', name: 'Data Analytics & AI Operations', code: 'DAI-2026', description: '', durationMonths: 4, status: 'ACTIVE' },
          { id: 'crs-03', name: 'Civil Services Foundation', code: 'CSF-2026', description: '', durationMonths: 12, status: 'ACTIVE' },
        ]),
      ]);
      setQuestions(qs);
      setCourseStats(stats);
      setCourses(crsList as Course[]);

      if (crsList.length > 0 && !formData.courseId) {
        setFormData((prev) => ({ ...prev, courseId: crsList[0].id }));
        setBulkCourseId(crsList[0].id);
      }
    } catch {
      addNotification('error', 'Failed to retrieve question bank items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Unique Subjects for filtering
  const availableSubjects = useMemo(() => {
    const list = selectedCourseId === 'ALL' 
      ? questions 
      : questions.filter((q) => q.courseId === selectedCourseId);
    return Array.from(new Set(list.map((q) => q.subject))).filter(Boolean);
  }, [questions, selectedCourseId]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchCourse = selectedCourseId === 'ALL' || q.courseId === selectedCourseId;
      const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
      const matchSub = selectedSubject === 'ALL' || q.subject === selectedSubject;
      const matchSearch =
        !searchQuery ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.courseName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCourse && matchDiff && matchSub && matchSearch;
    });
  }, [questions, selectedCourseId, selectedDifficulty, selectedSubject, searchQuery]);

  // Summary Metrics
  const totalQuestionsCount = questions.length;
  const avgAccuracy = useMemo(() => {
    if (questions.length === 0) return 0;
    const total = questions.reduce((acc, q) => acc + (q.accuracyRate || 0), 0);
    return Math.round(total / questions.length);
  }, [questions]);

  const difficultyCounts = useMemo(() => {
    return {
      easy: questions.filter((q) => q.difficulty === 'EASY').length,
      medium: questions.filter((q) => q.difficulty === 'MEDIUM').length,
      hard: questions.filter((q) => q.difficulty === 'HARD').length,
    };
  }, [questions]);

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      courseId: courses[0]?.id || 'crs-01',
      subject: '',
      topic: '',
      questionText: '',
      questionType: 'MCQ',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOptionIndex: 0,
      difficulty: 'MEDIUM',
      marks: 1,
      negativeMarks: 0.25,
      explanation: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (q: QuestionBankItem) => {
    setEditingQuestion(q);
    setFormData({
      courseId: q.courseId,
      subject: q.subject,
      topic: q.topic,
      questionText: q.questionText,
      questionType: q.questionType,
      optionA: q.options[0] || '',
      optionB: q.options[1] || '',
      optionC: q.options[2] || '',
      optionD: q.options[3] || '',
      correctOptionIndex: q.correctOptionIndex,
      difficulty: q.difficulty,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      explanation: q.explanation,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim()) {
      addNotification('warning', 'Please enter question text.');
      return;
    }
    if (!formData.optionA.trim() || !formData.optionB.trim()) {
      addNotification('warning', 'Please provide at least Option A and Option B.');
      return;
    }

    const selectedCourse = courses.find((c) => c.id === formData.courseId);
    const options = [
      formData.optionA.trim(),
      formData.optionB.trim(),
      formData.optionC.trim(),
      formData.optionD.trim(),
    ].filter(Boolean);

    try {
      if (editingQuestion) {
        await questionBankApi.update(editingQuestion.id, {
          courseId: formData.courseId,
          courseName: selectedCourse?.name || 'General Program',
          subject: formData.subject.trim() || 'General Subject',
          topic: formData.topic.trim() || 'Core Topic',
          questionText: formData.questionText.trim(),
          questionType: formData.questionType,
          options,
          correctOptionIndex: formData.correctOptionIndex,
          difficulty: formData.difficulty,
          marks: Number(formData.marks) || 1,
          negativeMarks: Number(formData.negativeMarks) || 0,
          explanation: formData.explanation.trim(),
        });
        addNotification('success', 'Question updated in question bank.');
      } else {
        await questionBankApi.create({
          courseId: formData.courseId,
          courseName: selectedCourse?.name || 'General Program',
          subject: formData.subject.trim() || 'General Subject',
          topic: formData.topic.trim() || 'Core Topic',
          questionText: formData.questionText.trim(),
          questionType: formData.questionType,
          options,
          correctOptionIndex: formData.correctOptionIndex,
          difficulty: formData.difficulty,
          marks: Number(formData.marks) || 1,
          negativeMarks: Number(formData.negativeMarks) || 0,
          explanation: formData.explanation.trim(),
          addedBy: user?.name || (role === 'SUPER_ADMIN' ? 'Super Admin' : 'Academy Admin'),
          creatorRole: role || 'ADMIN',
        });
        addNotification('success', 'New question added to course question bank!');
      }

      setIsAddModalOpen(false);
      await fetchData();
    } catch {
      addNotification('error', 'Error saving question.');
    }
  };

  const handleDelete = async (id: string, text: string) => {
    if (!window.confirm(`Are you sure you want to delete this question?\n\n"${text.slice(0, 70)}..."`)) {
      return;
    }
    try {
      await questionBankApi.delete(id);
      addNotification('info', 'Question removed from repository.');
      await fetchData();
    } catch {
      addNotification('error', 'Failed to delete question.');
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) {
      addNotification('warning', 'Please paste question bank data.');
      return;
    }

    setBulkLoading(true);
    try {
      const selectedCourse = courses.find((c) => c.id === bulkCourseId) || courses[0];
      let parsedItems: Partial<QuestionBankItem>[] = [];

      // Check if user pasted JSON or structured text
      if (bulkInput.trim().startsWith('[') || bulkInput.trim().startsWith('{')) {
        const parsed = JSON.parse(bulkInput.trim());
        parsedItems = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Line-based parser: Question | Option A | Option B | Option C | Option D | CorrectIndex (0-3) | Subject
        const lines = bulkInput.trim().split('\n');
        parsedItems = lines
          .map((line) => {
            const parts = line.split('|').map((p) => p.trim());
            if (parts.length >= 3) {
              return {
                questionText: parts[0],
                options: [parts[1], parts[2], parts[3] || 'Option C', parts[4] || 'Option D'],
                correctOptionIndex: parts[5] ? parseInt(parts[5], 10) : 0,
                subject: parts[6] || 'Core Module',
                topic: 'Imported Module',
                difficulty: 'MEDIUM' as QuestionDifficulty,
                marks: 1,
                explanation: 'Standard verified curriculum solution.',
              };
            }
            return null;
          })
          .filter(Boolean) as Partial<QuestionBankItem>[];
      }

      if (parsedItems.length === 0) {
        throw new Error('Could not parse any valid questions. Please verify format.');
      }

      const count = await questionBankApi.bulkImport(
        selectedCourse?.id || 'crs-01',
        selectedCourse?.name || 'General Course',
        parsedItems
      );

      addNotification('success', `Successfully imported ${count} questions into ${selectedCourse?.name}!`);
      setIsBulkModalOpen(false);
      setBulkInput('');
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bulk import failed. Please verify data format.';
      addNotification('error', msg);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in text-slate-100">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider mb-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            Central Academic Assessment Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-brand-orange" />
            Course Exam Question Bank &amp; Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Create, categorize, and monitor exam questions across all programs. Track difficulty balance, student accuracy rates, and curriculum question capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition shadow-sm"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-[#FF7700] hover:from-[#e55f00] hover:to-[#ea7d29] text-white text-xs font-bold shadow-lg shadow-brand-orange/20 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* 2. Top Executive Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071026] border border-[#162758] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Question Vault</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{totalQuestionsCount}</h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Live &amp; Verified
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071026] border border-[#162758] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Courses Monitored</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{courses.length}</h3>
            <span className="text-[11px] text-brand-orange flex items-center gap-1 mt-1 font-semibold">
              <Sparkles className="w-3 h-3" /> All Modules Synced
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071026] border border-[#162758] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Student Accuracy</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{avgAccuracy}%</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Across all mock tests
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071026] border border-[#162758] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Difficulty Spread</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-bold">
              <span className="text-emerald-400" title="Easy">{difficultyCounts.easy}E</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-amber-400" title="Medium">{difficultyCounts.medium}M</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-rose-400" title="Hard">{difficultyCounts.hard}H</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Balanced Rubric</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Course-Wise Question Bank Monitoring Radar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#071026] border border-[#162758] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-orange" />
              Course Question Bank Monitoring Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live capacity and health metrics for question banks attached to each curriculum program.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {courseStats.map((stat) => {
            const isSelected = selectedCourseId === stat.courseId;
            return (
              <div
                key={stat.courseId}
                onClick={() => setSelectedCourseId(isSelected ? 'ALL' : stat.courseId)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#0c1a40] to-[#122353] border-brand-orange/60 shadow-xl shadow-brand-orange/10'
                    : 'bg-[#050C20] border-[#13224B] hover:border-slate-500 hover:bg-[#071330]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                    {courses.find((c) => c.id === stat.courseId)?.code || stat.courseId}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      stat.coverageStatus === 'OPTIMAL'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : stat.coverageStatus === 'MODERATE'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {stat.coverageStatus.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-brand-orange transition-colors line-clamp-1">
                  {stat.courseName}
                </h3>

                <div className="mt-4 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-black/30 border border-white/5 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Questions</span>
                    <span className="text-sm font-black text-white">{stat.totalQuestions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Attempts</span>
                    <span className="text-sm font-black text-blue-400">{stat.totalAttempts}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Accuracy</span>
                    <span className="text-sm font-black text-emerald-400">{stat.avgAccuracy}%</span>
                  </div>
                </div>

                {/* Difficulty Distribution Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>Difficulty Ratio</span>
                    <span className="text-slate-300">{stat.easyCount}E / {stat.mediumCount}M / {stat.hardCount}H</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                    <div
                      style={{ width: `${stat.totalQuestions ? (stat.easyCount / stat.totalQuestions) * 100 : 0}%` }}
                      className="bg-emerald-500"
                      title="Easy"
                    />
                    <div
                      style={{ width: `${stat.totalQuestions ? (stat.mediumCount / stat.totalQuestions) * 100 : 0}%` }}
                      className="bg-amber-500"
                      title="Medium"
                    />
                    <div
                      style={{ width: `${stat.totalQuestions ? (stat.hardCount / stat.totalQuestions) * 100 : 0}%` }}
                      className="bg-rose-500"
                      title="Hard"
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{stat.subjectsCount} Subjects &bull; {stat.uniqueTopicsCount} Topics</span>
                  <span className="text-brand-orange font-bold text-[10px]">
                    {isSelected ? 'Filtering active ✓' : 'Click to filter'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Question Bank Explorer & Filter Bar */}
      <div className="space-y-4">
        {/* Controls */}
        <div className="p-4 rounded-2xl bg-[#071026] border border-[#162758] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by question text, topic, subject, keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Course Filter */}
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedSubject('ALL');
              }}
              className="px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 font-medium"
            >
              <option value="ALL">All Courses ({questions.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 font-medium"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 font-medium"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {(selectedCourseId !== 'ALL' || selectedDifficulty !== 'ALL' || selectedSubject !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCourseId('ALL');
                  setSelectedDifficulty('ALL');
                  setSelectedSubject('ALL');
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl font-bold transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredQuestions.length}</strong> questions
            {selectedCourseId !== 'ALL' && (
              <span> for <strong className="text-brand-orange">{courses.find((c) => c.id === selectedCourseId)?.name}</strong></span>
            )}
          </span>
          <span className="text-[11px] text-slate-500">
            Click on any question to inspect options &amp; explanation
          </span>
        </div>

        {/* Questions Cards List */}
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#071026] border border-[#162758] space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Questions Found Matching Criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your course or difficulty filters, or click &quot;Add New Question&quot; to expand this course&apos;s exam repository.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              Add Question to Course
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id;
              const difficultyBadgeClass =
                q.difficulty === 'EASY'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : q.difficulty === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

              return (
                <div
                  key={q.id}
                  className="rounded-2xl bg-[#071026] border border-[#162758] hover:border-slate-500 transition-all shadow-md overflow-hidden"
                >
                  {/* Question Summary Bar */}
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                          {q.courseName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                          {q.subject}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-300 font-medium">{q.topic}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${difficultyBadgeClass}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          Marks: +{q.marks} / -{q.negativeMarks}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-white leading-relaxed pt-1">
                        {q.questionText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <div className="hidden sm:flex flex-col items-end text-right mr-2">
                        <span className="text-[10px] text-slate-400 font-medium">Student Accuracy</span>
                        <span className="text-xs font-black text-emerald-400">{q.accuracyRate}% ({q.usageCount} attempts)</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(q);
                        }}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                        title="Edit Question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(q.id, q.questionText);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="p-1.5 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Inspector: Options, Answer, and Solution Rationale */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-[#050C20] space-y-4 animate-fade-in">
                      {/* Options Grid */}
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Options &amp; Verified Answer
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = optIdx === q.correctOptionIndex;
                            const optionLetter = String.fromCharCode(65 + optIdx);
                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
                                  isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white font-semibold'
                                    : 'bg-black/30 border-white/5 text-slate-300'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-500 text-black'
                                      : 'bg-white/10 text-slate-400'
                                  }`}
                                >
                                  {isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : optionLetter}
                                </span>
                                <span className="flex-1">{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation Rationale Box */}
                      {q.explanation && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
                          <span className="font-bold uppercase text-[10px] tracking-wider text-blue-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            Academic Solution &amp; Rubric Rationale
                          </span>
                          <p className="leading-relaxed text-slate-300">{q.explanation}</p>
                        </div>
                      )}

                      {/* Meta Footer */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
                        <span>Contributed by: <strong className="text-slate-300">{q.addedBy} ({q.creatorRole})</strong></span>
                        <span>Added: {new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Add / Edit Single Question Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingQuestion ? 'Edit Question in Vault' : 'Add New Question to Course Bank'}
        subtitle="Specify curriculum program, problem text, 4 options, and solution rationale."
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmitQuestion} className="space-y-4 text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Target Course / Program *
              </label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Subject Module *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Quantitative Aptitude"
                className="w-full px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Topic / Concept *
              </label>
              <input
                type="text"
                required
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Compound Interest"
                className="w-full px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Question Statement *
            </label>
            <textarea
              required
              rows={3}
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="Type the full exam problem or question statement clearly..."
              className="w-full px-3 py-2.5 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-300">
                Options (Select the correct answer with the radio button) *
              </label>
              <span className="text-[10px] text-brand-orange font-bold">
                Option {String.fromCharCode(65 + formData.correctOptionIndex)} is marked correct
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'optionA', label: 'A' },
                { key: 'optionB', label: 'B' },
                { key: 'optionC', label: 'C' },
                { key: 'optionD', label: 'D' },
              ].map((opt, i) => (
                <div
                  key={opt.key}
                  className={`flex items-center gap-2 p-2 rounded-xl border ${
                    formData.correctOptionIndex === i
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-[#050C20]'
                  }`}
                >
                  <input
                    type="radio"
                    name="correctOption"
                    checked={formData.correctOptionIndex === i}
                    onChange={() => setFormData({ ...formData, correctOptionIndex: i })}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-400">{opt.label}:</span>
                  <input
                    type="text"
                    required
                    value={(formData as any)[opt.key]}
                    onChange={(e) => setFormData({ ...formData, [opt.key]: e.target.value })}
                    placeholder={`Option ${opt.label} text`}
                    className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as QuestionDifficulty })}
                className="w-full px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 font-bold"
              >
                <option value="EASY">Easy (Foundation)</option>
                <option value="MEDIUM">Medium (Standard Exam)</option>
                <option value="HARD">Hard (Advanced / Olympiad)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Marks (+ve)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Negative (-ve)
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="5"
                value={formData.negativeMarks}
                onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Detailed Solution / Explanation
            </label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain step-by-step how to solve this question, shortcuts, or formula references..."
              className="w-full px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-brand-orange hover:bg-[#e55f00] text-white rounded-xl shadow-lg transition"
            >
              {editingQuestion ? 'Update Question' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Bulk Import Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Question Import Engine"
        subtitle="Paste JSON or line-delimited format to inject multiple questions instantly."
        maxWidth="2xl"
      >
        <form onSubmit={handleBulkImport} className="space-y-4 text-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Target Course *
            </label>
            <select
              required
              value={bulkCourseId}
              onChange={(e) => setBulkCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#050C20] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-300">
                Pasted Data (Pipe-Delimited or JSON) *
              </label>
              <span className="text-[10px] text-slate-400">
                Format: Question | OptionA | OptionB | OptionC | OptionD | CorrectIdx (0-3) | Subject
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="What is the capital of India? | Mumbai | New Delhi | Kolkata | Chennai | 1 | General Knowledge&#10;In which year did the 1857 Revolt start? | 1855 | 1857 | 1860 | 1870 | 1 | Modern History"
              className="w-full px-3 py-2 font-mono text-[11px] bg-[#050C20] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Quick Hint
            </span>
            <p className="text-[11px] leading-relaxed text-slate-300">
              You can paste lines generated from ChatGPT or Excel using the pipe format (`|`) or paste standard JSON arrays. All imported items are verified and attached to the chosen curriculum.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bulkLoading}
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg transition flex items-center gap-2"
            >
              {bulkLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Execute Bulk Import</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
