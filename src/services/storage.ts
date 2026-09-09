import type { UserSession, UserProfile, SubscriptionState, CompletedWorkoutLog, DailyLog } from '../types';
import { getTodayDateString } from '../utils/calc';

const STORAGE_KEYS = {
  SESSION: 'aura_fit_user_session',
  PROFILE: 'aura_fit_user_profile',
  SUBSCRIPTION: 'aura_fit_user_subscription',
  WORKOUT_LOGS: 'aura_fit_workout_logs',
  DAILY_LOGS: 'aura_fit_daily_logs',
  DEVICE_TRIAL_REGISTRY: 'aura_fit_device_trial_registry', // Global device fingerprint key
};

export interface DeviceTrialRecord {
  claimed: boolean;
  claimedAt: string; // ISO date string
  claimedByAccount: string;
}

// Default initial subscription state
export const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  plan: 'free',
  status: 'inactive',
  billingCycle: 'annual',
  trialEnd: null,
  isSubscribed: false,
};

/**
 * Device Trial Abuse Protection Manager
 */
export function getDeviceTrialRecord(): DeviceTrialRecord | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEVICE_TRIAL_REGISTRY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to parse device trial registry:', e);
    return null;
  }
}

export function isDeviceTrialAlreadyClaimed(): boolean {
  const record = getDeviceTrialRecord();
  return !!record?.claimed;
}

export function markDeviceTrialClaimed(accountName: string): void {
  const record: DeviceTrialRecord = {
    claimed: true,
    claimedAt: new Date().toISOString(),
    claimedByAccount: accountName,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICE_TRIAL_REGISTRY, JSON.stringify(record));
  } catch (e) {
    console.error('Failed to save device trial record:', e);
  }
}

/**
 * Session Management
 */
export function getUserSession(): UserSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to parse user session:', e);
    return null;
  }
}

export function saveUserSession(session: UserSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save user session:', e);
  }
}

export function clearUserSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/**
 * User Profile Management
 */
export function getUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to parse user profile:', e);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

/**
 * Subscription Management
 */
export function getSubscription(): SubscriptionState {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    const sub: SubscriptionState = data ? JSON.parse(data) : DEFAULT_SUBSCRIPTION;

    // Automatically expire trial if 7 days have passed
    if (sub.isSubscribed && sub.trialEnd) {
      if (new Date(sub.trialEnd) <= new Date()) {
        const expiredSub: SubscriptionState = {
          ...sub,
          status: 'expired',
          isSubscribed: false,
        };
        saveSubscription(expiredSub);
        return expiredSub;
      }
    }

    return sub;
  } catch (e) {
    console.error('Failed to parse subscription state:', e);
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscription(sub: SubscriptionState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  } catch (e) {
    console.error('Failed to save subscription:', e);
  }
}

/**
 * Workout Logs Management
 */
export function getWorkoutLogs(): CompletedWorkoutLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse workout logs:', e);
    return [];
  }
}

export function saveWorkoutLog(log: CompletedWorkoutLog): CompletedWorkoutLog[] {
  const currentLogs = getWorkoutLogs();
  const updatedLogs = [log, ...currentLogs]; // Latest first
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error('Failed to save workout log:', e);
  }
  return updatedLogs;
}

/**
 * Daily Logs (Water, Steps, Macros)
 */
export function getDailyLogs(): Record<string, DailyLog> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to parse daily logs:', e);
    return {};
  }
}

export function getTodayLog(_profile?: UserProfile | null): DailyLog {
  const todayDate = getTodayDateString();
  const logs = getDailyLogs();
  
  if (logs[todayDate]) {
    return logs[todayDate];
  }

  // Initial blank log for today
  const newLog: DailyLog = {
    date: todayDate,
    waterOz: 0,
    steps: 0,
    caloriesConsumed: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatsGrams: 0,
    meals: [],
    streakCompleted: false,
  };

  saveDailyLog(newLog);
  return newLog;
}

export function saveDailyLog(log: DailyLog): void {
  const logs = getDailyLogs();
  logs[log.date] = log;
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save daily log:', e);
  }
}

/**
 * Calculate current active streak (consecutive days with completed workout or logged meals)
 */
export function calculateStreak(): number {
  const workoutLogs = getWorkoutLogs();
  const dailyLogs = getDailyLogs();

  const activeDates = new Set<string>();
  workoutLogs.forEach(w => activeDates.add(w.date));
  Object.keys(dailyLogs).forEach(dateStr => {
    const d = dailyLogs[dateStr];
    if (d.caloriesConsumed > 0 || d.waterOz > 0 || d.steps > 0) {
      activeDates.add(dateStr);
    }
  });

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (activeDates.has(dateStr)) {
      streak++;
    } else if (i === 0) {
      // If today hasn't been logged yet, allow streak from yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Clear user data (Session, Profile, Logs) - Preserves Device Trial Record to prevent abuse!
 */
export function clearAllAppData(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
  localStorage.removeItem(STORAGE_KEYS.WORKOUT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
  // Note: DEVICE_TRIAL_REGISTRY is deliberately retained to prevent trial abuse!
}
