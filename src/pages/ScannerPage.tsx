import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FoodScan, ScanMode } from '../types';
import { analyzeImageWithAI, saveScanToFirestore } from '../services/scanService';
import {
  Camera,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ScannerPageProps {
  onScanComplete: (scan: FoodScan) => void;
}

const labels = {
  en: {
    title: 'Scan Product',
    subtitle: 'Take a photo or upload a product image',
    camera: 'Camera',
    upload: 'Upload',
    takePhoto: 'Take Photo',
    chooseImage: 'Choose Image',
    analyze: 'Analyze Product',
    analyzing: 'Analyzing...',
    retake: 'Retake',
    remove: 'Remove',
    loginRequired: 'Google Login Required',
    loginMessage:
      'Please login with your Google account before scanning a product.',
    loginGoogle: 'Login with Google',
    loginSuccess: 'Login successful. You can now scan the product.',
    loginFailed: 'Google login failed. Please try again.',
    noImage: 'Please select or capture an image first.',
    unavailable: 'Data unavailable',
    error: 'Something went wrong. Please try again.',
    tryAgain: 'Try Again',
    goodPoints: 'Good points',
    badPoints: 'Bad points',
    warning: 'Warning',
    benefit: 'Benefits',
    summary: 'AI Summary',
    dailyAdvice: 'Daily Advice',
    ingredients: 'Ingredients',
    artificialColors: 'Artificial Colors',
    preservatives: 'Preservatives',
    artificialSweeteners: 'Artificial Sweeteners',
    additives: 'Additives',
    allergens: 'Allergens',
    servingSize: 'Serving Size',
  },

  es: {
    title: 'Escanear producto',
    subtitle: 'Toma una foto o sube una imagen del producto',
    camera: 'Cámara',
    upload: 'Subir',
    takePhoto: 'Tomar foto',
    chooseImage: 'Elegir imagen',
    analyze: 'Analizar producto',
    analyzing: 'Analizando...',
    retake: 'Repetir',
    remove: 'Eliminar',
    loginRequired: 'Se requiere iniciar sesión con Google',
    loginMessage:
      'Inicia sesión con tu cuenta de Google antes de escanear un producto.',
    loginGoogle: 'Iniciar sesión con Google',
    loginSuccess: 'Inicio de sesión exitoso. Ahora puedes escanear el producto.',
    loginFailed: 'Error al iniciar sesión con Google. Inténtalo de nuevo.',
    noImage: 'Selecciona o captura una imagen primero.',
    unavailable: 'Datos no disponibles',
    error: 'Algo salió mal. Inténtalo de nuevo.',
    tryAgain: 'Intentar de nuevo',
    goodPoints: 'Aspectos positivos',
    badPoints: 'Aspectos negativos',
    warning: 'Advertencia',
    benefit: 'Beneficios',
    summary: 'Resumen de IA',
    dailyAdvice: 'Consejo diario',
    ingredients: 'Ingredientes',
    artificialColors: 'Colorantes artificiales',
    preservatives: 'Conservantes',
    artificialSweeteners: 'Edulcorantes artificiales',
    additives: 'Aditivos',
    allergens: 'Alérgenos',
    servingSize: 'Tamaño de porción',
  },

  fr: {
    title: 'Scanner le produit',
    subtitle: 'Prenez une photo ou téléchargez une image du produit',
    camera: 'Caméra',
    upload: 'Télécharger',
    takePhoto: 'Prendre une photo',
    chooseImage: 'Choisir une image',
    analyze: 'Analyser le produit',
    analyzing: 'Analyse...',
    retake: 'Reprendre',
    remove: 'Supprimer',
    loginRequired: 'Connexion Google requise',
    loginMessage:
      'Veuillez vous connecter avec votre compte Google avant de scanner un produit.',
    loginGoogle: 'Se connecter avec Google',
    loginSuccess: 'Connexion réussie. Vous pouvez maintenant scanner le produit.',
    loginFailed: 'Échec de la connexion Google. Veuillez réessayer.',
    noImage: 'Veuillez d’abord sélectionner ou prendre une image.',
    unavailable: 'Données indisponibles',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    tryAgain: 'Réessayer',
    goodPoints: 'Points positifs',
    badPoints: 'Points négatifs',
    warning: 'Avertissement',
    benefit: 'Avantages',
    summary: 'Résumé IA',
    dailyAdvice: 'Conseil quotidien',
    ingredients: 'Ingrédients',
    artificialColors: 'Colorants artificiels',
    preservatives: 'Conservateurs',
    artificialSweeteners: 'Édulcorants artificiels',
    additives: 'Additifs',
    allergens: 'Allergènes',
    servingSize: 'Taille de portion',
  },

  de: {
    title: 'Produkt scannen',
    subtitle: 'Foto aufnehmen oder Produktbild hochladen',
    camera: 'Kamera',
    upload: 'Hochladen',
    takePhoto: 'Foto aufnehmen',
    chooseImage: 'Bild auswählen',
    analyze: 'Produkt analysieren',
    analyzing: 'Analysieren...',
    retake: 'Erneut aufnehmen',
    remove: 'Entfernen',
    loginRequired: 'Google-Anmeldung erforderlich',
    loginMessage:
      'Bitte melden Sie sich mit Ihrem Google-Konto an, bevor Sie ein Produkt scannen.',
    loginGoogle: 'Mit Google anmelden',
    loginSuccess: 'Anmeldung erfolgreich. Sie können das Produkt jetzt scannen.',
    loginFailed: 'Google-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    noImage: 'Bitte wählen Sie zuerst ein Bild aus oder nehmen Sie eines auf.',
    unavailable: 'Daten nicht verfügbar',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    tryAgain: 'Erneut versuchen',
    goodPoints: 'Positive Punkte',
    badPoints: 'Negative Punkte',
    warning: 'Warnung',
    benefit: 'Vorteile',
    summary: 'KI-Zusammenfassung',
    dailyAdvice: 'Täglicher Rat',
    ingredients: 'Zutaten',
    artificialColors: 'Künstliche Farbstoffe',
    preservatives: 'Konservierungsstoffe',
    artificialSweeteners: 'Künstliche Süßstoffe',
    additives: 'Zusatzstoffe',
    allergens: 'Allergene',
    servingSize: 'Portionsgröße',
  },

  hi: {
    title: 'उत्पाद स्कैन करें',
    subtitle: 'फोटो लें या उत्पाद की तस्वीर अपलोड करें',
    camera: 'कैमरा',
    upload: 'अपलोड',
    takePhoto: 'फोटो लें',
    chooseImage: 'तस्वीर चुनें',
    analyze: 'उत्पाद का विश्लेषण करें',
    analyzing: 'विश्लेषण हो रहा है...',
    retake: 'दोबारा लें',
    remove: 'हटाएं',
    loginRequired: 'Google लॉगिन आवश्यक है',
    loginMessage:
      'उत्पाद स्कैन करने से पहले अपने Google खाते से लॉगिन करें।',
    loginGoogle: 'Google से लॉगिन करें',
    loginSuccess: 'लॉगिन सफल हुआ। अब आप उत्पाद स्कैन कर सकते हैं।',
    loginFailed: 'Google लॉगिन विफल हुआ। कृपया फिर प्रयास करें।',
    noImage: 'पहले कोई तस्वीर चुनें या लें।',
    unavailable: 'डेटा उपलब्ध नहीं है',
    error: 'कुछ गलत हो गया। कृपया फिर प्रयास करें।',
    tryAgain: 'फिर प्रयास करें',
    goodPoints: 'अच्छी बातें',
    badPoints: 'खराब बातें',
    warning: 'चेतावनी',
    benefit: 'लाभ',
    summary: 'AI सारांश',
    dailyAdvice: 'दैनिक सलाह',
    ingredients: 'सामग्री',
    artificialColors: 'कृत्रिम रंग',
    preservatives: 'प्रिजर्वेटिव',
    artificialSweeteners: 'कृत्रिम स्वीटनर',
    additives: 'एडिटिव्स',
    allergens: 'एलर्जेन',
    servingSize: 'सर्विंग आकार',
  },

  ar: {
    title: 'فحص المنتج',
    subtitle: 'التقط صورة أو حمّل صورة للمنتج',
    camera: 'الكاميرا',
    upload: 'رفع',
    takePhoto: 'التقاط صورة',
    chooseImage: 'اختيار صورة',
    analyze: 'تحليل المنتج',
    analyzing: 'جارٍ التحليل...',
    retake: 'إعادة الالتقاط',
    remove: 'إزالة',
    loginRequired: 'تسجيل الدخول عبر Google مطلوب',
    loginMessage:
      'يرجى تسجيل الدخول باستخدام حساب Google قبل فحص المنتج.',
    loginGoogle: 'تسجيل الدخول عبر Google',
    loginSuccess: 'تم تسجيل الدخول بنجاح. يمكنك الآن فحص المنتج.',
    loginFailed: 'فشل تسجيل الدخول عبر Google. حاول مرة أخرى.',
    noImage: 'يرجى اختيار صورة أو التقاطها أولاً.',
    unavailable: 'البيانات غير متاحة',
    error: 'حدث خطأ ما. حاول مرة أخرى.',
    tryAgain: 'حاول مرة أخرى',
    goodPoints: 'النقاط الجيدة',
    badPoints: 'النقاط السيئة',
    warning: 'تحذير',
    benefit: 'الفوائد',
    summary: 'ملخص الذكاء الاصطناعي',
    dailyAdvice: 'النصيحة اليومية',
    ingredients: 'المكونات',
    artificialColors: 'الألوان الصناعية',
    preservatives: 'المواد الحافظة',
    artificialSweeteners: 'المحليات الصناعية',
    additives: 'الإضافات',
    allergens: 'مسببات الحساسية',
    servingSize: 'حجم الحصة',
  },
};

type LanguageKey = keyof typeof labels;

export const ScannerPage: React.FC<ScannerPageProps> = ({
  onScanComplete,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser, userProfile, signInWithGoogle, updateUserStats } =
    useAuth();
  const { theme, language } = useTheme();

  const currentLanguage =
    (language as LanguageKey) in labels
      ? (language as LanguageKey)
      : 'en';

  const t = labels[currentLanguage];

  const isDark = theme === 'dark';

  const [mode, setMode] = useState<ScanMode>('photo');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setLoginMessage(null);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
      }
    };

    reader.onerror = () => {
      setError(t.error);
    };

    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setError(null);
    setLoginMessage(null);
  };

  const handleGoogleLogin = async () => {
    if (firebaseUser) return;

    setIsLoggingIn(true);
    setError(null);
    setLoginMessage(null);

    try {
      await signInWithGoogle();

      setLoginMessage(t.loginSuccess);
    } catch (err) {
      console.error('Google login failed:', err);
      setError(t.loginFailed);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const runAnalysis = async () => {
    setError(null);
    setLoginMessage(null);

    /*
     * IMPORTANT:
     * Authentication is checked BEFORE sending the image to the AI backend.
     * Therefore unauthenticated users cannot perform a scan/analyze operation.
     */
    if (!firebaseUser || !userProfile?.uid) {
      setError(t.loginMessage);
      return;
    }

    if (!selectedImage) {
      setError(t.noImage);
      return;
    }

    setIsAnalyzing(true);

    try {
      const base64Image = selectedImage.includes(',')
        ? selectedImage.split(',')[1]
        : selectedImage;

      const mimeType = selectedImage.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,/
      )?.[1] || 'image/jpeg';

      const aiData = await analyzeImageWithAI(
        base64Image,
        mimeType,
        'Analyze this product packaging image carefully. Identify whether the product is edible/food or non-edible/cosmetic. Do not invent nutrition values. If information is missing, return "Data unavailable".'
      );

      /*
       * Keep the server's non-edible enforcement.
       * The backend is responsible for setting:
       * healthScore = 0
       * grade = E
       * riskLevel = Avoid Frequently
       * for non-edible products.
       */
      const healthScore =
        typeof aiData?.healthScore === 'number'
          ? Math.max(0, Math.min(100, aiData.healthScore))
          : 0;

      const grade =
        aiData?.grade === 'A+' ||
        aiData?.grade === 'A' ||
        aiData?.grade === 'B' ||
        aiData?.grade === 'C' ||
        aiData?.grade === 'D' ||
        aiData?.grade === 'E'
          ? aiData.grade
          : 'E';

      const riskLevel =
        aiData?.riskLevel === 'Very Healthy' ||
        aiData?.riskLevel === 'Healthy' ||
        aiData?.riskLevel === 'Moderate' ||
        aiData?.riskLevel === 'Unhealthy' ||
        aiData?.riskLevel === 'Avoid Frequently'
          ? aiData.riskLevel
          : 'Avoid Frequently';

      const scanPayload: Omit<FoodScan, 'id'> = {
        userId: userProfile.uid,

        productName:
          aiData?.productName || 'Unknown Product',

        brand:
          aiData?.brand || 'Unknown Brand',

        barcode:
          aiData?.barcode || undefined,

        healthScore,

        grade,

        riskLevel,

        calories:
          aiData?.calories || t.unavailable,

        protein:
          aiData?.protein || t.unavailable,

        fat:
          aiData?.fat || t.unavailable,

        sugar:
          aiData?.sugar || t.unavailable,

        salt:
          aiData?.salt || t.unavailable,

        fiber:
          aiData?.fiber || t.unavailable,

        carbohydrates:
          aiData?.carbohydrates || t.unavailable,

        servingSize:
          aiData?.servingSize || t.unavailable,

        ingredients:
          Array.isArray(aiData?.ingredients)
            ? aiData.ingredients
            : [],

        artificialColors:
          Array.isArray(aiData?.artificialColors)
            ? aiData.artificialColors
            : [],

        preservatives:
          Array.isArray(aiData?.preservatives)
            ? aiData.preservatives
            : [],

        artificialSweeteners:
          Array.isArray(aiData?.artificialSweeteners)
            ? aiData.artificialSweeteners
            : [],

        additives:
          Array.isArray(aiData?.additives)
            ? aiData.additives
            : [],

        allergens:
          Array.isArray(aiData?.allergens)
            ? aiData.allergens
            : [],

        suitability: {
          forChildren:
            Boolean(aiData?.suitability?.forChildren),

          childrenNotes:
            aiData?.suitability?.childrenNotes || t.unavailable,

          forDiabetics:
            Boolean(aiData?.suitability?.forDiabetics),

          diabeticNotes:
            aiData?.suitability?.diabeticNotes || t.unavailable,

          forPregnant:
            Boolean(aiData?.suitability?.forPregnant),

          pregnantNotes:
            aiData?.suitability?.pregnantNotes || t.unavailable,

          forElderly:
            Boolean(aiData?.suitability?.forElderly),

          elderlyNotes:
            aiData?.suitability?.elderlyNotes || t.unavailable,

          forGym:
            Boolean(aiData?.suitability?.forGym),

          gymNotes:
            aiData?.suitability?.gymNotes || t.unavailable,
        },

        goodPoints:
          Array.isArray(aiData?.goodPoints)
            ? aiData.goodPoints
            : [],

        badPoints:
          Array.isArray(aiData?.badPoints)
            ? aiData.badPoints
            : [],

        warnings:
          Array.isArray(aiData?.warnings)
            ? aiData.warnings
            : [],

        benefits:
          Array.isArray(aiData?.benefits)
            ? aiData.benefits
            : [],

        dailyAdvice:
          aiData?.dailyAdvice || t.unavailable,

        alternatives:
          Array.isArray(aiData?.alternatives)
            ? aiData.alternatives
            : [],

        summary:
          aiData?.summary || t.unavailable,

        imageUrl:
          selectedImage,

        createdAt:
          new Date().toISOString(),

        isFavorite:
          false,
      };

      /*
       * Double-check that the authenticated UID is the UID being saved.
       * No "guest" fallback exists here.
       */
      const savedScan = await saveScanToFirestore(
        scanPayload,
        firebaseUser.uid
      );

      await updateUserStats(healthScore >= 60);

      onScanComplete(savedScan);

      navigate('/result', {
        state: {
          from: location.pathname,
        },
      });
    } catch (err) {
      console.error('Product analysis failed:', err);

      const message =
        err instanceof Error && err.message
          ? err.message
          : t.error;

      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className={`min-h-screen px-4 py-6 pb-28 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950 text-white'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t.title}</h1>

          <p
            className={`mt-1 text-sm ${
              isDark
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            {t.subtitle}
          </p>
        </div>

        {/* Login Required */}
        {!firebaseUser && (
          <div
            className={`mb-5 rounded-2xl border p-5 ${
              isDark
                ? 'border-amber-500/30 bg-amber-500/10'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <LogIn
                className="mt-0.5 shrink-0"
                size={22}
              />

              <div className="flex-1">
                <h2 className="font-semibold">
                  {t.loginRequired}
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    isDark
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {t.loginMessage}
                </p>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <LogIn size={18} />
                  )}

                  {isLoggingIn
                    ? t.analyzing
                    : t.loginGoogle}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Success */}
        {loginMessage && (
          <div
            className={`mb-5 flex items-center gap-3 rounded-xl border p-4 ${
              isDark
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            <CheckCircle2
              size={20}
              className="shrink-0"
            />

            <span className="text-sm font-medium">
              {loginMessage}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${
              isDark
                ? 'border-red-500/30 bg-red-500/10 text-red-300'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="text-sm font-medium">
                {error}
              </p>

              {!firebaseUser && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <LogIn size={16} />
                  {t.loginGoogle}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode selector */}
        <div
          className={`mb-5 grid grid-cols-2 gap-2 rounded-2xl p-1 ${
            isDark
              ? 'bg-slate-900'
              : 'bg-white shadow-sm'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setMode('photo');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'photo'
                ? 'bg-emerald-600 text-white'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera size={18} />
            {t.camera}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('upload');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'upload'
                ? 'bg-emerald-600 text-white'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload size={18} />
            {t.upload}
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageSelect}
        />

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Image area */}
        {!selectedImage ? (
          <div
            className={`rounded-3xl border-2 border-dashed p-8 text-center ${
              isDark
                ? 'border-slate-700 bg-slate-900'
                : 'border-slate-300 bg-white'
            }`}
          >
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                isDark
                  ? 'bg-slate-800'
                  : 'bg-slate-100'
              }`}
            >
              {mode === 'photo' ? (
                <Camera size={30} />
              ) : (
                <ImageIcon size={30} />
              )}
            </div>

            <h2 className="text-lg font-semibold">
              {mode === 'photo'
                ? t.takePhoto
                : t.chooseImage}
            </h2>

            <p
              className={`mt-2 text-sm ${
                isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {mode === 'photo'
                ? 'Use your camera to capture the product packaging.'
                : 'Select a product image from your device.'}
            </p>

            <button
              type="button"
              onClick={() =>
                mode === 'photo'
                  ? cameraInputRef.current?.click()
                  : uploadInputRef.current?.click()
              }
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              {mode === 'photo' ? (
                <Camera size={20} />
              ) : (
                <Upload size={20} />
              )}

              {mode === 'photo'
                ? t.takePhoto
                : t.chooseImage}
            </button>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-3xl border ${
              isDark
                ? 'border-slate-800 bg-slate-900'
                : 'border-slate-200 bg-white'
            }`}
          >
            {/* Image preview */}
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected product"
                className="max-h-[500px] w-full object-contain"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isAnalyzing}
                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur transition hover:bg-black/80 disabled:opacity-50"
                aria-label={t.remove}
              >
                <X size={20} />
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3 p-5">
              <button
                type="button"
                onClick={runAnalysis}
                disabled={
                  isAnalyzing ||
                  isLoggingIn ||
                  !firebaseUser ||
                  !userProfile?.uid
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    {t.analyze}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  mode === 'photo'
                    ? cameraInputRef.current?.click()
                    : uploadInputRef.current?.click()
                }
                disabled={isAnalyzing}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold transition disabled:opacity-50 ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {mode === 'photo' ? (
                  <Camera size={18} />
                ) : (
                  <Upload size={18} />
                )}

                {mode === 'photo'
                  ? t.retake
                  : t.chooseImage}
              </button>
            </div>
          </div>
        )}

        {/* Login reminder below scanner */}
        {!firebaseUser && selectedImage && (
          <div
            className={`mt-4 rounded-xl p-4 text-center text-sm ${
              isDark
                ? 'bg-slate-900 text-slate-400'
                : 'bg-white text-slate-600'
            }`}
          >
            {t.loginMessage}
          </div>
        )}
      </div>
    </div>
  );
};