import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  Shield,
  Info,
  MessageSquare,
  Check,
  Heart,
  ChevronRight,
  Send,
  Smartphone,
  Download,
  User,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const labels = {
  English: {
    preferences: 'Preferences',
    appearance: 'Appearance',
    themeMode: 'Theme Mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    toggleTheme: 'Toggle Theme',
    language: 'Language',
    dietaryPreferences: 'Dietary Preferences',
    selectedPreferences: 'Select preferences that should be considered during food analysis.',
    aboutLegal: 'About & Legal',
    sendFeedback: 'Send Feedback',
    privacy: 'Privacy',
    privacyText:
      'NutriScan AI stores scan history securely in Firebase Firestore. Your images are analyzed server-side and are not used for data monetization.',
    about: 'About',
    aboutText:
      'NutriScan AI uses Google Gemini AI for food and product analysis and Open Food Facts for product information.',
    feedbackTitle: 'Send Feedback',
    feedbackPlaceholder: 'Tell us what you think...',
    cancel: 'Cancel',
    submit: 'Submit',
    thankYou:
      'Thank you for your feedback! NutriScan AI is constantly improving.',
    installApp: 'Add to Home Screen',
    installDescription:
      'Install NutriScan AI on your device for quick access.',
    install: 'Install',
    creator: 'Creator',
    createdBy: 'Created by',
    project: 'AI & Data Science Engineering Project',
    creatorInfo: 'NutriScan AI was created as an engineering project focused on AI-powered food analysis.',
    unavailableInstall:
      'Installation is not currently available in this browser.',
  },

  Spanish: {
    preferences: 'Preferencias',
    appearance: 'Apariencia',
    themeMode: 'Modo de tema',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    toggleTheme: 'Cambiar tema',
    language: 'Idioma',
    dietaryPreferences: 'Preferencias dietéticas',
    selectedPreferences:
      'Selecciona las preferencias que deben considerarse durante el análisis de alimentos.',
    aboutLegal: 'Acerca de y legal',
    sendFeedback: 'Enviar comentarios',
    privacy: 'Privacidad',
    privacyText:
      'NutriScan AI almacena el historial de análisis de forma segura en Firebase Firestore. Las imágenes se analizan en el servidor y no se utilizan para monetización de datos.',
    about: 'Acerca de',
    aboutText:
      'NutriScan AI utiliza Google Gemini AI para analizar alimentos y productos y Open Food Facts para información de productos.',
    feedbackTitle: 'Enviar comentarios',
    feedbackPlaceholder: 'Cuéntanos qué piensas...',
    cancel: 'Cancelar',
    submit: 'Enviar',
    thankYou:
      '¡Gracias por tus comentarios! NutriScan AI sigue mejorando.',
    installApp: 'Añadir a la pantalla de inicio',
    installDescription:
      'Instala NutriScan AI en tu dispositivo para acceder rápidamente.',
    install: 'Instalar',
    creator: 'Creador',
    createdBy: 'Creado por',
    project: 'Proyecto de Ingeniería de IA y Ciencia de Datos',
    creatorInfo:
      'NutriScan AI fue creado como un proyecto de ingeniería centrado en el análisis de alimentos mediante IA.',
    unavailableInstall:
      'La instalación no está disponible actualmente en este navegador.',
  },

  French: {
    preferences: 'Préférences',
    appearance: 'Apparence',
    themeMode: 'Mode du thème',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    toggleTheme: 'Changer de thème',
    language: 'Langue',
    dietaryPreferences: 'Préférences alimentaires',
    selectedPreferences:
      'Sélectionnez les préférences à prendre en compte lors de l’analyse des aliments.',
    aboutLegal: 'À propos et mentions légales',
    sendFeedback: 'Envoyer un commentaire',
    privacy: 'Confidentialité',
    privacyText:
      'NutriScan AI stocke l’historique des analyses de manière sécurisée dans Firebase Firestore. Les images sont analysées côté serveur et ne sont pas utilisées à des fins de monétisation des données.',
    about: 'À propos',
    aboutText:
      'NutriScan AI utilise Google Gemini AI pour analyser les aliments et les produits et Open Food Facts pour les informations sur les produits.',
    feedbackTitle: 'Envoyer un commentaire',
    feedbackPlaceholder: 'Dites-nous ce que vous pensez...',
    cancel: 'Annuler',
    submit: 'Envoyer',
    thankYou:
      'Merci pour vos commentaires ! NutriScan AI continue de s’améliorer.',
    installApp: 'Ajouter à l’écran d’accueil',
    installDescription:
      'Installez NutriScan AI sur votre appareil pour un accès rapide.',
    install: 'Installer',
    creator: 'Créateur',
    createdBy: 'Créé par',
    project: 'Projet d’ingénierie IA et science des données',
    creatorInfo:
      'NutriScan AI a été créé comme un projet d’ingénierie axé sur l’analyse des aliments par IA.',
    unavailableInstall:
      'L’installation n’est pas disponible dans ce navigateur.',
  },

  German: {
    preferences: 'Einstellungen',
    appearance: 'Darstellung',
    themeMode: 'Designmodus',
    darkMode: 'Dunkelmodus',
    lightMode: 'Hellmodus',
    toggleTheme: 'Design wechseln',
    language: 'Sprache',
    dietaryPreferences: 'Ernährungseinstellungen',
    selectedPreferences:
      'Wählen Sie Einstellungen aus, die bei der Lebensmittelanalyse berücksichtigt werden sollen.',
    aboutLegal: 'Über & Rechtliches',
    sendFeedback: 'Feedback senden',
    privacy: 'Datenschutz',
    privacyText:
      'NutriScan AI speichert den Scanverlauf sicher in Firebase Firestore. Bilder werden serverseitig analysiert und nicht zur Datenmonetarisierung verwendet.',
    about: 'Über',
    aboutText:
      'NutriScan AI verwendet Google Gemini AI für die Analyse von Lebensmitteln und Produkten sowie Open Food Facts für Produktinformationen.',
    feedbackTitle: 'Feedback senden',
    feedbackPlaceholder: 'Teilen Sie uns Ihre Meinung mit...',
    cancel: 'Abbrechen',
    submit: 'Senden',
    thankYou:
      'Vielen Dank für Ihr Feedback! NutriScan AI wird ständig verbessert.',
    installApp: 'Zum Startbildschirm hinzufügen',
    installDescription:
      'Installieren Sie NutriScan AI auf Ihrem Gerät für schnellen Zugriff.',
    install: 'Installieren',
    creator: 'Ersteller',
    createdBy: 'Erstellt von',
    project: 'KI- und Data-Science-Engineering-Projekt',
    creatorInfo:
      'NutriScan AI wurde als Engineering-Projekt zur KI-gestützten Lebensmittelanalyse entwickelt.',
    unavailableInstall:
      'Die Installation ist in diesem Browser derzeit nicht verfügbar.',
  },

  Hindi: {
    preferences: 'प्राथमिकताएं',
    appearance: 'दिखावट',
    themeMode: 'थीम मोड',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    toggleTheme: 'थीम बदलें',
    language: 'भाषा',
    dietaryPreferences: 'आहार प्राथमिकताएं',
    selectedPreferences:
      'खाद्य विश्लेषण के दौरान ध्यान में रखी जाने वाली प्राथमिकताएं चुनें।',
    aboutLegal: 'जानकारी और कानूनी',
    sendFeedback: 'फीडबैक भेजें',
    privacy: 'गोपनीयता',
    privacyText:
      'NutriScan AI स्कैन इतिहास को Firebase Firestore में सुरक्षित रूप से संग्रहीत करता है। छवियों का सर्वर पर विश्लेषण किया जाता है और डेटा से कमाई के लिए उनका उपयोग नहीं किया जाता।',
    about: 'जानकारी',
    aboutText:
      'NutriScan AI खाद्य और उत्पाद विश्लेषण के लिए Google Gemini AI और उत्पाद जानकारी के लिए Open Food Facts का उपयोग करता है।',
    feedbackTitle: 'फीडबैक भेजें',
    feedbackPlaceholder: 'अपनी राय बताएं...',
    cancel: 'रद्द करें',
    submit: 'भेजें',
    thankYou:
      'फीडबैक के लिए धन्यवाद! NutriScan AI लगातार बेहतर हो रहा है।',
    installApp: 'होम स्क्रीन पर जोड़ें',
    installDescription:
      'त्वरित पहुंच के लिए अपने डिवाइस पर NutriScan AI इंस्टॉल करें।',
    install: 'इंस्टॉल करें',
    creator: 'निर्माता',
    createdBy: 'द्वारा बनाया गया',
    project: 'AI और Data Science Engineering Project',
    creatorInfo:
      'NutriScan AI को AI आधारित खाद्य विश्लेषण पर केंद्रित इंजीनियरिंग प्रोजेक्ट के रूप में बनाया गया है।',
    unavailableInstall:
      'इस ब्राउज़र में अभी इंस्टॉलेशन उपलब्ध नहीं है।',
  },

  Arabic: {
    preferences: 'التفضيلات',
    appearance: 'المظهر',
    themeMode: 'وضع المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    toggleTheme: 'تغيير المظهر',
    language: 'اللغة',
    dietaryPreferences: 'التفضيلات الغذائية',
    selectedPreferences:
      'اختر التفضيلات التي يجب مراعاتها أثناء تحليل الطعام.',
    aboutLegal: 'حول ومعلومات قانونية',
    sendFeedback: 'إرسال ملاحظات',
    privacy: 'الخصوصية',
    privacyText:
      'يخزن NutriScan AI سجل عمليات التحليل بأمان في Firebase Firestore. يتم تحليل الصور على الخادم ولا يتم استخدامها لتحقيق الدخل من البيانات.',
    about: 'حول',
    aboutText:
      'يستخدم NutriScan AI تقنية Google Gemini AI لتحليل الأطعمة والمنتجات وOpen Food Facts لمعلومات المنتجات.',
    feedbackTitle: 'إرسال ملاحظات',
    feedbackPlaceholder: 'أخبرنا برأيك...',
    cancel: 'إلغاء',
    submit: 'إرسال',
    thankYou:
      'شكرًا لملاحظاتك! يعمل NutriScan AI باستمرار على التحسين.',
    installApp: 'إضافة إلى الشاشة الرئيسية',
    installDescription:
      'ثبّت NutriScan AI على جهازك للوصول السريع.',
    install: 'تثبيت',
    creator: 'المطور',
    createdBy: 'تم إنشاؤه بواسطة',
    project: 'مشروع هندسة الذكاء الاصطناعي وعلوم البيانات',
    creatorInfo:
      'تم إنشاء NutriScan AI كمشروع هندسي يركز على تحليل الطعام باستخدام الذكاء الاصطناعي.',
    unavailableInstall:
      'التثبيت غير متاح حاليًا في هذا المتصفح.',
  },
} as const;

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage } = useTheme();

  const [dietary, setDietary] = useState<string[]>(() => {
    const saved = localStorage.getItem('nutriscan_dietary');

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['Diabetic-Friendly', 'Low-Sodium'];
      }
    }

    return ['Diabetic-Friendly', 'Low-Sodium'];
  });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installAvailable, setInstallAvailable] = useState(false);

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Hindi',
    'Arabic',
  ] as const;

  const dietaryOptions = [
    'Diabetic-Friendly',
    'Vegan',
    'Gluten-Free',
    'Nut-Free',
    'Low-Sodium',
    'Pregnancy-Safe',
    'Keto-Friendly',
  ];

  const isDark = theme === 'dark';
  const text = labels[language];

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;

      installEvent.preventDefault();

      setDeferredPrompt(installEvent);
      setInstallAvailable(true);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const toggleDietary = (item: string) => {
    const updated = dietary.includes(item)
      ? dietary.filter((d) => d !== item)
      : [...dietary, item];

    setDietary(updated);

    localStorage.setItem(
      'nutriscan_dietary',
      JSON.stringify(updated)
    );
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setInstallAvailable(false);
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();

    setFeedbackSent(true);

    setTimeout(() => {
      setFeedbackSent(false);
      setShowFeedbackModal(false);
      setFeedbackText('');
    }, 2000);
  };

  const translatedDietaryOption = (option: string) => {
    const translations: Record<
      string,
      Record<string, string>
    > = {
      'Diabetic-Friendly': {
        English: 'Diabetic-Friendly',
        Spanish: 'Apto para diabéticos',
        French: 'Adapté aux diabétiques',
        German: 'Diabetesfreundlich',
        Hindi: 'मधुमेह के अनुकूल',
        Arabic: 'مناسب لمرضى السكري',
      },
      Vegan: {
        English: 'Vegan',
        Spanish: 'Vegano',
        French: 'Végétalien',
        German: 'Vegan',
        Hindi: 'शाकाहारी',
        Arabic: 'نباتي',
      },
      'Gluten-Free': {
        English: 'Gluten-Free',
        Spanish: 'Sin gluten',
        French: 'Sans gluten',
        German: 'Glutenfrei',
        Hindi: 'ग्लूटेन मुक्त',
        Arabic: 'خالٍ من الغلوتين',
      },
      'Nut-Free': {
        English: 'Nut-Free',
        Spanish: 'Sin frutos secos',
        French: 'Sans fruits à coque',
        German: 'Nussfrei',
        Hindi: 'नट-मुक्त',
        Arabic: 'خالٍ من المكسرات',
      },
      'Low-Sodium': {
        English: 'Low-Sodium',
        Spanish: 'Bajo en sodio',
        French: 'Faible en sodium',
        German: 'Natriumarm',
        Hindi: 'कम सोडियम',
        Arabic: 'منخفض الصوديوم',
      },
      'Pregnancy-Safe': {
        English: 'Pregnancy-Safe',
        Spanish: 'Seguro durante el embarazo',
        French: 'Adapté à la grossesse',
        German: 'Schwangerschaftsgeeignet',
        Hindi: 'गर्भावस्था के लिए सुरक्षित',
        Arabic: 'آمن للحمل',
      },
      'Keto-Friendly': {
        English: 'Keto-Friendly',
        Spanish: 'Apto para dieta keto',
        French: 'Compatible avec le régime keto',
        German: 'Keto-freundlich',
        Hindi: 'कीटो के अनुकूल',
        Arabic: 'مناسب للكيتو',
      },
    };

    return translations[option]?.[language] ?? option;
  };

  return (
    <div
      className={`min-h-screen pb-28 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* HEADER */}
      <div
        className={`p-4 border-b sticky top-0 z-30 backdrop-blur-md transition-colors duration-300 ${
          isDark
            ? 'border-slate-800 bg-slate-900/90'
            : 'border-slate-200 bg-white/90'
        }`}
      >
        <div className="max-w-md mx-auto flex items-center gap-2">
          <div
            className={`p-2 rounded-xl ${
              isDark
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            <Settings className="w-5 h-5" />
          </div>

          <h2
            className={`text-base font-bold font-['Outfit'] ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {text.preferences}
          </h2>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* APPEARANCE */}
        <div
          className={`p-4 rounded-3xl border space-y-3 ${
            isDark
              ? 'bg-slate-900 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <h3
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {text.appearance}
          </h3>

          <div
            className={`flex items-center justify-between p-2.5 rounded-2xl border ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}

              <div>
                <span
                  className={`text-xs font-bold block ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {text.themeMode}
                </span>

                <span
                  className={`text-[10px] ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {isDark ? text.darkMode : text.lightMode}
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              {text.toggleTheme}
            </button>
          </div>
        </div>

        {/* LANGUAGE */}
        <div
          className={`p-4 rounded-3xl border space-y-3 ${
            isDark
              ? 'bg-slate-900 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <h3
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            {text.language}
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`p-2.5 rounded-2xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                  language === lang
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isDark
                    ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{lang}</span>

                {language === lang && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* DIETARY */}
        <div
          className={`p-4 rounded-3xl border space-y-3 ${
            isDark
              ? 'bg-slate-900 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <h3
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            {text.dietaryPreferences}
          </h3>

          <p
            className={`text-[11px] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {text.selectedPreferences}
          </p>

          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((opt) => {
              const active = dietary.includes(opt);

              return (
                <button
                  key={opt}
                  onClick={() => toggleDietary(opt)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                      : isDark
                      ? 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  )}

                  <span>{translatedDietaryOption(opt)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PWA INSTALL */}
        <div
          className={`p-4 rounded-3xl border space-y-3 ${
            isDark
              ? 'bg-slate-900 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <h3
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            {text.installApp}
          </h3>

          <p
            className={`text-[11px] leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {text.installDescription}
          </p>

          {installAvailable && deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              {text.install}
            </button>
          ) : (
            <p
              className={`text-[10px] ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {text.unavailableInstall}
            </p>
          )}
        </div>

        {/* ABOUT & LEGAL */}
        <div
          className={`p-4 rounded-3xl border space-y-2 ${
            isDark
              ? 'bg-slate-900 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <h3
            className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {text.aboutLegal}
          </h3>

          {/* FEEDBACK */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              {text.sendFeedback}
            </span>

            <ChevronRight
              className={`w-4 h-4 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            />
          </button>

          {/* PRIVACY */}
          <div
            className={`p-2.5 rounded-2xl border space-y-1 ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-bold ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              {text.privacy}
            </div>

            <p
              className={`text-[11px] leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {text.privacyText}
            </p>
          </div>

          {/* ABOUT */}
          <div
            className={`p-2.5 rounded-2xl border space-y-1 ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-bold ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <Info className="w-4 h-4 text-amber-400" />
              {text.about}
            </div>

            <p
              className={`text-[11px] leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {text.aboutText}
            </p>
          </div>
        </div>

        {/* CREATOR */}
        <div
          className={`p-4 rounded-3xl border space-y-3 ${
            isDark
              ? 'bg-slate-900 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <h3
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <User className="w-4 h-4 text-emerald-400" />
            {text.creator}
          </h3>

          <div
            className={`p-3 rounded-2xl border ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <p
              className={`text-xs font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {text.createdBy}: Umar Suhail
            </p>

            <p
              className={`text-[11px] mt-1 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {text.project}
            </p>

            <p
              className={`text-[11px] mt-2 leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {text.creatorInfo}
            </p>
          </div>
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm border rounded-3xl p-5 space-y-4 shadow-2xl ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              {text.feedbackTitle}
            </h3>

            {feedbackSent ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 text-center font-bold">
                {text.thankYou}
              </div>
            ) : (
              <form
                onSubmit={handleSendFeedback}
                className="space-y-3"
              >
                <textarea
                  required
                  rows={4}
                  placeholder={text.feedbackPlaceholder}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className={`px-3 py-1.5 text-xs rounded-xl ${
                      isDark
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {text.cancel}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {text.submit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};