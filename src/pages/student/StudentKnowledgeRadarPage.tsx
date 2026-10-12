import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopicGap {
  id: string;
  subject: string;
  topic: string;
  severity: 'CRITICAL' | 'MODERATE' | 'STRONG';
  accuracy: number;
  batchAvg: number;
  errorPattern: string;
  missedQuestionsCount: number;
  estimatedMarkLoss: number;
  prescribedAction: string;
  recommendedDrillTime: string;
}

const KNOWLEDGE_RADAR_DATA = [
  { subject: 'Mechanics', studentScore: 84, batchAvg: 70, fullMark: 100 },
  { subject: 'Electromagnetism', studentScore: 62, batchAvg: 68, fullMark: 100 },
  { subject: 'Calculus', studentScore: 54, batchAvg: 65, fullMark: 100 },
  { subject: 'Organic Chem', studentScore: 48, batchAvg: 62, fullMark: 100 },
  { subject: 'Gen. Studies', studentScore: 78, batchAvg: 72, fullMark: 100 },
  { subject: 'Reasoning', studentScore: 92, batchAvg: 75, fullMark: 100 },
];

const DETAILED_GAPS: TopicGap[] = [
  {
    id: 'gap-1',
    subject: 'Chemistry',
    topic: 'Organic Reaction Mechanisms (SN1 / SN2)',
    severity: 'CRITICAL',
    accuracy: 42,
    batchAvg: 64,
    errorPattern: 'Solvent effect confusion (polar protic vs polar aprotic) in nucleophilic substitution.',
    missedQuestionsCount: 7,
    estimatedMarkLoss: 14,
    prescribedAction: 'Review carbocation stability rules & complete 15 targeted elimination vs substitution drills.',
    recommendedDrillTime: '20 mins',
  },
  {
    id: 'gap-2',
    subject: 'Mathematics',
    topic: 'Definite Integration & Area Under Curves',
    severity: 'CRITICAL',
    accuracy: 48,
    batchAvg: 66,
    errorPattern: 'Sign errors at curve intersections and misidentifying boundary limits.',
    missedQuestionsCount: 5,
    estimatedMarkLoss: 10,
    prescribedAction: 'Practice sketching symmetrical parabolas and absolute value integrals.',
    recommendedDrillTime: '25 mins',
  },
  {
    id: 'gap-3',
    subject: 'Physics',
    topic: 'Ray Optics - Sign Conventions & Lens Formula',
    severity: 'MODERATE',
    accuracy: 62,
    batchAvg: 68,
    errorPattern: 'Applying Cartesian coordinate sign convention erroneously for virtual images in concave lenses.',
    missedQuestionsCount: 4,
    estimatedMarkLoss: 8,
    prescribedAction: 'Memorize the standard ray diagram matrix and solve 10 combination lens problems.',
    recommendedDrillTime: '15 mins',
  },
  {
    id: 'gap-4',
    subject: 'Reasoning',
    topic: 'Syllogisms & Venn Diagrams',
    severity: 'STRONG',
    accuracy: 94,
    batchAvg: 76,
    errorPattern: 'Virtually zero errors. Exceptional conceptual clarity maintained.',
    missedQuestionsCount: 1,
    estimatedMarkLoss: 2,
    prescribedAction: 'Maintain mastery with 1 weekly speed refresher.',
    recommendedDrillTime: '10 mins',
  },
];

