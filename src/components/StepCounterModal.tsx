import React, { useState, useEffect, useRef } from 'react';
import { Footprints, X, Play, Pause, Flame, MapPin, Clock, Award, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DailyLog, UserProfile } from '../types';
import { soundManager } from '../utils/audio';

interface StepCounterModalProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onClose: () => void;
  onUpdateDailyLog: (updated: DailyLog) => void;
}

export const StepCounterModal: React.FC<StepCounterModalProps> = ({
  profile,
  dailyLog,
  onClose,
  onUpdateDailyLog,
}) => {
  const [customStepInput, setCustomStepInput] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  
  const simulationIntervalRef = useRef<number | null>(null);

  const targetSteps = profile.dailyStepTarget || 10000;
  const currentSteps = dailyLog.steps || 0;
  const stepPct = Math.min(100, Math.round((currentSteps / targetSteps) * 100));

  // Calculated Stats
  const distanceMiles = ((currentSteps * 2.5) / 5280).toFixed(2);
  const caloriesBurned = Math.round(currentSteps * 0.04);
  const activeMinutes = Math.round(currentSteps / 100);

  // Live Simulation effect
  useEffect(() => {
    if (isSimulating) {
      simulationIntervalRef.current = window.setInterval(() => {
        const addedSteps = Math.floor(Math.random() * 3) + 2; // 2 to 4 steps per tick
        
        onUpdateDailyLog({
          ...dailyLog,
          steps: (dailyLog.steps || 0) + addedSteps,
          streakCompleted: true,
        });

        // Soft audio tick for step
        soundManager.playTick();
      }, 1000);
    } else {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    }

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [isSimulating, dailyLog, onUpdateDailyLog]);

  const handleAddSteps = (added: number) => {
    const nextSteps = Math.max(0, currentSteps + added);
    const updated = {
      ...dailyLog,
      steps: nextSteps,
      streakCompleted: true,
    };

    if (currentSteps < targetSteps && nextSteps >= targetSteps) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log(e);
      }
    }

    onUpdateDailyLog(updated);
  };

  const handleCustomSet = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customStepInput);
    if (!isNaN(val) && val >= 0) {
      const updated = {
        ...dailyLog,
        steps: val,
        streakCompleted: true,
      };
      onUpdateDailyLog(updated);
      setCustomStepInput('');
    }
  };

  const milestones = [
    { target: 5000, label: '5K Steps', badge: '🥉 Active Walker' },
    { target: 8000, label: '8K Steps', badge: '🥈 Health Warrior' },
    { target: 10000, label: '10K Steps', badge: '🥇 Daily Goal Crusher' },
    { target: 15000, label: '15K Steps', badge: '💎 Endurance Titan' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Advanced Pedometer & Step Tracker</h2>
              <p className="text-xs text-zinc-400">Real-time distance, calorie burn & live motion sensor simulator.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Main Gauges Card */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Today's Step Count</span>
                <div className="text-4xl sm:text-5xl font-black text-white mt-1">
                  {currentSteps.toLocaleString()}{' '}
                  <span className="text-sm font-bold text-emerald-400">/ {targetSteps.toLocaleString()} steps</span>
                </div>
              </div>

              {/* Live Walking Simulator Toggle */}
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                className={`py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isSimulating
                    ? 'bg-amber-500 text-zinc-950 shadow-amber-500/20 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Walking Simulator
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-zinc-950" /> Start Live Walking Sensor
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-900 h-3.5 rounded-full overflow-hidden border border-zinc-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${stepPct}%` }}
              />
            </div>

            {/* Calculated Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Distance
                </div>
                <div className="text-xl font-black text-white">{distanceMiles}</div>
                <div className="text-[10px] text-zinc-500">Miles walked</div>
              </div>

              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" /> Calories
                </div>
                <div className="text-xl font-black text-rose-400">{caloriesBurned}</div>
                <div className="text-[10px] text-zinc-500">kcal burned</div>
              </div>

              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Active Time
                </div>
                <div className="text-xl font-black text-white">{activeMinutes}</div>
                <div className="text-[10px] text-zinc-500">Minutes active</div>
              </div>
            </div>
          </div>

          {/* Quick Add Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Quick Add Steps
              </label>
              <button
                type="button"
                onClick={() => onUpdateDailyLog({ ...dailyLog, steps: 0 })}
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Today's Steps
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '+500', steps: 500, subtitle: 'Quick Walk' },
                { label: '+1,000', steps: 1000, subtitle: 'Short Jog' },
                { label: '+2,500', steps: 2500, subtitle: '30-Min Walk' },
                { label: '+5,000', steps: 5000, subtitle: '5K Distance' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleAddSteps(btn.steps)}
                  className="p-3 bg-zinc-950 hover:bg-emerald-500/10 border border-zinc-800 hover:border-emerald-500/40 rounded-2xl text-center transition-all cursor-pointer group"
                >
                  <div className="text-sm font-bold text-white group-hover:text-emerald-400">{btn.label}</div>
                  <div className="text-[10px] text-zinc-500">{btn.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Step Set Form */}
          <form onSubmit={handleCustomSet} className="flex gap-2">
            <input
              type="number"
              placeholder="Enter exact step count..."
              value={customStepInput}
              onChange={(e) => setCustomStepInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Set Count
            </button>
          </form>

          {/* Milestones & Achievement Badges */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Daily Step Badges & Milestones
            </label>

            <div className="grid grid-cols-2 gap-2">
              {milestones.map((m) => {
                const achieved = currentSteps >= m.target;
                return (
                  <div
                    key={m.target}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      achieved
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{m.badge}</div>
                      <div className="text-[10px] opacity-80">{m.label} Goal</div>
                    </div>
                    {achieved && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
