import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FoodScan } from '../types';
import { HealthScoreGauge } from '../components/HealthScoreGauge';
import { NutritionPieChart } from '../components/NutritionPieChart';
import { SuitabilityGrid } from '../components/SuitabilityGrid';
import { toggleFavoriteScan } from '../services/scanService';
import { useAuth } from '../context/AuthContext';
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

export const ResultPage: React.FC<ResultPageProps> = ({ scan, onBack }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(scan?.isFavorite || false);
  const [expandIngredients, setExpandIngredients] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  if (!scan) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Scan className="w-16 h-16 text-slate-600 animate-pulse" />
        <h2 className="text-xl font-bold font-['Outfit']">No Scan Selected</h2>
        <p className="text-xs text-slate-400">Scan a food product or select one from history.</p>
        <button
          onClick={() => navigate('/scan')}
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
        >
          Scan Product Now
        </button>
      </div>
    );
  }

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
          text: `Health Score: ${scan.healthScore}/100 (${scan.grade}) - ${scan.summary}`,
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(
        `NutriScan AI: ${scan.productName} - Score: ${scan.healthScore}/100 Grade ${scan.grade}. ${scan.summary}`
      );
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Top Header Controls */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-emerald-400 font-['Outfit'] tracking-wide uppercase flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> AI Health Result
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {shareSuccess && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl">
          Summary copied to clipboard!
        </div>
      )}

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Product Title Card */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 shadow-xl flex items-center gap-4">
          {scan.imageUrl ? (
            <img
              src={scan.imageUrl}
              alt={scan.productName}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-800 bg-slate-950 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white flex-shrink-0">
              <Apple className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {scan.brand || 'Food Product'}
            </span>
            <h1 className="text-base font-extrabold text-white font-['Outfit'] leading-snug line-clamp-2">
              {scan.productName}
            </h1>
            <p className="text-xs text-slate-400 font-mono">Serving: {scan.servingSize || '100g'}</p>
          </div>
        </div>

        {/* Circular Score Gauge */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col items-center">
          <HealthScoreGauge
            score={scan.healthScore}
            grade={scan.grade}
            riskLevel={scan.riskLevel}
            size={190}
          />

          {/* Plain-English Summary */}
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed text-center">
            <span className="font-bold text-emerald-400 block mb-1">AI Verdict:</span>
            {scan.summary}
          </div>
        </div>

        {/* Nutrition Cards Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" /> Nutrition Facts (per {scan.servingSize || '100g'})
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Calories</span>
              <span className="text-sm font-bold text-amber-300 font-['Outfit']">{scan.calories}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Protein</span>
              <span className="text-sm font-bold text-emerald-400 font-['Outfit']">{scan.protein}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Sugar</span>
              <span className="text-sm font-bold text-rose-400 font-['Outfit']">{scan.sugar}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fat</span>
              <span className="text-sm font-bold text-orange-400 font-['Outfit']">{scan.fat}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Salt</span>
              <span className="text-xs font-semibold text-slate-200">{scan.salt}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fiber</span>
              <span className="text-xs font-semibold text-slate-200">{scan.fiber}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Carbs</span>
              <span className="text-xs font-semibold text-slate-200">{scan.carbohydrates}</span>
            </div>
          </div>
        </div>

        {/* Macro Donut Chart */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 space-y-2">
          <h3 className="text-sm font-bold text-slate-200">Macronutrient Breakdown</h3>
          <NutritionPieChart
            protein={scan.protein}
            fat={scan.fat}
            carbs={scan.carbohydrates}
            sugar={scan.sugar}
          />
        </div>

        {/* Expandable Ingredients & Additive Deep Dive */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 space-y-3">
          <button
            onClick={() => setExpandIngredients(!expandIngredients)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Ingredients & Additive Analysis
              </h3>
            </div>
            {expandIngredients ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Additive quick flags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {scan.additives.map((add, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                Additive: {add}
              </span>
            ))}
            {scan.artificialColors.map((col, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium">
                Color: {col}
              </span>
            ))}
            {scan.artificialSweeteners.map((sw, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[10px] font-medium">
                Sweetener: {sw}
              </span>
            ))}
            {scan.allergens.map((alg, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-medium">
                Allergen: {alg}
              </span>
            ))}
          </div>

          {expandIngredients && (
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-slate-200">Full Ingredients List:</p>
              <p className="leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400">
                {scan.ingredients.length > 0 ? scan.ingredients.join(', ') : 'Ingredients not explicitly parsed.'}
              </p>
            </div>
          )}
        </div>

        {/* Suitability Grid */}
        <SuitabilityGrid suitability={scan.suitability} />

        {/* Pros, Cons, Warnings & Advice Cards */}
        <div className="space-y-3">
          {/* Good Points */}
          {scan.goodPoints.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Positives & Good Points
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                {scan.goodPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bad Points */}
          {scan.badPoints.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Drawbacks & Bad Points
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                {scan.badPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {scan.warnings.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Warnings & Precautions
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                {scan.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Daily Advice */}
          {scan.dailyAdvice && (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Daily Consumption Advice
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{scan.dailyAdvice}</p>
            </div>
          )}

          {/* Healthier Alternatives */}
          {scan.alternatives.length > 0 && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Healthier Alternatives
              </h4>
              <div className="space-y-2">
                {scan.alternatives.map((alt, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="font-bold text-white block">{alt.name}</span>
                    <span className="text-slate-400 text-[11px]">{alt.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sticky Action Button */}
        <button
          onClick={() => navigate('/scan')}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
        >
          <Scan className="w-4 h-4" /> Scan Another Product
        </button>
      </div>
    </div>
  );
};
