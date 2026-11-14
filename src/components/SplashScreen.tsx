import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Scan, Leaf } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { t } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 text-slate-900 dark:text-white px-4 transition-colors">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative flex items-center justify-center mb-8"
      >
        <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
        <div className="absolute w-28 h-28 rounded-3xl bg-emerald-500/30 blur-xl animate-ping" />

        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/30">
          <div className="w-full h-full bg-white/95 dark:bg-slate-950/90 rounded-[22px] flex items-center justify-center backdrop-blur-sm">
            <div className="relative">
              <Scan className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              <Leaf className="w-6 h-6 text-teal-500 dark:text-teal-300 absolute -top-1 -right-2 transform rotate-12" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight font-['Outfit'] bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-600 dark:from-white dark:via-slate-100 dark:to-emerald-300 bg-clip-text text-transparent">
            {t.appName} AI
          </h1>
          <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
          {t.splashTagline}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5"
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
        />
      </motion.div>
      <p className="mt-3 text-xs text-slate-500 font-mono tracking-wider">{t.splashReady}</p>
    </div>
  );
};
