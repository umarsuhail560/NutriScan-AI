import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FoodScan } from '../types';
import { HealthScoreGauge } from '../components/HealthScoreGauge';
import { NutritionPieChart } from '../components/NutritionPieChart';
import { SuitabilityGrid } from '../components/SuitabilityGrid';
import { toggleFavoriteScan } from '../services/scanService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Heart,
  Share2,
  Scan,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  ArrowLeft,
  Apple,
  Zap,
} from 'lucide-react';

interface ResultPageProps {
  scan: FoodScan | null;
  onBack: () => void;
}

/*
 * ResultPage-specific translations for labels that are not yet
 * present in ThemeContext.
 */
const resultLabels = {
  English: {
    noScanSelected: 'No scan selected',
    scanFoodOrHistory: 'Scan a food product or open a result from your history.',
    scanProductNow: 'Scan Product Now',
    aiHealthResult: 'AI Health Result',
    share: 'Share',
    summaryCopied: 'Summary copied',
    foodProduct: 'Food Product',
    serving: 'Serving',
    nutritionFacts: 'Nutrition Facts',
    per: 'per',
    macronutrientBreakdown: 'Macronutrient Breakdown',
    ingredientsAdditiveAnalysis: 'Ingredients & Additive Analysis',
    additive: 'Additive',
    color: 'Color',
    sweetener: 'Sweetener',
    allergen: 'Allergen',
    fullIngredientsList: 'Full Ingredients List',
    ingredientsNotParsed: 'Ingredients could not be parsed.',
    positivesGoodPoints: 'Good Points',
    drawbacksBadPoints: 'Drawbacks',
    warningsPrecautions: 'Warnings & Precautions',
    dailyConsumptionAdvice: 'Daily Consumption Advice',
    healthierAlternatives: 'Healthier Alternatives',
    scanAnotherProduct: 'Scan Another Product',
  },

  Spanish: {
    noScanSelected: 'No se ha seleccionado ningún escaneo',
    scanFoodOrHistory:
      'Escanea un producto alimenticio o abre un resultado de tu historial.',
    scanProductNow: 'Escanear producto ahora',
    aiHealthResult: 'Resultado de salud de IA',
    share: 'Compartir',
    summaryCopied: 'Resumen copiado',
    foodProduct: 'Producto alimenticio',
    serving: 'Porción',
    nutritionFacts: 'Información nutricional',
    per: 'por',
    macronutrientBreakdown: 'Desglose de macronutrientes',
    ingredientsAdditiveAnalysis:
      'Análisis de ingredientes y aditivos',
    additive: 'Aditivo',
    color: 'Color',
    sweetener: 'Edulcorante',
    allergen: 'Alérgeno',
    fullIngredientsList: 'Lista completa de ingredientes',
    ingredientsNotParsed: 'No se pudieron analizar los ingredientes.',
    positivesGoodPoints: 'Puntos positivos',
    drawbacksBadPoints: 'Desventajas',
    warningsPrecautions: 'Advertencias y precauciones',
    dailyConsumptionAdvice: 'Consejo de consumo diario',
    healthierAlternatives: 'Alternativas más saludables',
    scanAnotherProduct: 'Escanear otro producto',
  },

  French: {
    noScanSelected: 'Aucun scan sélectionné',
    scanFoodOrHistory:
      'Scannez un produit alimentaire ou ouvrez un résultat de votre historique.',
    scanProductNow: 'Scanner le produit maintenant',
    aiHealthResult: 'Résultat santé IA',
    share: 'Partager',
    summaryCopied: 'Résumé copié',
    foodProduct: 'Produit alimentaire',
    serving: 'Portion',
    nutritionFacts: 'Informations nutritionnelles',
    per: 'par',
    macronutrientBreakdown: 'Répartition des macronutriments',
    ingredientsAdditiveAnalysis:
      'Analyse des ingrédients et additifs',
    additive: 'Additif',
    color: 'Colorant',
    sweetener: 'Édulcorant',
    allergen: 'Allergène',
    fullIngredientsList: 'Liste complète des ingrédients',
    ingredientsNotParsed:
      'Les ingrédients n’ont pas pu être analysés.',
    positivesGoodPoints: 'Points positifs',
    drawbacksBadPoints: 'Inconvénients',
    warningsPrecautions: 'Avertissements et précautions',
    dailyConsumptionAdvice: 'Conseil de consommation quotidienne',
    healthierAlternatives: 'Alternatives plus saines',
    scanAnotherProduct: 'Scanner un autre produit',
  },

  German: {
    noScanSelected: 'Kein Scan ausgewählt',
    scanFoodOrHistory:
      'Scanne ein Lebensmittelprodukt oder öffne ein Ergebnis aus deinem Verlauf.',
    scanProductNow: 'Produkt jetzt scannen',
    aiHealthResult: 'KI-Gesundheitsergebnis',
    share: 'Teilen',
    summaryCopied: 'Zusammenfassung kopiert',
    foodProduct: 'Lebensmittel',
    serving: 'Portion',
    nutritionFacts: 'Nährwertangaben',
    per: 'pro',
    macronutrientBreakdown: 'Makronährstoffaufteilung',
    ingredientsAdditiveAnalysis:
      'Analyse von Zutaten und Zusatzstoffen',
    additive: 'Zusatzstoff',
    color: 'Farbstoff',
    sweetener: 'Süßstoff',
    allergen: 'Allergen',
    fullIngredientsList: 'Vollständige Zutatenliste',
    ingredientsNotParsed:
      'Zutaten konnten nicht analysiert werden.',
    positivesGoodPoints: 'Positive Punkte',
    drawbacksBadPoints: 'Nachteile',
    warningsPrecautions: 'Warnungen und Vorsichtsmaßnahmen',
    dailyConsumptionAdvice: 'Tägliche Verzehrhinweise',
    healthierAlternatives: 'Gesündere Alternativen',
    scanAnotherProduct: 'Anderes Produkt scannen',
  },

  Hindi: {
    noScanSelected: 'कोई स्कैन चयनित नहीं है',
    scanFoodOrHistory:
      'किसी खाद्य उत्पाद को स्कैन करें या इतिहास से परिणाम खोलें।',
    scanProductNow: 'अभी उत्पाद स्कैन करें',
    aiHealthResult: 'AI स्वास्थ्य परिणाम',
    share: 'साझा करें',
    summaryCopied: 'सारांश कॉपी किया गया',
    foodProduct: 'खाद्य उत्पाद',
    serving: 'सर्विंग',
    nutritionFacts: 'पोषण संबंधी जानकारी',
    per: 'प्रति',
    macronutrientBreakdown: 'मैक्रोन्यूट्रिएंट विवरण',
    ingredientsAdditiveAnalysis:
      'सामग्री और एडिटिव विश्लेषण',
    additive: 'एडिटिव',
    color: 'रंग',
    sweetener: 'स्वीटनर',
    allergen: 'एलर्जेन',
    fullIngredientsList: 'पूरी सामग्री सूची',
    ingredientsNotParsed: 'सामग्री का विश्लेषण नहीं किया जा सका।',
    positivesGoodPoints: 'अच्छी बातें',
    drawbacksBadPoints: 'कमियाँ',
    warningsPrecautions: 'चेतावनियाँ और सावधानियाँ',
    dailyConsumptionAdvice: 'दैनिक सेवन सलाह',
    healthierAlternatives: 'स्वास्थ्यवर्धक विकल्प',
    scanAnotherProduct: 'दूसरा उत्पाद स्कैन करें',
  },

  Arabic: {
    noScanSelected: 'لم يتم تحديد أي عملية مسح',
    scanFoodOrHistory:
      'امسح منتجًا غذائيًا أو افتح نتيجة من السجل.',
    scanProductNow: 'مسح المنتج الآن',
    aiHealthResult: 'نتيجة الصحة بالذكاء الاصطناعي',
    share: 'مشاركة',
    summaryCopied: 'تم نسخ الملخص',
    foodProduct: 'منتج غذائي',
    serving: 'الحصة',
    nutritionFacts: 'المعلومات الغذائية',
    per: 'لكل',
    macronutrientBreakdown: 'تفاصيل المغذيات الكبرى',
    ingredientsAdditiveAnalysis:
      'تحليل المكونات والإضافات',
    additive: 'مضاف',
    color: 'لون',
    sweetener: 'محلٍ',
    allergen: 'مسبب للحساسية',
    fullIngredientsList: 'قائمة المكونات الكاملة',
    ingredientsNotParsed: 'تعذر تحليل المكونات.',
    positivesGoodPoints: 'النقاط الإيجابية',
    drawbacksBadPoints: 'السلبيات',
    warningsPrecautions: 'التحذيرات والاحتياطات',
    dailyConsumptionAdvice: 'نصيحة الاستهلاك اليومي',
    healthierAlternatives: 'بدائل أكثر صحة',
    scanAnotherProduct: 'مسح منتج آخر',
  },
} as const;

