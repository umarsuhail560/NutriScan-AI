import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FoodScan } from '../types';
import { fetchUserScans, deleteScanFromFirestore, toggleFavoriteScan } from '../services/scanService';
import {
  History,
  Search,
  Trash2,
  Heart,
  ChevronRight,
  Scan,
} from 'lucide-react';

interface HistoryPageProps {
  onSelectScan: (scan: FoodScan) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectScan }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const { t } = useTheme();

  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'healthy' | 'unhealthy'>(
    location.state?.filter || 'all'
  );
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'high_score' | 'low_score'>('newest');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadScans();
  }, [userProfile?.uid]);

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await fetchUserScans(userProfile?.uid || 'guest');
      setScans(data);
    } catch (err) {
      console.warn('Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteScanFromFirestore(confirmDeleteId, userProfile?.uid || 'guest');
    setScans((prev) => prev.filter((s) => s.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, scan: FoodScan) => {
    e.stopPropagation();
    if (!scan.id) return;
    const nextFav = !scan.isFavorite;
    await toggleFavoriteScan(scan.id, nextFav, userProfile?.uid || 'guest');
    setScans((prev) => prev.map((s) => (s.id === scan.id ? { ...s, isFavorite: nextFav } : s)));
  };

  const filtered = scans.filter((s) => {
    const matchesSearch =
      (s.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.brand || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'favorites') return s.isFavorite;
    if (filterMode === 'healthy') return s.healthScore >= 60;
    if (filterMode === 'unhealthy') return s.healthScore < 60;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortMode === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortMode === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortMode === 'high_score') return b.healthScore - a.healthScore;
    if (sortMode === 'low_score') return a.healthScore - b.healthScore;
    return 0;
  });

  const filterLabels: Record<'all' | 'favorites' | 'healthy' | 'unhealthy', string> = {
    all: t.filterAll,
    favorites: t.filterFavorites,
    healthy: t.filterHealthy,
    unhealthy: t.filterUnhealthy,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-10 transition-colors">
      {/* Top Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80 sticky top-16 z-30 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <History className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold font-['Outfit']">
                {t.scanHistory} ({filtered.length})
              </h2>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:max-w-sm">
              <input
                type="text"
                placeholder={t.searchHistoryPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {(['all', 'favorites', 'healthy', 'unhealthy'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex-shrink-0 ${
                  filterMode === mode
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {filterLabels[mode]}
              </button>
            ))}

            {/* Sort Switcher */}
            <select
              value={sortMode}
              onChange={(e: any) => setSortMode(e.target.value)}
              className="ml-auto bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="high_score">{t.sortHighScore}</option>
              <option value="low_score">{t.sortLowScore}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">{t.loadingHistory}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm max-w-md mx-auto">
            <Scan className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.noScansFound}</h3>
            <p className="text-xs text-slate-500">{t.noProductMatchesFilter}</p>
            <button
              onClick={() => navigate('/scan')}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              {t.scanFoodProduct}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((scan) => (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold font-['Outfit'] border flex-shrink-0 ${
                      scan.healthScore >= 60
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : scan.healthScore >= 40
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <span className="text-sm leading-none">{scan.healthScore}</span>
                    <span className="text-[9px] uppercase opacity-80">{scan.grade}</span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{scan.productName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{scan.brand || t.foodItem}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleFavoriteToggle(e, scan)}
                    className={`p-1.5 rounded-lg ${
                      scan.isFavorite ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${scan.isFavorite ? 'fill-rose-500' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (scan.id) setConfirmDeleteId(scan.id);
                    }}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-app Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.deleteConfirmTitle}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{t.deleteConfirmMsg}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {t.deleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
