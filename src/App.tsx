import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  getUserSession,
  getUserProfile,
  getSubscription,
  saveSubscription,
  isDeviceTrialAlreadyClaimed,
  markDeviceTrialClaimed,
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

  // Check URL query parameters for Lemon Squeezy return redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (
      params.has('checkout') ||
      params.get('payment') === 'success' ||
      params.get('payment_success') === 'true' ||
      params.has('order_id')
    ) {
      let isTrial = false;
      if (!isDeviceTrialAlreadyClaimed()) {
        isTrial = true;
        markDeviceTrialClaimed(session?.name || 'Athlete');
      }

      const trialEndDate = new Date();
      if (isTrial) {
        trialEndDate.setDate(trialEndDate.getDate() + 7);
      }

      const activatedSub: SubscriptionState = {
        plan: 'pro',
        status: 'active',
        billingCycle: 'annual',
        trialEnd: isTrial ? trialEndDate.toISOString() : null,
        isSubscribed: true,
      };

      saveSubscription(activatedSub);
      setSubscription(activatedSub);

      try {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log(e);
      }

      // Clean URL params cleanly
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [session]);

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
  const [showPaywall, setShowPaywall] = useState<boolean>(() => !getSubscription().isSubscribed);
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
  const handleSubscriptionSuccess = (newSub?: SubscriptionState) => {
    if (newSub) setSubscription(newSub);
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

  const handleTriggerInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted native install prompt');
          setDeferredPrompt(null);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setShowInstallModal(true);
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
          onOpenInstallModal={handleTriggerInstallApp}
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
                onOpenInstallModal={handleTriggerInstallApp}
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
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onOpenInstallModal={handleTriggerInstallApp}
        />
      )}

      {showOnboarding && session && (
        <OnboardingWizard
          userName={session.name}
          onComplete={handleOnboardingComplete}
        />
      )}

      {showPaywall && (
        <PaywallModal
          onSuccess={handleSubscriptionSuccess}
          onClose={subscription.isSubscribed ? () => setShowPaywall(false) : undefined}
          onOpenInstallModal={handleTriggerInstallApp}
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
