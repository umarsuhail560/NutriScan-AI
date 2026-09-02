import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FoodScan } from '../types';
import {
  fetchUserScans,
  deleteScanFromFirestore,
  toggleFavoriteScan,
} from '../services/scanService';
import {
  History,
  Search,
  Trash2,
  Heart,
  ChevronRight,
  Scan,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HistoryPageProps {
  onSelectScan: (scan: FoodScan) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectScan }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const { theme, language, t } = useTheme();

  const isDark = theme === 'dark';

  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [filterMode, setFilterMode] = useState<
    'all' | 'favorites' | 'healthy' | 'unhealthy'
  >(location.state?.filter || 'all');

  const [sortMode, setSortMode] = useState<
    'newest' | 'oldest' | 'high_score' | 'low_score'
  >('newest');

  const labels = {
    English: {
      searchPlaceholder: 'Search history by name or brand...',
      all: 'All',
      favorites: 'Favorites',
      healthy: 'Healthy',
      unhealthy: 'Unhealthy',
      newest: 'Newest',
      oldest: 'Oldest',
      highestScore: 'Highest Score',
      lowestScore: 'Lowest Score',
      loading: 'Loading your history...',
      noScans: 'No Scans Found',
      noMatches: 'No food product matches this filter.',
      scanFood: 'Scan a Food Product',
      foodItem: 'Food Item',
      deleteConfirm: 'Delete this scan record from history?',
    },
    Spanish: {
      searchPlaceholder: 'Buscar historial por nombre o marca...',
      all: 'Todos',
      favorites: 'Favoritos',
      healthy: 'Saludable',
      unhealthy: 'No saludable',
      newest: 'Más reciente',
      oldest: 'Más antiguo',
      highestScore: 'Puntuación más alta',
      lowestScore: 'Puntuación más baja',
      loading: 'Cargando tu historial...',
      noScans: 'No se encontraron escaneos',
      noMatches: 'Ningún producto alimenticio coincide con este filtro.',
      scanFood: 'Escanear un producto',
      foodItem: 'Producto alimenticio',
      deleteConfirm: '¿Eliminar este registro del historial?',
    },
    French: {
      searchPlaceholder: 'Rechercher dans l’historique par nom ou marque...',
      all: 'Tous',
      favorites: 'Favoris',
      healthy: 'Sain',
      unhealthy: 'Malsain',
      newest: 'Plus récent',
      oldest: 'Plus ancien',
      highestScore: 'Score le plus élevé',
      lowestScore: 'Score le plus faible',
      loading: 'Chargement de votre historique...',
      noScans: 'Aucun scan trouvé',
      noMatches: 'Aucun produit alimentaire ne correspond à ce filtre.',
      scanFood: 'Scanner un produit',
      foodItem: 'Produit alimentaire',
      deleteConfirm: 'Supprimer cet enregistrement de l’historique ?',
    },
    German: {
      searchPlaceholder: 'Verlauf nach Name oder Marke durchsuchen...',
      all: 'Alle',
      favorites: 'Favoriten',
      healthy: 'Gesund',
      unhealthy: 'Ungesund',
      newest: 'Neueste',
      oldest: 'Älteste',
      highestScore: 'Höchster Score',
      lowestScore: 'Niedrigster Score',
      loading: 'Verlauf wird geladen...',
      noScans: 'Keine Scans gefunden',
      noMatches: 'Kein Lebensmittel passt zu diesem Filter.',
      scanFood: 'Lebensmittel scannen',
      foodItem: 'Lebensmittel',
      deleteConfirm: 'Diesen Verlaufseintrag löschen?',
    },
    Hindi: {
      searchPlaceholder: 'नाम या ब्रांड से इतिहास खोजें...',
      all: 'सभी',
      favorites: 'पसंदीदा',
      healthy: 'स्वस्थ',
      unhealthy: 'अस्वस्थ',
      newest: 'नवीनतम',
      oldest: 'पुराना',
      highestScore: 'उच्चतम स्कोर',
      lowestScore: 'न्यूनतम स्कोर',
      loading: 'आपका इतिहास लोड हो रहा है...',
      noScans: 'कोई स्कैन नहीं मिला',
      noMatches: 'इस फ़िल्टर से कोई खाद्य उत्पाद मेल नहीं खाता।',
      scanFood: 'खाद्य उत्पाद स्कैन करें',
      foodItem: 'खाद्य वस्तु',
      deleteConfirm: 'क्या इस स्कैन रिकॉर्ड को इतिहास से हटाना है?',
    },
    Arabic: {
      searchPlaceholder: 'ابحث في السجل بالاسم أو العلامة التجارية...',
      all: 'الكل',
      favorites: 'المفضلة',
      healthy: 'صحي',
      unhealthy: 'غير صحي',
      newest: 'الأحدث',
      oldest: 'الأقدم',
      highestScore: 'أعلى تقييم',
      lowestScore: 'أدنى تقييم',
      loading: 'جارٍ تحميل السجل...',
      noScans: 'لا توجد عمليات مسح',
      noMatches: 'لا يوجد منتج غذائي يطابق هذا الفلتر.',
      scanFood: 'مسح منتج غذائي',
      foodItem: 'منتج غذائي',
      deleteConfirm: 'هل تريد حذف سجل المسح هذا من السجل؟',
    },
  };

  const currentLabels = labels[language];

  useEffect(() => {
    loadScans();
  }, [userProfile?.uid]);

  const loadScans = async () => {
    if (!userProfile?.uid) {
      setScans([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await fetchUserScans(userProfile.uid);
      setScans(data);
    } catch (err) {
      console.warn('Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    scanId?: string
  ) => {
    e.stopPropagation();

    if (!scanId || !userProfile?.uid) return;

    if (window.confirm(currentLabels.deleteConfirm)) {
      try {
        await deleteScanFromFirestore(scanId, userProfile.uid);

        setScans((prev) =>
          prev.filter((s) => s.id !== scanId)
        );
      } catch (err) {
        console.warn('Error deleting scan:', err);
      }
    }
  };

  const handleFavoriteToggle = async (
    e: React.MouseEvent,
    scan: FoodScan
  ) => {
    e.stopPropagation();

    if (!scan.id || !userProfile?.uid) return;

    const nextFav = !scan.isFavorite;

    try {
      await toggleFavoriteScan(
        scan.id,
        nextFav,
        userProfile.uid
      );

      setScans((prev) =>
        prev.map((s) =>
          s.id === scan.id
            ? { ...s, isFavorite: nextFav }
            : s
        )
      );
    } catch (err) {
      console.warn('Error updating favorite:', err);
    }
  };

  let filtered = scans.filter((scan) => {
    const productName = scan.productName || '';
    const brand = scan.brand || '';

    const matchesSearch =
      productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      brand
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'favorites') return scan.isFavorite;
    if (filterMode === 'healthy') return scan.healthScore >= 60;
    if (filterMode === 'unhealthy') return scan.healthScore < 60;

    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortMode === 'newest') {
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    }

    if (sortMode === 'oldest') {
      return (
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
      );
    }

    if (sortMode === 'high_score') {
      return b.healthScore - a.healthScore;
    }

    if (sortMode === 'low_score') {
      return a.healthScore - b.healthScore;
    }

    return 0;
  });

  const filterLabels = {
    all: currentLabels.all,
    favorites: currentLabels.favorites,
    healthy: currentLabels.healthy,
    unhealthy: currentLabels.unhealthy,
  };

  return (
    <div
      className={`min-h-screen pb-28 transition-colors ${
        isDark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Header */}
      <div
        className={`p-4 border-b sticky top-0 z-30 backdrop-blur-md transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-900/90'
            : 'border-slate-200 bg-white/90'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl ${
                  isDark
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                <History className="w-5 h-5" />
              </div>

              <h2 className="text-base font-bold font-['Outfit']">
                {t('scanHistory')} ({filtered.length})
              </h2>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder={currentLabels.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />

            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {(
              ['all', 'favorites', 'healthy', 'unhealthy'] as const
            ).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex-shrink-0 ${
                  filterMode === mode
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isDark
                      ? 'bg-slate-950 text-slate-400 border border-slate-800'
                      : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {filterLabels[mode]}
              </button>
            ))}

            {/* Sort Switcher */}
            <select
              value={sortMode}
              onChange={(e) =>
                setSortMode(
                  e.target.value as
                    | 'newest'
                    | 'oldest'
                    | 'high_score'
                    | 'low_score'
                )
              }
              className={`ml-auto border text-xs rounded-lg px-2 py-1 focus:outline-none transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="newest">
                {currentLabels.newest}
              </option>
              <option value="oldest">
                {currentLabels.oldest}
              </option>
              <option value="high_score">
                {currentLabels.highestScore}
              </option>
              <option value="low_score">
                {currentLabels.lowestScore}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="max-w-md mx-auto p-4 space-y-3">
        {loading ? (
          <div
            className={`p-8 text-center text-xs ${
              isDark ? 'text-slate-500' : 'text-slate-500'
            }`}
          >
            {currentLabels.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className={`p-8 rounded-3xl border text-center space-y-3 ${
              isDark
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <Scan
              className={`w-12 h-12 mx-auto ${
                isDark ? 'text-slate-600' : 'text-slate-300'
              }`}
            />

            <h3
              className={`text-sm font-bold ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              {currentLabels.noScans}
            </h3>

            <p
              className={`text-xs ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              {currentLabels.noMatches}
            </p>

            <button
              onClick={() => navigate('/scan')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              {currentLabels.scanFood}
            </button>
          </div>
        ) : (
          filtered.map((scan) => (
            <div
              key={scan.id}
              onClick={() => onSelectScan(scan)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Score */}
                <div
                  className={`w-11 h-11 flex-shrink-0 rounded-2xl flex flex-col items-center justify-center font-bold font-['Outfit'] border ${
                    scan.healthScore >= 60
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : scan.healthScore >= 40
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  <span className="text-sm leading-none">
                    {scan.healthScore}
                  </span>

                  <span className="text-[9px] uppercase opacity-80">
                    {scan.grade}
                  </span>
                </div>

                {/* Product Info */}
                <div className="min-w-0">
                  <h4
                    className={`text-xs font-bold line-clamp-1 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {scan.productName}
                  </h4>

                  <p
                    className={`text-[11px] line-clamp-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {scan.brand || currentLabels.foodItem}
                  </p>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(
                      scan.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) =>
                    handleFavoriteToggle(e, scan)
                  }
                  aria-label={
                    scan.isFavorite
                      ? t('removeFavorite')
                      : t('favorite')
                  }
                  className={`p-1.5 rounded-lg ${
                    scan.isFavorite
                      ? 'text-rose-500'
                      : isDark
                        ? 'text-slate-500 hover:text-slate-300'
                        : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      scan.isFavorite ? 'fill-rose-500' : ''
                    }`}
                  />
                </button>

                <button
                  onClick={(e) =>
                    handleDelete(e, scan.id)
                  }
                  aria-label={t('delete')}
                  className={`p-1.5 rounded-lg ${
                    isDark
                      ? 'text-slate-500 hover:text-rose-400'
                      : 'text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight
                  className={`w-4 h-4 ml-1 ${
                    isDark
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};