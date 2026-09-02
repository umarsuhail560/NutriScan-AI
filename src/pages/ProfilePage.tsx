import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Award,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { theme, language, t } = useTheme();

  const profileTranslations = {
    English: {
      healthExplorer: 'Health Explorer',
      firstScan: 'Scanned your first food product',
      additiveInspector: 'Additive Inspector',
      fiveDeepDives: 'Completed 5 ingredient deep-dives',
      greenEater: 'Green Eater',
      threeHealthy: 'Scanned 3 high-grade healthy products (Score 80+)',
      nutriPro: 'NutriScan Pro',
      tenScans: 'Logged over 10 scans into your personal health ledger',
      achievements: 'Unlockable Achievements',
      unlocked: 'Unlocked',
      healthy: 'Healthy',
      unhealthy: 'Unhealthy',
      signOut: 'Sign Out',
      user: 'User',
    },

    Spanish: {
      healthExplorer: 'Explorador de salud',
      firstScan: 'Escaneaste tu primer producto alimenticio',
      additiveInspector: 'Inspector de aditivos',
      fiveDeepDives: 'Completaste 5 análisis detallados de ingredientes',
      greenEater: 'Comedor saludable',
      threeHealthy: 'Escaneaste 3 productos saludables de alta calidad (Puntuación 80+)',
      nutriPro: 'NutriScan Pro',
      tenScans: 'Registraste más de 10 escaneos en tu historial de salud',
      achievements: 'Logros desbloqueables',
      unlocked: 'Desbloqueado',
      healthy: 'Saludable',
      unhealthy: 'No saludable',
      signOut: 'Cerrar sesión',
      user: 'Usuario',
    },

    French: {
      healthExplorer: 'Explorateur de santé',
      firstScan: 'Vous avez scanné votre premier produit alimentaire',
      additiveInspector: 'Inspecteur des additifs',
      fiveDeepDives: 'Vous avez effectué 5 analyses détaillées des ingrédients',
      greenEater: 'Mangeur sain',
      threeHealthy: 'Vous avez scanné 3 produits sains de haute qualité (Score 80+)',
      nutriPro: 'NutriScan Pro',
      tenScans: 'Plus de 10 scans enregistrés dans votre historique de santé',
      achievements: 'Succès à débloquer',
      unlocked: 'Débloqué',
      healthy: 'Sain',
      unhealthy: 'Malsain',
      signOut: 'Se déconnecter',
      user: 'Utilisateur',
    },

    German: {
      healthExplorer: 'Gesundheits-Entdecker',
      firstScan: 'Erstes Lebensmittelprodukt gescannt',
      additiveInspector: 'Zusatzstoff-Inspektor',
      fiveDeepDives: '5 detaillierte Zutatenanalysen abgeschlossen',
      greenEater: 'Gesunder Esser',
      threeHealthy: '3 hochwertige gesunde Produkte gescannt (Wert 80+)',
      nutriPro: 'NutriScan Pro',
      tenScans: 'Mehr als 10 Scans im persönlichen Gesundheitsverlauf gespeichert',
      achievements: 'Freischaltbare Erfolge',
      unlocked: 'Freigeschaltet',
      healthy: 'Gesund',
      unhealthy: 'Ungesund',
      signOut: 'Abmelden',
      user: 'Benutzer',
    },

    Hindi: {
      healthExplorer: 'स्वास्थ्य खोजकर्ता',
      firstScan: 'अपना पहला खाद्य उत्पाद स्कैन किया',
      additiveInspector: 'एडिटिव निरीक्षक',
      fiveDeepDives: '5 सामग्री का विस्तृत विश्लेषण पूरा किया',
      greenEater: 'स्वस्थ भोजनकर्ता',
      threeHealthy: '3 उच्च-ग्रेड स्वस्थ उत्पाद स्कैन किए (स्कोर 80+)',
      nutriPro: 'NutriScan Pro',
      tenScans: 'अपने स्वास्थ्य इतिहास में 10 से अधिक स्कैन दर्ज किए',
      achievements: 'अनलॉक किए जा सकने वाले उपलब्धियाँ',
      unlocked: 'अनलॉक',
      healthy: 'स्वस्थ',
      unhealthy: 'अस्वस्थ',
      signOut: 'साइन आउट',
      user: 'उपयोगकर्ता',
    },

    Arabic: {
      healthExplorer: 'مستكشف الصحة',
      firstScan: 'قمت بمسح أول منتج غذائي لك',
      additiveInspector: 'مفتش الإضافات',
      fiveDeepDives: 'أكملت 5 تحليلات تفصيلية للمكونات',
      greenEater: 'آكل صحي',
      threeHealthy: 'قمت بمسح 3 منتجات صحية عالية الجودة (الدرجة 80+)',
      nutriPro: 'NutriScan Pro',
      tenScans: 'سجلت أكثر من 10 عمليات مسح في سجل صحتك',
      achievements: 'الإنجازات القابلة للفتح',
      unlocked: 'تم الفتح',
      healthy: 'صحي',
      unhealthy: 'غير صحي',
      signOut: 'تسجيل الخروج',
      user: 'المستخدم',
    },
  };

  const text =
    profileTranslations[language] ||
    profileTranslations.English;

  const achievements = [
    {
      id: 'first_scan',
      title: text.healthExplorer,
      description: text.firstScan,
      unlocked: (userProfile?.totalScans || 0) >= 1,
      icon: Sparkles,
    },
    {
      id: 'additive_detector',
      title: text.additiveInspector,
      description: text.fiveDeepDives,
      unlocked: (userProfile?.totalScans || 0) >= 5,
      icon: ShieldCheck,
    },
    {
      id: 'green_eater',
      title: text.greenEater,
      description: text.threeHealthy,
      unlocked: (userProfile?.healthyScansCount || 0) >= 3,
      icon: CheckCircle2,
    },
    {
      id: 'pro_scanner',
      title: text.nutriPro,
      description: text.tenScans,
      unlocked: (userProfile?.totalScans || 0) >= 10,
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 transition-colors">

      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800/80 p-6 transition-colors">
        <div className="max-w-md mx-auto flex items-center gap-4">

          {/* Profile Image */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl flex-shrink-0">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || text.user}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center font-black text-emerald-500 dark:text-emerald-400 text-xl font-['Outfit']">
                {(userProfile?.displayName || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="space-y-0.5">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              {userProfile?.displayName || text.user}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userProfile?.email || t('dataUnavailable')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-2.5">

          {/* Total Scans */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-center space-y-1 transition-colors">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('totalScans')}
            </span>

            <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              {userProfile?.totalScans || 0}
            </span>
          </div>

          {/* Healthy */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-center space-y-1 transition-colors">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">
              {text.healthy}
            </span>

            <span className="text-xl font-black text-emerald-500 font-['Outfit']">
              {userProfile?.healthyScansCount || 0}
            </span>
          </div>

          {/* Unhealthy */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-center space-y-1 transition-colors">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
              {text.unhealthy}
            </span>

            <span className="text-xl font-black text-rose-500 font-['Outfit']">
              {userProfile?.unhealthyScansCount || 0}
            </span>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-3 transition-colors">

          <div className="flex items-center justify-between">

            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />

              {text.achievements}
            </h3>

            <span className="text-xs font-mono text-emerald-500 dark:text-emerald-400">
              {achievements.filter((a) => a.unlocked).length} /{' '}
              {achievements.length}
            </span>
          </div>

          <div className="space-y-2">

            {achievements.map((achievement) => {
              const Icon = achievement.icon;

              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    achievement.unlocked
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      achievement.unlocked
                        ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      {achievement.title}

                      {achievement.unlocked && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                          {text.unlocked}
                        </span>
                      )}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={logout}
          className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-500/40 text-rose-500 dark:text-rose-400 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {text.signOut}
        </button>

      </div>
    </div>
  );
};