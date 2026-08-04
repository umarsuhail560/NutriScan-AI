import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Award,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userProfile, logout, isGuest } = useAuth();
  const navigate = useNavigate();

  const achievements = [
    {
      id: 'first_scan',
      title: 'Health Explorer',
      description: 'Scanned your first food product',
      unlocked: (userProfile?.totalScans || 0) >= 1,
      icon: Sparkles,
    },
    {
      id: 'additive_detector',
      title: 'Additive Inspector',
      description: 'Completed 5 ingredient deep-dives',
      unlocked: (userProfile?.totalScans || 0) >= 5,
      icon: ShieldCheck,
    },
    {
      id: 'green_eater',
      title: 'Green Eater',
      description: 'Scanned 3 high-grade healthy products (Score 80+)',
      unlocked: (userProfile?.healthyScansCount || 0) >= 3,
      icon: CheckCircle2,
    },
    {
      id: 'pro_scanner',
      title: 'NutriScan Pro',
      description: 'Logged over 10 scans into your personal health ledger',
      unlocked: (userProfile?.totalScans || 0) >= 10,
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 p-6">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl flex-shrink-0">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-emerald-400 text-xl font-['Outfit']">
                {(userProfile?.displayName || 'N').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <h2 className="text-lg font-extrabold text-white font-['Outfit']">
              {userProfile?.displayName || 'Guest User'}
            </h2>
            <p className="text-xs text-slate-400">{userProfile?.email || 'guest@nutriscan.ai'}</p>
            {isGuest && (
              <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold mt-1">
                Guest Mode
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Scans</span>
            <span className="text-xl font-black text-white font-['Outfit']">{userProfile?.totalScans || 0}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 text-center space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Healthy</span>
            <span className="text-xl font-black text-emerald-400 font-['Outfit']">{userProfile?.healthyScansCount || 0}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 text-center space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Unhealthy</span>
            <span className="text-xl font-black text-rose-400 font-['Outfit']">{userProfile?.unhealthyScansCount || 0}</span>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" /> Unlockable Achievements
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              {achievements.filter((a) => a.unlocked).length} / {achievements.length}
            </span>
          </div>

          <div className="space-y-2">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    a.unlocked
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      a.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {a.title}
                      {a.unlocked && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md">Unlocked</span>}
                    </h4>
                    <p className="text-[11px] text-slate-400">{a.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logout / Switch Account */}
        <button
          onClick={logout}
          className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-500/40 text-rose-400 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out / Switch Account
        </button>
      </div>
    </div>
  );
};
