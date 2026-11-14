import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Award,
  LogOut,
  LogIn,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ProfilePageProps {
  onOpenAuth?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenAuth }) => {
  const { userProfile, logout, isGuest } = useAuth();
  const { t } = useTheme();

  const achievements = [
    {
      id: 'first_scan',
      title: t.achHealthExplorer,
      description: t.achHealthExplorerDesc,
      unlocked: (userProfile?.totalScans || 0) >= 1,
      icon: Sparkles,
    },
    {
      id: 'additive_detector',
      title: t.achAdditiveInspector,
      description: t.achAdditiveInspectorDesc,
      unlocked: (userProfile?.totalScans || 0) >= 5,
      icon: ShieldCheck,
    },
    {
      id: 'green_eater',
      title: t.achGreenEater,
      description: t.achGreenEaterDesc,
      unlocked: (userProfile?.healthyScansCount || 0) >= 3,
      icon: CheckCircle2,
    },
    {
      id: 'pro_scanner',
      title: t.achNutriScanPro,
      description: t.achNutriScanProDesc,
      unlocked: (userProfile?.totalScans || 0) >= 10,
      icon: Award,
    },
  ];

  const isSignedOutOrGuest = !userProfile || isGuest;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-10 transition-colors">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-emerald-50 to-slate-50 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800/80 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl flex-shrink-0">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-xl sm:text-2xl font-['Outfit']">
                  {(userProfile?.displayName || 'N').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {userProfile?.displayName || t.guestUser}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{userProfile?.email || 'guest@nutriscan.ai'}</p>
              {isSignedOutOrGuest && (
                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold mt-1">
                  {t.guestMode}
                </span>
              )}
            </div>
          </div>

          <div className="hidden sm:block">
            {isSignedOutOrGuest ? (
              onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> {t.signInCreateAccount}
                </button>
              )
            ) : (
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-2xl transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> {t.signOutSwitch}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Statistics Cards & Mobile Auth CTA */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{t.totalScans}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">{userProfile?.totalScans || 0}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm text-center space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">{t.healthyLabel}</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">{userProfile?.healthyScansCount || 0}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm text-center space-y-1">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">{t.unhealthyLabel}</span>
                <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-['Outfit']">{userProfile?.unhealthyScansCount || 0}</span>
              </div>
            </div>

            {/* Mobile Auth Actions */}
            <div className="sm:hidden">
              {isSignedOutOrGuest ? (
                onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> {t.signInCreateAccount}
                  </button>
                )
              ) : (
                <button
                  onClick={logout}
                  className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> {t.signOutSwitch}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Achievements Section */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t.unlockableAchievements}
              </h3>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {achievements.filter((a) => a.unlocked).length} / {achievements.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                      a.unlocked
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-65'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        a.unlocked
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                        <span>{a.title}</span>
                        {a.unlocked && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                            {t.unlocked}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
