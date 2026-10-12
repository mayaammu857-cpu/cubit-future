import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Image,
  Upload,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Share2,
  HelpCircle,
  Lightbulb,
  Clock,
  ArrowRight,
  Bot,
  User,
  RotateCcw,
  Search,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SolvedDoubt {
  id: string;
  subject: string;
  topic: string;
  question: string;
  timestamp: string;
  concept: string;
  solutionSteps: string[];
  finalAnswer: string;
  pitfall: string;
  similarQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  bookmarked: boolean;
}

const PRESET_DOUBTS: SolvedDoubt[] = [
  {
    id: 'doubt-1',
    subject: 'Physics',
    topic: 'Laws of Motion & Friction',
    question:
      'A block of mass 5 kg rests on a rough horizontal surface with coefficient of static friction µs = 0.4. What is the minimum horizontal force required to move the block, and what is the friction force if only 15 N is applied?',
    timestamp: '10 mins ago',
    concept: "Static Friction Limiting Value & Normal Reaction (fs_max = µs * N)",
    solutionSteps: [
      'Step 1: Calculate the Normal Reaction (N). For a horizontal surface, N = m * g = 5 kg * 9.8 m/s² = 49 N (or 50 N taking g = 10 m/s²).',
      'Step 2: Determine Limiting Friction (fs_max). fs_max = µs * N = 0.4 * 50 N = 20 N.',
      'Step 3: Analyze the 15 N applied force. Since 15 N < 20 N (limiting friction), the applied force is insufficient to overcome static friction.',
      'Step 4: Recall that static friction is SELF-ADJUSTING up to its limit! Therefore, when 15 N is applied, the opposing static friction is exactly 15 N, NOT 20 N.',
    ],
    finalAnswer: 'Minimum force to initiate motion is 20 N. When 15 N is applied, the friction force is exactly 15 N (block remains stationary).',
    pitfall:
      'Common Exam Trap: Students frequently answer 20 N for the friction force under 15 N load. Remember: static friction equals the applied force until motion begins!',
    similarQuestion: {
      question:
        'A 2 kg mass rests on a table with µs = 0.5. A force of 8 N is applied horizontally. What is the friction force acting on the body (take g = 10 m/s²)?',
      options: ['10 N', '8 N', '0 N', '4 N'],
      correctIndex: 1,
      explanation: 'Limiting friction = 0.5 * 20 = 10 N. Since 8 N < 10 N, static friction self-adjusts to match the applied 8 N.',
    },
    bookmarked: true,
  },
  {
    id: 'doubt-2',
    subject: 'Mathematics',
    topic: 'Calculus - Maxima and Minima',
    question:
      'Find the dimensions of a rectangle with perimeter 36 cm that encloses the maximum possible area.',
    timestamp: '2 hours ago',
    concept: 'First and Second Derivative Tests for Optimization',
    solutionSteps: [
      'Step 1: Set up Perimeter equation: 2(x + y) = 36 => x + y = 18 => y = 18 - x.',
      'Step 2: Define Area function: A(x) = x * y = x(18 - x) = 18x - x².',
      'Step 3: Find critical points by taking the derivative: A\'(x) = 18 - 2x = 0 => x = 9 cm.',
      'Step 4: Verify maximum using second derivative: A\'\'(x) = -2 < 0 (confirms a local and global maximum at x = 9 cm).',
      'Step 5: Compute width: y = 18 - 9 = 9 cm.',
    ],
    finalAnswer: 'Dimensions are 9 cm by 9 cm (a square yields the maximum area of 81 cm²).',
    pitfall:
      'Remember: For any fixed perimeter, the rectangle with the maximum area is always an equilateral rectangle, i.e., a square.',
    similarQuestion: {
      question:
        'What is the maximum area of a rectangle with a fixed perimeter of 40 cm?',
      options: ['100 cm²', '90 cm²', '64 cm²', '120 cm²'],
      correctIndex: 0,
      explanation: 'Maximum area occurs when it is a square of side 40/4 = 10 cm. Area = 10 * 10 = 100 cm².',
    },
    bookmarked: false,
  },
];

const SUBJECTS = [
  'All Subjects',
  'Physics',
  'Mathematics',
  'Chemistry',
  'Biology',
  'General Studies',
  'Logical Reasoning',
  'Computer Science',
];

