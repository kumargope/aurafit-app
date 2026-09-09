import React, { useState } from 'react';
import { Clock, Flame, Play, Filter, CheckCircle2 } from 'lucide-react';
import type { WorkoutTemplate, CompletedWorkoutLog } from '../types';
import { DEFAULT_WORKOUTS } from '../data/defaultData';
import { formatDateFriendly } from '../utils/calc';

interface WorkoutLibraryProps {
  onStartWorkout: (template: WorkoutTemplate) => void;
  workoutHistory: CompletedWorkoutLog[];
}

export const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({
  onStartWorkout,
  workoutHistory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Push', 'Pull', 'Legs', 'Full Body', 'Core'];

  const filteredWorkouts = selectedCategory === 'All'
    ? DEFAULT_WORKOUTS
    : DEFAULT_WORKOUTS.filter((w) => w.category === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Offline Workout Protocols</h2>
          <p className="text-sm text-zinc-400 mt-1">Pre-loaded US hypertrophy and strength splits with live rest timer.</p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-zinc-500 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-lime-500 text-zinc-950 shadow-md shadow-lime-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Workout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkouts.map((workout) => {
          // Check if user completed this workout recently
          const lastLogged = workoutHistory.find((log) => log.workoutId === workout.id);

          return (
            <div
              key={workout.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/20">
                    {workout.category}
                  </span>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" /> {workout.estimatedMinutes} min
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-zinc-300">
                      <Flame className="w-3.5 h-3.5 text-amber-500" /> {workout.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-lime-400 transition-colors">
                  {workout.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {workout.description}
                </p>

                {/* Target Muscle Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {workout.targetMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-semibold bg-zinc-950 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-md"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Exercise List Preview */}
                <div className="space-y-1.5 border-t border-zinc-800/80 pt-4 mb-6">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase mb-2">
                    {workout.exercises.length} Included Movements:
                  </div>
                  {workout.exercises.map((ex, idx) => (
                    <div key={ex.id} className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">
                        {idx + 1}. {ex.name}
                      </span>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        {ex.targetSets} sets × {ex.targetReps} ({ex.defaultWeightLbs > 0 ? `${ex.defaultWeightLbs} lbs` : 'BW'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {lastLogged && (
                  <div className="mb-3 text-[11px] text-zinc-400 flex items-center gap-1.5 bg-zinc-950 p-2 rounded-xl border border-zinc-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    <span>Last completed: <strong className="text-white">{formatDateFriendly(lastLogged.date)}</strong> ({lastLogged.totalVolumeLbs.toLocaleString()} lbs total)</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onStartWorkout(workout)}
                  className="w-full py-3.5 px-4 bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>Start Live Workout Mode</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
