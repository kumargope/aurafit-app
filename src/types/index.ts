export type GoalType = 'hypertrophy' | 'fat_loss' | 'mobility';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type FoodPreference = 'high_protein' | 'keto' | 'standard';

export interface UserSession {
  name: string;
  passcodeHash: string;
  isLoggedIn: boolean;
  lastLogin: string;
}

export interface UserProfile {
  name: string;
  goal: GoalType;
  fitnessLevel: FitnessLevel;
  foodPreference: FoodPreference;
  currentWeightLbs: number;
  targetWeightLbs: number;
  heightInches: number;
  age: number;
  gender: 'male' | 'female';
  
  // Daily calculated targets
  dailyCalorieTarget: number;
  dailyProteinGrams: number;
  dailyCarbsGrams: number;
  dailyFatsGrams: number;
  dailyWaterOzTarget: number;
  dailyStepTarget: number;
  
  onboardingCompleted: boolean;
}

export interface SubscriptionState {
  plan: 'free' | 'pro';
  status: 'active' | 'inactive' | 'expired';
  billingCycle: 'monthly' | 'annual';
  trialEnd: string | null; // ISO string
  isSubscribed: boolean;
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weightLbs: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  defaultWeightLbs: number;
  restSeconds: number;
  instructions: string;
  muscleGroup: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetMuscles: string[];
  exercises: Exercise[];
}

export interface CompletedWorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string; // ISO date format string (YYYY-MM-DD)
  timestamp: number;
  durationMinutes: number;
  totalVolumeLbs: number;
  exerciseLogs: ExerciseLog[];
}

export interface MealPreset {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Post-Workout';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
}

export interface MealLogItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterOz: number;
  steps: number;
  caloriesConsumed: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  meals: MealLogItem[];
  streakCompleted: boolean;
}
