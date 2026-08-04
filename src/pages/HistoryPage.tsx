import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FoodScan } from '../types';
import { fetchUserScans, deleteScanFromFirestore, toggleFavoriteScan } from '../services/scanService';
import {
  History,
  Search,
  Trash2,
  Heart,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Sparkles,
  Scan,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HistoryPageProps {
  onSelectScan: (scan: FoodScan) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectScan }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();

  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'healthy' | 'unhealthy'>(
    location.state?.filter || 'all'
  );
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'high_score' | 'low_score'>('newest');

  useEffect(() => {
    loadScans();
  }, [userProfile]);

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

  const handleDelete = async (e: React.MouseEvent, scanId?: string) => {
    e.stopPropagation();
    if (!scanId) return;
    if (confirm('Delete this scan record from history?')) {
      await deleteScanFromFirestore(scanId, userProfile?.uid || 'guest');
      setScans((prev) => prev.filter((s) => s.id !== scanId));
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, scan: FoodScan) => {
    e.stopPropagation();
    if (!scan.id) return;
    const nextFav = !scan.isFavorite;
    await toggleFavoriteScan(scan.id, nextFav, userProfile?.uid || 'guest');
    setScans((prev) => prev.map((s) => (s.id === scan.id ? { ...s, isFavorite: nextFav } : s)));
  };

  // Filter & Search logic
  let filtered = scans.filter((s) => {
    const matchesSearch =
      s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'favorites') return s.isFavorite;
    if (filterMode === 'healthy') return s.healthScore >= 60;
    if (filterMode === 'unhealthy') return s.healthScore < 60;
    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (sortMode === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortMode === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortMode === 'high_score') return b.healthScore - a.healthScore;
    if (sortMode === 'low_score') return a.healthScore - b.healthScore;
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <History className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold font-['Outfit']">Scan History ({filtered.length})</h2>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search history by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {(['all', 'favorites', 'healthy', 'unhealthy'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all flex-shrink-0 ${
                  filterMode === mode
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}

            {/* Sort Switcher */}
            <select
              value={sortMode}
              onChange={(e: any) => setSortMode(e.target.value)}
              className="ml-auto bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="high_score">Highest Score</option>
              <option value="low_score">Lowest Score</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading your history...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <Scan className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No Scans Found</h3>
            <p className="text-xs text-slate-500">No food product matches this filter.</p>
            <button
              onClick={() => navigate('/scan')}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Scan a Food Product
            </button>
          </div>
        ) : (
          filtered.map((scan) => (
            <div
              key={scan.id}
              onClick={() => onSelectScan(scan)}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer transition-all hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold font-['Outfit'] border ${
                    scan.healthScore >= 60
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : scan.healthScore >= 40
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  <span className="text-sm leading-none">{scan.healthScore}</span>
                  <span className="text-[9px] uppercase opacity-80">{scan.grade}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{scan.productName}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{scan.brand || 'Food Item'}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => handleFavoriteToggle(e, scan)}
                  className={`p-1.5 rounded-lg ${
                    scan.isFavorite ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${scan.isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  onClick={(e) => handleDelete(e, scan.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-500 ml-1" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
