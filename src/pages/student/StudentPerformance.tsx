import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  Target,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { NativeTrendChart } from '../../components/common/NativeTrendChart';
import { examApi } from '../../services/api';
import { PerformanceAnalytics } from '../../types';
import { StatCard } from '../../components/common/StatCard';

export const StudentPerformance: React.FC = () => {
  const [performance, setPerformance] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerf = async () => {
      setLoading(true);
      try {
        const data = await examApi.getMyPerformance();
        setPerformance(data);
      } finally {
        setLoading(false);
      }
    };
    fetchPerf();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-orange" />
          Performance Analytics & Insights
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Deep diagnostic metrics, speed efficiency, accuracy analytics, and subject strengths
        </p>
      </div>

      {/* Top Analytical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Overall Accuracy"
          value={`${performance?.accuracyRate || 88.5}%`}
          subtitle="Net correct vs wrong answers"
          icon={Target}
          trend={{ value: '+3.2%', isPositive: true }}
          highlightOrange={true}
        />

        <StatCard
          title="Net Improvement"
          value={`+${performance?.improvementRate || 27.0}%`}
          subtitle="From baseline diagnostic test"
          icon={TrendingUp}
          trend={{ value: 'Steadily Rising', isPositive: true }}
          colorScheme="orange"
        />

        <StatCard
          title="Average Speed"
          value="48 sec"
          subtitle="Per MCQ question"
          icon={Clock}
          trend={{ value: '12s faster than avg', isPositive: true }}
          colorScheme="emerald"
        />

        <StatCard
          title="Percentile Standing"
          value="92.4th"
          subtitle="Across all active batches"
          icon={Award}
          trend={{ value: 'Top 8%', isPositive: true }}
          colorScheme="navy"
        />
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal Score Evolution */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-orange" />
                Score Progression Over 12 Tests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation from initial enrollment to present mocks
              </p>
            </div>
            <span className="text-xs font-bold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/30">
              Benchmark Target: 80%+
            </span>
          </div>

          <div className="w-full">
            {performance?.trend ? (
              <NativeTrendChart
                data={performance.trend.map((t) => ({ month: t.date || t.examName, score: t.score }))}
                height={220}
              />
            ) : null}
          </div>
        </div>

        {/* Strong vs Weak Domain Diagnostics */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-navy mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Domain Diagnostic Breakdown
            </h2>
            <p className="text-xs text-slate-500 mb-6">Subject strengths and growth areas</p>

            <div className="space-y-4">
              {performance?.subjectWise?.map((sub) => (
                <div key={sub.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{sub.subject}</span>
                    <span className="font-bold text-brand-navy">{sub.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sub.percentage >= 85
                          ? 'bg-emerald-500'
                          : sub.percentage >= 75
                          ? 'bg-brand-navy'
                          : 'bg-brand-orange'
                      }`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{sub.marksObtained} / {sub.maxMarks} marks</span>
                    <span className="text-emerald-600 font-semibold">+{sub.improvement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs space-y-2">
            <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Strongest: General Awareness & Reasoning Ability</span>
            </div>
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Recommended Focus: English Reading Comprehension</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