export const StudentDoubtSolverPage: React.FC = () => {
  const { student, user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [questionInput, setQuestionInput] = useState('');
  const [imageAttached, setImageAttached] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [doubts, setDoubts] = useState<SolvedDoubt[]>(PRESET_DOUBTS);
  const [activeDoubt, setActiveDoubt] = useState<SolvedDoubt>(PRESET_DOUBTS[0]);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterSubject, setFilterSubject] = useState('All Subjects');

  const studentName = student?.name || user?.name || 'Aman';

  const handleSimulateSolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() && !imageAttached) return;

    setIsSolving(true);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);

    setTimeout(() => {
      const newDoubt: SolvedDoubt = {
        id: `doubt-${Date.now()}`,
        subject: selectedSubject,
        topic: 'Concept Clarification & Deep Dive',
        question: questionInput || 'Image query: [Mathematical derivation / textbook numerical]',
        timestamp: 'Just now',
        concept: `${selectedSubject} Foundational Principles & Problem Solving Strategy`,
        solutionSteps: [
          `Step 1: Identify Given & Target Quantities from the question statement.`,
          `Step 2: Recall Core Theorem: Apply the primary governing equations for this ${selectedSubject} framework.`,
          `Step 3: Algebraic Resolution: Substitute the known values and maintain dimensional consistency.`,
          `Step 4: Verification: Cross-check the boundary conditions to ensure numerical sanity.`,
        ],
        finalAnswer: `Verified Solution: The mathematical logic confirms the result derived systematically above. Consistent with NCERT & standard competitive benchmarks.`,
        pitfall: `Pro-Tip for ${selectedSubject}: Always verify units before multiplying. Over 40% of negative marks in competitive tests stem from hasty unit conversion mistakes.`,
        similarQuestion: {
          question: `Follow-up Practice: If the values in this scenario were doubled, how would the output scale?`,
          options: ['Doubles (2x)', 'Quadruples (4x)', 'Remains Invariant', 'Halves (0.5x)'],
          correctIndex: 1,
          explanation: 'Because the parameter enters quadratically in the governing formula, doubling the input results in a 4-fold increase.',
        },
        bookmarked: false,
      };

      setDoubts([newDoubt, ...doubts]);
      setActiveDoubt(newDoubt);
      setIsSolving(false);
      setQuestionInput('');
      setImageAttached(null);
    }, 1200);
  };

  const handleToggleBookmark = (id: string) => {
    setDoubts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, bookmarked: !d.bookmarked } : d))
    );
    if (activeDoubt?.id === id) {
      setActiveDoubt((prev) => ({ ...prev, bookmarked: !prev.bookmarked }));
    }
  };

  const handleCopy = () => {
    if (!activeDoubt) return;
    const text = `${activeDoubt.question}\n\nConcept: ${activeDoubt.concept}\n\nSolution:\n${activeDoubt.solutionSteps.join('\n')}\n\nFinal Answer: ${activeDoubt.finalAnswer}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDoubts = doubts.filter(
    (d) => filterSubject === 'All Subjects' || d.subject === filterSubject
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Futuristic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1f4d] via-[#102a6b] to-[#0a183d] p-6 sm:p-8 border border-[#1e3a8a]/50 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-brand-orange text-xs font-bold tracking-wide mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>24/7 AI Academic Co-Pilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Doubt Solver & Instant Tutor
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Ask any academic question, upload textbook problems, or paste complex formulas. Get step-by-step derivations, core principles, and trap warnings 24 hours a day.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-[#091438]/80 border border-white/10 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Doubts Solved</span>
              <span className="text-xl font-black text-brand-orange">{doubts.length}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#091438]/80 border border-white/10 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Accuracy Rate</span>
              <span className="text-xl font-black text-emerald-400">99.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top Column: Ask Doubt Input Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#091438] border border-[#162758] rounded-3xl p-5 sm:p-6 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-brand-orange" />
              <span>Ask a New Doubt</span>
            </h2>

            {/* Subject Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Select Subject
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.filter((s) => s !== 'All Subjects').map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedSubject === subj
                        ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/30'
                        : 'bg-[#07112f] text-slate-400 hover:text-white border border-[#162758]'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSimulateSolve} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={4}
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder={`Type your ${selectedSubject} question here, or describe what you're stuck on...`}
                  className="w-full px-4 py-3 bg-[#060b1d] border border-[#162758] rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition resize-none"
                />
              </div>

              {/* Upload or Sample Image attachment */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#07112f] border border-[#162758] text-xs text-slate-300 hover:text-white hover:border-slate-500 transition">
                  <Image className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{imageAttached ? 'Image Attached ✓' : 'Attach Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageAttached(e.target.files[0].name);
                      }
                    }}
                  />
                </label>

                {imageAttached && (
                  <button
                    type="button"
                    onClick={() => setImageAttached(null)}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Remove photo
                  </button>
                )}

                <span className="text-[11px] text-slate-500 ml-auto">
                  Instant step-by-step
                </span>
              </div>

              {/* Quick Prompt Ideas */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                  Try asking:
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject('Physics');
                      setQuestionInput('Explain Lenz’s law and derive why it is a consequence of conservation of energy.');
                    }}
                    className="text-left text-xs text-slate-300 hover:text-brand-orange bg-[#060b1d]/80 px-3 py-2 rounded-xl border border-white/5 hover:border-brand-orange/40 transition truncate"
                  >
                    ⚡ Lenz’s law & energy conservation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject('Mathematics');
                      setQuestionInput('How to solve ∫ x * e^(2x) dx using integration by parts?');
                    }}
                    className="text-left text-xs text-slate-300 hover:text-brand-orange bg-[#060b1d]/80 px-3 py-2 rounded-xl border border-white/5 hover:border-brand-orange/40 transition truncate"
                  >
                    📐 Integration by parts for ∫ x e^(2x) dx
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSolving || (!questionInput.trim() && !imageAttached)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-orange to-[#ff7b00] hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-brand-orange/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSolving ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Formulating Solution...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Solve Doubt Now</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Doubt History List */}
          <div className="bg-[#091438] border border-[#162758] rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recent Doubts ({filteredDoubts.length})</span>
              </h3>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="bg-[#07112f] text-slate-300 text-xs px-2.5 py-1 rounded-xl border border-[#162758] focus:outline-none"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredDoubts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setActiveDoubt(d);
                    setSelectedQuizAnswer(null);
                    setQuizSubmitted(false);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition text-left ${
                    activeDoubt.id === d.id
                      ? 'bg-brand-orange/10 border-brand-orange/60 text-white shadow-md'
                      : 'bg-[#060b1d] border-[#162758] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-brand-orange uppercase">{d.subject}</span>
                    <span className="text-slate-500">{d.timestamp}</span>
                  </div>
                  <p className="text-xs font-medium line-clamp-2 leading-snug">{d.question}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Solution Breakdown */}
        <div className="lg:col-span-7">
          {activeDoubt ? (
            <div className="bg-[#091438] border border-[#162758] rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
                      {activeDoubt.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      &bull; {activeDoubt.topic}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-snug">
                    {activeDoubt.question}
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleBookmark(activeDoubt.id)}
                    className={`p-2 rounded-xl border transition ${
                      activeDoubt.bookmarked
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-[#07112f] border-[#162758] text-slate-400 hover:text-white'
                    }`}
                    title={activeDoubt.bookmarked ? 'Saved in notebook' : 'Save to notebook'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-[#07112f] border border-[#162758] text-slate-400 hover:text-white transition"
                    title="Copy Solution"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Core Concept Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c2357] to-[#071438] border border-[#1e40af]/40">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Core Principle & Theorem</span>
                </div>
                <p className="text-sm font-semibold text-white pl-6">
                  {activeDoubt.concept}
                </p>
              </div>

              {/* Step-by-Step Derivation */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step-by-Step Logical Walkthrough</span>
                </h3>

                <div className="space-y-2.5">
                  {activeDoubt.solutionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#060b1d] border border-[#162758] text-sm text-slate-200 leading-relaxed font-mono"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Answer Banner */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  🎯 Verified Final Answer
                </span>
                <p className="text-sm font-bold text-white">{activeDoubt.finalAnswer}</p>
              </div>

              {/* Common Pitfall / Exam Trap */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Crucial Exam Trap to Avoid</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  {activeDoubt.pitfall}
                </p>
              </div>

              {/* Interactive Micro-Quiz: Similar Practice Question */}
              <div className="p-5 rounded-2xl bg-[#07112f] border border-[#1a2f6c] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-orange flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Practice: Test Your Understanding</span>
                  </span>
                  <span className="text-[11px] text-slate-400">1 MCQ</span>
                </div>

                <p className="text-sm font-semibold text-white">
                  {activeDoubt.similarQuestion.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {activeDoubt.similarQuestion.options.map((opt, i) => {
                    const isSelected = selectedQuizAnswer === i;
                    const isCorrect = i === activeDoubt.similarQuestion.correctIndex;

                    let btnClass = 'bg-[#060b1d] border-[#162758] text-slate-300 hover:border-slate-500';
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-900/60 border-emerald-500 text-white font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'bg-red-900/60 border-red-500 text-white line-through';
                      }
                    } else if (isSelected) {
                      btnClass = 'bg-brand-orange/20 border-brand-orange text-white font-semibold';
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!quizSubmitted) setSelectedQuizAnswer(i);
                        }}
                        className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedQuizAnswer === null}
                    onClick={() => setQuizSubmitted(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold transition disabled:opacity-40"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-[#060b1d] border border-white/10 text-xs text-slate-300">
                    <strong className="text-brand-orange">Explanation: </strong>
                    {activeDoubt.similarQuestion.explanation}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-[#091438] border border-[#162758] rounded-3xl">
              <HelpCircle className="w-12 h-12 text-slate-500 mb-3" />
              <h3 className="text-base font-bold text-white">No Doubt Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Ask a question on the left or click any previous doubt to see the full step-by-step breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDoubtSolverPage;
