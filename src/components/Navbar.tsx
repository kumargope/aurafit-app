import React from 'react';
import { Flame, Dumbbell, LayoutDashboard, BarChart3, Settings, Sparkles, ShieldCheck, Download } from 'lucide-react';
import type { UserProfile, SubscriptionState } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'workouts' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'workouts' | 'analytics') => void;
  profile: UserProfile | null;
  subscription: SubscriptionState;
  streak: number;
  onOpenSettings: () => void;
  onOpenPaywall: () => void;
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  subscription,
  streak,
  onOpenSettings,
  onOpenPaywall,
  onOpenInstallModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <img
              src="/logo.jpg"
              alt="AURA FIT Logo"
              className="w-10 h-10 rounded-xl object-cover border border-lime-500/40 shadow-lg shadow-lime-500/10"
            />
            <span className="text-xl font-black tracking-tight text-white uppercase">
              AURA <span className="text-lime-400">FIT</span>
            </span>
          </div>

          {/* Privacy Trust Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Private • 0 Data Leak</span>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'workouts', label: 'Workouts', icon: Dumbbell },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as 'dashboard' | 'workouts' | 'analytics')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-zinc-800 text-lime-400 border border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Badges, Install App & Profile Settings */}
        <div className="flex items-center gap-2.5">
          
          {/* Download & Install App Button */}
          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-lime-500/30 text-lime-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Download & Install App (iOS & Android)"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400/30 text-amber-400 animate-pulse" />
            <span>{streak}d Streak</span>
          </div>

          {/* PRO / Upgrade Badge */}
          {subscription.isSubscribed ? (
            <div className="hidden sm:flex items-center gap-1 bg-lime-500/10 border border-lime-500/30 px-3 py-1 rounded-xl text-xs font-black text-lime-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> PRO
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="py-1.5 px-3 bg-gradient-to-r from-lime-500 to-emerald-400 hover:opacity-90 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-lime-500/10 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Unlock PRO
            </button>
          )}

          {/* Settings gear */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Settings & Reset"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950 px-4 py-2 flex justify-around">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'workouts', label: 'Workouts', icon: Dumbbell },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'dashboard' | 'workouts' | 'analytics')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                active ? 'text-lime-400 bg-zinc-900' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
