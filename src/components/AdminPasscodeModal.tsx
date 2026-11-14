import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { verifyAdminPasscode } from '../services/feedbackService';
import { Lock, ShieldCheck, X, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AdminPasscodeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onWrongPasscode: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  onClose,
  onSuccess,
  onWrongPasscode,
}) => {
  const { t } = useTheme();
  const [passcode, setPasscode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || checking) return;
    setChecking(true);
    try {
      const result = await verifyAdminPasscode(passcode.trim());
      if (result.verified) {
        onSuccess();
      } else {
        // As requested: wrong passcode routes directly to the regular user login page
        onWrongPasscode();
      }
    } catch {
      onWrongPasscode();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 dark:bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold font-['Outfit']">{t.adminPasscodeTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            aria-label={t.cancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t.adminPasscodeDesc}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showCode ? 'text' : 'password'}
              inputMode="numeric"
              autoFocus
              required
              placeholder={t.adminPasscodePlaceholder}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowCode((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!passcode.trim() || checking}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              {checking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{t.adminUnlockBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
