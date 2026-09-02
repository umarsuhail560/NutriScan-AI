import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const pwaLabels = {
  English: {
    title: 'Install NutriScan AI',
    description: 'Quick access to NutriScan AI from your device.',
    install: 'Install',
  },

  Spanish: {
    title: 'Instalar NutriScan AI',
    description: 'Acceso rápido a NutriScan AI desde tu dispositivo.',
    install: 'Instalar',
  },

  French: {
    title: 'Installer NutriScan AI',
    description: 'Accédez rapidement à NutriScan AI depuis votre appareil.',
    install: 'Installer',
  },

  German: {
    title: 'NutriScan AI installieren',
    description: 'Schneller Zugriff auf NutriScan AI von Ihrem Gerät.',
    install: 'Installieren',
  },

  Hindi: {
    title: 'NutriScan AI इंस्टॉल करें',
    description: 'अपने डिवाइस से NutriScan AI तक तुरंत पहुंचें।',
    install: 'इंस्टॉल करें',
  },

  Arabic: {
    title: 'تثبيت NutriScan AI',
    description: 'وصول سريع إلى NutriScan AI من جهازك.',
    install: 'تثبيت',
  },
} as const;

export const PWAInstallBanner: React.FC = () => {
  const { theme, language } = useTheme();

  const labels = pwaLabels[language];

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;

      installEvent.preventDefault();

      setDeferredPrompt(installEvent);

      const dismissed = localStorage.getItem(
        'nutriscan_pwa_dismissed'
      );

      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDeferredPrompt(null);

    localStorage.setItem(
      'nutriscan_pwa_dismissed',
      'true'
    );
  };

  if (!showBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div
      className={`fixed top-18 left-4 right-4 z-40 max-w-md mx-auto rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-slate-900 to-emerald-950 border-emerald-500/40 text-white'
          : 'bg-white border-emerald-500/30 text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            theme === 'dark'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}
        >
          <Smartphone className="w-5 h-5" />
        </div>

        <div>
          <h4
            className={`text-xs font-extrabold flex items-center gap-1 ${
              theme === 'dark'
                ? 'text-white'
                : 'text-slate-900'
            }`}
          >
            {labels.title}

            <Sparkles
              className={`w-3.5 h-3.5 ${
                theme === 'dark'
                  ? 'text-amber-300'
                  : 'text-amber-500'
              }`}
            />
          </h4>

          <p
            className={`text-[11px] ${
              theme === 'dark'
                ? 'text-slate-300'
                : 'text-slate-600'
            }`}
          >
            {labels.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          {labels.install}
        </button>

        <button
          onClick={handleDismiss}
          className={`p-1 rounded-lg ${
            theme === 'dark'
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};