import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('nutriscan_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('nutriscan_pwa_dismissed', 'true');
  };

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed top-18 left-4 right-4 z-40 max-w-md mx-auto bg-gradient-to-r from-slate-900 to-emerald-950 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between text-white animate-bounce-short">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold flex items-center gap-1">
            Install NutriScan AI App <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </h4>
          <p className="text-[11px] text-slate-300">Fast offline access & instant photo scanning!</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" /> Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
