import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FoodScan } from '../types';
import { fetchUserScans } from '../services/scanService';
import { useTheme } from '../context/ThemeContext';
import {
  Camera,
  Upload,
  Sparkles,
  Heart,
  ChevronRight,
  Award,
  Scan,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface DashboardPageProps {
  onSelectScan: (scan: FoodScan) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectScan,
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { theme, language } = useTheme();

  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isDark = theme === 'dark';

  const labels = {
    English: {
      aiHealthCompanion: 'AI Health Companion',
      hello: 'Hello',
      nutritionist: 'Nutritionist',
      scans: 'Scans',
      instantFoodAnalysis: 'Instant Food Analysis',
      analysisDescription:
        'Snap photos or upload food images to decode additives & health grades!',
      quickActions: 'Quick Actions',
      takePhoto: 'Take Photo',
      upload: 'Upload',
      dailyHealthReport: 'Daily Health Report',
      overallChoice: 'Overall Choice',
      totalScans: 'Total Scans',
      healthyPercent: 'Healthy %',
      favorites: 'Favorites',
      viewAll: 'View all',
      recentScans: 'Recent Scans',
      seeAll: 'See all',
      loadingRecent: 'Loading recent scans...',
      noProducts: 'No food products scanned yet.',
      startFirstScan: 'Start First AI Scan',
      foodItem: 'Food Item',
      score: 'Score',
    },

    Spanish: {
      aiHealthCompanion: 'Asistente de Salud IA',
      hello: 'Hola',
      nutritionist: 'Nutricionista',
      scans: 'Escaneos',
      instantFoodAnalysis: 'Análisis Instantáneo de Alimentos',
      analysisDescription:
        'Toma fotos o sube imágenes de alimentos para analizar aditivos y calificaciones de salud.',
      quickActions: 'Acciones Rápidas',
      takePhoto: 'Tomar Foto',
      upload: 'Subir',
      dailyHealthReport: 'Informe Diario de Salud',
      overallChoice: 'Elección General',
      totalScans: 'Total de Escaneos',
      healthyPercent: '% Saludable',
      favorites: 'Favoritos',
      viewAll: 'Ver todo',
      recentScans: 'Escaneos Recientes',
      seeAll: 'Ver todo',
      loadingRecent: 'Cargando escaneos recientes...',
      noProducts: 'Aún no se han escaneado productos alimenticios.',
      startFirstScan: 'Iniciar Primer Escaneo IA',
      foodItem: 'Producto Alimenticio',
      score: 'Puntuación',
    },

    French: {
      aiHealthCompanion: 'Assistant Santé IA',
      hello: 'Bonjour',
      nutritionist: 'Nutritionniste',
      scans: 'Scans',
      instantFoodAnalysis: 'Analyse Alimentaire Instantanée',
      analysisDescription:
        'Prenez des photos ou téléchargez des images alimentaires pour analyser les additifs et les scores de santé.',
      quickActions: 'Actions Rapides',
      takePhoto: 'Prendre une Photo',
      upload: 'Télécharger',
      dailyHealthReport: 'Rapport de Santé Quotidien',
      overallChoice: 'Choix Global',
      totalScans: 'Total des Scans',
      healthyPercent: '% Sain',
      favorites: 'Favoris',
      viewAll: 'Voir tout',
      recentScans: 'Scans Récents',
      seeAll: 'Tout voir',
      loadingRecent: 'Chargement des scans récents...',
      noProducts: 'Aucun produit alimentaire scanné pour le moment.',
      startFirstScan: 'Commencer le Premier Scan IA',
      foodItem: 'Produit Alimentaire',
      score: 'Score',
    },

    German: {
      aiHealthCompanion: 'KI-Gesundheitsassistent',
      hello: 'Hallo',
      nutritionist: 'Ernährungsberater',
      scans: 'Scans',
      instantFoodAnalysis: 'Sofortige Lebensmittelanalyse',
      analysisDescription:
        'Fotografieren oder laden Sie Lebensmittelbilder hoch, um Zusatzstoffe und Gesundheitsbewertungen zu analysieren.',
      quickActions: 'Schnellaktionen',
      takePhoto: 'Foto aufnehmen',
      upload: 'Hochladen',
      dailyHealthReport: 'Täglicher Gesundheitsbericht',
      overallChoice: 'Gesamtauswahl',
      totalScans: 'Scans insgesamt',
      healthyPercent: 'Gesund %',
      favorites: 'Favoriten',
      viewAll: 'Alle anzeigen',
      recentScans: 'Letzte Scans',
      seeAll: 'Alle anzeigen',
      loadingRecent: 'Letzte Scans werden geladen...',
      noProducts: 'Noch keine Lebensmittelprodukte gescannt.',
      startFirstScan: 'Ersten KI-Scan starten',
      foodItem: 'Lebensmittel',
      score: 'Punktzahl',
    },

    Hindi: {
      aiHealthCompanion: 'AI स्वास्थ्य सहायक',
      hello: 'नमस्ते',
      nutritionist: 'पोषण विशेषज्ञ',
      scans: 'स्कैन',
      instantFoodAnalysis: 'तुरंत खाद्य विश्लेषण',
      analysisDescription:
        'एडिटिव्स और स्वास्थ्य ग्रेड जानने के लिए भोजन की फोटो लें या छवि अपलोड करें।',
      quickActions: 'त्वरित कार्य',
      takePhoto: 'फोटो लें',
      upload: 'अपलोड करें',
      dailyHealthReport: 'दैनिक स्वास्थ्य रिपोर्ट',
      overallChoice: 'समग्र विकल्प',
      totalScans: 'कुल स्कैन',
      healthyPercent: 'स्वस्थ %',
      favorites: 'पसंदीदा',
      viewAll: 'सभी देखें',
      recentScans: 'हाल के स्कैन',
      seeAll: 'सभी देखें',
      loadingRecent: 'हाल के स्कैन लोड हो रहे हैं...',
      noProducts: 'अभी तक कोई खाद्य उत्पाद स्कैन नहीं किया गया है।',
      startFirstScan: 'पहला AI स्कैन शुरू करें',
      foodItem: 'खाद्य उत्पाद',
      score: 'स्कोर',
    },

    Arabic: {
      aiHealthCompanion: 'مساعد الصحة بالذكاء الاصطناعي',
      hello: 'مرحباً',
      nutritionist: 'أخصائي التغذية',
      scans: 'عمليات المسح',
      instantFoodAnalysis: 'تحليل الطعام الفوري',
      analysisDescription:
        'التقط صوراً أو ارفع صور الطعام لتحليل الإضافات ودرجات الصحة.',
      quickActions: 'إجراءات سريعة',
      takePhoto: 'التقاط صورة',
      upload: 'رفع',
      dailyHealthReport: 'تقرير الصحة اليومي',
      overallChoice: 'الاختيار العام',
      totalScans: 'إجمالي عمليات المسح',
      healthyPercent: 'النسبة الصحية',
      favorites: 'المفضلة',
      viewAll: 'عرض الكل',
      recentScans: 'عمليات المسح الأخيرة',
      seeAll: 'عرض الكل',
      loadingRecent: 'جارٍ تحميل عمليات المسح الأخيرة...',
      noProducts: 'لم يتم مسح أي منتجات غذائية بعد.',
      startFirstScan: 'ابدأ أول مسح بالذكاء الاصطناعي',
      foodItem: 'منتج غذائي',
      score: 'التقييم',
    },
  };

  const t = labels[language];

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!userProfile?.uid) {
        if (isMounted) {
          setScans([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const data = await fetchUserScans(userProfile.uid);

        if (isMounted) {
          setScans(data);
        }
      } catch (err) {
        console.warn('Failed to load user scans', err);

        if (isMounted) {
          setScans([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userProfile?.uid]);

  const recentScans = scans.slice(0, 5);
  const favoriteScans = scans.filter((s) => s.isFavorite);

  const healthyCount = scans.filter(
    (s) => s.healthScore >= 60
  ).length;

  const totalCount = scans.length;

  const healthyRatio =
    totalCount > 0
      ? Math.round((healthyCount / totalCount) * 100)
      : 0;

  return (
    <div
      className={`min-h-screen pb-28 transition-colors ${
        isDark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Hero Welcome Banner */}
      <div
        className={`border-b px-4 pt-6 pb-8 transition-colors ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 border-slate-800/80'
            : 'bg-gradient-to-br from-white via-white to-emerald-50 border-slate-200'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {t.aiHealthCompanion}
              </span>

              <h2
                className={`text-2xl font-extrabold font-['Outfit'] tracking-tight mt-0.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {t.hello},{' '}
                {userProfile?.displayName || t.nutritionist} 👋
              </h2>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
            >
              <Award className="w-4 h-4" />

              <span>
                {totalCount} {t.scans}
              </span>
            </button>
          </div>

          {/* Quick Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-950/50 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-black font-['Outfit']">
                {t.instantFoodAnalysis}
              </h3>

              <p className="text-xs text-emerald-100/90">
                {t.analysisDescription}
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
          <h3
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {t.quickActions}
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Take Photo */}
            <button
              onClick={() =>
                navigate('/scan', {
                  state: { mode: 'photo' },
                })
              }
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-center group transition-all ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800/80 border-slate-800/80'
                  : 'bg-white hover:bg-slate-100 border-slate-200 shadow-sm'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>

              <span
                className={`text-xs font-bold ${
                  isDark
                    ? 'text-slate-200'
                    : 'text-slate-700'
                }`}
              >
                {t.takePhoto}
              </span>
            </button>

            {/* Upload */}
            <button
              onClick={() =>
                navigate('/scan', {
                  state: { mode: 'upload' },
                })
              }
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-center group transition-all ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800/80 border-slate-800/80'
                  : 'bg-white hover:bg-slate-100 border-slate-200 shadow-sm'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>

              <span
                className={`text-xs font-bold ${
                  isDark
                    ? 'text-slate-200'
                    : 'text-slate-700'
                }`}
              >
                {t.upload}
              </span>
            </button>
          </div>
        </div>

        {/* Health Report & Stats Summary */}
        <div
          className={`p-4 rounded-2xl border space-y-3 transition-colors ${
            isDark
              ? 'bg-slate-900/90 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`text-sm font-bold flex items-center gap-2 ${
                isDark
                  ? 'text-slate-100'
                  : 'text-slate-800'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-500" />
              {t.dailyHealthReport}
            </h3>

            <span
              className={`text-xs font-medium ${
                isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {t.overallChoice}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span
                className={`text-xs block ${
                  isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {t.totalScans}
              </span>

              <span
                className={`text-lg font-black font-['Outfit'] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {totalCount}
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span
                className={`text-xs block ${
                  isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {t.healthyPercent}
              </span>

              <span className="text-lg font-black text-emerald-500 font-['Outfit']">
                {healthyRatio}%
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span
                className={`text-xs block ${
                  isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {t.favorites}
              </span>

              <span className="text-lg font-black text-teal-500 font-['Outfit']">
                {favoriteScans.length}
              </span>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteScans.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${
                  isDark
                    ? 'text-slate-200'
                    : 'text-slate-800'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                {t.favorites} ({favoriteScans.length})
              </h3>

              <button
                onClick={() =>
                  navigate('/history', {
                    state: { filter: 'favorites' },
                  })
                }
                className="text-xs text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
              >
                {t.viewAll}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {favoriteScans.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectScan(item)}
                  className={`min-w-[160px] max-w-[170px] p-3 rounded-2xl border hover:border-emerald-500/40 text-left flex flex-col justify-between space-y-2 flex-shrink-0 transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      {t.score} {item.healthScore}
                    </span>

                    <span className="text-xs font-bold text-teal-500">
                      {item.grade}
                    </span>
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold line-clamp-1 ${
                        isDark
                          ? 'text-white'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.productName}
                    </h4>

                    <p
                      className={`text-[10px] line-clamp-1 ${
                        isDark
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.brand}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Scans */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className={`text-sm font-bold flex items-center gap-2 ${
                isDark
                  ? 'text-slate-200'
                  : 'text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              {t.recentScans}
            </h3>

            <button
              onClick={() => navigate('/history')}
              className="text-xs text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
            >
              {t.seeAll}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div
              className={`p-6 text-center text-xs ${
                isDark
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {t.loadingRecent}
            </div>
          ) : recentScans.length === 0 ? (
            <div
              className={`p-8 rounded-2xl border text-center space-y-3 ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800/60'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <Scan
                className={`w-10 h-10 mx-auto ${
                  isDark
                    ? 'text-slate-600'
                    : 'text-slate-300'
                }`}
              />

              <p
                className={`text-xs ${
                  isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {t.noProducts}
              </p>

              <button
                onClick={() => navigate('/scan')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
              >
                {t.startFirstScan}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onSelectScan(scan)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:border-emerald-500/40 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800/80 hover:bg-slate-800'
                      : 'bg-white border-slate-200 shadow-sm hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 flex-shrink-0 rounded-2xl flex flex-col items-center justify-center font-bold font-['Outfit'] border ${
                        scan.healthScore >= 60
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : scan.healthScore >= 40
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                      }`}
                    >
                      <span className="text-sm leading-none">
                        {scan.healthScore}
                      </span>

                      <span className="text-[9px] uppercase tracking-tighter opacity-80">
                        {scan.grade}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold line-clamp-1 ${
                          isDark
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        {scan.productName}
                      </h4>

                      <p
                        className={`text-[11px] line-clamp-1 ${
                          isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {scan.brand || t.foodItem}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        scan.healthScore >= 60
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : scan.healthScore >= 40
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-rose-500/20 text-rose-500'
                      }`}
                    >
                      {scan.riskLevel}
                    </span>

                    <ChevronRight
                      className={`w-4 h-4 ${
                        isDark
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    />
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