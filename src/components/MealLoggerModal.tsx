import React, { useState } from 'react';
import { X, Plus, Utensils } from 'lucide-react';
import type { DailyLog, MealLogItem } from '../types';
import { DEFAULT_MEALS } from '../data/defaultData';

interface MealLoggerModalProps {
  dailyLog: DailyLog;
  onClose: () => void;
  onSaveDailyLog: (updated: DailyLog) => void;
}

export const MealLoggerModal: React.FC<MealLoggerModalProps> = ({
  dailyLog,
  onClose,
  onSaveDailyLog,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Custom Form State
  const [customName, setCustomName] = useState<string>('');
  const [customCalories, setCustomCalories] = useState<string>('350');
  const [customProtein, setCustomProtein] = useState<string>('30');
  const [customCarbs, setCustomCarbs] = useState<string>('35');
  const [customFats, setCustomFats] = useState<string>('10');

  const addMealToLog = (item: { name: string; calories: number; protein: number; carbs: number; fats: number }) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMealItem: MealLogItem = {
      id: `meal_${Date.now()}`,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      time: timeStr,
    };

    const updatedMeals = [...(dailyLog.meals || []), newMealItem];
    const updatedLog: DailyLog = {
      ...dailyLog,
      caloriesConsumed: (dailyLog.caloriesConsumed || 0) + item.calories,
      proteinGrams: (dailyLog.proteinGrams || 0) + item.protein,
      carbsGrams: (dailyLog.carbsGrams || 0) + item.carbs,
      fatsGrams: (dailyLog.fatsGrams || 0) + item.fats,
      meals: updatedMeals,
      streakCompleted: true,
    };

    onSaveDailyLog(updatedLog);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addMealToLog({
      name: customName.trim(),
      calories: parseInt(customCalories) || 0,
      protein: parseInt(customProtein) || 0,
      carbs: parseInt(customCarbs) || 0,
      fats: parseInt(customFats) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Log Nutrition & Macros</h2>
              <p className="text-xs text-zinc-400">Select US high-protein presets or input custom macros.</p>
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

        {/* Tab Selection */}
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800/80 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-lime-500 text-zinc-950'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            US Meal Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-lime-500 text-zinc-950'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Custom Macro Entry
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Tab 1: US Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              {DEFAULT_MEALS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 bg-zinc-950 border border-zinc-800 hover:border-lime-500/50 rounded-2xl flex items-center justify-between gap-4 transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {preset.category}
                      </span>
                      <h4 className="font-bold text-white text-sm group-hover:text-lime-400 transition-colors">
                        {preset.name}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{preset.portion}</p>
                    
                    {/* Macro pill summary */}
                    <div className="flex items-center gap-3 text-xs mt-2 font-mono">
                      <span className="text-lime-400 font-bold">{preset.calories} kcal</span>
                      <span className="text-cyan-400">{preset.protein}g P</span>
                      <span className="text-amber-400">{preset.carbs}g C</span>
                      <span className="text-rose-400">{preset.fats}g F</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addMealToLog(preset)}
                    className="py-2 px-3 bg-lime-500/10 hover:bg-lime-500 text-lime-400 hover:text-zinc-950 font-bold text-xs rounded-xl border border-lime-500/30 flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Custom Macro Entry */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Meal Name / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Steak & Eggs, Protein Shake"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:border-lime-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:border-lime-500 font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-cyan-400 font-mono font-bold text-center focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-amber-400 font-mono font-bold text-center focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    value={customFats}
                    onChange={(e) => setCustomFats(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-rose-400 font-mono font-bold text-center focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-lime-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Meal Entry to Today's Log
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
