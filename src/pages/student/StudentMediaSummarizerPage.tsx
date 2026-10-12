import React, { useState } from 'react';
import {
  Video,
  Mic,
  FileText,
  Sparkles,
  Play,
  Clock,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  ExternalLink,
  BookOpen,
  HelpCircle,
  RotateCcw,
  ListOrdered,
  Zap,
  Bookmark,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LectureSummary {
  id: string;
  title: string;
  sourceType: 'YOUTUBE' | 'AUDIO' | 'PDF';
  sourceUrlOrFile: string;
  duration: string;
  subject: string;
  date: string;
  tldr: string;
  keyTimestamps: { time: string; title: string; notes: string }[];
  formulasAndTerms: { term: string; definition: string }[];
  recallQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const PRESET_SUMMARIES: LectureSummary[] = [
  {
    id: 'sum-1',
    title: 'Thermodynamics: Second Law & Carnot Engine Efficiency',
    sourceType: 'YOUTUBE',
    sourceUrlOrFile: 'https://youtube.com/watch?v=carnot-cycle-lec14',
    duration: '48 mins',
    subject: 'Physics',
    date: 'Yesterday',
    tldr:
      'This lecture covers heat engines, reservoirs, Carnot cycle processes (2 isothermal, 2 adiabatic), and mathematical limits on thermal efficiency (η = 1 - Tc/Th). Key focus is why 100% efficiency is physically impossible according to Kelvin-Planck statement.',
    keyTimestamps: [
      {
        time: '04:15',
        title: 'Kelvin-Planck & Clausius Statements',
        notes: 'Explains why heat cannot spontaneously flow from a colder body to a hotter body without external work.',
      },
      {
        time: '14:30',
        title: 'The Four Stages of Carnot Cycle',
        notes: 'Stage 1: Isothermal Expansion -> Stage 2: Adiabatic Expansion -> Stage 3: Isothermal Compression -> Stage 4: Adiabatic Compression.',
      },
      {
        time: '28:50',
        title: 'Carnot Efficiency Formula Derivation',
        notes: 'η = (W / Qh) = (Qh - Qc) / Qh = 1 - (Tc / Th). Note: Temperatures MUST be substituted in absolute Kelvin (K), not Celsius!',
      },
      {
        time: '41:10',
        title: 'Carnot’s Theorem & Reversibility',
        notes: 'No engine operating between two given temperatures can be more efficient than a reversible Carnot engine.',
      },
    ],
    formulasAndTerms: [
      {
        term: 'Carnot Efficiency (η)',
        definition: 'η = 1 - (T_cold / T_hot), where temperatures are strictly in Kelvin.',
      },
      {
        term: 'Entropy Change (ΔS)',
        definition: 'For a reversible cycle: ∮(dQ / T) = 0. For irreversible cycles: ΔS_universe > 0.',
      },
      {
        term: 'Coefficient of Performance (COP)',
        definition: 'For a refrigerator: β = Q_cold / W = T_cold / (T_hot - T_cold).',
      },
    ],
    recallQuiz: [
      {
        question: 'What is the theoretical efficiency of a Carnot engine operating between 300 K and 600 K?',
        options: ['25%', '50%', '75%', '100%'],
        correctIndex: 1,
        explanation: 'η = 1 - (300 / 600) = 1 - 0.5 = 50%.',
      },
      {
        question: 'Which of the following processes in the Carnot cycle occurs at constant temperature?',
        options: ['Adiabatic expansion', 'Isothermal expansion', 'Isochoric heating', 'Isobaric cooling'],
        correctIndex: 1,
        explanation: 'Isothermal expansion occurs in contact with the hot reservoir at constant temperature Th.',
      },
    ],
  },
  {
    id: 'sum-2',
    title: 'Modern Indian History: Revolt of 1857 & Administrative Shifts',
    sourceType: 'AUDIO',
    sourceUrlOrFile: 'Audio Lecture: History_Class_Session_22.mp3',
    duration: '35 mins',
    subject: 'General Studies',
    date: '3 days ago',
    tldr:
      'Analyzes political, socioeconomic, religious, and immediate military triggers of the 1857 Uprising. Covers Lord Dalhousie’s Doctrine of Lapse, greased cartridges controversy, major leadership centers (Delhi, Kanpur, Lucknow, Jhansi), and the subsequent Government of India Act 1858 transferring power to the British Crown.',
    keyTimestamps: [
      {
        time: '03:40',
        title: 'Doctrine of Lapse & Annexations',
        notes: 'Satara, Sambalpur, Jhansi, and the controversial annexation of Awadh under the pretext of misgovernance.',
      },
      {
        time: '12:15',
        title: 'Immediate Spark at Meerut',
        notes: 'Enfield rifle cartridges greased with cow and pig fat; Mangal Pandey episode at Barrackpore.',
      },
      {
        time: '24:00',
        title: 'Regional Leaders & Command Centers',
        notes: 'Delhi: Bahadur Shah Zafar & General Bakht Khan; Kanpur: Nana Sahib; Lucknow: Begum Hazrat Mahal; Jhansi: Rani Lakshmibai.',
      },
      {
        time: '31:20',
        title: 'Queen’s Proclamation of 1858',
        notes: 'Abolition of East India Company rule; establishment of Secretary of State and Viceroy system.',
      },
    ],
    formulasAndTerms: [
      {
        term: 'Government of India Act 1858',
        definition: 'Act for the Better Government of India, transferring control directly to the British Crown.',
      },
      {
        term: 'Doctrine of Lapse',
        definition: 'Annexation policy devised by Lord Dalhousie where native states without a natural male heir were annexed.',
      },
    ],
    recallQuiz: [
      {
        question: 'Who led the 1857 uprising in Kanpur alongside Tatya Tope?',
        options: ['Kunwar Singh', 'Nana Sahib', 'Bahadur Shah II', 'Khan Bahadur Khan'],
        correctIndex: 1,
        explanation: 'Nana Sahib, the adopted son of Peshwa Baji Rao II, led the revolt in Kanpur.',
      },
    ],
  },
];

export const StudentMediaSummarizerPage: React.FC = () => {
  const { student, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'YOUTUBE' | 'AUDIO' | 'PDF'>('YOUTUBE');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaries, setSummaries] = useState<LectureSummary[]>(PRESET_SUMMARIES);
  const [activeSummary, setActiveSummary] = useState<LectureSummary>(PRESET_SUMMARIES[0]);
  const [copied, setCopied] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState(false);

  const handleSimulateSummarize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() && !selectedFile) return;

    setIsProcessing(true);
    setQuizAnswers({});
    setQuizChecked(false);

    setTimeout(() => {
      const newSum: LectureSummary = {
        id: `sum-${Date.now()}`,
        title: urlInput
          ? 'Comprehensive Class Lecture Analysis'
          : `Synthesized Document: ${selectedFile}`,
        sourceType: activeTab,
        sourceUrlOrFile: urlInput || selectedFile || 'Uploaded Media',
        duration: '32 mins',
        subject: 'Academic Syllabus',
        date: 'Just now',
        tldr:
          'AI Executive Summary: The uploaded media introduces core definitions, foundational derivations, and empirical problem solving techniques. Emphasizes exam weightage, high-frequency question patterns, and step-by-step resolution.',
        keyTimestamps: [
          {
            time: '00:00 - 05:20',
            title: 'Concept Introduction & Background',
            notes: 'Covers prerequisite knowledge and syllabus scope for competitive exams.',
          },
          {
            time: '05:20 - 18:40',
            title: 'Primary Equations & Core Principles',
            notes: 'Detailed line-by-line breakdown of mathematical rules and theoretical assumptions.',
          },
          {
            time: '18:40 - 32:00',
            title: 'Solved Numerical Demonstrations',
            notes: '3 standard exam questions solved with shortcut heuristics and trap warnings.',
          },
        ],
        formulasAndTerms: [
          {
            term: 'Governing Law',
            definition: 'Universal relation between primary variables ensuring energy/mass conservation.',
          },
          {
            term: 'Critical Condition',
            definition: 'Boundary threshold beyond which standard approximations break down.',
          },
        ],
        recallQuiz: [
          {
            question: 'What is the primary conclusion demonstrated in this lecture session?',
            options: [
              'System remains invariant under standard conditions',
              'Energy loss occurs due to non-conservative forces',
              'Rate of change is directly proportional to applied gradient',
              'None of the above',
            ],
            correctIndex: 2,
            explanation: 'The session proves that gradient proportionality governs the dynamic rate of change.',
          },
        ],
      };

      setSummaries([newSum, ...summaries]);
      setActiveSummary(newSum);
      setIsProcessing(false);
      setUrlInput('');
      setSelectedFile(null);
    }, 1500);
  };

  const handleCopyNotes = () => {
    if (!activeSummary) return;
    const content = `# ${activeSummary.title}\n\n## Executive Summary\n${activeSummary.tldr}\n\n## Key Timestamps\n${activeSummary.keyTimestamps
      .map((k) => `- [${k.time}] ${k.title}: ${k.notes}`)
      .join('\n')}\n\n## Key Formulas\n${activeSummary.formulasAndTerms
      .map((f) => `- **${f.term}**: ${f.definition}`)
      .join('\n')}`;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d2a4a] via-[#103a68] to-[#091b38] p-6 sm:p-8 border border-sky-800/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold tracking-wide mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Smart Audio/Video & Lecture Summarizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Lecture Summarizer & Rapid Notes Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Transform hour-long lecture videos, audio voice notes, and lengthy PDF chapters into 2-minute bullet summaries, clickable timestamps, formula cheat sheets, and instant recall quizzes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-[#091438]/80 border border-sky-500/30 text-center">
              <span className="text-[11px] text-sky-300 font-semibold block">Lectures Processed</span>
              <span className="text-xl font-black text-sky-400">{summaries.length}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#091438]/80 border border-sky-500/30 text-center">
              <span className="text-[11px] text-sky-300 font-semibold block">Time Saved</span>
              <span className="text-xl font-black text-emerald-400">~6.5 hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Lecture Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#091438] border border-[#162758] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-400" />
              <span>Summarize New Media</span>
            </h2>

            {/* Input Type Selector */}
            <div className="flex rounded-2xl bg-[#060b1d] p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('YOUTUBE')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'YOUTUBE'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video URL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('AUDIO')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'AUDIO'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Audio File</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PDF')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'PDF'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF / Notes</span>
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSimulateSummarize} className="space-y-4">
              {activeTab === 'YOUTUBE' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    YouTube or Classroom Video Link
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or classroom recording link"
                    className="w-full px-4 py-2.5 bg-[#060b1d] border border-[#162758] rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Upload {activeTab === 'AUDIO' ? 'Audio Recording' : 'Lecture PDF'}
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#162758] hover:border-sky-500 rounded-2xl bg-[#060b1d] cursor-pointer transition">
                    <Download className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-300 font-semibold">
                      {selectedFile ? selectedFile : `Click to browse or drop ${activeTab.toLowerCase()}`}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {activeTab === 'AUDIO' ? 'MP3, M4A, WAV up to 100MB' : 'PDF, DOCX up to 50MB'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || (!urlInput.trim() && !selectedFile)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-950/40 transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Extracting Audio & Synthesizing Notes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Instant AI Summary</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Library of Saved Summaries */}
          <div className="bg-[#091438] border border-[#162758] rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Synthesized Library ({summaries.length})</span>
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {summaries.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSummary(s);
                    setQuizAnswers({});
                    setQuizChecked(false);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition text-left ${
                    activeSummary.id === s.id
                      ? 'bg-sky-950/40 border-sky-500 text-white shadow-md'
                      : 'bg-[#060b1d] border-[#162758] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-sky-400 uppercase">{s.subject}</span>
                    <span className="text-slate-500">{s.duration}</span>
                  </div>
                  <h4 className="text-xs font-bold line-clamp-2 leading-snug">{s.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output: Notes, Timestamps, Formulas, Quiz (7 Cols) */}
        <div className="lg:col-span-7">
          {activeSummary && (
            <div className="bg-[#091438] border border-[#162758] rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {activeSummary.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      &bull; {activeSummary.duration} &bull; {activeSummary.date}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-snug">
                    {activeSummary.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCopyNotes}
                    className="p-2 rounded-xl bg-[#07112f] border border-[#162758] text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-medium"
                    title="Copy Markdown Notes"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1. TL;DR Executive Summary */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c234a] to-[#07142d] border border-sky-800/40 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2-Minute Executive Summary (TL;DR)</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {activeSummary.tldr}
                </p>
              </div>

              {/* 2. Clickable Timestamps & Key Moments */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Timestamped Key Concepts</span>
                </h3>

                <div className="space-y-2">
                  {activeSummary.keyTimestamps.map((item, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-[#060b1d] border border-[#162758] text-xs space-y-1 hover:border-slate-500 transition"
                    >
                      <div className="flex items-center gap-2 font-bold text-sky-300">
                        <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 font-mono text-[10px]">
                          ⏱️ {item.time}
                        </span>
                        <span>{item.title}</span>
                      </div>
                      <p className="text-slate-300 text-xs pl-1 leading-relaxed">
                        {item.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Formulas & Terminology Cheat Sheet */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Formula & Terminology Sheet</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeSummary.formulasAndTerms.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-[#060b1d] border border-[#162758] text-xs space-y-1"
                    >
                      <span className="font-bold text-emerald-400 block">{f.term}</span>
                      <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                        {f.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Instant Recall Mini-Quiz */}
              {activeSummary.recallQuiz && activeSummary.recallQuiz.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#07112f] border border-[#1a2f6c] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Instant Recall Quiz (Retention Check)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {activeSummary.recallQuiz.length} Questions
                    </span>
                  </div>

                  {activeSummary.recallQuiz.map((q, qIndex) => {
                    const selected = quizAnswers[qIndex];
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div key={qIndex} className="space-y-2 pt-2 border-t border-white/5">
                        <p className="text-xs font-semibold text-white">
                          {qIndex + 1}. {q.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIndex) => {
                            const isThisSelected = selected === optIndex;
                            let style =
                              'bg-[#060b1d] border-[#162758] text-slate-300 hover:border-slate-500';

                            if (quizChecked) {
                              if (optIndex === q.correctIndex) {
                                style = 'bg-emerald-950/80 border-emerald-500 text-white font-bold';
                              } else if (isThisSelected && !isCorrect) {
                                style = 'bg-rose-950/80 border-rose-500 text-white line-through';
                              }
                            } else if (isThisSelected) {
                              style = 'bg-sky-500/20 border-sky-400 text-white font-semibold';
                            }

                            return (
                              <button
                                key={optIndex}
                                type="button"
                                onClick={() => {
                                  if (!quizChecked) {
                                    setQuizAnswers({ ...quizAnswers, [qIndex]: optIndex });
                                  }
                                }}
                                className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {quizChecked && optIndex === q.correctIndex && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizChecked && (
                          <div className="p-2.5 rounded-xl bg-[#060b1d] border border-white/10 text-[11px] text-slate-300">
                            <strong className="text-sky-400">Explanation: </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!quizChecked ? (
                    <button
                      type="button"
                      disabled={Object.keys(quizAnswers).length === 0}
                      onClick={() => setQuizChecked(true)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-40"
                    >
                      Check Recall Score
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizChecked(false);
                      }}
                      className="w-full py-2 rounded-xl bg-[#060b1d] border border-white/10 text-xs text-slate-300 hover:text-white transition"
                    >
                      Retry Quiz
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMediaSummarizerPage;
