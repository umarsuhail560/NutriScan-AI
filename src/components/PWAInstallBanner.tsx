import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePWAInstall } from '../context/PWAContext';

export const PWAInstallBanner: React.FC = () => {
  const { t } = useTheme();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('nutriscan_pwa_dismissed');
    if (isInstallable && !isInstalled && !dismissed) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [isInstallable, isInstalled]);

  const handleInstallClick = async () => {
    const accepted = await installApp();
    if (accepted) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('nutriscan_pwa_dismissed', 'true');
  };

  if (!showBanner || !isInstallable || isInstalled) return null;

  return (
    <div className="fixed top-18 left-4 right-4 z-40 max-w-md md:max-w-xl mx-auto bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-emerald-950 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between text-slate-900 dark:text-white animate-bounce-short">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold flex items-center gap-1">
            {t.pwaInstallTitle} <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">{t.pwaInstallDesc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" /> {t.install}
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
