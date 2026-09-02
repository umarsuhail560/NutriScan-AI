import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProductsQuery } from '../services/scanService';
import {
  Search,
  Apple,
  Loader2,
  Scan,
  Info,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SearchPageProps {
  onSelectScan: (scan: any) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onSelectScan,
}) => {
  const navigate = useNavigate();
  const { theme, language } = useTheme();

  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations: Record<
    string,
    {
      title: string;
      placeholder: string;
      search: string;
      popular: string;
      noMatch: string;
      searchFailed: string;
      scanInstead: string;
      unavailable: string;
      verifiedData: string;
      calories: string;
      sugar: string;
      protein: string;
      noNutrition: string;
    }
  > = {
    English: {
      title: 'Search Food Products',
      placeholder:
        'Search food by name (e.g. Nutella, Greek Yogurt)...',
      search: 'Search',
      popular: 'Popular Searches',
      noMatch:
        'No exact match found in database. Try another search or scan packaging photo!',
      searchFailed:
        'Search failed. Please check your internet connection.',
      scanInstead: 'Scan Packaging Photo Instead',
      unavailable: 'Data unavailable',
      verifiedData: 'Verified product data',
      calories: 'Calories',
      sugar: 'Sugar',
      protein: 'Protein',
      noNutrition:
        'Nutrition information is not available for this product.',
    },

    Spanish: {
      title: 'Buscar productos alimenticios',
      placeholder: 'Buscar alimento por nombre...',
      search: 'Buscar',
      popular: 'Búsquedas populares',
      noMatch:
        'No se encontró una coincidencia exacta. Prueba otra búsqueda o escanea una foto del envase.',
      searchFailed:
        'La búsqueda falló. Comprueba tu conexión a Internet.',
      scanInstead: 'Escanear foto del envase',
      unavailable: 'Datos no disponibles',
      verifiedData: 'Datos del producto verificados',
      calories: 'Calorías',
      sugar: 'Azúcar',
      protein: 'Proteína',
      noNutrition:
        'La información nutricional no está disponible para este producto.',
    },

    French: {
      title: 'Rechercher des produits alimentaires',
      placeholder: 'Rechercher un aliment par nom...',
      search: 'Rechercher',
      popular: 'Recherches populaires',
      noMatch:
        'Aucune correspondance exacte trouvée. Essayez une autre recherche ou scannez une photo.',
      searchFailed:
        'La recherche a échoué. Vérifiez votre connexion Internet.',
      scanInstead: 'Scanner une photo du produit',
      unavailable: 'Données indisponibles',
      verifiedData: 'Données produit vérifiées',
      calories: 'Calories',
      sugar: 'Sucre',
      protein: 'Protéines',
      noNutrition:
        'Les informations nutritionnelles ne sont pas disponibles pour ce produit.',
    },

    German: {
      title: 'Lebensmittel suchen',
      placeholder: 'Lebensmittel nach Namen suchen...',
      search: 'Suchen',
      popular: 'Beliebte Suchanfragen',
      noMatch:
        'Keine genaue Übereinstimmung gefunden. Versuche eine andere Suche oder scanne ein Produktfoto.',
      searchFailed:
        'Suche fehlgeschlagen. Bitte überprüfe deine Internetverbindung.',
      scanInstead: 'Produktfotografie scannen',
      unavailable: 'Daten nicht verfügbar',
      verifiedData: 'Verifizierte Produktdaten',
      calories: 'Kalorien',
      sugar: 'Zucker',
      protein: 'Protein',
      noNutrition:
        'Für dieses Produkt sind keine Nährwertinformationen verfügbar.',
    },

    Hindi: {
      title: 'खाद्य उत्पाद खोजें',
      placeholder: 'खाद्य पदार्थ का नाम खोजें...',
      search: 'खोजें',
      popular: 'लोकप्रिय खोजें',
      noMatch:
        'सटीक उत्पाद नहीं मिला। दूसरी खोज करें या पैकेजिंग की फोटो स्कैन करें।',
      searchFailed:
        'खोज विफल हुई। अपना इंटरनेट कनेक्शन जांचें।',
      scanInstead: 'पैकेजिंग फोटो स्कैन करें',
      unavailable: 'डेटा उपलब्ध नहीं है',
      verifiedData: 'सत्यापित उत्पाद डेटा',
      calories: 'कैलोरी',
      sugar: 'चीनी',
      protein: 'प्रोटीन',
      noNutrition:
        'इस उत्पाद की पोषण संबंधी जानकारी उपलब्ध नहीं है।',
    },

    Arabic: {
      title: 'البحث عن المنتجات الغذائية',
      placeholder: 'ابحث عن الطعام بالاسم...',
      search: 'بحث',
      popular: 'عمليات البحث الشائعة',
      noMatch:
        'لم يتم العثور على تطابق دقيق. جرّب بحثًا آخر أو امسح صورة المنتج.',
      searchFailed:
        'فشل البحث. يرجى التحقق من اتصال الإنترنت.',
      scanInstead: 'مسح صورة العبوة',
      unavailable: 'البيانات غير متاحة',
      verifiedData: 'بيانات المنتج الموثقة',
      calories: 'السعرات الحرارية',
      sugar: 'السكر',
      protein: 'البروتين',
      noNutrition:
        'المعلومات الغذائية غير متاحة لهذا المنتج.',
    },
  };

  const text =
    translations[language] || translations.English;

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const surface = isDark ? 'bg-slate-900' : 'bg-white';
  const border = isDark
    ? 'border-slate-800'
    : 'border-slate-200';
  const primaryText = isDark
    ? 'text-slate-100'
    : 'text-slate-900';
  const secondaryText = isDark
    ? 'text-slate-400'
    : 'text-slate-500';
  const inputBg = isDark
    ? 'bg-slate-950'
    : 'bg-slate-100';

  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await searchProductsQuery(
        searchTerm.trim()
      );

      setResults(res);

      if (res.length === 0) {
        setError(text.noMatch);
      }
    } catch (err) {
      console.error('Search failed:', err);

      setResults([]);
      setError(text.searchFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    await searchProducts(query);
  };

  /*
   * Search results are verified database information.
   *
   * IMPORTANT:
   * These results are NOT AI health analyses.
   *
   * Therefore we do NOT create a fake FoodScan object,
   * do NOT assign a health score,
   * do NOT assign a grade,
   * and do NOT assign a risk level.
   *
   * The user should use the packaging-photo scanner
   * when they want the complete AI health analysis.
   */

  const handleSelectProduct = (item: any) => {
    /*
     * Search results should not be sent to ResultPage
     * because ResultPage expects a complete AI FoodScan.
     *
     * Instead, we display the verified product information
     * directly in this page.
     */

    setSelectedProduct(item);
  };

  const [selectedProduct, setSelectedProduct] =
    useState<any | null>(null);

  const popularSearches = [
    'Greek Yogurt',
    'Oat Milk',
    'Almond Butter',
    'Nutella',
    'Protein Bar',
    'Avocado Oil',
  ];

  return (
    <div
      dir={language === 'Arabic' ? 'rtl' : 'ltr'}
      className={`min-h-screen ${bg} ${primaryText} pb-28 transition-colors`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b ${border} ${surface} transition-colors`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Search className="w-5 h-5" />
            </div>

            <h2 className="text-base font-bold font-['Outfit']">
              {text.title}
            </h2>
          </div>

          <form
            onSubmit={handleSearch}
            className="relative"
          >
            <input
              type="text"
              placeholder={text.placeholder}
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              className={`w-full pl-10 pr-20 py-3 ${inputBg} border ${border} rounded-2xl text-xs ${primaryText} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner`}
            />

            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />

            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                text.search
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-md mx-auto p-4 space-y-5">

        {/* Popular searches */}
        {results.length === 0 &&
          !loading &&
          !selectedProduct && (
            <div className="space-y-2">
              <span
                className={`text-xs font-bold ${secondaryText} uppercase tracking-wider block`}
              >
                {text.popular}
              </span>

              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      searchProducts(term);
                    }}
                    className={`px-3 py-1.5 ${surface} border ${border} hover:border-emerald-500 rounded-xl text-xs ${secondaryText} font-medium transition-all`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Error */}
        {error && (
          <div
            className={`p-4 rounded-2xl ${surface} border ${border} text-center space-y-2`}
          >
            <p
              className={`text-xs ${secondaryText}`}
            >
              {error}
            </p>

            <button
              onClick={() => navigate('/scan')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 mx-auto"
            >
              <Scan className="w-4 h-4" />
              {text.scanInstead}
            </button>
          </div>
        )}

        {/* Selected product */}
        {selectedProduct && (
          <div
            className={`p-4 rounded-3xl ${surface} border ${border} space-y-4`}
          >
            <div className="flex items-center gap-3">
              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={
                    selectedProduct.productName ||
                    'Food product'
                  }
                  className={`w-16 h-16 rounded-2xl object-cover ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-100 border-slate-200'
                  } border flex-shrink-0`}
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-2xl ${
                    isDark
                      ? 'bg-slate-800'
                      : 'bg-slate-100'
                  } flex items-center justify-center ${
                    isDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  <Apple className="w-8 h-8" />
                </div>
              )}

              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  {text.verifiedData}
                </span>

                <h3
                  className={`text-sm font-extrabold ${primaryText} font-['Outfit']`}
                >
                  {selectedProduct.productName ||
                    text.unavailable}
                </h3>

                <p
                  className={`text-xs ${secondaryText}`}
                >
                  {selectedProduct.brand ||
                    text.unavailable}
                </p>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl ${
                isDark
                  ? 'bg-slate-950'
                  : 'bg-slate-100'
              } border ${border} flex gap-2`}
            >
              <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />

              <p
                className={`text-[11px] ${secondaryText} leading-relaxed`}
              >
                {text.verifiedData}. {text.noNutrition}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div
                className={`p-3 rounded-xl ${isDark ? 'bg-slate-950' : 'bg-slate-100'} border ${border} text-center`}
              >
                <span
                  className={`text-[10px] ${secondaryText} block`}
                >
                  {text.calories}
                </span>

                <span
                  className={`text-xs font-bold ${primaryText}`}
                >
                  {selectedProduct.calories ||
                    text.unavailable}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl ${isDark ? 'bg-slate-950' : 'bg-slate-100'} border ${border} text-center`}
              >
                <span
                  className={`text-[10px] ${secondaryText} block`}
                >
                  {text.sugar}
                </span>

                <span
                  className={`text-xs font-bold ${primaryText}`}
                >
                  {selectedProduct.sugar ||
                    text.unavailable}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl ${isDark ? 'bg-slate-950' : 'bg-slate-100'} border ${border} text-center`}
              >
                <span
                  className={`text-[10px] ${secondaryText} block`}
                >
                  {text.protein}
                </span>

                <span
                  className={`text-xs font-bold ${primaryText}`}
                >
                  {selectedProduct.protein ||
                    text.unavailable}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/scan')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              {text.scanInstead}
            </button>
          </div>
        )}

        {/* Results */}
        {!selectedProduct && (
          <div className="space-y-2">
            {results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  handleSelectProduct(item)
                }
                className={`w-full text-left p-3.5 rounded-2xl ${surface} hover:opacity-90 border ${border} flex items-center justify-between cursor-pointer transition-all`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={
                        item.productName ||
                        'Food product'
                      }
                      className={`w-11 h-11 rounded-xl object-cover ${
                        isDark
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-100 border-slate-200'
                      } border flex-shrink-0`}
                    />
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-xl ${
                        isDark
                          ? 'bg-slate-800'
                          : 'bg-slate-100'
                      } flex items-center justify-center ${
                        isDark
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      } flex-shrink-0`}
                    >
                      <Apple className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4
                      className={`text-xs font-bold ${primaryText} line-clamp-1`}
                    >
                      {item.productName ||
                        text.unavailable}
                    </h4>

                    <p
                      className={`text-[11px] ${secondaryText} line-clamp-1`}
                    >
                      {item.brand ||
                        text.unavailable}
                    </p>

                    <span
                      className={`text-[10px] ${
                        isDark
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      } font-mono`}
                    >
                      {text.calories}:{' '}
                      {item.calories ||
                        text.unavailable}{' '}
                      | {text.sugar}:{' '}
                      {item.sugar ||
                        text.unavailable}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] ${
                    isDark
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  } flex-shrink-0`}
                >
                  →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};