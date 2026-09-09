import React from 'react';
import { Award, Calendar, Dumbbell, Flame, TrendingUp, CheckCircle } from 'lucide-react';
import type { CompletedWorkoutLog, DailyLog, UserProfile } from '../types';
import { formatDateFriendly } from '../utils/calc';

interface AnalyticsViewProps {
  profile: UserProfile;
  workoutLogs: CompletedWorkoutLog[];
  dailyLogs: Record<string, DailyLog>;
  streak: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  workoutLogs,
  streak,
}) => {
  const totalVolumeLbs = workoutLogs.reduce((acc, log) => acc + log.totalVolumeLbs, 0);
  const totalWorkoutMinutes = workoutLogs.reduce((acc, log) => acc + log.durationMinutes, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner Overview */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
        <h2 className="text-2xl font-black text-white tracking-tight">Performance Analytics & History</h2>
        <p className="text-sm text-zinc-400">All metrics calculated from local browser storage logs.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
              <Flame className="w-4 h-4 text-lime-400" /> Active Streak
            </div>
            <div className="text-3xl font-black text-lime-400 mt-2">{streak} Days</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Consecutive check-ins</div>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
              <Dumbbell className="w-4 h-4 text-cyan-400" /> Total Volume
            </div>
            <div className="text-3xl font-black text-white mt-2">{totalVolumeLbs.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Cumulative lbs lifted</div>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
              <Award className="w-4 h-4 text-amber-400" /> Workouts
            </div>
            <div className="text-3xl font-black text-white mt-2">{workoutLogs.length}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Completed protocols</div>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Time Spent
            </div>
            <div className="text-3xl font-black text-white mt-2">{totalWorkoutMinutes}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Total active minutes</div>
          </div>
        </div>
      </div>

      {/* Workout Logs History List */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-lime-400" /> Completed Workout Log History
        </h3>

        {workoutLogs.length === 0 ? (
          <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-2xl text-center text-zinc-500 text-sm">
            No completed workouts logged yet. Start a protocol session from the Workouts tab!
          </div>
        ) : (
          <div className="space-y-3">
            {workoutLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-lime-400" />
                    <h4 className="font-bold text-white text-base">{log.workoutName}</h4>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {formatDateFriendly(log.date)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-zinc-400 mt-2">
                    {log.exerciseLogs.map((ex, i) => (
                      <span key={i} className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[11px]">
                        {ex.exerciseName} ({ex.sets.filter((s) => s.completed).length} sets)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-zinc-400 shrink-0">
                  <div className="text-lime-400 font-bold text-sm">
                    {log.totalVolumeLbs.toLocaleString()} lbs
                  </div>
                  <div>{log.durationMinutes} minutes</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
