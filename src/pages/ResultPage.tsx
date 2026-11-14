import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FoodScan } from '../types';
import { HealthScoreGauge } from '../components/HealthScoreGauge';
import { NutritionPieChart } from '../components/NutritionPieChart';
import { SuitabilityGrid } from '../components/SuitabilityGrid';
import { toggleFavoriteScan, askProductQuestionWithAI } from '../services/scanService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AI_VOICES, useSpeech } from '../context/SpeechContext';
import { buildDailyReferences, evaluateDietaryMatches } from '../utils/nutritionUtils';
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
  Volume2,
  Square,
  Mic,
  Loader2,
  X,
  Check,
  Scale,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react';

interface ResultPageProps {
  scan: FoodScan | null;
  onBack: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ scan, onBack }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { t, language } = useTheme();
  const {
    selectedVoiceId,
    setSelectedVoiceId,
    speechRate,
    setSpeechRate,
    deviceVoices,
    isSpeaking,
    isLoadingAudio,
    speak,
    stop,
    buildScanNarration,
  } = useSpeech();

  const [isFavorite, setIsFavorite] = useState<boolean>(scan?.isFavorite || false);
  const [expandIngredients, setExpandIngredients] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);

  const [questionInput, setQuestionInput] = useState<string>('');
  const [qaList, setQaList] = useState<Array<{ q: string; a: string }>>([]);
  const [askingAI, setAskingAI] = useState<boolean>(false);
  const [qaError, setQaError] = useState<string | null>(null);

  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);

  useEffect(() => {
    setIsFavorite(scan?.isFavorite || false);
    setQaList([]);
    setQaError(null);
    stop();
    try {
      const saved = localStorage.getItem('nutriscan_dietary');
      setDietaryPrefs(saved ? JSON.parse(saved) : []);
    } catch {
      setDietaryPrefs([]);
    }
  }, [scan]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  if (!scan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Scan className="w-16 h-16 text-slate-400 dark:text-slate-600 animate-pulse" />
        <h2 className="text-xl font-bold font-['Outfit']">{t.noScanSelected}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t.noScanSelectedDesc}</p>
        <button
          onClick={() => navigate('/scan')}
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
        >
          {t.scanProductNow}
        </button>
      </div>
    );
  }

  const additives = scan.additives || [];
  const artificialColors = scan.artificialColors || [];
  const artificialSweeteners = scan.artificialSweeteners || [];
  const allergens = scan.allergens || [];
  const ingredients = scan.ingredients || [];
  const goodPoints = scan.goodPoints || [];
  const badPoints = scan.badPoints || [];
  const warnings = scan.warnings || [];
  const alternatives = scan.alternatives || [];

  const dailyRefs = buildDailyReferences(scan, t);
  const dietaryMatches = evaluateDietaryMatches(scan, dietaryPrefs, t);

  const handleReadToggle = async () => {
    if (isSpeaking || isLoadingAudio) {
      stop();
      return;
    }
    const narration = buildScanNarration(scan, language, t);
    await speak(narration, language);
  };

  const handleAskQuestion = async (customQuestion?: string) => {
    const q = (customQuestion ?? questionInput).trim();
    if (!q || askingAI) return;
    setAskingAI(true);
    setQaError(null);
    try {
      const answer = await askProductQuestionWithAI(scan, q);
      setQaList((prev) => [{ q, a: answer }, ...prev]);
      if (!customQuestion) setQuestionInput('');
    } catch (err: any) {
      setQaError(err?.message || 'Unable to answer right now');
    } finally {
      setAskingAI(false);
    }
  };

  const handleFavoriteToggle = async () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (scan.id) {
      await toggleFavoriteScan(scan.id, nextState, userProfile?.uid || 'guest');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NutriScan AI: ${scan.productName}`,
          text: `${t.score}: ${scan.healthScore}/100 (${scan.grade}) - ${scan.summary}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(
        `NutriScan AI: ${scan.productName} - ${t.score}: ${scan.healthScore}/100 ${t.grade} ${scan.grade}. ${scan.summary}`
      );
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const speedOptions = [
    { value: 0.8, label: t.speedSlow },
    { value: 1.0, label: t.speedNormal },
    { value: 1.15, label: t.speedFast },
  ];

  const activeVoiceLabel = selectedVoiceId.startsWith('ai:')
    ? AI_VOICES.find((v) => v.id === selectedVoiceId)?.name || 'Kore'
    : deviceVoices.find((v) => `browser:${v.voiceURI}` === selectedVoiceId)?.name || 'Device';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-10 transition-colors">
      {/* Top Header Controls */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              stop();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit'] tracking-wide uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> {t.aiHealthResult}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-xl transition-all ${
                isFavorite
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/40'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {shareSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl">
          {t.summaryCopied}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sticky Column: Product Header, Read Aloud, Gauge & Macro Pie */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-32">
            {/* Product Title Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-md flex items-center gap-4">
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
                  {scan.brand || t.foodItem}
                </span>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-['Outfit'] leading-snug line-clamp-2">
                  {scan.productName}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {t.serving}: {scan.servingSize || '100g'}
                </p>
              </div>
            </div>

            {/* Senior-Friendly Read Result & Change Voice Bar */}
            <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-md flex items-center gap-2.5">
              <button
                onClick={handleReadToggle}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                  isSpeaking || isLoadingAudio
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white'
                }`}
              >
                {isLoadingAudio ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.readingResult}</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <Square className="w-4 h-4 fill-white" />
                    <span>{t.stopReading}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>{t.readResult}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowVoiceModal(true)}
                className="py-3 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
                title={t.changeVoice}
              >
                <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.changeVoice}</span>
              </button>
            </div>

            {/* Circular Score Gauge */}
            <div className="p-6 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center">
              <HealthScoreGauge
                score={scan.healthScore}
                grade={scan.grade}
                riskLevel={scan.riskLevel}
                size={190}
              />

              <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-center w-full">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">{t.aiVerdict}</span>
                {scan.summary}
              </div>
            </div>

            {/* Macro Donut Chart */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.macronutrientBreakdown}</h3>
              <NutritionPieChart
                protein={scan.protein}
                fat={scan.fat}
                carbs={scan.carbohydrates}
                sugar={scan.sugar}
              />
            </div>
          </div>

          {/* Right Column: Nutrition Facts, Ingredients, Suitability & Advice */}
          <div className="lg:col-span-7 space-y-6">
            {/* Nutrition Cards Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" /> {t.nutritionFacts} ({t.per} {scan.servingSize || '100g'})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.calories}</span>
                  <span className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-300 font-['Outfit']">{scan.calories}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.protein}</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit']">{scan.protein}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.sugar}</span>
                  <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 font-['Outfit']">{scan.sugar}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.fat}</span>
                  <span className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400 font-['Outfit']">{scan.fat}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.salt}</span>
                  <span className="text-xs sm:text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">{scan.salt}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.fiber}</span>
                  <span className="text-xs sm:text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">{scan.fiber}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.carbs}</span>
                  <span className="text-xs sm:text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">{scan.carbohydrates}</span>
                </div>
              </div>

              {/* Daily Reference Progress Bars */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {t.dailyGuidelineTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.dailyGuidelineSub}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                  {dailyRefs.map((item) => (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className="tabular-nums text-slate-600 dark:text-slate-400">
                          <strong className="text-slate-900 dark:text-white">{item.rawValue}</strong>{' '}
                          <span className={`font-semibold ${item.textColor}`}>· {item.percent}%</span>{' '}
                          <span className="text-[10px] text-slate-400">({item.statusText})</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                          style={{ width: `${Math.max(4, item.percent)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personal Dietary Match Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t.dietaryMatchTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {t.configurePrefs}
                </button>
              </div>

              {dietaryMatches.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.noDietaryPrefsSet}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dietaryMatches.map((m) => (
                    <div
                      key={m.key}
                      className={`px-3 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        m.compatible
                          ? 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      <span>{m.label}</span>
                      <span className="flex items-center gap-1 font-bold">
                        {m.compatible ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> {t.dietaryCompatible}
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" /> {t.dietaryCaution}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expandable Ingredients & Additive Deep Dive */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <button
                onClick={() => setExpandIngredients(!expandIngredients)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t.ingredientsAdditiveAnalysis}
                  </h3>
                </div>
                {expandIngredients ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                )}
              </button>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {additives.map((add, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[10px] font-medium">
                    {t.additiveLabel}: {add}
                  </span>
                ))}
                {artificialColors.map((col, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25 text-[10px] font-medium">
                    {t.colorLabel}: {col}
                  </span>
                ))}
                {artificialSweeteners.map((sw, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/25 text-[10px] font-medium">
                    {t.sweetenerLabel}: {sw}
                  </span>
                ))}
                {allergens.map((alg, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 text-[10px] font-medium">
                    {t.allergenLabel}: {alg}
                  </span>
                ))}
              </div>

              {expandIngredients && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{t.fullIngredientsList}</p>
                  <p className="leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {ingredients.length > 0 ? ingredients.join(', ') : t.ingredientsNotParsed}
                  </p>
                </div>
              )}
            </div>

            {/* Suitability Grid */}
            <SuitabilityGrid suitability={scan.suitability} />

            {/* Pros, Cons, Warnings & Advice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goodPoints.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {t.positivesGoodPoints}
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-1">
                    {goodPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {badPoints.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-1.5">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> {t.drawbacksBadPoints}
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-1">
                    {badPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> {t.warningsPrecautions}
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-1">
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {scan.dailyAdvice && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                  <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> {t.dailyConsumptionAdvice}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{scan.dailyAdvice}</p>
                </div>
              )}
            </div>

            {alternatives.length > 0 && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-4 h-4" /> {t.healthierAlternatives}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {alternatives.map((alt, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">{alt.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{alt.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ask Nutritionist AI Interactive Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm space-y-3.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t.askNutritionist}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.askNutritionistDesc}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[t.quickQKids, t.quickQWeight, t.quickQSwap, t.quickQTime].map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={askingAI}
                    onClick={() => void handleAskQuestion(q)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleAskQuestion();
                  }}
                  placeholder={t.askPlaceholder}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  disabled={!questionInput.trim() || askingAI}
                  onClick={() => void handleAskQuestion()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  {askingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{askingAI ? t.thinkingAnswer : t.sendQuestion}</span>
                </button>
              </div>

              {qaError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{qaError}</p>
              )}

              {qaList.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  {qaList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {item.q}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSpeaking) stop();
                            else void speak(item.a, language);
                          }}
                          className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 flex-shrink-0"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.listenAnswer}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate('/compare', { state: { productA: scan } })}
                className="w-full py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t.compareThisProduct}
              </button>

              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                <Scan className="w-4 h-4" /> {t.scanAnotherProduct}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Voice & Speed Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 dark:bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-slate-900 dark:text-white space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-['Outfit'] flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t.changeVoice}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeVoiceLabel}
                </p>
              </div>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reading Speed */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                {t.readingSpeed}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {speedOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSpeechRate(opt.value)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      speechRate === opt.value
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Natural AI Voices */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                {t.aiVoicesGroup}
              </label>
              <div className="space-y-1.5">
                {AI_VOICES.map((v) => {
                  const selected = selectedVoiceId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoiceId(v.id)}
                      className={`w-full p-2.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        selected
                          ? 'bg-emerald-600/15 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span>{v.label}</span>
                      {selected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Device / Browser Voices */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                {t.deviceVoicesGroup}
              </label>
              {deviceVoices.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                  {t.voiceLoadHint}
                </p>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {deviceVoices.map((dv) => {
                    const id = `browser:${dv.voiceURI}`;
                    const selected = selectedVoiceId === id;
                    return (
                      <button
                        key={dv.voiceURI}
                        onClick={() => setSelectedVoiceId(id)}
                        className={`w-full p-2.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          selected
                            ? 'bg-emerald-600/15 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="truncate pr-2">
                          {dv.name} ({dv.lang})
                        </span>
                        {selected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  if (isSpeaking || isLoadingAudio) {
                    stop();
                  } else {
                    void speak(t.sampleTestSentence, language);
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                {isSpeaking || isLoadingAudio ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{t.stopReading}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.testVoice}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                {t.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
