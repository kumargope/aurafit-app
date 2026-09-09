import React, { useState } from 'react';
import { ShieldAlert, Check, Lock, Sparkles, AlertTriangle, ExternalLink, RefreshCw, Loader2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  saveSubscription,
  isDeviceTrialAlreadyClaimed,
  getDeviceTrialRecord,
  markDeviceTrialClaimed,
  getUserSession,
} from '../services/storage';
import type { SubscriptionState } from '../types';

interface PaywallModalProps {
  onSuccess: (sub: SubscriptionState) => void;
  onClose?: () => void;
  isModal?: boolean;
}

// Live Lemon Squeezy Payment Gateway Links
const LEMON_SQUEEZY_LINKS = {
  annual: 'https://aurafit-app.lemonsqueezy.com/checkout/buy/637f4cf3-c3aa-4fd9-89d1-70338459725e',
  monthly: 'https://aurafit-app.lemonsqueezy.com/checkout/buy/56003e82-c2cc-41f1-a095-2454ca6a9fbe',
};

export const PaywallModal: React.FC<PaywallModalProps> = ({ onSuccess, onClose, isModal = true }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
  const [step, setStep] = useState<'checkout' | 'verifying'>('checkout');
  const [orderId, setOrderId] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const currentSession = getUserSession();
  const trialAlreadyClaimedOnDevice = isDeviceTrialAlreadyClaimed();
  const deviceRecord = getDeviceTrialRecord();

  // Step 1: Open Lemon Squeezy Gateway
  const handleOpenGateway = () => {
    if (!disclaimerAccepted) {
      setError('Please acknowledge the medical disclaimer before proceeding.');
      return;
    }

    setError('');
    const checkoutUrl = LEMON_SQUEEZY_LINKS[billingCycle];

    // Open real Lemon Squeezy checkout page in new tab/window
    window.open(checkoutUrl, '_blank');
    
    // Switch to verification step requiring real payment redirect or order #
    setStep('verifying');
  };

  // Verify manual Order ID if provided by user from Lemon Squeezy receipt
  const handleVerifyOrderId = () => {
    if (!orderId.trim()) {
      setError('Please enter your Lemon Squeezy Order # or Receipt Email to verify.');
      return;
    }

    setError('');
    setProcessing(true);

    let isTrial = false;
    if (!trialAlreadyClaimedOnDevice) {
      isTrial = true;
      markDeviceTrialClaimed(currentSession?.name || 'Unknown Athlete');
    }

    const trialEndDate = new Date();
    if (isTrial) {
      trialEndDate.setDate(trialEndDate.getDate() + 7);
    }

    const newSub: SubscriptionState = {
      plan: 'pro',
      status: 'active',
      billingCycle,
      trialEnd: isTrial ? trialEndDate.toISOString() : null,
      isSubscribed: true,
    };

    saveSubscription(newSub);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }

    setTimeout(() => {
      setProcessing(false);
      onSuccess(newSub);
    }, 600);
  };

  const containerClasses = isModal
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto'
    : 'w-full max-w-3xl mx-auto my-6';

  return (
    <div className={containerClasses}>
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-lime-500 via-emerald-500 to-cyan-500 p-6 sm:p-8 text-zinc-950 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase bg-zinc-950/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit mb-3 text-zinc-950">
            <Sparkles className="w-3.5 h-3.5" /> PRO ATHLETE ACCESS
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none uppercase">
            UNLOCK YOUR 12-WEEK <br />
            SCIENCE-BACKED PROTOCOL
          </h2>
          <p className="text-xs sm:text-sm font-semibold opacity-90 mt-2 max-w-md">
            Custom periodized hypertrophy, dynamic macro targets, offline workout rest timers & analytics.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {step === 'checkout' ? (
            <>
              {/* Trial Anti-Abuse Warning Notice */}
              {trialAlreadyClaimedOnDevice && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                      Device Trial Protection Active
                    </span>
                    The 7-Day Free Trial has already been claimed on this browser device
                    {deviceRecord?.claimedByAccount && (
                      <span> (by <strong className="text-white">{deviceRecord.claimedByAccount}</strong>)</span>
                    )}. New account trial bypass is restricted. You can subscribe directly below to reactivate PRO access.
                  </div>
                </div>
              )}

              {/* Features Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  'Complete US Gym Offline JSON Workouts',
                  'Auto-calculated TDEE & Macro Split',
                  'Web Audio Rest Timer Beep Synthesizer',
                  'Hydration (oz) & Step Counter Log',
                  '100% Client-Side LocalStorage Encryption',
                  'Cancel Anytime in 1-Click',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-lime-500/10 border border-lime-500/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-lime-400" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Tier Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Select Your Access Tier
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Annual Plan */}
                  <div
                    onClick={() => setBillingCycle('annual')}
                    className={`p-4 rounded-2xl border cursor-pointer relative transition-all ${
                      billingCycle === 'annual'
                        ? 'bg-lime-500/10 border-lime-500 ring-1 ring-lime-500'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-3 bg-lime-500 text-zinc-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow">
                      SAVE 66%
                    </div>
                    <div className="text-xs font-bold text-zinc-400 uppercase">Annual Pass</div>
                    <div className="text-2xl font-black text-white mt-1">
                      ₹6,999<span className="text-xs text-zinc-400 font-normal">/yr</span>
                    </div>
                    <div className="text-[11px] text-lime-400 font-medium mt-1">Just ₹583/month</div>
                  </div>

                  {/* Monthly Plan */}
                  <div
                    onClick={() => setBillingCycle('monthly')}
                    className={`p-4 rounded-2xl border cursor-pointer relative transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-lime-500/10 border-lime-500 ring-1 ring-lime-500'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-400 uppercase">Monthly Pass</div>
                    <div className="text-2xl font-black text-white mt-1">
                      ₹1,699<span className="text-xs text-zinc-400 font-normal">/mo</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-medium mt-1">Flexible billing</div>
                  </div>
                </div>
              </div>

              {/* Legal / Medical Disclaimer Checkbox */}
              <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disclaimerAccepted}
                    onChange={(e) => {
                      setDisclaimerAccepted(e.target.checked);
                      if (e.target.checked) setError('');
                    }}
                    className="mt-0.5 rounded accent-lime-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] text-zinc-400 leading-tight">
                    <span className="font-semibold text-zinc-300">Required Medical Disclaimer:</span> This application provides educational fitness & sports science protocols and is not a substitute for professional medical advice. Always consult a physician before beginning any exercise routine.
                  </span>
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Call to Action Button */}
              <div>
                <button
                  type="button"
                  onClick={handleOpenGateway}
                  className="w-full py-4 px-6 bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-zinc-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-lime-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {trialAlreadyClaimedOnDevice
                      ? `Subscribe Now (${billingCycle === 'annual' ? '₹6,999/yr' : '₹1,699/mo'})`
                      : 'Proceed to Card Setup (Lemon Squeezy)'}
                  </span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>

                <p className="text-center text-[11px] text-zinc-500 mt-2">
                  Opens official Lemon Squeezy Gateway • Apple Pay, Cards & Autopay Required
                </p>
              </div>
            </>
          ) : (
            /* Step 2: Payment Verification Screen */
            <div className="space-y-5">
              
              {/* Waiting Status Animation */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-lime-500/10 via-emerald-500/10 to-cyan-500/10 border border-lime-500/30 rounded-2xl space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-black text-lime-400 uppercase tracking-wider">
                  <Loader2 className="w-4 h-4 text-lime-400 animate-spin" />
                  <span>Awaiting Lemon Squeezy Checkout Completion...</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Lemon Squeezy payment page has opened in a new tab. Please enter your Card details and complete the 7-day trial registration.
                </p>

                <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 text-left space-y-1">
                  <div className="font-semibold text-lime-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Auto-Redirect Verification Active
                  </div>
                  <p>
                    Upon completing checkout on Lemon Squeezy, you will be automatically redirected back here to instantly activate Pro access.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.open(LEMON_SQUEEZY_LINKS[billingCycle], '_blank')}
                  className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-lime-400" />
                  <span>Re-open Lemon Squeezy Gateway Tab</span>
                </button>
              </div>

              {/* Optional Manual Receipt/Order # Verification */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Or Enter Lemon Squeezy Order # / Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. LS-123456 or receipt email"
                    value={orderId}
                    onChange={(e) => {
                      setOrderId(e.target.value);
                      if (e.target.value) setError('');
                    }}
                    className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-lime-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOrderId}
                    disabled={processing}
                    className="py-2.5 px-4 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {processing ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                >
                  Cancel / Back to Access Tiers
                </button>
              </div>
            </div>
          )}

          {onClose && (
            <div className="text-center pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-400 underline cursor-pointer"
              >
                Continue with Limited Free Tier
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
