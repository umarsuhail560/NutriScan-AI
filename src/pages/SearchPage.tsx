import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProductsQuery, analyzeBarcodeWithAI } from '../services/scanService';
import { useTheme } from '../context/ThemeContext';
import { FoodScan } from '../types';
import { Search, ChevronRight, Apple, Loader2 } from 'lucide-react';

interface SearchPageProps {
  onSelectScan: (scan: FoodScan) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onSelectScan }) => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingBarcode, setAnalyzingBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchProductsQuery(term.trim());
      setResults(res);
      if (res.length === 0) {
        setError(t.noExactMatch);
      }
    } catch {
      setError(t.searchFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(query);
  };

  const handleSelectProduct = async (item: any) => {
    if (!item.barcode) return;
    setAnalyzingBarcode(item.barcode);
    setError(null);
    try {
      const res = await analyzeBarcodeWithAI(item.barcode);
      if (res.found && res.data) {
        onSelectScan(res.data);
        navigate('/result');
      } else {
        setError(res.message || t.productPartial);
      }
    } catch {
      setError(t.failedAnalyzeProduct);
    } finally {
      setAnalyzingBarcode(null);
    }
  };

  const popularSearches = [
    'Greek Yogurt',
    'Oat Milk',
    'Almond Butter',
    'Nutella',
    'Protein Bar',
    'Avocado Oil',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-10 transition-colors">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Search className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold font-['Outfit']">{t.searchFoodProducts}</h2>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:max-w-xl">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.search}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {results.length === 0 && !loading && (
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t.popularSearches}
            </span>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    runSearch(term);
                  }}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium shadow-sm transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm max-w-lg mx-auto">
            <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
            <button
              onClick={() => navigate('/scan')}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              {t.scanPackagingInstead}
            </button>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectProduct(item)}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                    <Apple className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.productName}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.brand}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {t.calories}: {item.calories} | {t.sugar}: {item.sugar}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {analyzingBarcode === item.barcode ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
