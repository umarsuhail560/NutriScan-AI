import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProductsQuery, analyzeBarcodeWithAI } from '../services/scanService';
import { FoodScan } from '../types';
import { Search, Sparkles, ChevronRight, Apple, Loader2, Barcode } from 'lucide-react';

interface SearchPageProps {
  onSelectScan: (scan: FoodScan) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onSelectScan }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingBarcode, setAnalyzingBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchProductsQuery(query.trim());
      setResults(res);
      if (res.length === 0) {
        setError('No exact match found in database. Try another search or scan packaging photo!');
      }
    } catch (err) {
      setError('Search failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (item: any) => {
    if (!item.barcode) {
      // If no barcode, search or navigate
      return;
    }
    setAnalyzingBarcode(item.barcode);
    try {
      const res = await analyzeBarcodeWithAI(item.barcode);
      if (res.found && res.data) {
        onSelectScan(res.data);
        navigate('/result');
      } else {
        alert(res.message || 'Product details partial. Please snap packaging photo.');
      }
    } catch (err) {
      alert('Failed to analyze selected product.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Search className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold font-['Outfit']">Search Food Products</h2>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search food by name (e.g. Nutella, Greek Yogurt)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">
        {/* Popular Pill Tag Suggestions */}
        {results.length === 0 && !loading && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    searchProductsQuery(term).then(setResults).catch(() => {});
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 font-medium transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">{error}</p>
            <button
              onClick={() => navigate('/scan')}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Scan Packaging Photo Instead
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-2">
          {results.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectProduct(item)}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="w-11 h-11 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Apple className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{item.productName}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.brand}</p>
                  <span className="text-[10px] text-slate-500 font-mono">Cal: {item.calories} | Sugar: {item.sugar}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {analyzingBarcode === item.barcode ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
