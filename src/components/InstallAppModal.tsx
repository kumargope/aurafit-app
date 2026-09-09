import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface InstallAppModalProps {
  onClose: () => void;
  deferredPrompt: any;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  onClose,
  deferredPrompt,
}) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-lime-500 via-emerald-500 to-cyan-500 p-6 text-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="AURA FIT Logo"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-zinc-950 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase bg-zinc-950/20 px-2.5 py-0.5 rounded-full w-fit mb-1 text-zinc-950">
                <Sparkles className="w-3 h-3" /> OFFICIAL APP DOWNLOAD
              </div>
              <h2 className="text-xl font-black tracking-tight leading-none uppercase">
                INSTALL AURA FIT APP
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-zinc-950/20 hover:bg-zinc-950/40 rounded-xl text-zinc-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Native Install Button for Android / Chrome / Desktop */}
          {deferredPrompt ? (
            <div className="space-y-3 text-center">
              <p className="text-xs text-zinc-400">
                Install AURA FIT directly onto your device home screen for 100% offline access.
              </p>

              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full py-4 px-6 bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-lime-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>1-Click Download & Install App</span>
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Install on iPhone / iPad (Safari)
                </div>

                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                      1
                    </span>
                    <span>
                      Tap the <strong className="text-white">Share Button</strong> <Share className="w-3.5 h-3.5 inline text-cyan-400 mx-0.5" /> at the bottom of Safari browser.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                      2
                    </span>
                    <span>
                      Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                      3
                    </span>
                    <span>
                      Tap <strong className="text-white">"Add"</strong> in top right. AURA FIT icon will appear on your home screen!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* General Browser Instructions */
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Quick Mobile & Desktop Installation
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Open your browser menu (3 dots or share icon) and select <strong className="text-white">"Add to Home Screen"</strong> or <strong className="text-white">"Install App"</strong> to use AURA FIT like a native mobile app.
                </p>
              </div>
            </div>
          )}

          {/* Benefits bullets */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
              <span>100% Offline Capable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fast 1-Touch Launch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Storage Footprint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero Cloud Tracking</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
