import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Layers,
  Award,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Shuffle,
  Filter,
  Search,
  Check,
  Flame,
  Target,
  BarChart2,
  Clock,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { questionBankApi, coursesApi } from '../../services/api';
import { QuestionBankItem, Course, QuestionDifficulty } from '../../types';

export const StudentQuestionBankPage: React.FC = () => {
  const { student, user } = useAuth();
  const { addNotification } = useNotifications();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [allQuestions, setAllQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mode: 'PRACTICE' (interactive 1-by-1 exam) | 'BROWSE' (question repository list)
  const [viewMode, setViewMode] = useState<'PRACTICE' | 'BROWSE'>('PRACTICE');

  // Filters for browse & practice
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Practice State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [revealedExplanation, setRevealedExplanation] = useState(false);

  // Student Session Stats
  const [sessionAttempted, setSessionAttempted] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userAnswersHistory, setUserAnswersHistory] = useState<
    Record<string, { selected: number; isCorrect: boolean }>
  >({});

  // Expanded card state in BROWSE mode
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // 1. Initial Load of Courses & Questions
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [coursesRes, questionsRes] = await Promise.all([
          coursesApi.getAll().catch(() => [
            { id: 'crs-01', name: 'Banking & Financial Services', code: 'BFS-2026' } as Course,
            { id: 'crs-02', name: 'Data Analytics & AI Operations', code: 'DAI-2026' } as Course,
            { id: 'crs-03', name: 'Civil Services Foundation', code: 'CSF-2026' } as Course,
          ]),
          questionBankApi.getAll(),
        ]);

        setCourses(coursesRes);
        setAllQuestions(questionsRes);

        // Pre-select student's enrolled course if valid, else fallback to first course
        const studentCourseId = student?.courseId;
        const matchingCourse = coursesRes.find(
          (c) => c.id === studentCourseId || c.name.toLowerCase() === student?.courseName?.toLowerCase()
        );

        if (matchingCourse) {
          setSelectedCourseId(matchingCourse.id);
        } else if (coursesRes.length > 0) {
          setSelectedCourseId(coursesRes[0].id);
        }
      } catch {
        addNotification('error', 'Failed to load Exam Question Bank questions.');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [student, addNotification]);

  // 2. Filtered Questions for the selected course
  const courseQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (selectedCourseId && q.courseId !== selectedCourseId) return false;
      if (selectedSubject !== 'ALL' && q.subject !== selectedSubject) return false;
      if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const qText = (q.questionText + ' ' + q.topic + ' ' + q.subject).toLowerCase();
        if (!qText.includes(searchQuery.toLowerCase().trim())) return false;
      }
      return true;
    });
  }, [allQuestions, selectedCourseId, selectedSubject, selectedDifficulty, searchQuery]);

  // Available Subjects in the selected course
  const availableSubjects = useMemo(() => {
    const base = allQuestions.filter((q) => !selectedCourseId || q.courseId === selectedCourseId);
    return Array.from(new Set(base.map((q) => q.subject))).filter(Boolean);
  }, [allQuestions, selectedCourseId]);

  // Current active question in Practice Mode
  const currentQuestion: QuestionBankItem | undefined = courseQuestions[currentIdx];

  // Reset practice state when course or question index changes
  useEffect(() => {
    if (currentQuestion) {
      const prior = userAnswersHistory[currentQuestion.id];
      if (prior) {
        setSelectedOption(prior.selected);
        setIsAnswerSubmitted(true);
        setRevealedExplanation(true);
      } else {
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setRevealedExplanation(false);
      }
    }
  }, [currentIdx, currentQuestion?.id, userAnswersHistory]);

  // Submit Answer Action
  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQuestion || isAnswerSubmitted) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    setIsAnswerSubmitted(true);
    setRevealedExplanation(true);

    // Update Session Metrics
    setSessionAttempted((prev) => prev + 1);
    if (isCorrect) {
      setSessionCorrect((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    // Save locally to user session history
    setUserAnswersHistory((prev) => ({
      ...prev,
      [currentQuestion.id]: { selected: selectedOption, isCorrect },
    }));

    // Record persistent attempt in Question Bank analytics
    try {
      await questionBankApi.recordAnswerAttempt(currentQuestion.id, isCorrect);
    } catch {
      // non-blocking
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < courseQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    if (courseQuestions.length > 1) {
      const randomIdx = Math.floor(Math.random() * courseQuestions.length);
      setCurrentIdx(randomIdx);
      addNotification('info', 'Jumped to a random question!');
    }
  };

  const handleResetSession = () => {
    setSessionAttempted(0);
    setSessionCorrect(0);
    setStreak(0);
    setUserAnswersHistory({});
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setRevealedExplanation(false);
    setCurrentIdx(0);
    addNotification('info', 'Practice session statistics reset.');
  };

  const selectedCourseObj = courses.find((c) => c.id === selectedCourseId);
  const accuracyPct =
    sessionAttempted > 0 ? Math.round((sessionCorrect / sessionAttempted) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-orange/30 to-brand-purple/30 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-lg shadow-brand-orange/10">
              <HelpCircle className="w-5 h-5 text-brand-orange" />
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Student Question Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-2">
            Exam Question Bank
            <Sparkles className="w-5 h-5 text-brand-orange animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Interactive practice and high-yield question repository partitioned by course curriculum.
            Test your comprehension, view instant solutions, and monitor your personal accuracy.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-[#091124] p-1.5 rounded-2xl border border-[#1b2b54] self-start lg:self-auto">
          <button
            onClick={() => setViewMode('PRACTICE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              viewMode === 'PRACTICE'
                ? 'bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-md shadow-brand-orange/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Exam Practice Mode
          </button>
          <button
            onClick={() => setViewMode('BROWSE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              viewMode === 'BROWSE'
                ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            Browse Bank ({courseQuestions.length})
          </button>
        </div>
      </div>

      {/* Course Selection Tabs */}
      <div className="bg-[#091124]/90 backdrop-blur-md rounded-2xl border border-[#16254a] p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
            Select Course Curriculum:
          </label>
          {student?.courseId && (
            <span className="text-[11px] text-brand-orange bg-brand-orange/10 px-2.5 py-0.5 rounded-full border border-brand-orange/20">
              Enrolled: {student.courseName || 'Your Program'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {courses.map((c) => {
            const isEnrolled =
              student?.courseId === c.id ||
              student?.courseName?.toLowerCase() === c.name.toLowerCase();
            const isSelected = selectedCourseId === c.id;
            const qCount = allQuestions.filter((q) => q.courseId === c.id).length;

            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCourseId(c.id);
                  setSelectedSubject('ALL');
                  setCurrentIdx(0);
                }}
                className={`relative p-3.5 rounded-xl border text-left transition duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-brand-orange/20 to-brand-purple/20 border-brand-orange text-white shadow-lg shadow-brand-orange/10'
                    : 'bg-[#0d162d]/60 border-[#1c2c54] text-slate-300 hover:border-slate-500 hover:bg-[#111c38]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      {c.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-orange shrink-0" />}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Code: <span className="font-mono text-slate-300">{c.code || c.id}</span>
                    </p>
                  </div>
                  {isEnrolled && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      Enrolled
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-brand-orange" />
                    {qCount} Questions
                  </span>
                  <span className="text-slate-500">Live Bank</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Session Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#091124] border border-[#16254a] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Available</p>
            <p className="text-lg sm:text-xl font-bold text-white">{courseQuestions.length}</p>
          </div>
        </div>

        <div className="bg-[#091124] border border-[#16254a] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Session Attempted</p>
            <p className="text-lg sm:text-xl font-bold text-amber-300">
              {sessionAttempted}
            </p>
          </div>
        </div>

        <div className="bg-[#091124] border border-[#16254a] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Session Accuracy</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-400">
              {accuracyPct}%{' '}
              <span className="text-xs text-slate-400 font-normal">
                ({sessionCorrect}/{sessionAttempted})
              </span>
            </p>
          </div>
        </div>

        <div className="bg-[#091124] border border-[#16254a] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Current Streak</p>
            <p className="text-lg sm:text-xl font-bold text-purple-300">
              {streak} <span className="text-xs text-slate-400 font-normal">in a row</span>
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[#091124] border border-[#16254a] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setCurrentIdx(0);
            }}
            className="bg-[#0d162d] border border-[#1e2f5c] text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-orange"
          >
            <option value="ALL">All Subjects ({availableSubjects.length})</option>
            {availableSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setCurrentIdx(0);
            }}
            className="bg-[#0d162d] border border-[#1e2f5c] text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-orange"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Search Query */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topic or question text..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIdx(0);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#0d162d] border border-[#1e2f5c] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        {viewMode === 'PRACTICE' && (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleShuffle}
              title="Pick a random question"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            >
              <Shuffle className="w-3.5 h-3.5 text-brand-orange" />
              Shuffle
            </button>
            <button
              onClick={handleResetSession}
              title="Reset session score and streak"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Stats
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: INTERACTIVE PRACTICE EXAM MODE */}
      {/* ========================================================================= */}
      {viewMode === 'PRACTICE' && (
        <>
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-[#091124] rounded-2xl border border-[#16254a]">
              <Sparkles className="w-8 h-8 text-brand-orange animate-spin mx-auto mb-2" />
              Loading question vault...
            </div>
          ) : courseQuestions.length === 0 ? (
            <div className="p-12 text-center bg-[#091124] rounded-2xl border border-[#16254a]">
              <AlertCircleIcon />
              <h3 className="text-lg font-bold text-white mt-3">No Questions Matched</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No questions found with your active filters in {selectedCourseObj?.name}. Try
                switching subjects or clearing difficulty filters.
              </p>
              <button
                onClick={() => {
                  setSelectedSubject('ALL');
                  setSelectedDifficulty('ALL');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : currentQuestion ? (
            <div className="bg-[#091124] rounded-3xl border border-[#16254a] shadow-2xl overflow-hidden">
              {/* Question Top Status Banner */}
              <div className="px-6 py-4 bg-[#0d162d] border-b border-[#16254a] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-brand-orange px-2.5 py-1 rounded-lg bg-brand-orange/10 border border-brand-orange/30">
                    Question {currentIdx + 1} of {courseQuestions.length}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    {currentQuestion.subject}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline-block">
                    • {currentQuestion.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Difficulty Badge */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      currentQuestion.difficulty === 'EASY'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : currentQuestion.difficulty === 'MEDIUM'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    +{currentQuestion.marks} Mk
                  </span>
                  {currentQuestion.negativeMarks > 0 && (
                    <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/20">
                      -{currentQuestion.negativeMarks} Neg
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-white leading-relaxed">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQuestion.correctOptionIndex;

                    let optionClasses =
                      'bg-[#0c1429] border-[#1a274e] text-slate-200 hover:border-slate-500 hover:bg-[#111c38]';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        optionClasses =
                          'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-900/30';
                      } else if (isSelected && !isCorrect) {
                        optionClasses =
                          'bg-rose-950/40 border-rose-500 text-rose-200 shadow-md shadow-rose-900/30';
                      } else {
                        optionClasses = 'bg-[#0c1429]/50 border-white/5 text-slate-500 opacity-60';
                      }
                    } else if (isSelected) {
                      optionClasses =
                        'bg-brand-orange/15 border-brand-orange text-white shadow-lg shadow-brand-orange/10';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswerSubmitted}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition duration-200 ${optionClasses}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAnswerSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-500 text-white'
                                  : isSelected
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-white/10 text-slate-400'
                                : isSelected
                                ? 'bg-brand-orange text-white'
                                : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-relaxed">
                            {option}
                          </span>
                        </div>

                        {/* Status Icon */}
                        {isAnswerSubmitted && (
                          <div className="shrink-0">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : isSelected ? (
                              <XCircle className="w-5 h-5 text-rose-400" />
                            ) : null}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                        selectedOption !== null
                          ? 'bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-500 hover:to-brand-orange text-white shadow-lg shadow-brand-orange/20 cursor-pointer'
                          : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Submit & Check Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {selectedOption === currentQuestion.correctOptionIndex ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Correct Answer! (+{currentQuestion.marks} marks)
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                          <XCircle className="w-4 h-4" />
                          Incorrect. Correct is Option{' '}
                          {String.fromCharCode(65 + currentQuestion.correctOptionIndex)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Previous / Next Navigation */}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentIdx === 0}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        currentIdx > 0
                          ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                          : 'opacity-40 text-slate-600 border border-transparent cursor-not-allowed'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentIdx === courseQuestions.length - 1}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        currentIdx < courseQuestions.length - 1
                          ? 'bg-gradient-to-r from-brand-purple to-indigo-600 hover:opacity-90 text-white shadow-md'
                          : 'opacity-40 text-slate-600 border border-transparent cursor-not-allowed'
                      }`}
                    >
                      Next
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Verified Solution & Explanation */}
                {revealedExplanation && currentQuestion.explanation && (
                  <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[#0c1836] to-[#122147] border border-[#1d3263] space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Step-by-Step Verified Rationale & Rubric:
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                      {currentQuestion.explanation}
                    </p>
                    <div className="pl-6 pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Authored by: {currentQuestion.addedBy}</span>
                      <span>•</span>
                      <span>Overall student accuracy: {currentQuestion.accuracyRate}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: BROWSE QUESTION VAULT */}
      {/* ========================================================================= */}
      {viewMode === 'BROWSE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{courseQuestions.length}</strong> questions in{' '}
              <span className="text-brand-orange">{selectedCourseObj?.name}</span>
            </span>
          </div>

          <div className="space-y-3">
            {courseQuestions.map((q, idx) => {
              const isExpanded = expandedCardId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-[#091124] border border-[#16254a] rounded-2xl p-4 sm:p-5 hover:border-slate-500/50 transition duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold font-mono text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/30">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {q.subject}
                        </span>
                        <span className="text-xs text-slate-400">({q.topic})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            q.difficulty === 'EASY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : q.difficulty === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-semibold text-white pt-1">
                        {q.questionText}
                      </h3>
                    </div>

                    <button
                      onClick={() => setExpandedCardId(isExpanded ? null : q.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-brand-orange border border-white/10 shrink-0"
                    >
                      {isExpanded ? 'Hide Rubric' : 'View Options & Rubric'}
                    </button>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#16254a] space-y-3 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctOptionIndex;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                                isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-semibold'
                                  : 'bg-[#0d162d] border-[#1c2c54] text-slate-400'
                              }`}
                            >
                              <span>
                                <strong className="mr-2">{String.fromCharCode(65 + oIdx)}.</strong>
                                {opt}
                              </span>
                              {isCorrect && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-3.5 rounded-xl bg-[#0c1836] border border-[#1d3263] text-xs text-slate-300">
                          <strong className="text-amber-400 block mb-1">
                            Verified Solution Rationale:
                          </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const AlertCircleIcon = () => (
  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
    <HelpCircle className="w-6 h-6" />
  </div>
);

export default StudentQuestionBankPage;
