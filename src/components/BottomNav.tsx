import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scan, Search, History, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTheme();

  const navItems = [
    { path: '/', label: t.home, icon: LayoutDashboard },
    { path: '/search', label: t.search, icon: Search },
    { path: '/scan', label: t.scanAI, icon: Scan, isPrimary: true },
    { path: '/history', label: t.history, icon: History },
    { path: '/settings', label: t.settings, icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-4 py-2 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isPrimary) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -top-5 flex flex-col items-center group focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/30 group-active:scale-95 transition-all">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-600 dark:text-emerald-400' : ''}`} />
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
