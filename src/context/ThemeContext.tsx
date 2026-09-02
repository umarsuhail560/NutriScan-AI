import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';

export type Language =
  | 'English'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Hindi'
  | 'Arabic';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  English: {
    // Header
    online: 'Online',
    offlineModeActive: 'Offline Mode Active',
    offline: 'Offline',
    installApp: 'Install App',
    toggleTheme: 'Toggle Theme',
    user: 'User',
    signIn: 'Sign In',

    // Navigation
    home: 'Home',
    scan: 'Scan',
    search: 'Search',
    history: 'History',
    profile: 'Profile',
    settings: 'Settings',

    // Dashboard
    welcomeBack: 'Welcome Back',
    readyToScan: 'Ready to scan your food?',
    scanFood: 'Scan Food',
    scanProduct: 'Scan Product',
    uploadImage: 'Upload Image',
    recentScans: 'Recent Scans',
    totalScans: 'Total Scans',
    favorites: 'Favorites',
    healthScore: 'Health Score',
    aiTip: 'AI Tip',
    quickActions: 'Quick Actions',
    viewHistory: 'View History',
    viewFavorites: 'View Favorites',
    noRecentScans: 'No recent scans',
    startScanning: 'Start scanning to see your results here.',

    // Scanner
    camera: 'Camera',
    upload: 'Upload',
    takePhoto: 'Take Photo',
    chooseImage: 'Choose Image',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    analyzingProduct: 'Analyzing product...',
    retake: 'Retake',
    selectImage: 'Select Image',
    dataUnavailable: 'Data unavailable',
    pointCameraAtProduct: 'Point your camera at the food package',
    uploadFoodImage: 'Upload a clear image of the food package',
    analysisFailed: 'Analysis failed',
    tryAgain: 'Try Again',

    // Search
    searchProducts: 'Search Products',
    searchPlaceholder: 'Search for a product...',
    searchResults: 'Search Results',
    noResults: 'No products found',
    searchFailed: 'Search failed',
    productName: 'Product Name',
    brand: 'Brand',
    calories: 'Calories',
    sugar: 'Sugar',
    protein: 'Protein',

    // Results
    result: 'Result',
    nutrition: 'Nutrition',
    suitability: 'Suitability',
    summary: 'Summary',
    warnings: 'Warnings',
    goodPoints: 'Good Points',
    benefits: 'Benefits',
    alternatives: 'Alternatives',
    dailyAdvice: 'Daily Advice',
    servingSize: 'Serving Size',
    fat: 'Fat',
    salt: 'Salt',
    fiber: 'Fiber',
    carbohydrates: 'Carbohydrates',
    save: 'Save',
    saved: 'Saved',
    favorite: 'Favorite',
    removeFavorite: 'Remove Favorite',
    back: 'Back',

    // Suitability
    children: 'Children',
    diabetics: 'Diabetics',
    pregnantWomen: 'Pregnant Women',
    elderlyPeople: 'Elderly People',
    gymAthletes: 'Gym & Athletes',
    suitable: 'Suitable',
    caution: 'Caution',
    notSuitable: 'Not Suitable',

    // Risk / grades
    veryHealthy: 'Very Healthy',
    healthy: 'Healthy',
    moderate: 'Moderate',
    unhealthy: 'Unhealthy',
    avoidFrequently: 'Avoid Frequently',

    // History
    scanHistory: 'Scan History',
    noHistory: 'No scan history',
    delete: 'Delete',
    deleteScan: 'Delete Scan',
    confirmDelete: 'Are you sure you want to delete this scan?',

    // Profile
    myProfile: 'My Profile',
    account: 'Account',
    achievements: 'Achievements',
    scansCompleted: 'Scans Completed',
    favoriteProducts: 'Favorite Products',
    signOut: 'Sign Out',
    switchAccount: 'Switch Account',

    // Settings
    preferences: 'Preferences',
    appearance: 'Appearance',
    themeMode: 'Theme Mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    dietaryPreferences: 'Dietary Preferences',
    selectedPreferences: 'Selected Preferences',
    sendFeedback: 'Send Feedback',
    privacy: 'Privacy',
    about: 'About',
    cancel: 'Cancel',
    submit: 'Submit',
    feedbackTitle: 'Send Feedback',
    feedbackPlaceholder: 'Tell us what you think...',

    // PWA
    addToHomeScreen: 'Add to Home Screen',
    installNutriScan: 'Install NutriScan AI',
    installDescription:
      'Install the app on your device for quick access.',
    install: 'Install',
    later: 'Later',

    // Creator
    creator: 'Creator',
    createdBy: 'Created By',
    aboutNutriScan: 'About NutriScan AI',
    project: 'Project',

    // General
    loading: 'Loading...',
    close: 'Close',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
  },

  Spanish: {
    // Header
    online: 'En línea',
    offlineModeActive: 'Modo sin conexión activo',
    offline: 'Sin conexión',
    installApp: 'Instalar aplicación',
    toggleTheme: 'Cambiar tema',
    user: 'Usuario',
    signIn: 'Iniciar sesión',

    // Navigation
    home: 'Inicio',
    scan: 'Escanear',
    search: 'Buscar',
    history: 'Historial',
    profile: 'Perfil',
    settings: 'Configuración',

    // Dashboard
    welcomeBack: 'Bienvenido de nuevo',
    readyToScan: '¿Listo para escanear tu comida?',
    scanFood: 'Escanear comida',
    scanProduct: 'Escanear producto',
    uploadImage: 'Subir imagen',
    recentScans: 'Escaneos recientes',
    totalScans: 'Escaneos totales',
    favorites: 'Favoritos',
    healthScore: 'Puntuación de salud',
    aiTip: 'Consejo de IA',
    quickActions: 'Acciones rápidas',
    viewHistory: 'Ver historial',
    viewFavorites: 'Ver favoritos',
    noRecentScans: 'No hay escaneos recientes',
    startScanning: 'Comienza a escanear para ver tus resultados aquí.',

    // Scanner
    camera: 'Cámara',
    upload: 'Subir',
    takePhoto: 'Tomar foto',
    chooseImage: 'Elegir imagen',
    analyze: 'Analizar',
    analyzing: 'Analizando...',
    analyzingProduct: 'Analizando producto...',
    retake: 'Volver a tomar',
    selectImage: 'Seleccionar imagen',
    dataUnavailable: 'Datos no disponibles',
    pointCameraAtProduct: 'Apunta la cámara al paquete de comida',
    uploadFoodImage: 'Sube una imagen clara del paquete de comida',
    analysisFailed: 'El análisis falló',
    tryAgain: 'Intentar de nuevo',

    // Search
    searchProducts: 'Buscar productos',
    searchPlaceholder: 'Buscar un producto...',
    searchResults: 'Resultados de búsqueda',
    noResults: 'No se encontraron productos',
    searchFailed: 'La búsqueda falló',
    productName: 'Nombre del producto',
    brand: 'Marca',
    calories: 'Calorías',
    sugar: 'Azúcar',
    protein: 'Proteína',

    // Results
    result: 'Resultado',
    nutrition: 'Nutrición',
    suitability: 'Adecuación',
    summary: 'Resumen',
    warnings: 'Advertencias',
    goodPoints: 'Puntos positivos',
    benefits: 'Beneficios',
    alternatives: 'Alternativas',
    dailyAdvice: 'Consejo diario',
    servingSize: 'Tamaño de porción',
    fat: 'Grasa',
    salt: 'Sal',
    fiber: 'Fibra',
    carbohydrates: 'Carbohidratos',
    save: 'Guardar',
    saved: 'Guardado',
    favorite: 'Favorito',
    removeFavorite: 'Eliminar favorito',
    back: 'Atrás',

    // Suitability
    children: 'Niños',
    diabetics: 'Diabéticos',
    pregnantWomen: 'Mujeres embarazadas',
    elderlyPeople: 'Personas mayores',
    gymAthletes: 'Gimnasio y atletas',
    suitable: 'Adecuado',
    caution: 'Precaución',
    notSuitable: 'No adecuado',

    // Risk
    veryHealthy: 'Muy saludable',
    healthy: 'Saludable',
    moderate: 'Moderado',
    unhealthy: 'No saludable',
    avoidFrequently: 'Evitar frecuentemente',

    // History
    scanHistory: 'Historial de escaneos',
    noHistory: 'No hay historial de escaneos',
    delete: 'Eliminar',
    deleteScan: 'Eliminar escaneo',
    confirmDelete: '¿Seguro que quieres eliminar este escaneo?',

    // Profile
    myProfile: 'Mi perfil',
    account: 'Cuenta',
    achievements: 'Logros',
    scansCompleted: 'Escaneos completados',
    favoriteProducts: 'Productos favoritos',
    signOut: 'Cerrar sesión',
    switchAccount: 'Cambiar cuenta',

    // Settings
    preferences: 'Preferencias',
    appearance: 'Apariencia',
    themeMode: 'Modo de tema',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    language: 'Idioma',
    dietaryPreferences: 'Preferencias dietéticas',
    selectedPreferences: 'Preferencias seleccionadas',
    sendFeedback: 'Enviar comentarios',
    privacy: 'Privacidad',
    about: 'Acerca de',
    cancel: 'Cancelar',
    submit: 'Enviar',
    feedbackTitle: 'Enviar comentarios',
    feedbackPlaceholder: 'Cuéntanos qué piensas...',

    // PWA
    addToHomeScreen: 'Añadir a la pantalla de inicio',
    installNutriScan: 'Instalar NutriScan AI',
    installDescription:
      'Instala la aplicación en tu dispositivo para acceder rápidamente.',
    install: 'Instalar',
    later: 'Más tarde',

    // Creator
    creator: 'Creador',
    createdBy: 'Creado por',
    aboutNutriScan: 'Acerca de NutriScan AI',
    project: 'Proyecto',

    // General
    loading: 'Cargando...',
    close: 'Cerrar',
    error: 'Error',
    success: 'Éxito',
    yes: 'Sí',
    no: 'No',
  },

  French: {
    // Header
    online: 'En ligne',
    offlineModeActive: 'Mode hors ligne actif',
    offline: 'Hors ligne',
    installApp: 'Installer l’application',
    toggleTheme: 'Changer de thème',
    user: 'Utilisateur',
    signIn: 'Se connecter',

    // Navigation
    home: 'Accueil',
    scan: 'Scanner',
    search: 'Rechercher',
    history: 'Historique',
    profile: 'Profil',
    settings: 'Paramètres',

    // Dashboard
    welcomeBack: 'Bon retour',
    readyToScan: 'Prêt à scanner votre nourriture ?',
    scanFood: 'Scanner un aliment',
    scanProduct: 'Scanner un produit',
    uploadImage: 'Télécharger une image',
    recentScans: 'Scans récents',
    totalScans: 'Scans totaux',
    favorites: 'Favoris',
    healthScore: 'Score santé',
    aiTip: 'Conseil IA',
    quickActions: 'Actions rapides',
    viewHistory: 'Voir l’historique',
    viewFavorites: 'Voir les favoris',
    noRecentScans: 'Aucun scan récent',
    startScanning: 'Commencez à scanner pour voir vos résultats ici.',

    // Scanner
    camera: 'Caméra',
    upload: 'Télécharger',
    takePhoto: 'Prendre une photo',
    chooseImage: 'Choisir une image',
    analyze: 'Analyser',
    analyzing: 'Analyse...',
    analyzingProduct: 'Analyse du produit...',
    retake: 'Reprendre',
    selectImage: 'Sélectionner une image',
    dataUnavailable: 'Données indisponibles',
    pointCameraAtProduct: 'Pointez la caméra vers l’emballage alimentaire',
    uploadFoodImage: 'Téléchargez une image claire de l’emballage alimentaire',
    analysisFailed: 'Échec de l’analyse',
    tryAgain: 'Réessayer',

    // Search
    searchProducts: 'Rechercher des produits',
    searchPlaceholder: 'Rechercher un produit...',
    searchResults: 'Résultats de recherche',
    noResults: 'Aucun produit trouvé',
    searchFailed: 'Échec de la recherche',
    productName: 'Nom du produit',
    brand: 'Marque',
    calories: 'Calories',
    sugar: 'Sucre',
    protein: 'Protéines',

    // Results
    result: 'Résultat',
    nutrition: 'Nutrition',
    suitability: 'Compatibilité',
    summary: 'Résumé',
    warnings: 'Avertissements',
    goodPoints: 'Points positifs',
    benefits: 'Bienfaits',
    alternatives: 'Alternatives',
    dailyAdvice: 'Conseil quotidien',
    servingSize: 'Portion',
    fat: 'Lipides',
    salt: 'Sel',
    fiber: 'Fibres',
    carbohydrates: 'Glucides',
    save: 'Enregistrer',
    saved: 'Enregistré',
    favorite: 'Favori',
    removeFavorite: 'Retirer des favoris',
    back: 'Retour',

    // Suitability
    children: 'Enfants',
    diabetics: 'Diabétiques',
    pregnantWomen: 'Femmes enceintes',
    elderlyPeople: 'Personnes âgées',
    gymAthletes: 'Sportifs et salle de sport',
    suitable: 'Convient',
    caution: 'Attention',
    notSuitable: 'Ne convient pas',

    // Risk
    veryHealthy: 'Très sain',
    healthy: 'Sain',
    moderate: 'Modéré',
    unhealthy: 'Malsain',
    avoidFrequently: 'À éviter fréquemment',

    // History
    scanHistory: 'Historique des scans',
    noHistory: 'Aucun historique de scans',
    delete: 'Supprimer',
    deleteScan: 'Supprimer le scan',
    confirmDelete: 'Voulez-vous vraiment supprimer ce scan ?',

    // Profile
    myProfile: 'Mon profil',
    account: 'Compte',
    achievements: 'Réalisations',
    scansCompleted: 'Scans effectués',
    favoriteProducts: 'Produits favoris',
    signOut: 'Se déconnecter',
    switchAccount: 'Changer de compte',

    // Settings
    preferences: 'Préférences',
    appearance: 'Apparence',
    themeMode: 'Mode du thème',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    language: 'Langue',
    dietaryPreferences: 'Préférences alimentaires',
    selectedPreferences: 'Préférences sélectionnées',
    sendFeedback: 'Envoyer des commentaires',
    privacy: 'Confidentialité',
    about: 'À propos',
    cancel: 'Annuler',
    submit: 'Envoyer',
    feedbackTitle: 'Envoyer des commentaires',
    feedbackPlaceholder: 'Dites-nous ce que vous pensez...',

    // PWA
    addToHomeScreen: 'Ajouter à l’écran d’accueil',
    installNutriScan: 'Installer NutriScan AI',
    installDescription:
      'Installez l’application sur votre appareil pour un accès rapide.',
    install: 'Installer',
    later: 'Plus tard',

    // Creator
    creator: 'Créateur',
    createdBy: 'Créé par',
    aboutNutriScan: 'À propos de NutriScan AI',
    project: 'Projet',

    // General
    loading: 'Chargement...',
    close: 'Fermer',
    error: 'Erreur',
    success: 'Succès',
    yes: 'Oui',
    no: 'Non',
  },

  German: {
    // Header
    online: 'Online',
    offlineModeActive: 'Offline-Modus aktiv',
    offline: 'Offline',
    installApp: 'App installieren',
    toggleTheme: 'Design wechseln',
    user: 'Benutzer',
    signIn: 'Anmelden',

    // Navigation
    home: 'Startseite',
    scan: 'Scannen',
    search: 'Suchen',
    history: 'Verlauf',
    profile: 'Profil',
    settings: 'Einstellungen',

    // Dashboard
    welcomeBack: 'Willkommen zurück',
    readyToScan: 'Bereit, dein Essen zu scannen?',
    scanFood: 'Essen scannen',
    scanProduct: 'Produkt scannen',
    uploadImage: 'Bild hochladen',
    recentScans: 'Letzte Scans',
    totalScans: 'Scans insgesamt',
    favorites: 'Favoriten',
    healthScore: 'Gesundheitswert',
    aiTip: 'KI-Tipp',
    quickActions: 'Schnellaktionen',
    viewHistory: 'Verlauf anzeigen',
    viewFavorites: 'Favoriten anzeigen',
    noRecentScans: 'Keine aktuellen Scans',
    startScanning: 'Starte einen Scan, um deine Ergebnisse hier zu sehen.',

    // Scanner
    camera: 'Kamera',
    upload: 'Hochladen',
    takePhoto: 'Foto aufnehmen',
    chooseImage: 'Bild auswählen',
    analyze: 'Analysieren',
    analyzing: 'Analyse...',
    analyzingProduct: 'Produkt wird analysiert...',
    retake: 'Erneut aufnehmen',
    selectImage: 'Bild auswählen',
    dataUnavailable: 'Daten nicht verfügbar',
    pointCameraAtProduct: 'Richte die Kamera auf die Lebensmittelverpackung',
    uploadFoodImage: 'Lade ein klares Bild der Lebensmittelverpackung hoch',
    analysisFailed: 'Analyse fehlgeschlagen',
    tryAgain: 'Erneut versuchen',

    // Search
    searchProducts: 'Produkte suchen',
    searchPlaceholder: 'Nach einem Produkt suchen...',
    searchResults: 'Suchergebnisse',
    noResults: 'Keine Produkte gefunden',
    searchFailed: 'Suche fehlgeschlagen',
    productName: 'Produktname',
    brand: 'Marke',
    calories: 'Kalorien',
    sugar: 'Zucker',
    protein: 'Protein',

    // Results
    result: 'Ergebnis',
    nutrition: 'Ernährung',
    suitability: 'Eignung',
    summary: 'Zusammenfassung',
    warnings: 'Warnungen',
    goodPoints: 'Positive Punkte',
    benefits: 'Vorteile',
    alternatives: 'Alternativen',
    dailyAdvice: 'Täglicher Tipp',
    servingSize: 'Portionsgröße',
    fat: 'Fett',
    salt: 'Salz',
    fiber: 'Ballaststoffe',
    carbohydrates: 'Kohlenhydrate',
    save: 'Speichern',
    saved: 'Gespeichert',
    favorite: 'Favorit',
    removeFavorite: 'Aus Favoriten entfernen',
    back: 'Zurück',

    // Suitability
    children: 'Kinder',
    diabetics: 'Diabetiker',
    pregnantWomen: 'Schwangere',
    elderlyPeople: 'Ältere Menschen',
    gymAthletes: 'Fitness & Sportler',
    suitable: 'Geeignet',
    caution: 'Vorsicht',
    notSuitable: 'Nicht geeignet',

    // Risk
    veryHealthy: 'Sehr gesund',
    healthy: 'Gesund',
    moderate: 'Mäßig',
    unhealthy: 'Ungesund',
    avoidFrequently: 'Häufig vermeiden',

    // History
    scanHistory: 'Scan-Verlauf',
    noHistory: 'Kein Scan-Verlauf',
    delete: 'Löschen',
    deleteScan: 'Scan löschen',
    confirmDelete: 'Möchtest du diesen Scan wirklich löschen?',

    // Profile
    myProfile: 'Mein Profil',
    account: 'Konto',
    achievements: 'Erfolge',
    scansCompleted: 'Abgeschlossene Scans',
    favoriteProducts: 'Lieblingsprodukte',
    signOut: 'Abmelden',
    switchAccount: 'Konto wechseln',

    // Settings
    preferences: 'Einstellungen',
    appearance: 'Darstellung',
    themeMode: 'Design-Modus',
    darkMode: 'Dunkler Modus',
    lightMode: 'Heller Modus',
    language: 'Sprache',
    dietaryPreferences: 'Ernährungseinstellungen',
    selectedPreferences: 'Ausgewählte Einstellungen',
    sendFeedback: 'Feedback senden',
    privacy: 'Datenschutz',
    about: 'Über',
    cancel: 'Abbrechen',
    submit: 'Senden',
    feedbackTitle: 'Feedback senden',
    feedbackPlaceholder: 'Was denkst du?...',

    // PWA
    addToHomeScreen: 'Zum Startbildschirm hinzufügen',
    installNutriScan: 'NutriScan AI installieren',
    installDescription:
      'Installiere die App auf deinem Gerät für schnellen Zugriff.',
    install: 'Installieren',
    later: 'Später',

    // Creator
    creator: 'Ersteller',
    createdBy: 'Erstellt von',
    aboutNutriScan: 'Über NutriScan AI',
    project: 'Projekt',

    // General
    loading: 'Wird geladen...',
    close: 'Schließen',
    error: 'Fehler',
    success: 'Erfolgreich',
    yes: 'Ja',
    no: 'Nein',
  },

  Hindi: {
    // Header
    online: 'ऑनलाइन',
    offlineModeActive: 'ऑफलाइन मोड सक्रिय',
    offline: 'ऑफलाइन',
    installApp: 'ऐप इंस्टॉल करें',
    toggleTheme: 'थीम बदलें',
    user: 'उपयोगकर्ता',
    signIn: 'साइन इन',

    // Navigation
    home: 'होम',
    scan: 'स्कैन',
    search: 'खोजें',
    history: 'इतिहास',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',

    // Dashboard
    welcomeBack: 'वापसी पर स्वागत है',
    readyToScan: 'क्या आप अपना भोजन स्कैन करने के लिए तैयार हैं?',
    scanFood: 'भोजन स्कैन करें',
    scanProduct: 'उत्पाद स्कैन करें',
    uploadImage: 'छवि अपलोड करें',
    recentScans: 'हाल के स्कैन',
    totalScans: 'कुल स्कैन',
    favorites: 'पसंदीदा',
    healthScore: 'स्वास्थ्य स्कोर',
    aiTip: 'AI सुझाव',
    quickActions: 'त्वरित कार्य',
    viewHistory: 'इतिहास देखें',
    viewFavorites: 'पसंदीदा देखें',
    noRecentScans: 'कोई हाल का स्कैन नहीं',
    startScanning: 'अपने परिणाम देखने के लिए स्कैन शुरू करें।',

    // Scanner
    camera: 'कैमरा',
    upload: 'अपलोड',
    takePhoto: 'फोटो लें',
    chooseImage: 'छवि चुनें',
    analyze: 'विश्लेषण करें',
    analyzing: 'विश्लेषण हो रहा है...',
    analyzingProduct: 'उत्पाद का विश्लेषण हो रहा है...',
    retake: 'दोबारा लें',
    selectImage: 'छवि चुनें',
    dataUnavailable: 'डेटा उपलब्ध नहीं',
    pointCameraAtProduct: 'कैमरा खाद्य पैकेज की ओर रखें',
    uploadFoodImage: 'खाद्य पैकेज की स्पष्ट छवि अपलोड करें',
    analysisFailed: 'विश्लेषण विफल हुआ',
    tryAgain: 'फिर से प्रयास करें',

    // Search
    searchProducts: 'उत्पाद खोजें',
    searchPlaceholder: 'किसी उत्पाद को खोजें...',
    searchResults: 'खोज परिणाम',
    noResults: 'कोई उत्पाद नहीं मिला',
    searchFailed: 'खोज विफल हुई',
    productName: 'उत्पाद का नाम',
    brand: 'ब्रांड',
    calories: 'कैलोरी',
    sugar: 'चीनी',
    protein: 'प्रोटीन',

    // Results
    result: 'परिणाम',
    nutrition: 'पोषण',
    suitability: 'उपयुक्तता',
    summary: 'सारांश',
    warnings: 'चेतावनियाँ',
    goodPoints: 'अच्छी बातें',
    benefits: 'लाभ',
    alternatives: 'विकल्प',
    dailyAdvice: 'दैनिक सलाह',
    servingSize: 'सर्विंग आकार',
    fat: 'वसा',
    salt: 'नमक',
    fiber: 'फाइबर',
    carbohydrates: 'कार्बोहाइड्रेट',
    save: 'सहेजें',
    saved: 'सहेजा गया',
    favorite: 'पसंदीदा',
    removeFavorite: 'पसंदीदा से हटाएँ',
    back: 'वापस',

    // Suitability
    children: 'बच्चे',
    diabetics: 'मधुमेह रोगी',
    pregnantWomen: 'गर्भवती महिलाएँ',
    elderlyPeople: 'बुजुर्ग',
    gymAthletes: 'जिम और एथलीट',
    suitable: 'उपयुक्त',
    caution: 'सावधानी',
    notSuitable: 'उपयुक्त नहीं',

    // Risk
    veryHealthy: 'बहुत स्वस्थ',
    healthy: 'स्वस्थ',
    moderate: 'मध्यम',
    unhealthy: 'अस्वस्थ',
    avoidFrequently: 'अक्सर न लें',

    // History
    scanHistory: 'स्कैन इतिहास',
    noHistory: 'कोई स्कैन इतिहास नहीं',
    delete: 'हटाएँ',
    deleteScan: 'स्कैन हटाएँ',
    confirmDelete: 'क्या आप वाकई इस स्कैन को हटाना चाहते हैं?',

    // Profile
    myProfile: 'मेरी प्रोफ़ाइल',
    account: 'खाता',
    achievements: 'उपलब्धियाँ',
    scansCompleted: 'पूर्ण किए गए स्कैन',
    favoriteProducts: 'पसंदीदा उत्पाद',
    signOut: 'साइन आउट',
    switchAccount: 'खाता बदलें',

    // Settings
    preferences: 'प्राथमिकताएँ',
    appearance: 'दिखावट',
    themeMode: 'थीम मोड',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    language: 'भाषा',
    dietaryPreferences: 'आहार प्राथमिकताएँ',
    selectedPreferences: 'चयनित प्राथमिकताएँ',
    sendFeedback: 'फीडबैक भेजें',
    privacy: 'गोपनीयता',
    about: 'जानकारी',
    cancel: 'रद्द करें',
    submit: 'सबमिट करें',
    feedbackTitle: 'फीडबैक भेजें',
    feedbackPlaceholder: 'हमें बताएं कि आप क्या सोचते हैं...',

    // PWA
    addToHomeScreen: 'होम स्क्रीन पर जोड़ें',
    installNutriScan: 'NutriScan AI इंस्टॉल करें',
    installDescription:
      'त्वरित पहुँच के लिए ऐप को अपने डिवाइस पर इंस्टॉल करें।',
    install: 'इंस्टॉल करें',
    later: 'बाद में',

    // Creator
    creator: 'निर्माता',
    createdBy: 'द्वारा बनाया गया',
    aboutNutriScan: 'NutriScan AI के बारे में',
    project: 'प्रोजेक्ट',

    // General
    loading: 'लोड हो रहा है...',
    close: 'बंद करें',
    error: 'त्रुटि',
    success: 'सफल',
    yes: 'हाँ',
    no: 'नहीं',
  },

  Arabic: {
    // Header
    online: 'متصل',
    offlineModeActive: 'وضع عدم الاتصال نشط',
    offline: 'غير متصل',
    installApp: 'تثبيت التطبيق',
    toggleTheme: 'تغيير المظهر',
    user: 'المستخدم',
    signIn: 'تسجيل الدخول',

    // Navigation
    home: 'الرئيسية',
    scan: 'مسح',
    search: 'بحث',
    history: 'السجل',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',

    // Dashboard
    welcomeBack: 'مرحباً بعودتك',
    readyToScan: 'هل أنت مستعد لمسح طعامك؟',
    scanFood: 'مسح الطعام',
    scanProduct: 'مسح المنتج',
    uploadImage: 'رفع صورة',
    recentScans: 'عمليات المسح الأخيرة',
    totalScans: 'إجمالي عمليات المسح',
    favorites: 'المفضلة',
    healthScore: 'درجة الصحة',
    aiTip: 'نصيحة الذكاء الاصطناعي',
    quickActions: 'إجراءات سريعة',
    viewHistory: 'عرض السجل',
    viewFavorites: 'عرض المفضلة',
    noRecentScans: 'لا توجد عمليات مسح حديثة',
    startScanning: 'ابدأ المسح لرؤية نتائجك هنا.',

    // Scanner
    camera: 'الكاميرا',
    upload: 'رفع',
    takePhoto: 'التقاط صورة',
    chooseImage: 'اختيار صورة',
    analyze: 'تحليل',
    analyzing: 'جارٍ التحليل...',
    analyzingProduct: 'جارٍ تحليل المنتج...',
    retake: 'إعادة الالتقاط',
    selectImage: 'اختيار صورة',
    dataUnavailable: 'البيانات غير متوفرة',
    pointCameraAtProduct: 'وجّه الكاميرا نحو عبوة الطعام',
    uploadFoodImage: 'ارفع صورة واضحة لعبوة الطعام',
    analysisFailed: 'فشل التحليل',
    tryAgain: 'حاول مرة أخرى',

    // Search
    searchProducts: 'البحث عن المنتجات',
    searchPlaceholder: 'ابحث عن منتج...',
    searchResults: 'نتائج البحث',
    noResults: 'لم يتم العثور على منتجات',
    searchFailed: 'فشل البحث',
    productName: 'اسم المنتج',
    brand: 'العلامة التجارية',
    calories: 'السعرات الحرارية',
    sugar: 'السكر',
    protein: 'البروتين',

    // Results
    result: 'النتيجة',
    nutrition: 'التغذية',
    suitability: 'الملاءمة',
    summary: 'الملخص',
    warnings: 'تحذيرات',
    goodPoints: 'النقاط الإيجابية',
    benefits: 'الفوائد',
    alternatives: 'البدائل',
    dailyAdvice: 'النصيحة اليومية',
    servingSize: 'حجم الحصة',
    fat: 'الدهون',
    salt: 'الملح',
    fiber: 'الألياف',
    carbohydrates: 'الكربوهيدرات',
    save: 'حفظ',
    saved: 'تم الحفظ',
    favorite: 'مفضل',
    removeFavorite: 'إزالة من المفضلة',
    back: 'رجوع',

    // Suitability
    children: 'الأطفال',
    diabetics: 'مرضى السكري',
    pregnantWomen: 'النساء الحوامل',
    elderlyPeople: 'كبار السن',
    gymAthletes: 'الرياضيون والجيم',
    suitable: 'مناسب',
    caution: 'تحذير',
    notSuitable: 'غير مناسب',

    // Risk
    veryHealthy: 'صحي جداً',
    healthy: 'صحي',
    moderate: 'متوسط',
    unhealthy: 'غير صحي',
    avoidFrequently: 'تجنب تناوله بشكل متكرر',

    // History
    scanHistory: 'سجل عمليات المسح',
    noHistory: 'لا يوجد سجل للمسح',
    delete: 'حذف',
    deleteScan: 'حذف المسح',
    confirmDelete: 'هل أنت متأكد من أنك تريد حذف عملية المسح هذه؟',

    // Profile
    myProfile: 'ملفي الشخصي',
    account: 'الحساب',
    achievements: 'الإنجازات',
    scansCompleted: 'عمليات المسح المكتملة',
    favoriteProducts: 'المنتجات المفضلة',
    signOut: 'تسجيل الخروج',
    switchAccount: 'تبديل الحساب',

    // Settings
    preferences: 'التفضيلات',
    appearance: 'المظهر',
    themeMode: 'وضع المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'اللغة',
    dietaryPreferences: 'التفضيلات الغذائية',
    selectedPreferences: 'التفضيلات المحددة',
    sendFeedback: 'إرسال ملاحظات',
    privacy: 'الخصوصية',
    about: 'حول',
    cancel: 'إلغاء',
    submit: 'إرسال',
    feedbackTitle: 'إرسال ملاحظات',
    feedbackPlaceholder: 'أخبرنا برأيك...',

    // PWA
    addToHomeScreen: 'إضافة إلى الشاشة الرئيسية',
    installNutriScan: 'تثبيت NutriScan AI',
    installDescription:
      'ثبّت التطبيق على جهازك للوصول السريع.',
    install: 'تثبيت',
    later: 'لاحقاً',

    // Creator
    creator: 'المُنشئ',
    createdBy: 'تم الإنشاء بواسطة',
    aboutNutriScan: 'حول NutriScan AI',
    project: 'المشروع',

    // General
    loading: 'جارٍ التحميل...',
    close: 'إغلاق',
    error: 'خطأ',
    success: 'نجاح',
    yes: 'نعم',
    no: 'لا',
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('nutriscan_theme');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return 'dark';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('nutriscan_lang');

    if (
      savedLanguage === 'English' ||
      savedLanguage === 'Spanish' ||
      savedLanguage === 'French' ||
      savedLanguage === 'German' ||
      savedLanguage === 'Hindi' ||
      savedLanguage === 'Arabic'
    ) {
      return savedLanguage;
    }

    return 'English';
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('nutriscan_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;

    root.lang = language;

    if (language === 'Arabic') {
      root.dir = 'rtl';
    } else {
      root.dir = 'ltr';
    }

    localStorage.setItem('nutriscan_lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark'
    );
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.English[key] || key;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
};