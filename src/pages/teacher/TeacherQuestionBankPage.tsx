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
  Check,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  GraduationCap,
} from 'lucide-react';
import { questionBankApi, coursesApi } from '../../services/api';
import { QuestionBankItem, CourseQuestionStats, Course, QuestionDifficulty, QuestionType } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

export const TeacherQuestionBankPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

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

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);

  // Form State
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
      }
    } catch {
      addNotification('error', 'Failed to retrieve questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableSubjects = useMemo(() => {
    const list = selectedCourseId === 'ALL'
      ? questions
      : questions.filter((q) => q.courseId === selectedCourseId);
    return Array.from(new Set(list.map((q) => q.subject))).filter(Boolean);
  }, [questions, selectedCourseId]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchCourse = selectedCourseId === 'ALL' || q.courseId === selectedCourseId;
      const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
      const matchSub = selectedSubject === 'ALL' || q.subject === selectedSubject;
      const matchSearch =
        !searchQuery ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCourse && matchDiff && matchSub && matchSearch;
    });
  }, [questions, selectedCourseId, selectedDifficulty, selectedSubject, searchQuery]);

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
      await questionBankApi.create({
        courseId: formData.courseId,
        courseName: selectedCourse?.name || 'General Program',
        subject: formData.subject.trim() || 'Faculty Curriculum',
        topic: formData.topic.trim() || 'Core Topic',
        questionText: formData.questionText.trim(),
        questionType: formData.questionType,
        options,
        correctOptionIndex: formData.correctOptionIndex,
        difficulty: formData.difficulty,
        marks: Number(formData.marks) || 1,
        negativeMarks: Number(formData.negativeMarks) || 0,
        explanation: formData.explanation.trim(),
        addedBy: user?.name || 'Faculty Mentor',
        creatorRole: 'TEACHER',
      });

      addNotification('success', 'Question contributed to course question bank!');
      setIsAddModalOpen(false);
      await fetchData();
    } catch {
      addNotification('error', 'Error saving question.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Faculty Question Bank &amp; Item Authoring
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-blue-400" />
            Course Question Bank &amp; Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Author exam practice questions for your programs, review problem rubrics, and monitor student accuracy.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Contribute Question</span>
        </button>
      </div>

      {/* Program Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courseStats.map((stat) => (
          <div
            key={stat.courseId}
            onClick={() => setSelectedCourseId(selectedCourseId === stat.courseId ? 'ALL' : stat.courseId)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedCourseId === stat.courseId
                ? 'bg-[#0b173d] border-blue-500/70 shadow-lg'
                : 'bg-[#060D25] border-[#162758] hover:border-blue-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-300">{stat.courseName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {stat.totalQuestions} Qs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Student Accuracy</span>
                <span className="font-black text-emerald-400">{stat.avgAccuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Attempts</span>
                <span className="font-black text-blue-400">{stat.totalAttempts}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#060D25] border border-[#162758] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic, statement, subject..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#03081A] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-xs bg-[#03081A] border border-slate-700 rounded-xl text-white font-medium"
          >
            <option value="ALL">All Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs bg-[#03081A] border border-slate-700 rounded-xl text-white font-medium"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedQuestionId === q.id;
          return (
            <div
              key={q.id}
              className="rounded-2xl bg-[#060D25] border border-[#162758] hover:border-slate-500 transition-all shadow-md overflow-hidden"
            >
              <div
                onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                      {q.courseName}
                    </span>
                    <span className="text-slate-300 font-medium">{q.subject} &bull; {q.topic}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/10 text-slate-300">
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed pt-1">
                    {q.questionText}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-emerald-400">{q.accuracyRate}% acc</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-[#03081A] space-y-3 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, i) => {
                      const isCorrect = i === q.correctOptionIndex;
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-white font-semibold'
                              : 'bg-black/30 border-white/5 text-slate-300'
                          }`}
                        >
                          <span className="font-bold">{String.fromCharCode(65 + i)}:</span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && <span className="text-[10px] text-emerald-400 font-black uppercase">Correct</span>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300">
                      <strong className="text-blue-300 block mb-1">Academic Rationale:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Contribute Question to Program"
        subtitle="Ensure balanced difficulty and verified answer keys."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitQuestion} className="space-y-4 text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Target Program *</label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#03081A] border border-slate-700 rounded-xl text-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Subject Module *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Quantitative Aptitude"
                className="w-full px-3 py-2 text-xs bg-[#03081A] border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Question Statement *</label>
            <textarea
              required
              rows={3}
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="Enter exam question..."
              className="w-full px-3 py-2 text-xs bg-[#03081A] border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-300">4 Options (Select Correct Answer) *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'optionA', label: 'A' },
                { key: 'optionB', label: 'B' },
                { key: 'optionC', label: 'C' },
                { key: 'optionD', label: 'D' },
              ].map((opt, i) => (
                <div
                  key={opt.key}
                  className={`flex items-center gap-2 p-2 rounded-xl border ${
                    formData.correctOptionIndex === i ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-[#03081A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="tchCorrect"
                    checked={formData.correctOptionIndex === i}
                    onChange={() => setFormData({ ...formData, correctOptionIndex: i })}
                    className="w-4 h-4 text-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-400">{opt.label}:</span>
                  <input
                    type="text"
                    required
                    value={(formData as any)[opt.key]}
                    onChange={(e) => setFormData({ ...formData, [opt.key]: e.target.value })}
                    className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Solution / Explanation</label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Step-by-step solution..."
              className="w-full px-3 py-2 text-xs bg-[#03081A] border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg"
            >
              Add to Question Vault
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
