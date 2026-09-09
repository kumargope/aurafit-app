import type { GoalType, FoodPreference } from '../types';

/**
 * Hash a passcode locally using Web Crypto API (SHA-256)
 */
export async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculates Mifflin-St Jeor TDEE & macro targets based on US Imperial units
 */
export function calculateMacroTargets(params: {
  currentWeightLbs: number;
  targetWeightLbs: number;
  heightInches: number;
  age: number;
  gender: 'male' | 'female';
  goal: GoalType;
  foodPreference: FoodPreference;
}) {
  // Convert Imperial to Metric for formula
  const weightKg = params.currentWeightLbs * 0.453592;
  const heightCm = params.heightInches * 2.54;

  // BMR (Mifflin-St Jeor)
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * params.age);
  if (params.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Activity Factor (Moderate exercise multiplier ~ 1.55)
  let tdee = Math.round(bmr * 1.55);

  // Goal Adjustments
  let calorieTarget = tdee;
  if (params.goal === 'fat_loss') {
    calorieTarget = Math.round(tdee - 500); // 500 kcal deficit
  } else if (params.goal === 'hypertrophy') {
    calorieTarget = Math.round(tdee + 350); // 350 kcal surplus
  }

  // Ensure reasonable minimum calorie floor
  calorieTarget = Math.max(1200, calorieTarget);

  let proteinPct = 0.30;
  let carbPct = 0.45;
  let fatPct = 0.25;

  if (params.foodPreference === 'high_protein') {
    proteinPct = 0.40;
    carbPct = 0.35;
    fatPct = 0.25;
  } else if (params.foodPreference === 'keto') {
    proteinPct = 0.30;
    carbPct = 0.05;
    fatPct = 0.65;
  }

  const proteinGrams = Math.round((calorieTarget * proteinPct) / 4);
  const carbsGrams = Math.round((calorieTarget * carbPct) / 4);
  const fatsGrams = Math.round((calorieTarget * fatPct) / 9);

  // Water recommendation: ~0.67 oz per lb of body weight
  const waterOzTarget = Math.round(params.currentWeightLbs * 0.67);

  // Step target recommendation
  const stepTarget = params.goal === 'fat_loss' ? 10000 : 8000;

  return {
    dailyCalorieTarget: calorieTarget,
    dailyProteinGrams: proteinGrams,
    dailyCarbsGrams: carbsGrams,
    dailyFatsGrams: fatsGrams,
    dailyWaterOzTarget: waterOzTarget,
    dailyStepTarget: stepTarget,
  };
}

/**
 * Format date to YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateFriendly(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
