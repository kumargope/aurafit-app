import React from 'react';
import { X, ShieldCheck, Trash2 } from 'lucide-react';
import type { UserProfile, SubscriptionState } from '../types';
import { clearAllAppData } from '../services/storage';

interface SettingsModalProps {
  profile: UserProfile | null;
  subscription: SubscriptionState;
  onClose: () => void;
  onResetData: () => void;
  onOpenPaywall: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  subscription,
  onClose,
  onResetData,
  onOpenPaywall,
}) => {
  const handleHardReset = () => {
    if (window.confirm('Are you sure you want to reset all local storage data? This will clear your user profile, logs, and subscription status.')) {
      clearAllAppData();
      onResetData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Account & Local Data Settings</h2>
            <p className="text-xs text-zinc-400">Manage local session and subscription status.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* User Profile Card */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold text-base">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{profile?.name || 'Athlete'}</h3>
                  <p className="text-xs text-zinc-400">
                    {profile?.currentWeightLbs} lbs • Goal: {profile?.goal.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-400 uppercase">Subscription Status</div>
                <div className="text-lg font-black text-white mt-0.5 flex items-center gap-2">
                  <span>{subscription.isSubscribed ? 'PRO Athlete Pass' : 'Free Tier'}</span>
                  {subscription.isSubscribed && (
                    <span className="text-[10px] bg-lime-500/10 text-lime-400 border border-lime-500/30 px-2 py-0.5 rounded font-bold uppercase">
                      ACTIVE ({subscription.billingCycle})
                    </span>
                  )}
                </div>
              </div>

              {!subscription.isSubscribed && (
                <button
                  type="button"
                  onClick={onOpenPaywall}
                  className="py-2 px-3 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Upgrade to PRO
                </button>
              )}
            </div>
          </div>

          {/* Local Security & Hard Reset */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-lime-400" />
              <span>All data is encrypted in your browser's LocalStorage.</span>
            </div>

            <button
              type="button"
              onClick={handleHardReset}
              className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Reset All Local App Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