export const ResultPage: React.FC<ResultPageProps> = ({
  scan,
  onBack,
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { t, language } = useTheme();

  const r = resultLabels[language];

  const [isFavorite, setIsFavorite] = useState<boolean>(
    scan?.isFavorite || false
  );

  const [expandIngredients, setExpandIngredients] =
    useState<boolean>(false);

  const [shareSuccess, setShareSuccess] =
    useState<boolean>(false);

  if (!scan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Scan className="w-16 h-16 text-slate-300 dark:text-slate-600 animate-pulse" />

        <h2 className="text-xl font-bold font-['Outfit']">
          {r.noScanSelected}
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {r.scanFoodOrHistory}
        </p>

        <button
          onClick={() => navigate('/scan')}
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
        >
          {r.scanProductNow}
        </button>
      </div>
    );
  }

  const handleFavoriteToggle = async () => {
    const nextState = !isFavorite;

    setIsFavorite(nextState);

    if (scan.id) {
      await toggleFavoriteScan(
        scan.id,
        nextState,
        userProfile?.uid || 'guest'
      );
    }
  };

  const handleShare = async () => {
    const shareText =
      `NutriScan AI: ${scan.productName} - ` +
      `Score: ${scan.healthScore}/100 ` +
      `Grade ${scan.grade}. ${scan.summary}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `NutriScan AI: ${scan.productName}`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing.
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);

        setShareSuccess(true);

        setTimeout(() => {
          setShareSuccess(false);
        }, 2500);
      } catch {
        // Clipboard unavailable.
      }
    }
  };

  const servingSize =
    scan.servingSize || t('dataUnavailable');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">

      {/* Top Header Controls */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">

        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={t('back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 font-['Outfit'] tracking-wide uppercase flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          {r.aiHealthResult}
        </span>

        <div className="flex items-center gap-2">

          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-rose-400'
            }`}
            title={
              isFavorite
                ? t('removeFavorite')
                : t('favorite')
            }
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-rose-500' : ''
              }`}
            />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={r.share}
          >
            <Share2 className="w-5 h-5" />
          </button>

        </div>
      </div>

      {shareSuccess && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl">
          {r.summaryCopied}
        </div>
      )}

      <div className="max-w-md mx-auto p-4 space-y-6">

        {/* Product Title Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xl flex items-center gap-4">

          {scan.imageUrl ? (
            <img
              src={scan.imageUrl}
              alt={scan.productName}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white flex-shrink-0">
              <Apple className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {scan.brand || r.foodProduct}
            </span>

            <h1 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] leading-snug line-clamp-2">
              {scan.productName}
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {r.serving}: {servingSize}
            </p>
          </div>
        </div>

        {/* Health Score */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center">

          <HealthScoreGauge
            score={scan.healthScore}
            grade={scan.grade}
            riskLevel={scan.riskLevel}
            size={190}
          />

          <div className="mt-5 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center">
            <span className="font-bold text-emerald-500 dark:text-emerald-400 block mb-1">
              {t('summary')}:
            </span>

            {scan.summary}
          </div>
        </div>

        {/* Nutrition Cards */}
        <div className="space-y-3">

          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            {r.nutritionFacts} ({r.per}{' '}
            {servingSize})
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center">

            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {t('calories')}
              </span>

              <span className="text-sm font-bold text-amber-500 dark:text-amber-300 font-['Outfit']">
                {scan.calories}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {t('protein')}
              </span>

              <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 font-['Outfit']">
                {scan.protein}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {t('sugar')}
              </span>

              <span className="text-sm font-bold text-rose-500 dark:text-rose-400 font-['Outfit']">
                {scan.sugar}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {t('fat')}
              </span>

              <span className="text-sm font-bold text-orange-500 dark:text-orange-400 font-['Outfit']">
                {scan.fat}
              </span>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-2 text-center">

            <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {t('salt')}
              </span>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {scan.salt}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {t('fiber')}
              </span>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {scan.fiber}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {t('carbohydrates')}
              </span>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {scan.carbohydrates}
              </span>
            </div>

          </div>
        </div>

        {/* Macro Donut Chart */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-2">

          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {r.macronutrientBreakdown}
          </h3>

          <NutritionPieChart
            protein={scan.protein}
            fat={scan.fat}
            carbs={scan.carbohydrates}
            sugar={scan.sugar}
          />
        </div>

        {/* Ingredients & Additives */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-3">

          <button
            onClick={() =>
              setExpandIngredients(!expandIngredients)
            }
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />

              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {r.ingredientsAdditiveAnalysis}
              </h3>
            </div>

            {expandIngredients ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Additive Quick Flags */}
          <div className="flex flex-wrap gap-1.5 pt-1">

            {scan.additives.map((add, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-300 border border-amber-500/20 text-[10px] font-medium"
              >
                {r.additive}: {add}
              </span>
            ))}

            {scan.artificialColors.map((col, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 dark:text-rose-300 border border-rose-500/20 text-[10px] font-medium"
              >
                {r.color}: {col}
              </span>
            ))}

            {scan.artificialSweeteners.map((sw, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-300 border border-orange-500/20 text-[10px] font-medium"
              >
                {r.sweetener}: {sw}
              </span>
            ))}

            {scan.allergens.map((alg, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 dark:text-purple-300 border border-purple-500/20 text-[10px] font-medium"
              >
                {r.allergen}: {alg}
              </span>
            ))}

          </div>

          {expandIngredients && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">

              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {r.fullIngredientsList}
              </p>

              <p className="leading-relaxed bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {scan.ingredients.length > 0
                  ? scan.ingredients.join(', ')
                  : r.ingredientsNotParsed}
              </p>

            </div>
          )}
        </div>

        {/* Suitability */}
        <SuitabilityGrid
          suitability={scan.suitability}
        />

        {/* Pros, Cons, Warnings & Advice */}
        <div className="space-y-3">

          {scan.goodPoints.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">

              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {r.positivesGoodPoints}
              </h4>

              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                {scan.goodPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>

            </div>
          )}

          {scan.badPoints.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/30 space-y-1.5">

              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                {r.drawbacksBadPoints}
              </h4>

              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                {scan.badPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>

            </div>
          )}

          {scan.warnings.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 space-y-1.5">

              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {r.warningsPrecautions}
              </h4>

              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                {scan.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>

            </div>
          )}

          {scan.dailyAdvice && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">

              <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                {r.dailyConsumptionAdvice}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {scan.dailyAdvice}
              </p>

            </div>
          )}

          {scan.alternatives.length > 0 && (
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">

              <h4 className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                {r.healthierAlternatives}
              </h4>

              <div className="space-y-2">

                {scan.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {alt.name}
                    </span>

                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {alt.reason}
                    </span>
                  </div>
                ))}

              </div>
            </div>
          )}

        </div>

        {/* Scan Another Product */}
        <button
          onClick={() => navigate('/scan')}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
        >
          <Scan className="w-4 h-4" />
          {r.scanAnotherProduct}
        </button>

      </div>
    </div>
  );
};