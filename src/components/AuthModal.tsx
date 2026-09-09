import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, CheckCircle2, LockKeyhole, WifiOff } from 'lucide-react';
import { hashPasscode } from '../utils/calc';
import { getUserSession, saveUserSession } from '../services/storage';

interface AuthModalProps {
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const existingSession = getUserSession();
  const [isLoginMode, setIsLoginMode] = useState<boolean>(!!existingSession);
  const [name, setName] = useState<string>(existingSession?.name || '');
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!passcode.trim() || passcode.length < 4) {
      setError('Passcode must be at least 4 digits or characters');
      return;
    }

    setLoading(true);

    try {
      const hashed = await hashPasscode(passcode);

      if (isLoginMode && existingSession) {
        if (existingSession.passcodeHash !== hashed) {
          setError('Invalid passcode. Please try again.');
          setLoading(false);
          return;
        }
        // Update session timestamp
        saveUserSession({
          ...existingSession,
          isLoggedIn: true,
          lastLogin: new Date().toISOString(),
        });
      } else {
        // Create fresh local session
        saveUserSession({
          name: name.trim(),
          passcodeHash: hashed,
          isLoggedIn: true,
          lastLogin: new Date().toISOString(),
        });
      }

      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('An error occurred while securing your session.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top High-Trust Security Guarantee Banner */}
        <div className="bg-gradient-to-r from-lime-500/20 via-emerald-500/20 to-cyan-500/20 border-b border-lime-500/30 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-lime-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
            <span>100% PRIVATE • ZERO DATA LEAK GUARANTEE</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-zinc-300">
            <div className="flex items-center gap-1.5 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800">
              <LockKeyhole className="w-3.5 h-3.5 text-lime-400 shrink-0" />
              <span>0 Data Uploaded to Cloud</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>LocalStorage Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>No Ad Tracking or Spying</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800">
              <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>100% Offline Gym Capable</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header Branding with Custom Logo */}
          <div className="flex items-center justify-center gap-3">
            <img
              src="/logo.jpg"
              alt="AURA FIT Logo"
              className="w-12 h-12 rounded-2xl object-cover border border-lime-500/40 shadow-xl shadow-lime-500/20"
            />
            <span className="text-2xl font-black tracking-tight text-white uppercase">
              AURA <span className="text-lime-400">FIT</span>
            </span>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isLoginMode ? 'Welcome Back, Athlete' : 'Create Secure Local Account'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your PIN is hashed locally with Web Crypto SHA-256. Data never leaves this browser.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Athlete Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Local Passcode (PIN or Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  minLength={4}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-zinc-950 font-bold text-sm rounded-xl shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="animate-pulse">Encrypting & Securing Session...</span>
                ) : (
                  <>
                    <span>{isLoginMode ? 'Unlock Dashboard' : 'Start Protocol Setup'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {existingSession && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                }}
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
              >
                {isLoginMode ? 'Need to switch local accounts?' : 'Already have a local profile? Log in'}
              </button>
            </div>
          )}

          {/* Bottom Security Footer */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
            <span>Guaranteed Zero External Analytics or Database Leaks</span>
          </div>

        </div>
      </div>
    </div>
  );
};
