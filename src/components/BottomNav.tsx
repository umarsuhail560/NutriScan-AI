import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Scan,
  Search,
  History,
  Settings,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, language } = useTheme();

  const isDark = theme === 'dark';

  const labels = {
    English: {
      home: 'Home',
      search: 'Search',
      scan: 'Scan',
      history: 'History',
      settings: 'Settings',
      scanAI: 'Scan AI',
    },
    Spanish: {
      home: 'Inicio',
      search: 'Buscar',
      scan: 'Escanear',
      history: 'Historial',
      settings: 'Ajustes',
      scanAI: 'Escanear IA',
    },
    French: {
      home: 'Accueil',
      search: 'Recherche',
      scan: 'Scanner',
      history: 'Historique',
      settings: 'Paramètres',
      scanAI: 'Scanner IA',
    },
    German: {
      home: 'Start',
      search: 'Suche',
      scan: 'Scannen',
      history: 'Verlauf',
      settings: 'Einstellungen',
      scanAI: 'KI-Scan',
    },
    Hindi: {
      home: 'होम',
      search: 'खोजें',
      scan: 'स्कैन',
      history: 'इतिहास',
      settings: 'सेटिंग्स',
      scanAI: 'AI स्कैन',
    },
    Arabic: {
      home: 'الرئيسية',
      search: 'بحث',
      scan: 'مسح',
      history: 'السجل',
      settings: 'الإعدادات',
      scanAI: 'مسح AI',
    },
  };

  const currentLabels = labels[language];

  const navItems = [
    {
      path: '/',
      label: currentLabels.home,
      icon: LayoutDashboard,
    },
    {
      path: '/search',
      label: currentLabels.search,
      icon: Search,
    },
    {
      path: '/scan',
      label: currentLabels.scan,
      icon: Scan,
      isPrimary: true,
    },
    {
      path: '/history',
      label: currentLabels.history,
      icon: History,
    },
    {
      path: '/settings',
      label: currentLabels.settings,
      icon: Settings,
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t px-4 py-2 transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-800/80'
          : 'bg-white/90 border-slate-200'
      }`}
    >
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
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'bg-slate-950' : 'bg-white'
                    }`}
                  >
                    <Icon className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-400 mt-0.5">
                  {currentLabels.scanAI}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'scale-110 text-emerald-400' : ''
                }`}
              />

              <span className="text-[11px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};