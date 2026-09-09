import React from 'react';
import type { UserProfile, DailyLog, CompletedWorkoutLog, WorkoutTemplate } from '../types';
import { MacroCards } from './MacroCards';
import { HydrationStepTracker } from './HydrationStepTracker';
import { Dumbbell, Play, Sparkles, ChevronRight, Download } from 'lucide-react';
import { DEFAULT_WORKOUTS } from '../data/defaultData';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  workoutHistory: CompletedWorkoutLog[];
  onUpdateDailyLog: (updated: DailyLog) => void;
  onOpenMealLogger: () => void;
  onOpenStepCounterModal?: () => void;
  onOpenInstallModal?: () => void;
  onStartWorkout: (workout: WorkoutTemplate) => void;
  onNavigateToWorkouts: () => void;
  onOpenPaywall: () => void;
  isSubscribed: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  dailyLog,
  onUpdateDailyLog,
  onOpenMealLogger,
  onOpenStepCounterModal,
  onOpenInstallModal,
  onStartWorkout,
  onNavigateToWorkouts,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Welcome Athlete Hero Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> 12-Week Protocol Active
            </div>

            {onOpenInstallModal && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Install App (iOS & Android)
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome Back, {profile.name}!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Targeting <strong className="text-white capitalize">{profile.goal.replace('_', ' ')}</strong> at {profile.currentWeightLbs} lbs bodyweight. Your custom macro split is live.
          </p>
        </div>

        {/* Quick Actions Buttons */}
        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="py-3.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-lime-400" />
              <span>Install Mobile App</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onStartWorkout(DEFAULT_WORKOUTS[0])}
            className="py-3.5 px-5 bg-lime-500 hover:bg-lime-400 active:scale-95 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            <span>Start Chest & Tri Split</span>
          </button>
        </div>
      </div>

      {/* Main Calorie & Macro Target Cards */}
      <MacroCards
        profile={profile}
        dailyLog={dailyLog}
        onOpenMealLogger={onOpenMealLogger}
      />

      {/* Hydration & Step Counter Cards */}
      <HydrationStepTracker
        profile={profile}
        dailyLog={dailyLog}
        onUpdateDailyLog={onUpdateDailyLog}
        onOpenStepCounterModal={onOpenStepCounterModal}
      />

      {/* Recommended Offline Workouts Shortcut Grid */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-lime-400" /> Recommended Hypertrophy Splits
            </h3>
            <p className="text-xs text-zinc-400">Tap to start live set & rep logging with Web Audio timer.</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToWorkouts}
            className="text-xs font-bold text-lime-400 hover:text-lime-300 flex items-center gap-1 cursor-pointer"
          >
            View All ({DEFAULT_WORKOUTS.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DEFAULT_WORKOUTS.slice(0, 3).map((w) => (
            <div
              key={w.id}
              onClick={() => onStartWorkout(w)}
              className="p-4 bg-zinc-950 border border-zinc-800 hover:border-lime-500/50 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20">
                  {w.category}
                </span>
                <h4 className="font-bold text-white text-sm mt-2 group-hover:text-lime-400 transition-colors">
                  {w.name}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{w.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">{w.estimatedMinutes} mins</span>
                <span className="text-lime-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Start <Play className="w-3 h-3 fill-lime-400" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
