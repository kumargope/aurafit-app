import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Timer, Plus, Play, Pause, Dumbbell, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { WorkoutTemplate, ExerciseLog, SetLog, CompletedWorkoutLog } from '../types';
import { soundManager } from '../utils/audio';
import { saveWorkoutLog } from '../services/storage';
import { getTodayDateString } from '../utils/calc';

interface ActiveWorkoutModalProps {
  workout: WorkoutTemplate;
  onClose: () => void;
  onWorkoutCompleted: (log: CompletedWorkoutLog) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  onClose,
  onWorkoutCompleted,
}) => {
  // Initialize Exercise logs from template
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => {
    return workout.exercises.map((ex) => {
      const sets: SetLog[] = Array.from({ length: ex.targetSets }, (_, i) => ({
        setNumber: i + 1,
        reps: parseInt(ex.targetReps) || 10,
        weightLbs: ex.defaultWeightLbs,
        completed: false,
      }));

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets,
      };
    });
  });

  const [startTime] = useState<number>(Date.now());

  // Rest Timer State
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerTotal, setTimerTotal] = useState<number>(60);
  const [timerLeft, setTimerLeft] = useState<number>(60);
  const [timerExerciseName, setTimerExerciseName] = useState<string>('');

  const intervalRef = useRef<number | null>(null);

  // Timer Tick Logic
  useEffect(() => {
    if (timerActive && timerLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            soundManager.playTick();
          }
          if (prev <= 1) {
            soundManager.playCompletionChime();
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive, timerLeft]);

  // Start Rest Timer for specific exercise
  const triggerRestTimer = (seconds: number, exName: string) => {
    setTimerTotal(seconds);
    setTimerLeft(seconds);
    setTimerExerciseName(exName);
    setTimerActive(true);
  };

  // Toggle Set Completion
  const handleToggleSet = (exerciseIndex: number, setIndex: number, defaultRest: number) => {
    setExerciseLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      const targetSet = newLogs[exerciseIndex].sets[setIndex];
      const nextCompletedState = !targetSet.completed;

      targetSet.completed = nextCompletedState;

      // If marking set as completed, trigger rest timer
      if (nextCompletedState) {
        triggerRestTimer(defaultRest, newLogs[exerciseIndex].exerciseName);
      }

      return newLogs;
    });
  };

  // Update Reps or Weight
  const handleUpdateSetField = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weightLbs',
    value: number
  ) => {
    setExerciseLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      newLogs[exerciseIndex].sets[setIndex][field] = Math.max(0, value);
      return newLogs;
    });
  };

  // Add extra set to an exercise
  const handleAddSet = (exerciseIndex: number) => {
    setExerciseLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      const currentSets = newLogs[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1] || { reps: 10, weightLbs: 50 };

      newLogs[exerciseIndex].sets.push({
        setNumber: currentSets.length + 1,
        reps: lastSet.reps,
        weightLbs: lastSet.weightLbs,
        completed: false,
      });
      return newLogs;
    });
  };

  // Calculate total volume lifted in lbs
  const totalVolumeLbs = exerciseLogs.reduce((acc, ex) => {
    const exerciseVol = ex.sets.reduce((sAcc, set) => {
      return sAcc + (set.completed ? set.reps * set.weightLbs : 0);
    }, 0);
    return acc + exerciseVol;
  }, 0);

  // Total completed sets count
  const completedSetsCount = exerciseLogs.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.completed).length;
  }, 0);

  // Finish Workout
  const handleFinishWorkout = () => {
    const durationMinutes = Math.max(1, Math.round((Date.now() - startTime) / (1000 * 60)));

    const log: CompletedWorkoutLog = {
      id: `log_${Date.now()}`,
      workoutId: workout.id,
      workoutName: workout.name,
      date: getTodayDateString(),
      timestamp: Date.now(),
      durationMinutes,
      totalVolumeLbs,
      exerciseLogs,
    };

    saveWorkoutLog(log);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (e) {
      console.log(e);
    }

    onWorkoutCompleted(log);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Navigation Bar */}
        <div className="p-4 sm:p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">{workout.name}</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20">
                  LIVE SESSION
                </span>
              </div>
              <p className="text-xs text-zinc-400">Log your sets & reps in lbs. Rest timer plays Web Audio chime.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Volume & Completed Banner */}
        <div className="bg-zinc-950/60 px-6 py-3 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <span>Volume Lifted: </span>
              <strong className="text-lime-400 font-mono text-sm">{totalVolumeLbs.toLocaleString()} lbs</strong>
            </div>
            <div className="hidden sm:block">
              <span>Sets Completed: </span>
              <strong className="text-white font-mono">{completedSetsCount} sets</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishWorkout}
            className="py-2 px-4 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-lime-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4" /> Finish Session
          </button>
        </div>

        {/* Main Workout Exercises Log Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {workout.exercises.map((exerciseTemplate, exIdx) => {
            const exLog = exerciseLogs[exIdx];
            return (
              <div
                key={exerciseTemplate.id}
                className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {exIdx + 1}. {exerciseTemplate.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{exerciseTemplate.instructions}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-400">
                      Rest: <strong className="text-lime-400">{exerciseTemplate.restSeconds}s</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerRestTimer(exerciseTemplate.restSeconds, exerciseTemplate.name)}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Timer className="w-3.5 h-3.5 text-lime-400" /> Start Rest
                    </button>
                  </div>
                </div>

                {/* Set Log Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-zinc-400 uppercase text-center px-1">
                  <div className="col-span-2 text-left">Set</div>
                  <div className="col-span-4">Weight (lbs)</div>
                  <div className="col-span-4">Reps</div>
                  <div className="col-span-2">Done</div>
                </div>

                {/* Set Rows */}
                <div className="space-y-2">
                  {exLog.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                        set.completed
                          ? 'bg-lime-500/10 border-lime-500/30'
                          : 'bg-zinc-900/60 border-zinc-800'
                      }`}
                    >
                      {/* Set Label */}
                      <div className="col-span-2 text-xs font-mono font-bold text-zinc-300 pl-1">
                        Set {set.setNumber}
                      </div>

                      {/* Weight (lbs) Input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.weightLbs}
                          onChange={(e) =>
                            handleUpdateSetField(exIdx, setIdx, 'weightLbs', parseInt(e.target.value) || 0)
                          }
                          className="w-full text-center px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            handleUpdateSetField(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)
                          }
                          className="w-full text-center px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      {/* Checkbox Toggle */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleSet(exIdx, setIdx, exerciseTemplate.restSeconds)
                          }
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            set.completed
                              ? 'bg-lime-500 text-zinc-950 shadow-md shadow-lime-500/20'
                              : 'bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Set button */}
                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="text-xs text-zinc-400 hover:text-lime-400 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Extra Set
                </button>
              </div>
            );
          })}
        </div>

        {/* Floating Rest Timer Widget / Drawer */}
        {timerActive && (
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4 shrink-0 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-zinc-800" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-lime-400 transition-all duration-1000"
                    fill="transparent"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * (timerTotal - timerLeft)) / timerTotal}
                  />
                </svg>
                <span className="absolute font-mono font-bold text-xs text-white">{timerLeft}s</span>
              </div>

              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-lime-400" /> Rest Timer Running
                </div>
                <div className="text-[11px] text-zinc-400">Next set for {timerExerciseName}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimerLeft((prev) => prev + 30)}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-bold hover:text-white cursor-pointer"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => setTimerActive(!timerActive)}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white cursor-pointer"
              >
                {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerActive(false);
                  setTimerLeft(0);
                }}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-red-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
