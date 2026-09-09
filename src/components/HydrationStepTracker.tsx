import React, { useState } from 'react';
import { Droplet, Footprints, RotateCcw, Flame, MapPin, ExternalLink } from 'lucide-react';
import type { UserProfile, DailyLog } from '../types';

interface HydrationStepTrackerProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onUpdateDailyLog: (updated: DailyLog) => void;
  onOpenStepCounterModal?: () => void;
}

export const HydrationStepTracker: React.FC<HydrationStepTrackerProps> = ({
  profile,
  dailyLog,
  onUpdateDailyLog,
  onOpenStepCounterModal,
}) => {
  const [stepInput, setStepInput] = useState<string>('');

  const targetWaterOz = profile.dailyWaterOzTarget || 120;
  const currentWaterOz = dailyLog.waterOz || 0;
  const waterPct = Math.min(100, Math.round((currentWaterOz / targetWaterOz) * 100));

  const targetSteps = profile.dailyStepTarget || 10000;
  const currentSteps = dailyLog.steps || 0;
  const stepPct = Math.min(100, Math.round((currentSteps / targetSteps) * 100));

  // Calculated distance & calories
  const distanceMiles = ((currentSteps * 2.5) / 5280).toFixed(2);
  const caloriesBurned = Math.round(currentSteps * 0.04);

  const handleAddWater = (oz: number) => {
    const updated = {
      ...dailyLog,
      waterOz: Math.max(0, currentWaterOz + oz),
    };
    onUpdateDailyLog(updated);
  };

  const handleSetSteps = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(stepInput);
    if (!isNaN(val) && val >= 0) {
      const updated = {
        ...dailyLog,
        steps: val,
        streakCompleted: true,
      };
      onUpdateDailyLog(updated);
      setStepInput('');
    }
  };

  const handleQuickAddSteps = (added: number) => {
    const updated = {
      ...dailyLog,
      steps: Math.max(0, currentSteps + added),
      streakCompleted: true,
    };
    onUpdateDailyLog(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Water Tracker Card */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Droplet className="w-5 h-5 fill-blue-400/20" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Hydration Log</h3>
              <p className="text-xs text-zinc-400">Target: {targetWaterOz} fl. oz / day</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleAddWater(-currentWaterOz)}
            title="Reset water log"
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Big Numbers */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="text-3xl font-black text-white">
            {currentWaterOz} <span className="text-xs font-semibold text-blue-400">fl. oz</span>
          </div>
          <div className="text-xs font-bold text-zinc-400 font-mono">
            {waterPct}% achieved
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${waterPct}%` }}
          />
        </div>

        {/* Quick Add Oz Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[
            { label: '+8 oz', oz: 8, subtitle: 'Glass' },
            { label: '+16 oz', oz: 16, subtitle: 'Bottle' },
            { label: '+32 oz', oz: 32, subtitle: 'Shaker' },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => handleAddWater(btn.oz)}
              className="py-2.5 px-3 bg-zinc-950 hover:bg-blue-500/10 border border-zinc-800 hover:border-blue-500/40 rounded-xl text-center transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-white group-hover:text-blue-400">{btn.label}</div>
              <div className="text-[10px] text-zinc-500">{btn.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step Tracker Card */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Live Step Counter</h3>
              <p className="text-xs text-zinc-400">Target: {targetSteps.toLocaleString()} steps</p>
            </div>
          </div>

          {onOpenStepCounterModal && (
            <button
              type="button"
              onClick={onOpenStepCounterModal}
              className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 border border-emerald-500/30 font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Simulator & Badges</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Big Numbers & Distance preview */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="text-3xl font-black text-white">
              {currentSteps.toLocaleString()} <span className="text-xs font-semibold text-emerald-400">steps</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> {distanceMiles} mi
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" /> {caloriesBurned} kcal
              </span>
            </div>
          </div>

          <div className="text-xs font-bold text-zinc-400 font-mono">
            {stepPct}% achieved
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${stepPct}%` }}
          />
        </div>

        {/* Quick Add Steps / Input Form */}
        <form onSubmit={handleSetSteps} className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleQuickAddSteps(1000)}
            className="py-2 px-3 bg-zinc-950 hover:bg-emerald-500/10 border border-zinc-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-white hover:text-emerald-400 transition-all cursor-pointer"
          >
            +1,000
          </button>
          <button
            type="button"
            onClick={() => handleQuickAddSteps(2500)}
            className="py-2 px-3 bg-zinc-950 hover:bg-emerald-500/10 border border-zinc-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-white hover:text-emerald-400 transition-all cursor-pointer"
          >
            +2,500
          </button>
          <input
            type="number"
            placeholder="Custom count..."
            value={stepInput}
            onChange={(e) => setStepInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer"
          >
            Set
          </button>
        </form>
      </div>

    </div>
  );
};
