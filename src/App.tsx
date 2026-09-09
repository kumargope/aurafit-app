import { useState, useEffect } from 'react';
import {
  getUserSession,
  getUserProfile,
  getSubscription,
  getWorkoutLogs,
  getTodayLog,
  saveDailyLog,
  calculateStreak,
} from './services/storage';
import type {
  UserSession,
  UserProfile,
  SubscriptionState,
  CompletedWorkoutLog,
  DailyLog,
  WorkoutTemplate,
} from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { WorkoutLibrary } from './components/WorkoutLibrary';
import { AnalyticsView } from './components/AnalyticsView';
import { AuthModal } from './components/AuthModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { PaywallModal } from './components/PaywallModal';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { MealLoggerModal } from './components/MealLoggerModal';
import { SettingsModal } from './components/SettingsModal';
import { StepCounterModal } from './components/StepCounterModal';
import { InstallAppModal } from './components/InstallAppModal';

export function App() {
  const [session, setSession] = useState<UserSession | null>(() => getUserSession());
  const [profile, setProfile] = useState<UserProfile | null>(() => getUserProfile());
  const [subscription, setSubscription] = useState<SubscriptionState>(() => getSubscription());
  const [workoutLogs, setWorkoutLogs] = useState<CompletedWorkoutLog[]>(() => getWorkoutLogs());
  const [todayLog, setTodayLog] = useState<DailyLog>(() => getTodayLog(getUserProfile()));
  const [streak, setStreak] = useState<number>(() => calculateStreak());

  // PWA Install Prompt Listener
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'analytics'>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(!getUserSession());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(
    !!getUserSession() && (!getUserProfile() || !getUserProfile()?.onboardingCompleted)
  );
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [showMealLogger, setShowMealLogger] = useState<boolean>(false);
  const [showStepCounterModal, setShowStepCounterModal] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);

  // Sync state on session unlock
  const handleAuthSuccess = () => {
    const s = getUserSession();
    setSession(s);
    setShowAuthModal(false);

    const p = getUserProfile();
    if (!p || !p.onboardingCompleted) {
      setShowOnboarding(true);
    } else {
      setProfile(p);
    }
  };

  // Sync state on onboarding completion
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setShowOnboarding(false);
    setTodayLog(getTodayLog(newProfile));

    // Pitch paywall if not subscribed
    const sub = getSubscription();
    if (!sub.isSubscribed) {
      setShowPaywall(true);
    }
  };

  // Sync state on subscription change
  const handleSubscriptionSuccess = (newSub: SubscriptionState) => {
    setSubscription(newSub);
    setShowPaywall(false);
  };

  // Update today's daily log
  const handleUpdateDailyLog = (updated: DailyLog) => {
    saveDailyLog(updated);
    setTodayLog(updated);
    setStreak(calculateStreak());
  };

  // Handle completed workout
  const handleWorkoutCompleted = (_log: CompletedWorkoutLog) => {
    const updatedWorkoutLogs = getWorkoutLogs();
    setWorkoutLogs(updatedWorkoutLogs);
    setActiveWorkout(null);
    setStreak(calculateStreak());
  };

  // App hard reset
  const handleResetData = () => {
    setSession(null);
    setProfile(null);
    setSubscription(getSubscription());
    setWorkoutLogs([]);
    setTodayLog(getTodayLog(null));
    setStreak(0);
    setShowSettings(false);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-lime-500 selection:text-zinc-950 flex flex-col">
      
      {/* Top Header Navbar */}
      {session && profile && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          subscription={subscription}
          streak={streak}
          onOpenSettings={() => setShowSettings(true)}
          onOpenPaywall={() => setShowPaywall(true)}
          onOpenInstallModal={() => setShowInstallModal(true)}
        />
      )}

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {session && profile && profile.onboardingCompleted ? (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                profile={profile}
                dailyLog={todayLog}
                workoutHistory={workoutLogs}
                onUpdateDailyLog={handleUpdateDailyLog}
                onOpenMealLogger={() => setShowMealLogger(true)}
                onOpenStepCounterModal={() => setShowStepCounterModal(true)}
                onOpenInstallModal={() => setShowInstallModal(true)}
                onStartWorkout={(workout) => setActiveWorkout(workout)}
                onNavigateToWorkouts={() => setActiveTab('workouts')}
                onOpenPaywall={() => setShowPaywall(true)}
                isSubscribed={subscription.isSubscribed}
              />
            )}

            {activeTab === 'workouts' && (
              <WorkoutLibrary
                onStartWorkout={(workout) => setActiveWorkout(workout)}
                workoutHistory={workoutLogs}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                profile={profile}
                workoutLogs={workoutLogs}
                dailyLogs={{}}
                streak={streak}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse text-zinc-500 text-sm font-semibold">
              Initializing AURA FIT Engine...
            </div>
          </div>
        )}
      </main>

      {/* Modals & Overlays */}
      {showAuthModal && <AuthModal onSuccess={handleAuthSuccess} />}

      {showOnboarding && session && (
        <OnboardingWizard
          userName={session.name}
          onComplete={handleOnboardingComplete}
        />
      )}

      {showPaywall && (
        <PaywallModal
          onSuccess={handleSubscriptionSuccess}
          onClose={() => setShowPaywall(false)}
        />
      )}

      {activeWorkout && (
        <ActiveWorkoutModal
          workout={activeWorkout}
          onClose={() => setActiveWorkout(null)}
          onWorkoutCompleted={handleWorkoutCompleted}
        />
      )}

      {showMealLogger && (
        <MealLoggerModal
          dailyLog={todayLog}
          onClose={() => setShowMealLogger(false)}
          onSaveDailyLog={handleUpdateDailyLog}
        />
      )}

      {showStepCounterModal && profile && (
        <StepCounterModal
          profile={profile}
          dailyLog={todayLog}
          onClose={() => setShowStepCounterModal(false)}
          onUpdateDailyLog={handleUpdateDailyLog}
        />
      )}

      {showInstallModal && (
        <InstallAppModal
          onClose={() => setShowInstallModal(false)}
          deferredPrompt={deferredPrompt}
        />
      )}

      {showSettings && (
        <SettingsModal
          profile={profile}
          subscription={subscription}
          onClose={() => setShowSettings(false)}
          onResetData={handleResetData}
          onOpenPaywall={() => {
            setShowSettings(false);
            setShowPaywall(true);
          }}
        />
      )}

    </div>
  );
}

export default App;
