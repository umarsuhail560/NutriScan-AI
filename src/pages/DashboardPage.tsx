import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FoodScan } from '../types';
import { fetchUserScans } from '../services/scanService';
import {
  Camera,
  Barcode,
  Upload,
  Sparkles,
  Heart,
  ChevronRight,
  Zap,
  Flame,
  Award,
  Search,
  Scan,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface DashboardPageProps {
  onOpenBarcodeScanner: () => void;
  onSelectScan: (scan: FoodScan) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenBarcodeScanner,
  onSelectScan,
}) => {
  const navigate = useNavigate();
  const { userProfile, isGuest } = useAuth();
  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchUserScans(userProfile?.uid || 'guest');
        setScans(data);
      } catch (err) {
        console.warn('Failed to load user scans', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userProfile]);

  const recentScans = scans.slice(0, 5);
  const favoriteScans = scans.filter((s) => s.isFavorite);

  // Calculate stats
  const healthyCount = scans.filter((s) => s.healthScore >= 60).length;
  const totalCount = scans.length;
  const healthyRatio = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 border-b border-slate-800/80 px-4 pt-6 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Health Companion
              </span>
              <h2 className="text-2xl font-extrabold font-['Outfit'] text-white tracking-tight mt-0.5">
                Hello, {userProfile?.displayName || 'Nutritionist'} 👋
              </h2>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>{totalCount} Scans</span>
            </button>
          </div>

          {/* Quick Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-950/50 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-black font-['Outfit']">Instant Food Analysis</h3>
              <p className="text-xs text-emerald-100/90">
                Snap photos or scan barcodes to decode additives & health grades!
              </p>
            </div>
            <button
              onClick={() => navigate('/scan')}
              className="p-3 bg-white text-slate-950 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Scan className="w-6 h-6 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {/* Main Action Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => navigate('/scan', { state: { mode: 'photo' } })}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80 flex flex-col items-center gap-2 text-center group transition-all"
            >
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200">Take Photo</span>
            </button>

            <button
              onClick={onOpenBarcodeScanner}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80 flex flex-col items-center gap-2 text-center group transition-all"
            >
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Barcode className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200">Barcode</span>
            </button>

            <button
              onClick={() => navigate('/scan', { state: { mode: 'upload' } })}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80 flex flex-col items-center gap-2 text-center group transition-all"
            >
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200">Upload</span>
            </button>
          </div>
        </div>

        {/* Health Report & Stats Summary */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Daily Health Report
            </h3>
            <span className="text-xs text-slate-400 font-medium">Overall Choice</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block">Total Scans</span>
              <span className="text-lg font-black text-white font-['Outfit']">{totalCount}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block">Healthy %</span>
              <span className="text-lg font-black text-emerald-400 font-['Outfit']">{healthyRatio}%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block">Favorites</span>
              <span className="text-lg font-black text-teal-300 font-['Outfit']">{favoriteScans.length}</span>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteScans.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Favorites ({favoriteScans.length})
              </h3>
              <button
                onClick={() => navigate('/history', { state: { filter: 'favorites' } })}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {favoriteScans.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectScan(item)}
                  className="min-w-[160px] max-w-[170px] p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left flex flex-col justify-between space-y-2 flex-shrink-0 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Score {item.healthScore}
                    </span>
                    <span className="text-xs font-bold text-teal-300">{item.grade}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{item.productName}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{item.brand}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Scans */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Recent Scans
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500">Loading recent scans...</div>
          ) : recentScans.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-center space-y-3">
              <Scan className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No food products scanned yet.</p>
              <button
                onClick={() => navigate('/scan')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
              >
                Start First AI Scan
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onSelectScan(scan)}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-all hover:border-slate-700"
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
                      <span className="text-[9px] uppercase tracking-tighter opacity-80">{scan.grade}</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{scan.productName}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{scan.brand || 'Food Item'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        scan.healthScore >= 60
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : scan.healthScore >= 40
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {scan.riskLevel}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
