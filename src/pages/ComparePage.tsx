import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSpeech } from '../context/SpeechContext';
import { FoodScan } from '../types';
import {
  analyzeBarcodeWithAI,
  compareProductsWithAI,
  fetchUserScans,
  ProductComparisonResult,
  saveScanToFirestore,
} from '../services/scanService';
import { parseCalories, parseNutrientGrams } from '../utils/nutritionUtils';
import { translateRiskLevel } from '../i18n/translations';
import {
  ArrowLeftRight,
  Barcode,
  CheckCircle2,
  Loader2,
  Scale,
  Sparkles,
  Trophy,
  Volume2,
  Square,
  Apple,
  Scan,
} from 'lucide-react';

interface ComparePageProps {
  onSelectScan?: (scan: FoodScan) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onSelectScan }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const { t, language } = useTheme();
  const { speak, stop, isSpeaking, isLoadingAudio } = useSpeech();

  const initialProductA = (location.state as { productA?: FoodScan } | null)?.productA || null;

  const [historyScans, setHistoryScans] = useState<FoodScan[]>([]);
  const [productA, setProductA] = useState<FoodScan | null>(initialProductA);
  const [productB, setProductB] = useState<FoodScan | null>(null);

  const [barcodeInputA, setBarcodeInputA] = useState('');
  const [barcodeInputB, setBarcodeInputB] = useState('');
  const [loadingSide, setLoadingSide] = useState<'A' | 'B' | null>(null);

  const [comparing, setComparing] = useState(false);
  const [aiResult, setAiResult] = useState<ProductComparisonResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchUserScans(userProfile?.uid || 'guest')
      .then((list) => {
        if (!active) return;
        setHistoryScans(list);
        if (!initialProductA && list.length >= 1 && !productA) {
          setProductA(list[0]);
        }
        if (list.length >= 2 && !productB) {
          const second = list.find((s) => s.id !== (initialProductA?.id || list[0]?.id));
          if (second) setProductB(second);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
      stop();
    };
  }, [userProfile?.uid]);

  useEffect(() => {
    setAiResult(null);
    setErrorMsg(null);
  }, [productA?.id, productB?.id, productA?.productName, productB?.productName]);

  const handleLoadBarcode = async (side: 'A' | 'B') => {
    const code = (side === 'A' ? barcodeInputA : barcodeInputB).trim();
    if (!code) return;
    setLoadingSide(side);
    setErrorMsg(null);
    try {
      const res = await analyzeBarcodeWithAI(code);
      if (res.found && res.data) {
        const aiData = res.data;
        const payload: Omit<FoodScan, 'id'> = {
          userId: userProfile?.uid || 'guest',
          productName: aiData.productName || `Barcode ${code}`,
          brand: aiData.brand || 'Unknown Brand',
          barcode: aiData.barcode || code,
          healthScore: aiData.healthScore ?? 65,
          grade: aiData.grade || 'B',
          riskLevel: aiData.riskLevel || 'Healthy',
          calories: aiData.calories || 'N/A',
          protein: aiData.protein || 'N/A',
          fat: aiData.fat || 'N/A',
          sugar: aiData.sugar || 'N/A',
          salt: aiData.salt || 'N/A',
          fiber: aiData.fiber || 'N/A',
          carbohydrates: aiData.carbohydrates || 'N/A',
          servingSize: aiData.servingSize || '100g',
          ingredients: aiData.ingredients || [],
          artificialColors: aiData.artificialColors || [],
          preservatives: aiData.preservatives || [],
          artificialSweeteners: aiData.artificialSweeteners || [],
          additives: aiData.additives || [],
          allergens: aiData.allergens || [],
          suitability: aiData.suitability || {
            forChildren: true,
            childrenNotes: '',
            forDiabetics: false,
            diabeticNotes: '',
            forPregnant: true,
            pregnantNotes: '',
            forElderly: true,
            elderlyNotes: '',
            forGym: true,
            gymNotes: '',
          },
          goodPoints: aiData.goodPoints || [],
          badPoints: aiData.badPoints || [],
          warnings: aiData.warnings || [],
          benefits: aiData.benefits || [],
          dailyAdvice: aiData.dailyAdvice || '',
          alternatives: aiData.alternatives || [],
          summary: aiData.summary || 'Nutritional analysis complete.',
          imageUrl: aiData.imageUrl || undefined,
          createdAt: new Date().toISOString(),
          isFavorite: false,
        };
        const saved = await saveScanToFirestore(payload, userProfile?.uid || 'guest');
        setHistoryScans((prev) => [saved, ...prev]);
        if (side === 'A') {
          setProductA(saved);
          setBarcodeInputA('');
        } else {
          setProductB(saved);
          setBarcodeInputB('');
        }
      } else {
        setErrorMsg(res.message || t.barcodeUnavailableMsg);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t.barcodeFailedMsg);
    } finally {
      setLoadingSide(null);
    }
  };

  const handleSwap = () => {
    const prevA = productA;
    setProductA(productB);
    setProductB(prevA);
  };

  const handleRunComparison = async () => {
    if (!productA || !productB) return;
    setComparing(true);
    setErrorMsg(null);
    try {
      const result = await compareProductsWithAI(productA, productB);
      setAiResult(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  const handleSpeakVerdict = () => {
    if (!aiResult) return;
    if (isSpeaking || isLoadingAudio) {
      stop();
      return;
    }
    const text = [aiResult.headline, aiResult.verdict, aiResult.recommendation].filter(Boolean).join('. ');
    void speak(text, language);
  };

  const metricRows = useMemo(() => {
    if (!productA || !productB) return [];
    const calA = parseCalories(productA.calories);
    const calB = parseCalories(productB.calories);
    const sugA = parseNutrientGrams(productA.sugar);
    const sugB = parseNutrientGrams(productB.sugar);
    const proA = parseNutrientGrams(productA.protein);
    const proB = parseNutrientGrams(productB.protein);
    const fatA = parseNutrientGrams(productA.fat);
    const fatB = parseNutrientGrams(productB.fat);
    const saltA = parseNutrientGrams(productA.salt);
    const saltB = parseNutrientGrams(productB.salt);
    const fibA = parseNutrientGrams(productA.fiber);
    const fibB = parseNutrientGrams(productB.fiber);

    return [
      {
        label: t.score,
        valA: `${productA.healthScore}/100`,
        valB: `${productB.healthScore}/100`,
        numA: productA.healthScore,
        numB: productB.healthScore,
        higherIsBetter: true,
      },
      {
        label: t.calories,
        valA: productA.calories,
        valB: productB.calories,
        numA: calA,
        numB: calB,
        higherIsBetter: false,
      },
      {
        label: t.sugar,
        valA: productA.sugar,
        valB: productB.sugar,
        numA: sugA,
        numB: sugB,
        higherIsBetter: false,
      },
      {
        label: t.protein,
        valA: productA.protein,
        valB: productB.protein,
        numA: proA,
        numB: proB,
        higherIsBetter: true,
      },
      {
        label: t.fat,
        valA: productA.fat,
        valB: productB.fat,
        numA: fatA,
        numB: fatB,
        higherIsBetter: false,
      },
      {
        label: t.salt,
        valA: productA.salt,
        valB: productB.salt,
        numA: saltA,
        numB: saltB,
        higherIsBetter: false,
      },
      {
        label: t.fiber,
        valA: productA.fiber,
        valB: productB.fiber,
        numA: fibA,
        numB: fibB,
        higherIsBetter: true,
      },
      {
        label: t.additiveLabel,
        valA: String((productA.additives || []).length),
        valB: String((productB.additives || []).length),
        numA: (productA.additives || []).length,
        numB: (productB.additives || []).length,
        higherIsBetter: false,
      },
    ];
  }, [productA, productB, t]);

  const renderSelectorCard = (
    side: 'A' | 'B',
    selected: FoodScan | null,
    onSelect: (scan: FoodScan | null) => void,
    barcodeVal: string,
    setBarcodeVal: (v: string) => void
  ) => {
    const isWinner =
      aiResult &&
      ((side === 'A' && aiResult.winner === 'A') || (side === 'B' && aiResult.winner === 'B'));

    return (
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-3.5 ${
          isWinner
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {side === 'A' ? t.productA : t.productB}
          </span>
          {isWinner && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-3.5 h-3.5" /> {t.winner}
            </span>
          )}
        </div>

        {/* History Dropdown Selector */}
        <select
          value={selected?.id || ''}
          onChange={(e) => {
            const found = historyScans.find((s) => s.id === e.target.value) || null;
            onSelect(found);
          }}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">{t.selectFromHistory}</option>
          {historyScans.map((item) => (
            <option key={item.id || item.productName} value={item.id || ''}>
              {item.productName} ({item.healthScore}/100 · {item.grade})
            </option>
          ))}
        </select>

        {/* Direct Barcode Loader */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              inputMode="numeric"
              value={barcodeVal}
              onChange={(e) => setBarcodeVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleLoadBarcode(side);
              }}
              placeholder={t.enterBarcodePrompt}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="button"
            disabled={!barcodeVal.trim() || loadingSide === side}
            onClick={() => void handleLoadBarcode(side)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            {loadingSide === side ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t.lookupBarcode}
          </button>
        </div>

        {/* Selected Product Preview */}
        {selected && (
          <div
            onClick={() => onSelectScan?.(selected)}
            className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 cursor-pointer group"
          >
            {selected.imageUrl ? (
              <img
                src={selected.imageUrl}
                alt={selected.productName}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Apple className="w-7 h-7" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {selected.brand || t.foodItem}
              </p>
              <h3 className="text-sm font-bold font-['Outfit'] text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {selected.productName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 tabular-nums mt-0.5">
                {selected.healthScore}/100 · {t.grade} {selected.grade} · {translateRiskLevel(selected.riskLevel, t)}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 dark:text-white flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              {t.compareTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.compareSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSwap}
              disabled={!productA && !productB}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.swapProducts}</span>
            </button>

            <button
              type="button"
              disabled={!productA || !productB || comparing}
              onClick={() => void handleRunComparison()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              {comparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.analyzingComparison}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.compareWithAI}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Dual Product Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {renderSelectorCard('A', productA, setProductA, barcodeInputA, setBarcodeInputA)}
          {renderSelectorCard('B', productB, setProductB, barcodeInputB, setBarcodeInputB)}
        </div>

        {/* AI Nutritionist Verdict */}
        {aiResult && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/70 dark:from-emerald-950/35 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    {aiResult.winner === 'Tie' ? t.tieResult : t.winner}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
                    {aiResult.headline}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSpeakVerdict}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSpeaking || isLoadingAudio
                    ? 'bg-rose-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-slate-800'
                }`}
              >
                {isLoadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSpeaking ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span>{isSpeaking ? t.stopReading : t.readComparison}</span>
              </button>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {aiResult.verdict}
            </p>

            {aiResult.keyDifferences && aiResult.keyDifferences.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-emerald-200/70 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t.keyDifferences}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {aiResult.keyDifferences.map((diff, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {aiResult.recommendation && (
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-emerald-200/70 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t.nutritionRecommendation}
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {aiResult.recommendation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Side-by-Side Metric Table */}
        {productA && productB ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="grid grid-cols-12 px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">{t.nutritionFacts}</div>
              <div className="col-span-4 text-center truncate px-2">{productA.productName}</div>
              <div className="col-span-4 text-center truncate px-2">{productB.productName}</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {metricRows.map((row) => {
                const diff = row.numA - row.numB;
                const aWins = diff !== 0 && (row.higherIsBetter ? row.numA > row.numB : row.numA < row.numB);
                const bWins = diff !== 0 && (row.higherIsBetter ? row.numB > row.numA : row.numB < row.numA);

                return (
                  <div key={row.label} className="grid grid-cols-12 items-center px-4 sm:px-6 py-3.5 text-xs sm:text-sm">
                    <div className="col-span-4 font-semibold text-slate-700 dark:text-slate-300">
                      {row.label}
                    </div>
                    <div
                      className={`col-span-4 text-center tabular-nums font-bold ${
                        aWins
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {row.valA}
                    </div>
                    <div
                      className={`col-span-4 text-center tabular-nums font-bold ${
                        bWins
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {row.valB}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Scale className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t.compareEmptyHint}
            </p>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Scan className="w-4 h-4" />
              <span>{t.startFirstScan}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
