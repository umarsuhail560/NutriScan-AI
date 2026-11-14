import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Scan,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  User as UserIcon,
  Download,
  LayoutDashboard,
  Search,
  History,
  Settings,
  Scale,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  deferredPrompt: any;
  onInstallPWA: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenProfile,
  deferredPrompt,
  onInstallPWA,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, isGuest } = useAuth();
  const { theme, toggleTheme, t } = useTheme();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { path: '/', label: t.home, icon: LayoutDashboard },
    { path: '/search', label: t.search, icon: Search },
    { path: '/scan', label: t.scanAI, icon: Scan, isPrimary: true },
    { path: '/compare', label: t.compare, icon: Scale },
    { path: '/history', label: t.history, icon: History },
    { path: '/settings', label: t.settings, icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left focus:outline-none group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Scan className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h1 className="text-lg font-bold font-['Outfit'] text-slate-900 dark:text-slate-100 whitespace-nowrap">
            {t.appName} <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">AI</span>
          </h1>
        </button>

        {/* Desktop & Laptop Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.isPrimary) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Online/Offline crisp dot indicator */}
          <div
            title={isOnline ? t.online : t.offline}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap"
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="hidden xl:inline">{isOnline ? t.online : t.offline}</span>
          </div>

          {/* PWA Install Button if available */}
          {deferredPrompt && (
            <button
              onClick={onInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-semibold shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.installApp}</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700/50"
            title={t.toggleTheme}
            aria-label={t.toggleTheme}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* User Profile / Auth Button */}
          {userProfile && !isGuest ? (
            <button
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all"
              title={userProfile.displayName || t.profile}
            >
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm">
                  {(userProfile.displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
