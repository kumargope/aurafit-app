import React, { useState } from 'react';
import { Target, Dumbbell, Utensils, Award, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import type { GoalType, FitnessLevel, FoodPreference, UserProfile } from '../types';
import { calculateMacroTargets } from '../utils/calc';
import { saveUserProfile } from '../services/storage';

interface OnboardingWizardProps {
  userName: string;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState<number>(1);

  // Form State (Default US Imperial values)
  const [goal, setGoal] = useState<GoalType>('hypertrophy');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('intermediate');
  const [currentWeightLbs, setCurrentWeightLbs] = useState<number>(180);
  const [targetWeightLbs, setTargetWeightLbs] = useState<number>(170);
  const [heightInches, setHeightInches] = useState<number>(70); // 5'10"
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('high_protein');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Calculate final target metrics
      const calculated = calculateMacroTargets({
        currentWeightLbs,
        targetWeightLbs,
        heightInches,
        age,
        gender,
        goal,
        foodPreference,
      });

      const profile: UserProfile = {
        name: userName,
        goal,
        fitnessLevel,
        foodPreference,
        currentWeightLbs,
        targetWeightLbs,
        heightInches,
        age,
        gender,
        ...calculated,
        onboardingCompleted: true,
      };

      saveUserProfile(profile);
      onComplete(profile);
    }
  };

  const calculatedPreview = calculateMacroTargets({
    currentWeightLbs,
    targetWeightLbs,
    heightInches,
    age,
    gender,
    goal,
    foodPreference,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Progress Bar */}
        <div className="w-full bg-zinc-950 h-1.5 flex">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-full flex-1 transition-all duration-300 ${
                s <= step ? 'bg-lime-500' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-lime-400 bg-lime-500/10 px-3 py-1 rounded-full border border-lime-500/20">
              Step {step} of 4 • Protocol Customization
            </span>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>

          {/* Step 1: Goal Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">What is your primary fitness goal?</h2>
                <p className="text-sm text-zinc-400 mt-1">We optimize training volume and macro targets based on your goal.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: 'hypertrophy',
                    title: 'Hypertrophy & Muscle',
                    desc: 'Build lean muscle mass, power, and high-density strength.',
                    icon: Dumbbell,
                  },
                  {
                    id: 'fat_loss',
                    title: 'Fat Loss & Shred',
                    desc: 'Maintain muscle while dropping body fat percentage efficiently.',
                    icon: Target,
                  },
                  {
                    id: 'mobility',
                    title: 'Athletic Mobility',
                    desc: 'Enhance core strength, joint health, endurance, and longevity.',
                    icon: Award,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = goal === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setGoal(item.id as GoalType)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selected
                          ? 'bg-lime-500/10 border-lime-500 text-white shadow-lg shadow-lime-500/10'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-950'
                      }`}
                    >
                      <div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                          selected ? 'bg-lime-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white text-base mb-1">{item.title}</h3>
                        <p className="text-xs leading-relaxed text-zinc-400">{item.desc}</p>
                      </div>
                      {selected && (
                        <div className="mt-4 flex items-center gap-1 text-lime-400 text-xs font-bold">
                          <Check className="w-4 h-4" /> Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Experience & Body Metrics */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Fitness Experience & US Metrics</h2>
                <p className="text-sm text-zinc-400 mt-1">Used for baseline TDEE and calorie expenditure modeling.</p>
              </div>

              {/* Fitness Level */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Training Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'beginner', label: 'Beginner', desc: '< 1 Year' },
                    { id: 'intermediate', label: 'Intermediate', desc: '1 - 3 Years' },
                    { id: 'advanced', label: 'Advanced', desc: '3+ Years' },
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setFitnessLevel(level.id as FitnessLevel)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        fitnessLevel === level.id
                          ? 'bg-lime-500 text-zinc-950 border-lime-400 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm">{level.label}</div>
                      <div className="text-[11px] opacity-80 font-normal">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g as 'male' | 'female')}
                        className={`py-2.5 rounded-xl border text-sm capitalize font-semibold transition-all cursor-pointer ${
                          gender === g
                            ? 'bg-lime-500/20 border-lime-500 text-lime-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min={14}
                    max={90}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:border-lime-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Weight & Height (US Imperial) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Current Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={currentWeightLbs}
                    onChange={(e) => setCurrentWeightLbs(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:border-lime-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Target Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={targetWeightLbs}
                    onChange={(e) => setTargetWeightLbs(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:border-lime-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Height (Inches)
                  </label>
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:border-lime-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    e.g. 5'10" = 70 inches
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Food Preferences */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Nutrition & Food Preference</h2>
                <p className="text-sm text-zinc-400 mt-1">Select your preferred dietary protocol split.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'high_protein',
                    title: 'High-Protein Performance (40/35/25)',
                    desc: 'Optimal for muscle growth, tissue repair, and satiety. High protein, moderate carbs.',
                    icon: Utensils,
                  },
                  {
                    id: 'keto',
                    title: 'Keto / Low-Carb (30/5/65)',
                    desc: 'High healthy fat intake with strict low carbohydrate intake to promote ketosis.',
                    icon: Sparkles,
                  },
                  {
                    id: 'standard',
                    title: 'Standard Balanced (30/45/25)',
                    desc: 'Flexible macro distribution suitable for overall endurance and balanced energy.',
                    icon: Target,
                  },
                ].map((pref) => {
                  const selected = foodPreference === pref.id;
                  return (
                    <div
                      key={pref.id}
                      onClick={() => setFoodPreference(pref.id as FoodPreference)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                        selected
                          ? 'bg-lime-500/10 border-lime-500 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selected ? 'bg-lime-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <pref.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">{pref.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{pref.desc}</p>
                      </div>
                      {selected && <Check className="w-5 h-5 text-lime-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Protocol Target Summary */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Protocol Engine Generated
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Your Customized 12-Week Protocol</h2>
                <p className="text-sm text-zinc-400 mt-1">Calculated from Mifflin-St Jeor TDEE formula with US imperial stats.</p>
              </div>

              {/* Target Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase">Daily Calories</div>
                  <div className="text-2xl font-black text-lime-400 mt-1">{calculatedPreview.dailyCalorieTarget}</div>
                  <div className="text-[10px] text-zinc-500">kcal/day</div>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase">Protein Target</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{calculatedPreview.dailyProteinGrams}g</div>
                  <div className="text-[10px] text-zinc-500">40% split</div>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase">Hydration Target</div>
                  <div className="text-2xl font-black text-blue-400 mt-1">{calculatedPreview.dailyWaterOzTarget}</div>
                  <div className="text-[10px] text-zinc-500">fl. oz/day</div>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase">Daily Steps</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{calculatedPreview.dailyStepTarget.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500">steps/day</div>
                </div>
              </div>

              <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Carbohydrates Target:</span>
                  <span className="font-bold text-white">{calculatedPreview.dailyCarbsGrams}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Dietary Fats Target:</span>
                  <span className="font-bold text-white">{calculatedPreview.dailyFatsGrams}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Weight Deficit/Surplus:</span>
                  <span className="font-bold text-lime-400">{targetWeightLbs - currentWeightLbs} lbs delta</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 px-6 bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{step === 4 ? 'Unlock Science-Backed Protocol' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