export const StudentKnowledgeRadarPage: React.FC = () => {
  const { student, user } = useAuth();
  const [selectedGap, setSelectedGap] = useState<TopicGap>(DETAILED_GAPS[0]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'MODERATE' | 'STRONG'>('ALL');
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [drillCompleted, setDrillCompleted] = useState(false);

  const studentName = student?.name || user?.name || 'Aman';

  const filteredGaps = DETAILED_GAPS.filter((gap) => {
    if (activeTab === 'ALL') return true;
    return gap.severity === activeTab;
  });

  const totalMarkLoss = DETAILED_GAPS.filter((g) => g.severity !== 'STRONG').reduce(
    (acc, g) => acc + g.estimatedMarkLoss,
    0
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#100828] via-[#1d1245] to-[#0c0620] p-6 sm:p-8 border border-purple-900/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold tracking-wide mb-3">
              <Target className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>AI Weakness & Vulnerability Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Knowledge Gap Radar & Diagnostic Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Synthesized from your recent mock tests and homework submissions. Pinpointing exactly where marks are leaking and providing high-yield recovery roadmaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-[#140b33]/80 border border-purple-500/30 text-center">
              <span className="text-[11px] text-purple-300 font-semibold block">Total Leakage</span>
              <span className="text-xl font-black text-rose-400">-{totalMarkLoss} Marks</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#140b33]/80 border border-purple-500/30 text-center">
              <span className="text-[11px] text-purple-300 font-semibold block">Potential Jump</span>
              <span className="text-xl font-black text-emerald-400">+12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Radar Visualization & Potential Impact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-[#091438] border border-[#162758] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                <span>Multidimensional Competency Map</span>
              </h2>
              <p className="text-xs text-slate-400">Comparing your mastery score vs. batch average</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-orange" />
                <span className="text-slate-300">Your Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-slate-400">Batch Avg</span>
              </div>
            </div>
          </div>

          {/* Recharts Radar */}
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={KNOWLEDGE_RADAR_DATA}>
                <PolarGrid stroke="#1b2e63" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#060b1d] border border-[#1e3a8a] p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.subject}</p>
                          <p className="text-brand-orange">Your Score: {data.studentScore}%</p>
                          <p className="text-slate-400">Batch Average: {data.batchAvg}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Radar
                  name="Your Score"
                  dataKey="studentScore"
                  stroke="#ff7800"
                  fill="#ff7800"
                  fillOpacity={0.35}
                />
                <Radar
                  name="Batch Average"
                  dataKey="batchAvg"
                  stroke="#64748b"
                  fill="#64748b"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Primary Strength: <strong>Reasoning (92%)</strong></span>
            <span>Primary Weakness: <strong>Organic Chem (48%)</strong></span>
          </div>
        </div>

        {/* AI Score Predictor Simulation (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1840] to-[#091230] border border-[#19326e] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Smart Cohort Rank Predictor</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">
              What happens if you seal your 2 Critical Gaps?
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Our academic machine learning model predicts your next mock test standing based on resolving <strong>Organic Reaction Mechanisms</strong> and <strong>Integration</strong>:
            </p>
          </div>

          {/* Metric Comparison Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#060b1d]/80 border border-white/10 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Current Standing</span>
              <p className="text-2xl font-black text-slate-300 mt-1">72%</p>
              <span className="text-[11px] text-slate-500 font-bold block mt-0.5">Cohort Rank #12</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-emerald-900/30 border border-emerald-500/50 text-center shadow-lg shadow-emerald-950/40">
              <span className="text-[11px] text-emerald-300 font-bold block">Predicted Post-Drill</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">84.2%</p>
              <span className="text-[11px] text-emerald-300 font-extrabold block mt-0.5">🔥 Cohort Rank #4</span>
            </div>
          </div>

          {/* Recommended Weekly Plan */}
          <div className="p-4 rounded-2xl bg-[#060b1d] border border-white/5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orange flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Rapid 7-Day Recovery Plan</span>
            </h4>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Day 1-3: Organic Chem SN1/SN2 flashcards (15 mins/day)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Day 4-5: Integration boundary curves (20 mins/day)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Day 6-7: 1 Full Diagnostic Retest</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setPracticeModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-950/40 transition flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Launch Remedial Drill Session</span>
          </button>
        </div>
      </div>

      {/* 3. Vulnerability Matrix Table & Deep Dive */}
      <div className="bg-[#091438] border border-[#162758] rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Topic Vulnerability Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select any gap to inspect error patterns and prescribed recovery steps
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 bg-[#060b1d] p-1.5 rounded-2xl border border-white/5">
            {(['ALL', 'CRITICAL', 'MODERATE', 'STRONG'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Gap Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGaps.map((gap) => {
            const isSelected = selectedGap?.id === gap.id;
            const isCrit = gap.severity === 'CRITICAL';
            const isMod = gap.severity === 'MODERATE';

            return (
              <div
                key={gap.id}
                onClick={() => setSelectedGap(gap)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500'
                    : 'bg-[#060b1d] border-[#162758] hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-extrabold uppercase text-slate-400 tracking-wider">
                      {gap.subject}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isMod
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {gap.severity}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-3">
                    {gap.topic}
                  </h4>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Accuracy:</span>
                    <span
                      className={`font-black ${
                        isCrit ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {gap.accuracy}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estimated Loss:</span>
                    <span className="font-black text-rose-400">-{gap.estimatedMarkLoss} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gap Deep Dive Panel */}
        {selectedGap && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0d1c47] via-[#091538] to-[#070e28] border border-[#1d3570] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="text-xs font-extrabold text-brand-orange uppercase">
                  AI Diagnostic Deep Dive &bull; {selectedGap.subject}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {selectedGap.topic}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Drill Time:</span>
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                  ⏱️ {selectedGap.recommendedDrillTime}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#060b1d]/80 border border-white/5 space-y-1.5">
                <span className="text-xs font-bold uppercase text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Identified Error Pattern</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedGap.errorPattern}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#060b1d]/80 border border-white/5 space-y-1.5">
                <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Prescribed Action</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedGap.prescribedAction}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remedial Drill Interactive Modal */}
      {practiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#060b1d]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#091438] border border-[#1d3570] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase">
                  Cubit Remedial Engine
                </span>
                <h3 className="text-base font-bold text-white">
                  Organic Chemistry Reaction Drill (5 MCQs)
                </h3>
              </div>
              <button
                onClick={() => {
                  setPracticeModalOpen(false);
                  setDrillCompleted(false);
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {!drillCompleted ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Targeted Question 1 of 5: In an SN1 reaction on an optically active alkyl halide, what is the stereochemical outcome?
                </p>
                <div className="space-y-2">
                  {[
                    'Complete inversion of configuration (Walden inversion)',
                    'Partial or complete racemization (carbocation planar intermediate)',
                    'Retention of configuration exclusively',
                    'Formation of diastereomers only',
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setDrillCompleted(true)}
                      className="w-full text-left p-3 rounded-xl bg-[#060b1d] border border-white/10 text-xs text-slate-200 hover:border-purple-400 hover:bg-purple-950/20 transition"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Drill Complete! 5/5 Correct</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your Organic Chemistry SN1 accuracy rating has increased from 42% to <strong>68%</strong>!
                </p>
                <button
                  onClick={() => {
                    setPracticeModalOpen(false);
                    setDrillCompleted(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                >
                  Return to Radar Hub
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentKnowledgeRadarPage;
