import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { studyPlansApi } from '../../services/api';
import { StudyPlan, StudyPlanDay } from '../../types';

export const StudentStudyPlanPage: React.FC = () => {
  const { student } = useAuth();
  const { addNotification } = useNotifications();

  const studentId = student?.studentId || 'CF-STU-0001';

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const res = await studyPlansApi.getStudentPlan(studentId);
        setStudyPlan(res);
        if (res.schedule && res.schedule.length > 0) {
          setSelectedDay(res.schedule[0].day);
        }
      } catch {
        addNotification('error', 'Could not load student study plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [studentId]);

  const activeDaySchedule: StudyPlanDay | undefined = studyPlan?.schedule?.find(
    (d) => d.day.toLowerCase() === selectedDay.toLowerCase()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Digital Study Plan</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Day-by-day structured learning path customized for {student?.courseName || 'Banking & Financial Services'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Batch: {student?.batchName || 'Morning Achievers'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading structured curriculum schedule...</p>
        </div>
      ) : !studyPlan ? (
        <div className="p-12 text-center rounded-2xl bg-[#060B1E] border border-white/5 space-y-2">
          <p className="text-sm font-bold text-white">No active study plan assigned yet</p>
          <p className="text-xs text-slate-400">Your faculty advisor will assign your weekly syllabus plan shortly.</p>
        </div>
      ) : (
        <>
          {/* Plan Meta Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#091438] via-[#0D1C4D] to-[#091438] border border-[#192D6B] shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 relative z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-orange text-white">
                Active Curriculum
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">{studyPlan.title}</h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {studyPlan.description}
              </p>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3 relative z-10 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[100px]">
                <p className="text-[10px] text-slate-400">Total Days</p>
                <p className="text-lg font-black text-white mt-0.5">{studyPlan.schedule?.length || 6}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[100px]">
                <p className="text-[10px] text-slate-400">Daily Study Target</p>
                <p className="text-lg font-black text-brand-orange mt-0.5">60-75m</p>
              </div>
            </div>
          </div>

          {/* Day Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {studyPlan.schedule?.map((d) => {
              const isSelected = selectedDay.toLowerCase() === d.day.toLowerCase();
              return (
                <button
                  key={d.day}
                  onClick={() => setSelectedDay(d.day)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition flex flex-col items-start gap-1 min-w-[130px] border ${
                    isSelected
                      ? 'bg-gradient-to-br from-brand-orange to-[#FF7700] text-white border-brand-orange shadow-lg shadow-brand-orange/20 scale-102'
                      : 'bg-[#070D24] text-slate-300 border-[#14234E] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="uppercase tracking-wider text-[10px] opacity-80">{d.day}</span>
                  <span className="font-extrabold text-sm truncate w-full text-left">{d.subject}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Day Breakdown */}
          {activeDaySchedule ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#070E28] border border-[#162758] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider">
                    {activeDaySchedule.day} • {activeDaySchedule.subject}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Topic Focus: {activeDaySchedule.focus}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-brand-orange" />
                    Target Time: {activeDaySchedule.targetMins} mins
                  </span>
                  {activeDaySchedule.targetQuestions > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-slate-300">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      Target Questions: {activeDaySchedule.targetQuestions} Qs
                    </span>
                  )}
                </div>
              </div>

              {/* Tasks List Under This Day */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Sub-Tasks for {activeDaySchedule.day}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeDaySchedule.tasks?.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="p-4 rounded-2xl bg-[#060B1E] border border-[#13224B] hover:border-brand-orange/40 transition flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-brand-orange text-xs flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-white">{t.title}</h5>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                              {t.type}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-brand-orange" /> {t.durationMins} mins
                            </span>
                            {t.targetQuestions > 0 && (
                              <>
                                <span>•</span>
                                <span>{t.targetQuestions} Practice Questions</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {t.completed ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default StudentStudyPlanPage;
