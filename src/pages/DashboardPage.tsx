import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FoodScan } from '../types';
import { fetchUserScans } from '../services/scanService';
import { translateDietaryOption, translateRiskLevel } from '../i18n/translations';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import {
  Camera,
  Barcode,
  Upload,
  Sparkles,
  Heart,
  ChevronRight,
  Scan,
  TrendingUp,
  Activity,
  Scale,
  SlidersHorizontal,
  Shield,
} from 'lucide-react';

interface DashboardPageProps {
  onOpenBarcodeScanner: () => void;
  onSelectScan: (scan: FoodScan) => void;
  onOpenAdmin?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenBarcodeScanner,
  onSelectScan,
  onOpenAdmin,
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { t, theme } = useTheme();
  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchUserScans(userProfile?.uid || 'guest');
        if (active) setScans(data);
      } catch (err) {
        console.warn('Failed to load user scans', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    try {
      const saved = localStorage.getItem('nutriscan_dietary');
      setDietaryPrefs(saved ? JSON.parse(saved) : []);
    } catch {
      setDietaryPrefs([]);
    }
    return () => {
      active = false;
    };
  }, [userProfile?.uid]);

  const recentScans = scans.slice(0, 8);
  const favoriteScans = scans.filter((s) => s.isFavorite);

  const healthyCount = scans.filter((s) => s.healthScore >= 60).length;
  const totalCount = scans.length;
  const healthyRatio = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;
  const avgScore =
    totalCount > 0
      ? Math.round(scans.reduce((acc, s) => acc + (s.healthScore || 0), 0) / totalCount)
      : 0;

  const trendData = useMemo(() => {
    return scans
      .slice(0, 7)
      .reverse()
      .map((s) => ({
        name: s.productName.length > 10 ? `${s.productName.slice(0, 10)}…` : s.productName,
        fullName: s.productName,
        score: s.healthScore,
      }));
  }, [scans]);

  const getScoreColor = (val: number) => {
    if (val >= 75) return '#10B981';
    if (val >= 55) return '#84CC16';
    if (val >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-10 transition-colors">
      {/* Hero Welcome Banner */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/70 border-b border-slate-200 dark:border-slate-800/80 pt-10 pb-6 md:py-9">
        {/* Small Discreet Corner Option for Admin */}
        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="absolute top-2.5 right-3 sm:right-6 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 flex items-center gap-1 transition-all"
            title={t.adminPasscodeTitle}
          >
            <Shield className="w-3 h-3" />
            <span>{t.adminCornerLabel}</span>
          </button>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="uppercase tracking-widest font-bold">{t.aiHealthCompanion}</span>
              <span className="text-slate-400">·</span>
              <button
                onClick={() => navigate('/profile')}
                className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 tabular-nums transition-colors"
              >
                {totalCount} {t.scansCount}
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 dark:text-white tracking-tight">
              {t.hello}, {userProfile?.displayName || t.nutritionist}
            </h2>
          </div>

          {/* Quick Action Banner */}
          <div className="md:w-[420px] lg:w-[460px] flex-shrink-0 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-900/15 dark:shadow-emerald-950/50 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-black font-['Outfit']">{t.instantFoodAnalysis}</h3>
              <p className="text-xs text-emerald-50/90">{t.instantFoodDesc}</p>
            </div>
            <button
              onClick={() => navigate('/scan')}
              className="p-3 bg-white text-slate-950 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              aria-label={t.scanAI}
            >
              <Scan className="w-6 h-6 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Quick Actions, Daily Report, Score Trend & Favorites */}
          <div className="lg:col-span-5 space-y-5">
            {/* Main Action Grid (4 crisp actions incl. Compare) */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.quickActions}
              </h3>
              <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                <button
                  onClick={() => navigate('/scan', { state: { mode: 'photo' } })}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center gap-1.5 text-center group transition-all"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.takePhoto}</span>
                </button>

                <button
                  onClick={onOpenBarcodeScanner}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center gap-1.5 text-center group transition-all"
                >
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.barcode}</span>
                </button>

                <button
                  onClick={() => navigate('/scan', { state: { mode: 'upload' } })}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center gap-1.5 text-center group transition-all"
                >
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.upload}</span>
                </button>

                <button
                  onClick={() => navigate('/compare')}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center gap-1.5 text-center group transition-all"
                >
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.compare}</span>
                </button>
              </div>
            </div>

            {/* Health Report & KPI Summary */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t.dailyHealthReport}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.overallChoice}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.totalScans}</span>
                  <span className="text-lg font-black tabular-nums text-slate-900 dark:text-white font-['Outfit']">{totalCount}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.healthyPercent}</span>
                  <span className="text-lg font-black tabular-nums text-emerald-600 dark:text-emerald-400 font-['Outfit']">{healthyRatio}%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.avgScore}</span>
                  <span className="text-lg font-black tabular-nums text-cyan-600 dark:text-cyan-400 font-['Outfit']">{avgScore}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.favorites}</span>
                  <span className="text-lg font-black tabular-nums text-teal-600 dark:text-teal-300 font-['Outfit']">{favoriteScans.length}</span>
                </div>
              </div>

              {/* Active Dietary Filters Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{t.activeDietaryProfile}:</span>
                  <span className="truncate">
                    {dietaryPrefs.length > 0
                      ? dietaryPrefs.map((p) => translateDietaryOption(p, t)).join(' · ')
                      : t.configurePrefs}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/settings')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex-shrink-0"
                >
                  {t.settings}
                </button>
              </div>
            </div>

            {/* Health Score Trend Bar Chart */}
            {trendData.length >= 2 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.scoreTrendTitle}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.scoreTrendSubtitle}</p>
                  </div>
                </div>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${value}/100`, t.score]}
                        labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullName || ''}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                          borderRadius: '10px',
                          fontSize: '12px',
                          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                        }}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={30}>
                        {trendData.map((entry, idx) => (
                          <Cell key={idx} fill={getScoreColor(entry.score)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Favorites Section */}
            {favoriteScans.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> {t.favorites} ({favoriteScans.length})
                  </h3>
                  <button
                    onClick={() => navigate('/history', { state: { filter: 'favorites' } })}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {t.viewAll} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
                  {favoriteScans.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectScan(item)}
                      className="min-w-[160px] max-w-[170px] lg:min-w-0 lg:max-w-none p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm text-left flex flex-col justify-between space-y-2 flex-shrink-0 transition-all"
                    >
                      <div className="flex justify-between items-center w-full text-xs">
                        <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {item.healthScore}/100
                        </span>
                        <span className="font-bold text-teal-600 dark:text-teal-300">{item.grade}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.productName}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.brand}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Recent Scans */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t.recentScans}
              </h3>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                {t.seeAll} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">{t.loadingRecentScans}</div>
            ) : recentScans.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 shadow-sm text-center space-y-3">
                <Scan className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.noScansYet}</p>
                <button
                  onClick={() => navigate('/scan')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {t.startFirstScan}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => onSelectScan(scan)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-2 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold font-['Outfit'] border flex-shrink-0 tabular-nums ${
                          scan.healthScore >= 60
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : scan.healthScore >= 40
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <span className="text-sm leading-none">{scan.healthScore}</span>
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">{scan.grade}</span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{scan.productName}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {scan.brand || t.foodItem} · {translateRiskLevel(scan.riskLevel, t)}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
