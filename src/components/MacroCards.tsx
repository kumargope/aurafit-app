import React from 'react';
import { Flame, Plus } from 'lucide-react';
import type { UserProfile, DailyLog } from '../types';

interface MacroCardsProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onOpenMealLogger: () => void;
}

export const MacroCards: React.FC<MacroCardsProps> = ({ profile, dailyLog, onOpenMealLogger }) => {
  const calTarget = profile.dailyCalorieTarget || 2200;
  const calConsumed = dailyLog.caloriesConsumed || 0;
  const calPct = Math.min(100, Math.round((calConsumed / calTarget) * 100));

  const proteinTarget = profile.dailyProteinGrams || 180;
  const proteinConsumed = dailyLog.proteinGrams || 0;
  const proteinPct = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100));

  const carbsTarget = profile.dailyCarbsGrams || 220;
  const carbsConsumed = dailyLog.carbsGrams || 0;
  const carbsPct = Math.min(100, Math.round((carbsConsumed / carbsTarget) * 100));

  const fatsTarget = profile.dailyFatsGrams || 65;
  const fatsConsumed = dailyLog.fatsGrams || 0;
  const fatsPct = Math.min(100, Math.round((fatsConsumed / fatsTarget) * 100));

  return (
    <div className="space-y-4">
      
      {/* Main Calorie Header Card */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <Flame className="w-6 h-6 fill-lime-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">Daily Calorie Target</h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20">
                  {profile.goal.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400">Target calculated for {profile.currentWeightLbs} lbs athlete bodyweight</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMealLogger}
            className="py-2.5 px-4 bg-lime-500 hover:bg-lime-400 active:scale-95 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-lime-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Meal / Macros
          </button>
        </div>

        {/* Big Numbers Gauge */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Consumed</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">{calConsumed}</div>
            <span className="text-[10px] text-zinc-500">kcal</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Remaining</span>
            <div className="text-2xl sm:text-3xl font-black text-lime-400 mt-0.5">
              {Math.max(0, calTarget - calConsumed)}
            </div>
            <span className="text-[10px] text-zinc-500">kcal</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Goal</span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-400 mt-0.5">{calTarget}</div>
            <span className="text-[10px] text-zinc-500">kcal</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${calPct}%` }}
          />
        </div>
      </div>

      {/* 3 Macro Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Protein Card */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Protein
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">
              {proteinConsumed} / {proteinTarget}g
            </span>
          </div>
          <div className="text-xl font-black text-white mb-2">
            {proteinPct}% <span className="text-xs font-normal text-zinc-400">of daily goal</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Carbs
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">
              {carbsConsumed} / {carbsTarget}g
            </span>
          </div>
          <div className="text-xl font-black text-white mb-2">
            {carbsPct}% <span className="text-xs font-normal text-zinc-400">of daily goal</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${carbsPct}%` }}
            />
          </div>
        </div>

        {/* Fats Card */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Fats
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">
              {fatsConsumed} / {fatsTarget}g
            </span>
          </div>
          <div className="text-xl font-black text-white mb-2">
            {fatsPct}% <span className="text-xs font-normal text-zinc-400">of daily goal</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${fatsPct}%` }}
            />
          </div>
        </div>

      </div>

    </div>
  );
};
