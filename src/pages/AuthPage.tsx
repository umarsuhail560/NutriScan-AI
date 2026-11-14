import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Scan, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Check, Shield } from 'lucide-react';

interface AuthPageProps {
  onClose?: () => void;
  onSuccess?: () => void;
  onOpenAdmin?: () => void;
  noticeMessage?: string | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onClose,
  onSuccess,
  onOpenAdmin,
  noticeMessage,
}) => {
  const {
    loginWithEmail,
    registerWithEmail,
    signInWithGoogle,
    resetPassword,
    enableGuestMode,
  } = useAuth();
  const { t } = useTheme();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/email-already-in-use') {
      return 'An account already exists with this email address. Please switch to Sign In.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/weak-password') {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed before completing.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    if (code === 'auth/unauthorized-domain') {
      return `This domain (${window.location.hostname}) is not authorized for Google Sign-In yet. Add it under Firebase Console → Authentication → Settings → Authorized domains.`;
    }
    return message || 'Authentication failed. Please check your credentials.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error('Please enter your full name');
        }
        await registerWithEmail(email, password, displayName);
      }
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotEmail) return;
    try {
      const outcome = await resetPassword(forgotEmail, forgotNewPassword || undefined);
      setSuccessMsg(outcome === 'email_sent' ? t.resetEmailSent : t.passwordUpdated);
      setShowForgotModal(false);
      setForgotNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleGuestClick = () => {
    enableGuestMode();
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Small Discreet Corner Option for Admin */}
      {onOpenAdmin && (
        <button
          type="button"
          onClick={onOpenAdmin}
          className="fixed top-4 left-4 z-50 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 flex items-center gap-1 shadow-sm transition-all"
          title={t.adminPasscodeTitle}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{t.adminCornerLabel}</span>
        </button>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 mb-2">
          <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Scan className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold font-['Outfit'] text-slate-900 dark:text-white tracking-tight">
          {t.welcomeTitle}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.welcomeSubtitle}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.createAccount}
            </button>
          </div>

          {noticeMessage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium">
              {noticeMessage}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={t.fullNamePlaceholder}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.emailAddress}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.password}</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <span>{t.processing}</span>
              ) : (
                <>
                  <span>{tab === 'login' ? t.signIn : t.createAccount}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 font-medium">{t.orContinueWith}</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t.googleAccount}</span>
          </button>

          {/* Guest Button */}
          <button
            type="button"
            onClick={handleGuestClick}
            className="w-full py-2 bg-transparent text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.continueAsGuest}
          </button>

          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            {t.encryptedSecureAuth}
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-bold">{t.resetPassword}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.resetLocalDesc}
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder={t.emailPlaceholder}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder={t.newPassword}
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg"
                >
                  {t.updatePassword}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
