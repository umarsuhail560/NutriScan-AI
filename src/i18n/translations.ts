export type SupportedLanguage = 'English' | 'Spanish' | 'French' | 'German' | 'Hindi' | 'Arabic';

export const LANGUAGE_META: Record<SupportedLanguage, { code: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  English: { code: 'en', nativeName: 'English', dir: 'ltr' },
  Spanish: { code: 'es', nativeName: 'Español', dir: 'ltr' },
  French: { code: 'fr', nativeName: 'Français', dir: 'ltr' },
  German: { code: 'de', nativeName: 'Deutsch', dir: 'ltr' },
  Hindi: { code: 'hi', nativeName: 'हिन्दी', dir: 'ltr' },
  Arabic: { code: 'ar', nativeName: 'العربية', dir: 'rtl' },
};

export interface Translations {
  // Common & Nav
  appName: string;
  online: string;
  offline: string;
  installApp: string;
  install: string;
  signIn: string;
  toggleTheme: string;
  home: string;
  search: string;
  scanAI: string;
  history: string;
  settings: string;
  cancel: string;
  submit: string;
  loading: string;
  score: string;
  grade: string;
  serving: string;

  // Risk Levels
  riskVeryHealthy: string;
  riskHealthy: string;
  riskModerate: string;
  riskUnhealthy: string;
  riskAvoidFrequently: string;

  // Dashboard
  aiHealthCompanion: string;
  hello: string;
  nutritionist: string;
  scansCount: string;
  instantFoodAnalysis: string;
  instantFoodDesc: string;
  quickActions: string;
  takePhoto: string;
  barcode: string;
  upload: string;
  dailyHealthReport: string;
  overallChoice: string;
  totalScans: string;
  healthyPercent: string;
  favorites: string;
  viewAll: string;
  recentScans: string;
  seeAll: string;
  loadingRecentScans: string;
  noScansYet: string;
  startFirstScan: string;
  foodItem: string;

  // Scanner
  aiFoodScanner: string;
  camera: string;
  cameraUnavailable: string;
  switchToUpload: string;
  alignFoodLabel: string;
  tapToUpload: string;
  fileSizeHint: string;
  optionalNoteLabel: string;
  optionalNotePlaceholder: string;
  retakePhoto: string;
  analyzeWithAI: string;
  snapFoodPhoto: string;
  geminiInspecting: string;
  analyzingDetails: string;
  analysisFailed: string;

  // Result
  noScanSelected: string;
  noScanSelectedDesc: string;
  scanProductNow: string;
  aiHealthResult: string;
  summaryCopied: string;
  aiVerdict: string;
  nutritionFacts: string;
  per: string;
  calories: string;
  protein: string;
  sugar: string;
  fat: string;
  salt: string;
  fiber: string;
  carbs: string;
  carbohydrates: string;
  amount: string;
  noMacroData: string;
  macronutrientBreakdown: string;
  ingredientsAdditiveAnalysis: string;
  additiveLabel: string;
  colorLabel: string;
  sweetenerLabel: string;
  allergenLabel: string;
  fullIngredientsList: string;
  ingredientsNotParsed: string;
  positivesGoodPoints: string;
  drawbacksBadPoints: string;
  warningsPrecautions: string;
  dailyConsumptionAdvice: string;
  healthierAlternatives: string;
  scanAnotherProduct: string;
  outOf100: string;

  // Suitability
  populationSuitability: string;
  children: string;
  diabetics: string;
  pregnantWomen: string;
  elderlyPeople: string;
  gymAthletes: string;
  safe: string;
  caution: string;

  // Search
  searchFoodProducts: string;
  searchPlaceholder: string;
  popularSearches: string;
  noExactMatch: string;
  searchFailed: string;
  scanPackagingInstead: string;
  productPartial: string;
  failedAnalyzeProduct: string;

  // History
  scanHistory: string;
  searchHistoryPlaceholder: string;
  filterAll: string;
  filterFavorites: string;
  filterHealthy: string;
  filterUnhealthy: string;
  sortNewest: string;
  sortOldest: string;
  sortHighScore: string;
  sortLowScore: string;
  loadingHistory: string;
  noScansFound: string;
  noProductMatchesFilter: string;
  scanFoodProduct: string;
  deleteConfirmTitle: string;
  deleteConfirmMsg: string;
  deleteBtn: string;

  // Profile
  guestUser: string;
  guestMode: string;
  healthyLabel: string;
  unhealthyLabel: string;
  unlockableAchievements: string;
  unlocked: string;
  achHealthExplorer: string;
  achHealthExplorerDesc: string;
  achAdditiveInspector: string;
  achAdditiveInspectorDesc: string;
  achGreenEater: string;
  achGreenEaterDesc: string;
  achNutriScanPro: string;
  achNutriScanProDesc: string;
  signOutSwitch: string;
  signInCreateAccount: string;

  // Settings
  preferencesSettings: string;
  appearance: string;
  themeMode: string;
  darkMode: string;
  lightMode: string;
  languageLabel: string;
  dietaryPreferences: string;
  dietaryDesc: string;
  dietDiabeticFriendly: string;
  dietVegan: string;
  dietGlutenFree: string;
  dietNutFree: string;
  dietLowSodium: string;
  dietPregnancySafe: string;
  dietKetoFriendly: string;
  aboutLegal: string;
  sendFeedback: string;
  privacyEncryption: string;
  privacyDesc: string;
  aboutNutriScan: string;
  aboutDesc: string;
  sendAppFeedback: string;
  feedbackThanks: string;
  feedbackPlaceholder: string;

  // Auth
  welcomeTitle: string;
  welcomeSubtitle: string;
  createAccount: string;
  fullName: string;
  fullNamePlaceholder: string;
  emailAddress: string;
  emailPlaceholder: string;
  password: string;
  forgotPassword: string;
  processing: string;
  orContinueWith: string;
  googleAccount: string;
  continueAsGuest: string;
  encryptedSecureAuth: string;
  resetPassword: string;
  resetPasswordDesc: string;
  resetLocalDesc: string;
  newPassword: string;
  sendResetLink: string;
  updatePassword: string;
  resetEmailSent: string;
  passwordUpdated: string;

  // Barcode Modal & PWA
  scanProductBarcode: string;
  pointCameraBarcode: string;
  typeBarcodeManually: string;
  barcodePlaceholder: string;
  scanBtn: string;
  enterValidBarcode: string;
  barcodeNotFoundPrompt: string;
  uploadPhotoInstead: string;
  barcodeUnavailableMsg: string;
  barcodeFailedMsg: string;
  pwaInstallTitle: string;
  pwaInstallDesc: string;
  splashTagline: string;
  splashReady: string;

  // Creator & Home Screen & Voice Assistant
  creatorTitle: string;
  creatorByLabel: string;
  creatorName: string;
  creatorRole: string;
  creatorDept: string;
  addToHomeScreen: string;
  addToHomeScreenDesc: string;
  alreadyInstalled: string;
  installGuideTitle: string;
  installGuideAndroid: string;
  installGuideIOS: string;
  installGuideDesktop: string;
  gotIt: string;
  readResult: string;
  readingResult: string;
  stopReading: string;
  changeVoice: string;
  voiceAccessibility: string;
  voiceAccessibilityDesc: string;
  selectVoice: string;
  readingSpeed: string;
  speedSlow: string;
  speedNormal: string;
  speedFast: string;
  testVoice: string;
  aiVoicesGroup: string;
  deviceVoicesGroup: string;
  sampleTestSentence: string;
  voiceLoadHint: string;

  // Compare, Ask Nutritionist AI, Daily Guidelines & Dashboard Analytics
  compare: string;
  compareTitle: string;
  compareSubtitle: string;
  productA: string;
  productB: string;
  selectFromHistory: string;
  enterBarcodePrompt: string;
  lookupBarcode: string;
  compareWithAI: string;
  analyzingComparison: string;
  winner: string;
  tieResult: string;
  keyDifferences: string;
  nutritionRecommendation: string;
  readComparison: string;
  swapProducts: string;
  compareEmptyHint: string;
  compareThisProduct: string;
  askNutritionist: string;
  askNutritionistDesc: string;
  askPlaceholder: string;
  sendQuestion: string;
  thinkingAnswer: string;
  listenAnswer: string;
  quickQKids: string;
  quickQWeight: string;
  quickQSwap: string;
  quickQTime: string;
  dietaryMatchTitle: string;
  dietaryCompatible: string;
  dietaryCaution: string;
  noDietaryPrefsSet: string;
  configurePrefs: string;
  dailyGuidelineTitle: string;
  dailyGuidelineSub: string;
  statusLow: string;
  statusModerate: string;
  statusHigh: string;
  statusGood: string;
  avgScore: string;
  scoreTrendTitle: string;
  scoreTrendSubtitle: string;
  activeDietaryProfile: string;
  compareFoodsDesc: string;

  // Admin Portal & Private Feedback Inbox
  adminCornerLabel: string;
  adminPasscodeTitle: string;
  adminPasscodeDesc: string;
  adminPasscodePlaceholder: string;
  adminUnlockBtn: string;
  adminWrongPasscodeNotice: string;
  adminWelcomeBanner: string;
  adminWelcomeSubtitle: string;
  adminSignOut: string;
  adminAccountsTab: string;
  adminFeedbackTab: string;
  adminTotalAccounts: string;
  adminTotalFeedback: string;
  adminPendingReplies: string;
  adminSearchAccounts: string;
  adminNoAccountsYet: string;
  adminNoFeedbackYet: string;
  adminReplyPlaceholder: string;
  adminSendReply: string;
  adminReplySent: string;
  adminRepliedBadge: string;
  adminPendingBadge: string;
  myFeedbackTitle: string;
  myFeedbackEmpty: string;
  adminReplyFromLabel: string;
  waitingAdminReply: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  English: {
    appName: 'NutriScan',
    online: 'Online',
    offline: 'Offline',
    installApp: 'Install App',
    install: 'Install',
    signIn: 'Sign In',
    toggleTheme: 'Toggle theme',
    home: 'Home',
    search: 'Search',
    scanAI: 'Scan AI',
    history: 'History',
    settings: 'Settings',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    score: 'Score',
    grade: 'Grade',
    serving: 'Serving',

    riskVeryHealthy: 'Very Healthy',
    riskHealthy: 'Healthy',
    riskModerate: 'Moderate',
    riskUnhealthy: 'Unhealthy',
    riskAvoidFrequently: 'Avoid Frequently',

    aiHealthCompanion: 'AI Health Companion',
    hello: 'Hello',
    nutritionist: 'Nutritionist',
    scansCount: 'Scans',
    instantFoodAnalysis: 'Instant Food Analysis',
    instantFoodDesc: 'Snap photos or scan barcodes to decode additives & health grades!',
    quickActions: 'Quick Actions',
    takePhoto: 'Take Photo',
    barcode: 'Barcode',
    upload: 'Upload',
    dailyHealthReport: 'Daily Health Report',
    overallChoice: 'Overall Choice',
    totalScans: 'Total Scans',
    healthyPercent: 'Healthy %',
    favorites: 'Favorites',
    viewAll: 'View all',
    recentScans: 'Recent Scans',
    seeAll: 'See all',
    loadingRecentScans: 'Loading recent scans...',
    noScansYet: 'No food products scanned yet.',
    startFirstScan: 'Start First AI Scan',
    foodItem: 'Food Item',

    aiFoodScanner: 'AI Food Scanner',
    camera: 'Camera',
    cameraUnavailable: 'Camera access unavailable. You can upload an image file instead.',
    switchToUpload: 'Switch to Upload Mode',
    alignFoodLabel: 'Align food label / nutrition facts here',
    tapToUpload: 'Tap to upload food packaging photo',
    fileSizeHint: 'PNG, JPG, WEBP up to 20MB',
    optionalNoteLabel: 'Optional note (e.g. "I am diabetic" or "Check for peanuts"):',
    optionalNotePlaceholder: 'Add dietary note or question...',
    retakePhoto: 'Retake Photo',
    analyzeWithAI: 'Analyze with Gemini AI',
    snapFoodPhoto: 'Snap Food Packaging Photo',
    geminiInspecting: 'Gemini AI Inspecting...',
    analyzingDetails: 'Analyzing ingredients, additives, sugars & risk scores',
    analysisFailed: 'AI Analysis failed. Please ensure the image is clear and try again.',

    noScanSelected: 'No Scan Selected',
    noScanSelectedDesc: 'Scan a food product or select one from history.',
    scanProductNow: 'Scan Product Now',
    aiHealthResult: 'AI Health Result',
    summaryCopied: 'Summary copied to clipboard!',
    aiVerdict: 'AI Verdict:',
    nutritionFacts: 'Nutrition Facts',
    per: 'per',
    calories: 'Calories',
    protein: 'Protein',
    sugar: 'Sugar',
    fat: 'Fat',
    salt: 'Salt',
    fiber: 'Fiber',
    carbs: 'Carbs',
    carbohydrates: 'Carbohydrates',
    amount: 'Amount',
    noMacroData: 'No macro distribution data',
    macronutrientBreakdown: 'Macronutrient Breakdown',
    ingredientsAdditiveAnalysis: 'Ingredients & Additive Analysis',
    additiveLabel: 'Additive',
    colorLabel: 'Color',
    sweetenerLabel: 'Sweetener',
    allergenLabel: 'Allergen',
    fullIngredientsList: 'Full Ingredients List:',
    ingredientsNotParsed: 'Ingredients not explicitly parsed.',
    positivesGoodPoints: 'Positives & Good Points',
    drawbacksBadPoints: 'Drawbacks & Bad Points',
    warningsPrecautions: 'Warnings & Precautions',
    dailyConsumptionAdvice: 'Daily Consumption Advice',
    healthierAlternatives: 'Healthier Alternatives',
    scanAnotherProduct: 'Scan Another Product',
    outOf100: 'Out of 100',

    populationSuitability: 'Population & Health Suitability',
    children: 'Children',
    diabetics: 'Diabetics',
    pregnantWomen: 'Pregnant Women',
    elderlyPeople: 'Elderly People',
    gymAthletes: 'Gym & Athletes',
    safe: 'Safe',
    caution: 'Caution',

    searchFoodProducts: 'Search Food Products',
    searchPlaceholder: 'Search food by name (e.g. Nutella, Greek Yogurt)...',
    popularSearches: 'Popular Searches',
    noExactMatch: 'No exact match found in database. Try another search or scan packaging photo!',
    searchFailed: 'Search failed. Please check your internet connection.',
    scanPackagingInstead: 'Scan Packaging Photo Instead',
    productPartial: 'Product details partial. Please snap packaging photo.',
    failedAnalyzeProduct: 'Failed to analyze selected product.',

    scanHistory: 'Scan History',
    searchHistoryPlaceholder: 'Search history by name or brand...',
    filterAll: 'All',
    filterFavorites: 'Favorites',
    filterHealthy: 'Healthy',
    filterUnhealthy: 'Unhealthy',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortHighScore: 'Highest Score',
    sortLowScore: 'Lowest Score',
    loadingHistory: 'Loading your history...',
    noScansFound: 'No Scans Found',
    noProductMatchesFilter: 'No food product matches this filter.',
    scanFoodProduct: 'Scan a Food Product',
    deleteConfirmTitle: 'Delete Scan',
    deleteConfirmMsg: 'Delete this scan record from your history?',
    deleteBtn: 'Delete',

    guestUser: 'Guest User',
    guestMode: 'Guest Mode',
    healthyLabel: 'Healthy',
    unhealthyLabel: 'Unhealthy',
    unlockableAchievements: 'Unlockable Achievements',
    unlocked: 'Unlocked',
    achHealthExplorer: 'Health Explorer',
    achHealthExplorerDesc: 'Scanned your first food product',
    achAdditiveInspector: 'Additive Inspector',
    achAdditiveInspectorDesc: 'Completed 5 ingredient deep-dives',
    achGreenEater: 'Green Eater',
    achGreenEaterDesc: 'Scanned 3 high-grade healthy products (Score 80+)',
    achNutriScanPro: 'NutriScan Pro',
    achNutriScanProDesc: 'Logged over 10 scans into your personal health ledger',
    signOutSwitch: 'Sign Out / Switch Account',
    signInCreateAccount: 'Sign In / Create Account',

    preferencesSettings: 'Preferences & Settings',
    appearance: 'Appearance',
    themeMode: 'Theme Mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    languageLabel: 'Language',
    dietaryPreferences: 'Dietary Preferences',
    dietaryDesc: 'Selected preferences are prioritized during Gemini AI food risk evaluation.',
    dietDiabeticFriendly: 'Diabetic-Friendly',
    dietVegan: 'Vegan',
    dietGlutenFree: 'Gluten-Free',
    dietNutFree: 'Nut-Free',
    dietLowSodium: 'Low-Sodium',
    dietPregnancySafe: 'Pregnancy-Safe',
    dietKetoFriendly: 'Keto-Friendly',
    aboutLegal: 'About & Legal',
    sendFeedback: 'Send Feedback & Suggestions',
    privacyEncryption: 'Privacy & Encryption',
    privacyDesc: 'NutriScan AI stores scan history securely. Your images are analyzed server-side with zero data monetization.',
    aboutNutriScan: 'About NutriScan AI v2.5',
    aboutDesc: 'Powered by Google Gemini AI and Open Food Facts international barcode repository.',
    sendAppFeedback: 'Send App Feedback',
    feedbackThanks: 'Thank you for your feedback! NutriScan AI is constantly improving.',
    feedbackPlaceholder: 'Share your thoughts or feature requests...',

    welcomeTitle: 'Welcome to NutriScan AI',
    welcomeSubtitle: 'Sync your nutritional history, custom health profiles & achievements',
    createAccount: 'Create Account',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Jane Doe',
    emailAddress: 'Email Address',
    emailPlaceholder: 'name@example.com',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    processing: 'Processing...',
    orContinueWith: 'Or continue with',
    googleAccount: 'Google Account',
    continueAsGuest: 'Continue as Guest Explorer',
    encryptedSecureAuth: 'Encrypted & Secure Authentication',
    resetPassword: 'Reset Password',
    resetPasswordDesc: 'Enter your email address and we will send password reset instructions.',
    resetLocalDesc: 'Enter your registered email and choose a new password.',
    newPassword: 'New Password',
    sendResetLink: 'Send Reset Link',
    updatePassword: 'Update Password',
    resetEmailSent: 'Password reset instructions sent to your email!',
    passwordUpdated: 'Password updated! You can now sign in with your new password.',

    scanProductBarcode: 'Scan Product Barcode',
    pointCameraBarcode: 'Point camera at EAN/UPC code',
    typeBarcodeManually: 'Or type barcode manually:',
    barcodePlaceholder: 'e.g. 737628064502',
    scanBtn: 'Scan',
    enterValidBarcode: 'Please enter a valid barcode number',
    barcodeNotFoundPrompt: 'Barcode hard to read or not found?',
    uploadPhotoInstead: 'Upload Packaging Photo Instead',
    barcodeUnavailableMsg: 'Product barcode details unavailable. Please snap packaging photo.',
    barcodeFailedMsg: 'Failed to analyze barcode.',
    pwaInstallTitle: 'Install NutriScan AI App',
    pwaInstallDesc: 'Fast offline access & instant photo scanning!',
    splashTagline: 'AI-Powered Food & Barcode Health Analysis',
    splashReady: 'VERSION 2.5 • AI READY',

    creatorTitle: 'Creator & Developer',
    creatorByLabel: 'Created by',
    creatorName: 'Umar Suhail',
    creatorRole: 'Engineering Student, Bearys Institute of Technology',
    creatorDept: 'Department of Artificial Intelligence & Data Science',
    addToHomeScreen: 'Add to Home Screen',
    addToHomeScreenDesc: 'Install NutriScan AI on your device home screen for instant one-tap access.',
    alreadyInstalled: 'Installed on Home Screen',
    installGuideTitle: 'Add to Home Screen',
    installGuideAndroid: 'Android (Chrome): Tap the 3-dot menu (⋮) in the top right and choose "Add to Home screen" or "Install app".',
    installGuideIOS: 'iPhone / iPad (Safari): Tap the Share icon at the bottom, scroll down, and tap "Add to Home Screen".',
    installGuideDesktop: 'Desktop (Chrome / Edge): Click the Install icon in the address bar or open browser menu → "Install NutriScan AI".',
    gotIt: 'Got it',
    readResult: 'Read',
    readingResult: 'Reading...',
    stopReading: 'Stop',
    changeVoice: 'Change Voice',
    voiceAccessibility: 'Voice & Reading Assistant',
    voiceAccessibilityDesc: 'Listen to scan results in clear sentences. Choose your preferred voice and reading speed.',
    selectVoice: 'Select Voice',
    readingSpeed: 'Reading Speed',
    speedSlow: '0.8x Slower (Senior-Friendly)',
    speedNormal: '1.0x Normal',
    speedFast: '1.15x Faster',
    testVoice: 'Test Voice',
    aiVoicesGroup: 'Natural AI Voices (All Languages)',
    deviceVoicesGroup: 'Device / Browser Voices',
    sampleTestSentence: 'Hello! I am NutriScan AI. I will clearly read your food health results for you.',
    voiceLoadHint: 'Tip: Select an AI Natural Voice for clear pronunciation in any language.',

    compare: 'Compare',
    compareTitle: 'Side-by-Side Comparison',
    compareSubtitle: 'Compare two food labels or barcodes to find the healthier choice.',
    productA: 'Product A',
    productB: 'Product B',
    selectFromHistory: 'Select from history...',
    enterBarcodePrompt: 'Enter barcode number...',
    lookupBarcode: 'Load',
    compareWithAI: 'Get AI Verdict',
    analyzingComparison: 'Comparing nutrition profiles...',
    winner: 'Healthier Choice',
    tieResult: 'Even Match',
    keyDifferences: 'Key Differences',
    nutritionRecommendation: 'Nutritionist Recommendation',
    readComparison: 'Read Verdict',
    swapProducts: 'Swap A / B',
    compareEmptyHint: 'Pick two scanned products or enter barcodes above to compare nutrition facts.',
    compareThisProduct: 'Compare Product',
    askNutritionist: 'Ask Nutritionist AI',
    askNutritionistDesc: 'Ask anything about ingredients, portions, or dietary fit.',
    askPlaceholder: 'e.g. Is this safe for evening snacks?',
    sendQuestion: 'Ask',
    thinkingAnswer: 'Checking label...',
    listenAnswer: 'Listen',
    quickQKids: 'Safe for kids?',
    quickQWeight: 'Good for weight loss?',
    quickQSwap: 'Healthier swap?',
    quickQTime: 'Best time to eat?',
    dietaryMatchTitle: 'Your Dietary Match',
    dietaryCompatible: 'Compatible',
    dietaryCaution: 'Caution',
    noDietaryPrefsSet: 'Set dietary filters in Settings for personalized safety checks.',
    configurePrefs: 'Set Filters',
    dailyGuidelineTitle: 'Daily Reference Check',
    dailyGuidelineSub: 'Share of standard adult daily guideline per serving',
    statusLow: 'Low',
    statusModerate: 'Moderate',
    statusHigh: 'High',
    statusGood: 'Good',
    avgScore: 'Avg Score',
    scoreTrendTitle: 'Health Score Trend',
    scoreTrendSubtitle: 'Recent scanned products',
    activeDietaryProfile: 'Active Dietary Filters',
    compareFoodsDesc: 'Compare Foods',

    adminCornerLabel: 'Admin',
    adminPasscodeTitle: 'Admin Access Verification',
    adminPasscodeDesc: 'Enter the administrator passcode to open Umar Suhail’s dashboard.',
    adminPasscodePlaceholder: 'Enter passcode',
    adminUnlockBtn: 'Verify & Enter',
    adminWrongPasscodeNotice: 'Invalid admin passcode. Please sign in with your user account below.',
    adminWelcomeBanner: 'Hii Umar Suhail, Welcome to Admin Page',
    adminWelcomeSubtitle: 'NutriScan AI Control Center · Registered Accounts & Private Feedback',
    adminSignOut: 'Exit Admin',
    adminAccountsTab: 'User Accounts',
    adminFeedbackTab: 'User Feedback',
    adminTotalAccounts: 'User Accounts',
    adminTotalFeedback: 'Feedback Received',
    adminPendingReplies: 'Pending Replies',
    adminSearchAccounts: 'Search user name or email...',
    adminNoAccountsYet: 'No registered user accounts yet.',
    adminNoFeedbackYet: 'No feedback submitted by users yet.',
    adminReplyPlaceholder: 'Write a private reply visible only to this user...',
    adminSendReply: 'Send Reply',
    adminReplySent: 'Reply sent privately to this user',
    adminRepliedBadge: 'Replied',
    adminPendingBadge: 'Pending',
    myFeedbackTitle: 'My Feedback & Admin Replies',
    myFeedbackEmpty: 'You have not sent feedback yet. Only you and Admin Umar Suhail can see your messages.',
    adminReplyFromLabel: 'Reply from Admin (Umar Suhail)',
    waitingAdminReply: 'Sent privately to Admin — waiting for reply',
  },

  Spanish: {
    appName: 'NutriScan',
    online: 'En línea',
    offline: 'Sin conexión',
    installApp: 'Instalar App',
    install: 'Instalar',
    signIn: 'Iniciar sesión',
    toggleTheme: 'Cambiar tema',
    home: 'Inicio',
    search: 'Buscar',
    scanAI: 'Escanear IA',
    history: 'Historial',
    settings: 'Ajustes',
    cancel: 'Cancelar',
    submit: 'Enviar',
    loading: 'Cargando...',
    score: 'Puntuación',
    grade: 'Nota',
    serving: 'Porción',

    riskVeryHealthy: 'Muy saludable',
    riskHealthy: 'Saludable',
    riskModerate: 'Moderado',
    riskUnhealthy: 'Poco saludable',
    riskAvoidFrequently: 'Evitar consumo frecuente',

    aiHealthCompanion: 'Compañero de Salud IA',
    hello: 'Hola',
    nutritionist: 'Nutricionista',
    scansCount: 'Escaneos',
    instantFoodAnalysis: 'Análisis Instantáneo',
    instantFoodDesc: '¡Toma fotos o escanea códigos de barras para detectar aditivos!',
    quickActions: 'Acciones rápidas',
    takePhoto: 'Tomar foto',
    barcode: 'Código',
    upload: 'Subir',
    dailyHealthReport: 'Informe Diario de Salud',
    overallChoice: 'Elección general',
    totalScans: 'Total escaneos',
    healthyPercent: '% Saludable',
    favorites: 'Favoritos',
    viewAll: 'Ver todo',
    recentScans: 'Escaneos recientes',
    seeAll: 'Ver todos',
    loadingRecentScans: 'Cargando escaneos recientes...',
    noScansYet: 'Aún no hay productos escaneados.',
    startFirstScan: 'Primer Escaneo IA',
    foodItem: 'Alimento',

    aiFoodScanner: 'Escáner IA de Alimentos',
    camera: 'Cámara',
    cameraUnavailable: 'Cámara no disponible. Puedes subir una imagen.',
    switchToUpload: 'Cambiar a modo Subir',
    alignFoodLabel: 'Alinea la etiqueta nutricional aquí',
    tapToUpload: 'Toca para subir foto del envase',
    fileSizeHint: 'PNG, JPG, WEBP hasta 20MB',
    optionalNoteLabel: 'Nota opcional (ej. "Soy diabético" o "Revisar cacahuetes"):',
    optionalNotePlaceholder: 'Añadir nota dietética o pregunta...',
    retakePhoto: 'Repetir foto',
    analyzeWithAI: 'Analizar con Gemini IA',
    snapFoodPhoto: 'Capturar foto del envase',
    geminiInspecting: 'Gemini IA analizando...',
    analyzingDetails: 'Analizando ingredientes, aditivos, azúcares y riesgo',
    analysisFailed: 'Error en el análisis. Asegúrate de que la imagen sea nítida.',

    noScanSelected: 'Ningún escaneo seleccionado',
    noScanSelectedDesc: 'Escanea un producto o elige uno del historial.',
    scanProductNow: 'Escanear producto',
    aiHealthResult: 'Resultado de Salud IA',
    summaryCopied: '¡Resumen copiado al portapapeles!',
    aiVerdict: 'Veredicto IA:',
    nutritionFacts: 'Información Nutricional',
    per: 'por',
    calories: 'Calorías',
    protein: 'Proteína',
    sugar: 'Azúcar',
    fat: 'Grasa',
    salt: 'Sal',
    fiber: 'Fibra',
    carbs: 'Carbohidratos',
    carbohydrates: 'Carbohidratos',
    amount: 'Cantidad',
    noMacroData: 'Sin datos de macronutrientes',
    macronutrientBreakdown: 'Desglose de Macronutrientes',
    ingredientsAdditiveAnalysis: 'Análisis de Ingredientes y Aditivos',
    additiveLabel: 'Aditivo',
    colorLabel: 'Colorante',
    sweetenerLabel: 'Edulcorante',
    allergenLabel: 'Alérgeno',
    fullIngredientsList: 'Lista completa de ingredientes:',
    ingredientsNotParsed: 'Ingredientes no especificados.',
    positivesGoodPoints: 'Puntos positivos',
    drawbacksBadPoints: 'Puntos negativos',
    warningsPrecautions: 'Advertencias y precauciones',
    dailyConsumptionAdvice: 'Consejo de consumo diario',
    healthierAlternatives: 'Alternativas más saludables',
    scanAnotherProduct: 'Escanear otro producto',
    outOf100: 'De 100',

    populationSuitability: 'Idoneidad por Población y Salud',
    children: 'Niños',
    diabetics: 'Diabéticos',
    pregnantWomen: 'Embarazadas',
    elderlyPeople: 'Personas mayores',
    gymAthletes: 'Gimnasio y atletas',
    safe: 'Seguro',
    caution: 'Precaución',

    searchFoodProducts: 'Buscar Alimentos',
    searchPlaceholder: 'Buscar alimento por nombre (ej. Nutella, Yogur)...',
    popularSearches: 'Búsquedas populares',
    noExactMatch: 'Sin coincidencia exacta. ¡Prueba otra búsqueda o escanea una foto!',
    searchFailed: 'Error en la búsqueda. Verifica tu conexión.',
    scanPackagingInstead: 'Escanear foto del envase',
    productPartial: 'Detalles parciales. Toma una foto del envase.',
    failedAnalyzeProduct: 'No se pudo analizar el producto.',

    scanHistory: 'Historial de Escaneos',
    searchHistoryPlaceholder: 'Buscar por nombre o marca...',
    filterAll: 'Todos',
    filterFavorites: 'Favoritos',
    filterHealthy: 'Saludables',
    filterUnhealthy: 'No saludables',
    sortNewest: 'Más recientes',
    sortOldest: 'Más antiguos',
    sortHighScore: 'Mayor puntuación',
    sortLowScore: 'Menor puntuación',
    loadingHistory: 'Cargando historial...',
    noScansFound: 'Sin escaneos',
    noProductMatchesFilter: 'Ningún producto coincide con este filtro.',
    scanFoodProduct: 'Escanear un alimento',
    deleteConfirmTitle: 'Eliminar escaneo',
    deleteConfirmMsg: '¿Eliminar este registro de tu historial?',
    deleteBtn: 'Eliminar',

    guestUser: 'Invitado',
    guestMode: 'Modo Invitado',
    healthyLabel: 'Saludable',
    unhealthyLabel: 'No saludable',
    unlockableAchievements: 'Logros desbloqueables',
    unlocked: 'Desbloqueado',
    achHealthExplorer: 'Explorador de Salud',
    achHealthExplorerDesc: 'Escaneaste tu primer producto alimenticio',
    achAdditiveInspector: 'Inspector de Aditivos',
    achAdditiveInspectorDesc: 'Completaste 5 análisis de ingredientes',
    achGreenEater: 'Consumidor Verde',
    achGreenEaterDesc: 'Escaneaste 3 productos muy saludables (80+)',
    achNutriScanPro: 'NutriScan Pro',
    achNutriScanProDesc: 'Registraste más de 10 escaneos en tu historial',
    signOutSwitch: 'Cerrar sesión / Cambiar cuenta',
    signInCreateAccount: 'Iniciar sesión / Crear cuenta',

    preferencesSettings: 'Preferencias y Ajustes',
    appearance: 'Apariencia',
    themeMode: 'Modo de Tema',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    languageLabel: 'Idioma',
    dietaryPreferences: 'Preferencias Dietéticas',
    dietaryDesc: 'Las opciones seleccionadas se priorizan en la evaluación de riesgos con IA.',
    dietDiabeticFriendly: 'Apto para Diabéticos',
    dietVegan: 'Vegano',
    dietGlutenFree: 'Sin Gluten',
    dietNutFree: 'Sin Frutos Secos',
    dietLowSodium: 'Bajo en Sodio',
    dietPregnancySafe: 'Seguro en Embarazo',
    dietKetoFriendly: 'Apto Keto',
    aboutLegal: 'Información y Legal',
    sendFeedback: 'Enviar Comentarios y Sugerencias',
    privacyEncryption: 'Privacidad y Cifrado',
    privacyDesc: 'NutriScan AI guarda tu historial de forma segura sin monetizar tus datos.',
    aboutNutriScan: 'Acerca de NutriScan AI v2.5',
    aboutDesc: 'Impulsado por Google Gemini AI y la base internacional Open Food Facts.',
    sendAppFeedback: 'Enviar Comentarios',
    feedbackThanks: '¡Gracias por tus comentarios! NutriScan AI mejora cada día.',
    feedbackPlaceholder: 'Comparte tus ideas o sugerencias...',

    welcomeTitle: 'Bienvenido a NutriScan AI',
    welcomeSubtitle: 'Sincroniza tu historial nutricional, perfiles de salud y logros',
    createAccount: 'Crear cuenta',
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'María García',
    emailAddress: 'Correo electrónico',
    emailPlaceholder: 'nombre@ejemplo.com',
    password: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    processing: 'Procesando...',
    orContinueWith: 'O continuar con',
    googleAccount: 'Cuenta de Google',
    continueAsGuest: 'Continuar como Invitado',
    encryptedSecureAuth: 'Autenticación Cifrada y Segura',
    resetPassword: 'Restablecer Contraseña',
    resetPasswordDesc: 'Ingresa tu correo para enviarte instrucciones.',
    resetLocalDesc: 'Ingresa tu correo registrado y elige una nueva contraseña.',
    newPassword: 'Nueva contraseña',
    sendResetLink: 'Enviar enlace',
    updatePassword: 'Actualizar contraseña',
    resetEmailSent: '¡Instrucciones enviadas a tu correo!',
    passwordUpdated: '¡Contraseña actualizada! Ya puedes iniciar sesión.',

    scanProductBarcode: 'Escanear Código de Barras',
    pointCameraBarcode: 'Apunta la cámara al código EAN/UPC',
    typeBarcodeManually: 'O escribe el código manualmente:',
    barcodePlaceholder: 'ej. 737628064502',
    scanBtn: 'Escanear',
    enterValidBarcode: 'Ingresa un código de barras válido',
    barcodeNotFoundPrompt: '¿Código ilegible o no encontrado?',
    uploadPhotoInstead: 'Subir Foto del Envase',
    barcodeUnavailableMsg: 'Detalles no disponibles. Toma una foto del envase.',
    barcodeFailedMsg: 'Error al analizar el código de barras.',
    pwaInstallTitle: 'Instalar NutriScan AI',
    pwaInstallDesc: '¡Acceso rápido y escaneo instantáneo!',
    splashTagline: 'Análisis Nutricional y de Códigos con IA',
    splashReady: 'VERSIÓN 2.5 • IA LISTA',

    creatorTitle: 'Creador y Desarrollador',
    creatorByLabel: 'Creado por',
    creatorName: 'Umar Suhail',
    creatorRole: 'Estudiante de Ingeniería, Bearys Institute of Technology',
    creatorDept: 'Departamento de Inteligencia Artificial y Ciencia de Datos',
    addToHomeScreen: 'Añadir a pantalla de inicio',
    addToHomeScreenDesc: 'Instala NutriScan AI en tu pantalla de inicio para acceder con un toque.',
    alreadyInstalled: 'Instalado en pantalla de inicio',
    installGuideTitle: 'Añadir a pantalla de inicio',
    installGuideAndroid: 'Android (Chrome): Toca el menú de 3 puntos (⋮) arriba a la derecha y elige "Añadir a pantalla de inicio" o "Instalar aplicación".',
    installGuideIOS: 'iPhone / iPad (Safari): Toca el botón Compartir abajo, desliza y toca "Añadir a pantalla de inicio".',
    installGuideDesktop: 'Escritorio (Chrome / Edge): Haz clic en el icono Instalar en la barra de direcciones.',
    gotIt: 'Entendido',
    readResult: 'Leer',
    readingResult: 'Leyendo...',
    stopReading: 'Detener',
    changeVoice: 'Cambiar voz',
    voiceAccessibility: 'Asistente de Voz y Lectura',
    voiceAccessibilityDesc: 'Escucha los resultados en frases claras. Elige la voz y velocidad que prefieras.',
    selectVoice: 'Seleccionar voz',
    readingSpeed: 'Velocidad de lectura',
    speedSlow: '0.8x Lento (Ideal para mayores)',
    speedNormal: '1.0x Normal',
    speedFast: '1.15x Rápido',
    testVoice: 'Probar voz',
    aiVoicesGroup: 'Voces IA Naturales (Todos los idiomas)',
    deviceVoicesGroup: 'Voces del dispositivo / navegador',
    sampleTestSentence: '¡Hola! Soy NutriScan AI. Leeré claramente tus resultados nutricionales.',
    voiceLoadHint: 'Consejo: Elige una Voz IA Natural para una pronunciación clara en cualquier idioma.',

    compare: 'Comparar',
    compareTitle: 'Comparación lado a lado',
    compareSubtitle: 'Compara dos alimentos o códigos de barras para elegir la opción más saludable.',
    productA: 'Producto A',
    productB: 'Producto B',
    selectFromHistory: 'Elegir del historial...',
    enterBarcodePrompt: 'Código de barras...',
    lookupBarcode: 'Cargar',
    compareWithAI: 'Veredicto IA',
    analyzingComparison: 'Comparando perfiles nutricionales...',
    winner: 'Opción más saludable',
    tieResult: 'Empate',
    keyDifferences: 'Diferencias clave',
    nutritionRecommendation: 'Recomendación nutricional',
    readComparison: 'Leer veredicto',
    swapProducts: 'Intercambiar A / B',
    compareEmptyHint: 'Elige dos productos escaneados o ingresa códigos de barras arriba.',
    compareThisProduct: 'Comparar producto',
    askNutritionist: 'Pregunta al Nutricionista IA',
    askNutritionistDesc: 'Consulta sobre ingredientes, porciones o compatibilidad.',
    askPlaceholder: 'Ej. ¿Es bueno para la merienda?',
    sendQuestion: 'Preguntar',
    thinkingAnswer: 'Revisando etiqueta...',
    listenAnswer: 'Escuchar',
    quickQKids: '¿Apto para niños?',
    quickQWeight: '¿Bueno para bajar de peso?',
    quickQSwap: '¿Alternativa más sana?',
    quickQTime: '¿Mejor hora?',
    dietaryMatchTitle: 'Tu perfil dietético',
    dietaryCompatible: 'Compatible',
    dietaryCaution: 'Precaución',
    noDietaryPrefsSet: 'Configura filtros dietéticos en Ajustes para alertas personalizadas.',
    configurePrefs: 'Configurar',
    dailyGuidelineTitle: 'Referencia diaria',
    dailyGuidelineSub: 'Porcentaje aproximado de la guía diaria por porción',
    statusLow: 'Bajo',
    statusModerate: 'Moderado',
    statusHigh: 'Alto',
    statusGood: 'Bueno',
    avgScore: 'Prom. Score',
    scoreTrendTitle: 'Tendencia de salud',
    scoreTrendSubtitle: 'Últimos productos escaneados',
    activeDietaryProfile: 'Filtros dietéticos activos',
    compareFoodsDesc: 'Comparar',

    adminCornerLabel: 'Admin',
    adminPasscodeTitle: 'Acceso de Administrador',
    adminPasscodeDesc: 'Ingresa el código de administrador para abrir el panel de Umar Suhail.',
    adminPasscodePlaceholder: 'Código de acceso',
    adminUnlockBtn: 'Verificar y entrar',
    adminWrongPasscodeNotice: 'Código incorrecto. Inicia sesión con tu cuenta de usuario.',
    adminWelcomeBanner: 'Hola Umar Suhail, Bienvenido a la Página de Admin',
    adminWelcomeSubtitle: 'Centro de Control NutriScan AI · Cuentas registradas y comentarios privados',
    adminSignOut: 'Salir de Admin',
    adminAccountsTab: 'Cuentas de usuario',
    adminFeedbackTab: 'Comentarios',
    adminTotalAccounts: 'Cuentas totales',
    adminTotalFeedback: 'Comentarios',
    adminPendingReplies: 'Pendientes',
    adminSearchAccounts: 'Buscar nombre o correo...',
    adminNoAccountsYet: 'Aún no hay cuentas registradas.',
    adminNoFeedbackYet: 'Aún no hay comentarios de usuarios.',
    adminReplyPlaceholder: 'Escribe una respuesta privada solo para este usuario...',
    adminSendReply: 'Enviar respuesta',
    adminReplySent: 'Respuesta enviada en privado',
    adminRepliedBadge: 'Respondido',
    adminPendingBadge: 'Pendiente',
    myFeedbackTitle: 'Mis comentarios y respuestas',
    myFeedbackEmpty: 'Aún no has enviado comentarios. Solo tú y el Admin Umar Suhail pueden verlos.',
    adminReplyFromLabel: 'Respuesta del Admin (Umar Suhail)',
    waitingAdminReply: 'Enviado en privado al Admin — esperando respuesta',
  },

  French: {
    appName: 'NutriScan',
    online: 'En ligne',
    offline: 'Hors ligne',
    installApp: 'Installer',
    install: 'Installer',
    signIn: 'Connexion',
    toggleTheme: 'Changer le thème',
    home: 'Accueil',
    search: 'Rechercher',
    scanAI: 'Scanner IA',
    history: 'Historique',
    settings: 'Paramètres',
    cancel: 'Annuler',
    submit: 'Envoyer',
    loading: 'Chargement...',
    score: 'Score',
    grade: 'Note',
    serving: 'Portion',

    riskVeryHealthy: 'Très sain',
    riskHealthy: 'Sain',
    riskModerate: 'Modéré',
    riskUnhealthy: 'Malsain',
    riskAvoidFrequently: 'À éviter souvent',

    aiHealthCompanion: 'Assistant Santé IA',
    hello: 'Bonjour',
    nutritionist: 'Nutritionniste',
    scansCount: 'Scans',
    instantFoodAnalysis: 'Analyse Instantanée',
    instantFoodDesc: 'Prenez une photo ou scannez un code-barres pour décoder les additifs !',
    quickActions: 'Actions rapides',
    takePhoto: 'Photo',
    barcode: 'Code-barres',
    upload: 'Importer',
    dailyHealthReport: 'Bilan Santé Quotidien',
    overallChoice: 'Choix global',
    totalScans: 'Total scans',
    healthyPercent: '% Sain',
    favorites: 'Favoris',
    viewAll: 'Tout voir',
    recentScans: 'Scans récents',
    seeAll: 'Tout voir',
    loadingRecentScans: 'Chargement des scans...',
    noScansYet: 'Aucun produit scanné.',
    startFirstScan: 'Premier Scan IA',
    foodItem: 'Aliment',

    aiFoodScanner: 'Scanner Alimentaire IA',
    camera: 'Caméra',
    cameraUnavailable: 'Caméra indisponible. Vous pouvez importer une image.',
    switchToUpload: 'Passer en mode Importer',
    alignFoodLabel: 'Alignez l’étiquette nutritionnelle ici',
    tapToUpload: 'Appuyez pour importer une photo',
    fileSizeHint: 'PNG, JPG, WEBP jusqu’à 20 Mo',
    optionalNoteLabel: 'Note optionnelle (ex. "Diabétique" ou "Arachides") :',
    optionalNotePlaceholder: 'Ajouter une note diététique...',
    retakePhoto: 'Reprendre',
    analyzeWithAI: 'Analyser avec Gemini IA',
    snapFoodPhoto: 'Prendre une photo',
    geminiInspecting: 'Inspection Gemini IA...',
    analyzingDetails: 'Analyse des ingrédients, additifs, sucres et risques',
    analysisFailed: 'Échec de l’analyse. Vérifiez la netteté de l’image.',

    noScanSelected: 'Aucun scan sélectionné',
    noScanSelectedDesc: 'Scannez un produit ou choisissez dans l’historique.',
    scanProductNow: 'Scanner un produit',
    aiHealthResult: 'Résultat Santé IA',
    summaryCopied: 'Résumé copié dans le presse-papiers !',
    aiVerdict: 'Verdict IA :',
    nutritionFacts: 'Valeurs Nutritionnelles',
    per: 'pour',
    calories: 'Calories',
    protein: 'Protéines',
    sugar: 'Sucres',
    fat: 'Lipides',
    salt: 'Sel',
    fiber: 'Fibres',
    carbs: 'Glucides',
    carbohydrates: 'Glucides',
    amount: 'Quantité',
    noMacroData: 'Aucune donnée de macronutriments',
    macronutrientBreakdown: 'Répartition des Macronutriments',
    ingredientsAdditiveAnalysis: 'Ingrédients et Additifs',
    additiveLabel: 'Additif',
    colorLabel: 'Colorant',
    sweetenerLabel: 'Édulcorant',
    allergenLabel: 'Allergène',
    fullIngredientsList: 'Liste complète des ingrédients :',
    ingredientsNotParsed: 'Ingrédients non détaillés.',
    positivesGoodPoints: 'Points positifs',
    drawbacksBadPoints: 'Points négatifs',
    warningsPrecautions: 'Avertissements et précautions',
    dailyConsumptionAdvice: 'Conseil de consommation',
    healthierAlternatives: 'Alternatives plus saines',
    scanAnotherProduct: 'Scanner un autre produit',
    outOf100: 'Sur 100',

    populationSuitability: 'Compatibilité Santé et Profils',
    children: 'Enfants',
    diabetics: 'Diabétiques',
    pregnantWomen: 'Femmes enceintes',
    elderlyPeople: 'Personnes âgées',
    gymAthletes: 'Sportifs',
    safe: 'Adapté',
    caution: 'Prudence',

    searchFoodProducts: 'Rechercher des Aliments',
    searchPlaceholder: 'Rechercher par nom (ex. Nutella, Yaourt)...',
    popularSearches: 'Recherches populaires',
    noExactMatch: 'Aucun résultat exact. Essayez un autre mot ou scannez le produit !',
    searchFailed: 'Échec de la recherche. Vérifiez votre connexion.',
    scanPackagingInstead: 'Scanner l’emballage à la place',
    productPartial: 'Détails partiels. Prenez une photo de l’emballage.',
    failedAnalyzeProduct: 'Impossible d’analyser ce produit.',

    scanHistory: 'Historique des Scans',
    searchHistoryPlaceholder: 'Rechercher par nom ou marque...',
    filterAll: 'Tous',
    filterFavorites: 'Favoris',
    filterHealthy: 'Sains',
    filterUnhealthy: 'Malsains',
    sortNewest: 'Plus récents',
    sortOldest: 'Plus anciens',
    sortHighScore: 'Meilleur score',
    sortLowScore: 'Score le plus bas',
    loadingHistory: 'Chargement de l’historique...',
    noScansFound: 'Aucun scan trouvé',
    noProductMatchesFilter: 'Aucun produit ne correspond à ce filtre.',
    scanFoodProduct: 'Scanner un produit',
    deleteConfirmTitle: 'Supprimer le scan',
    deleteConfirmMsg: 'Supprimer ce scan de votre historique ?',
    deleteBtn: 'Supprimer',

    guestUser: 'Invité',
    guestMode: 'Mode Invité',
    healthyLabel: 'Sain',
    unhealthyLabel: 'Malsain',
    unlockableAchievements: 'Succès à débloquer',
    unlocked: 'Débloqué',
    achHealthExplorer: 'Explorateur Santé',
    achHealthExplorerDesc: 'Premier produit alimentaire scanné',
    achAdditiveInspector: 'Inspecteur d’Additifs',
    achAdditiveInspectorDesc: '5 analyses d’ingrédients effectuées',
    achGreenEater: 'Mangeur Sain',
    achGreenEaterDesc: '3 produits très sains scannés (Score 80+)',
    achNutriScanPro: 'NutriScan Pro',
    achNutriScanProDesc: 'Plus de 10 scans enregistrés',
    signOutSwitch: 'Déconnexion / Changer de compte',
    signInCreateAccount: 'Connexion / Créer un compte',

    preferencesSettings: 'Préférences et Paramètres',
    appearance: 'Apparence',
    themeMode: 'Thème',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    languageLabel: 'Langue',
    dietaryPreferences: 'Préférences Alimentaires',
    dietaryDesc: 'Ces préférences sont prioritaires lors de l’analyse par l’IA.',
    dietDiabeticFriendly: 'Adapté Diabète',
    dietVegan: 'Végan',
    dietGlutenFree: 'Sans Gluten',
    dietNutFree: 'Sans Noix',
    dietLowSodium: 'Faible en Sel',
    dietPregnancySafe: 'Sûr Grossesse',
    dietKetoFriendly: 'Céto / Keto',
    aboutLegal: 'À propos et Légal',
    sendFeedback: 'Envoyer un avis ou suggestion',
    privacyEncryption: 'Confidentialité et Sécurité',
    privacyDesc: 'NutriScan AI stocke votre historique de façon sécurisée sans revente de données.',
    aboutNutriScan: 'À propos de NutriScan AI v2.5',
    aboutDesc: 'Propulsé par Google Gemini AI et la base internationale Open Food Facts.',
    sendAppFeedback: 'Envoyer un Avis',
    feedbackThanks: 'Merci pour votre retour ! NutriScan AI s’améliore constamment.',
    feedbackPlaceholder: 'Partagez vos suggestions...',

    welcomeTitle: 'Bienvenue sur NutriScan AI',
    welcomeSubtitle: 'Synchronisez votre historique, vos profils santé et succès',
    createAccount: 'Créer un compte',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Marie Dupont',
    emailAddress: 'Adresse e-mail',
    emailPlaceholder: 'nom@exemple.com',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    processing: 'Traitement...',
    orContinueWith: 'Ou continuer avec',
    googleAccount: 'Compte Google',
    continueAsGuest: 'Continuer en tant qu’Invité',
    encryptedSecureAuth: 'Authentification Chiffrée et Sécurisée',
    resetPassword: 'Réinitialiser le mot de passe',
    resetPasswordDesc: 'Entrez votre e-mail pour recevoir les instructions.',
    resetLocalDesc: 'Entrez votre e-mail et choisissez un nouveau mot de passe.',
    newPassword: 'Nouveau mot de passe',
    sendResetLink: 'Envoyer le lien',
    updatePassword: 'Mettre à jour',
    resetEmailSent: 'Instructions envoyées à votre e-mail !',
    passwordUpdated: 'Mot de passe mis à jour ! Vous pouvez vous connecter.',

    scanProductBarcode: 'Scanner un Code-Barres',
    pointCameraBarcode: 'Pointez la caméra sur le code EAN/UPC',
    typeBarcodeManually: 'Ou saisissez le code manuellement :',
    barcodePlaceholder: 'ex. 737628064502',
    scanBtn: 'Scanner',
    enterValidBarcode: 'Veuillez saisir un code valide',
    barcodeNotFoundPrompt: 'Code illisible ou introuvable ?',
    uploadPhotoInstead: 'Importer une Photo à la Place',
    barcodeUnavailableMsg: 'Détails indisponibles. Prenez une photo du produit.',
    barcodeFailedMsg: 'Échec de l’analyse du code-barres.',
    pwaInstallTitle: 'Installer NutriScan AI',
    pwaInstallDesc: 'Accès rapide et scan instantané !',
    splashTagline: 'Analyse Alimentaire & Code-Barres par IA',
    splashReady: 'VERSION 2.5 • IA PRÊTE',

    creatorTitle: 'Créateur & Développeur',
    creatorByLabel: 'Créé par',
    creatorName: 'Umar Suhail',
    creatorRole: 'Étudiant en Ingénierie, Bearys Institute of Technology',
    creatorDept: 'Département d’Intelligence Artificielle et Science des Données',
    addToHomeScreen: 'Ajouter à l’écran d’accueil',
    addToHomeScreenDesc: 'Installez NutriScan AI sur votre écran d’accueil pour un accès instantané.',
    alreadyInstalled: 'Installé sur l’écran d’accueil',
    installGuideTitle: 'Ajouter à l’écran d’accueil',
    installGuideAndroid: 'Android (Chrome) : Appuyez sur le menu (⋮) en haut à droite puis sur « Ajouter à l’écran d’accueil ».',
    installGuideIOS: 'iPhone / iPad (Safari) : Appuyez sur Partager en bas, puis sur « Sur l’écran d’accueil ».',
    installGuideDesktop: 'Ordinateur (Chrome / Edge) : Cliquez sur l’icône Installer dans la barre d’adresse.',
    gotIt: 'Compris',
    readResult: 'Lire',
    readingResult: 'Lecture...',
    stopReading: 'Arrêter',
    changeVoice: 'Changer de voix',
    voiceAccessibility: 'Assistant Vocal & Lecture',
    voiceAccessibilityDesc: 'Écoutez les résultats en phrases claires. Choisissez votre voix et votre vitesse.',
    selectVoice: 'Choisir une voix',
    readingSpeed: 'Vitesse de lecture',
    speedSlow: '0.8x Lent (Confort seniors)',
    speedNormal: '1.0x Normal',
    speedFast: '1.15x Rapide',
    testVoice: 'Tester la voix',
    aiVoicesGroup: 'Voix IA Naturelles (Toutes langues)',
    deviceVoicesGroup: 'Voix de l’appareil / navigateur',
    sampleTestSentence: 'Bonjour ! Je suis NutriScan AI. Je vais lire clairement vos résultats santé.',
    voiceLoadHint: 'Astuce : Choisissez une Voix IA Naturelle pour une prononciation claire dans chaque langue.',

    compare: 'Comparer',
    compareTitle: 'Comparaison côte à côte',
    compareSubtitle: 'Comparez deux produits ou codes-barres pour trouver le meilleur choix.',
    productA: 'Produit A',
    productB: 'Produit B',
    selectFromHistory: 'Choisir dans l’historique...',
    enterBarcodePrompt: 'Entrer un code-barres...',
    lookupBarcode: 'Charger',
    compareWithAI: 'Verdict IA',
    analyzingComparison: 'Comparaison en cours...',
    winner: 'Choix le plus sain',
    tieResult: 'Égalité',
    keyDifferences: 'Différences clés',
    nutritionRecommendation: 'Conseil du nutritionniste',
    readComparison: 'Lire le verdict',
    swapProducts: 'Inverser A / B',
    compareEmptyHint: 'Sélectionnez deux produits ou saisissez des codes-barres ci-dessus.',
    compareThisProduct: 'Comparer ce produit',
    askNutritionist: 'Demander au Nutritionniste IA',
    askNutritionistDesc: 'Posez vos questions sur les ingrédients ou les portions.',
    askPlaceholder: 'Ex. Est-ce adapté pour le goûter ?',
    sendQuestion: 'Demander',
    thinkingAnswer: 'Analyse...',
    listenAnswer: 'Écouter',
    quickQKids: 'Sûr pour enfants ?',
    quickQWeight: 'Pour perdre du poids ?',
    quickQSwap: 'Alternative saine ?',
    quickQTime: 'Meilleur moment ?',
    dietaryMatchTitle: 'Compatibilité alimentaire',
    dietaryCompatible: 'Compatible',
    dietaryCaution: 'Prudence',
    noDietaryPrefsSet: 'Définissez vos filtres dans Réglages pour un suivi personnalisé.',
    configurePrefs: 'Configurer',
    dailyGuidelineTitle: 'Repère journalier',
    dailyGuidelineSub: 'Part des apports de référence par portion',
    statusLow: 'Faible',
    statusModerate: 'Modéré',
    statusHigh: 'Élevé',
    statusGood: 'Bon',
    avgScore: 'Score moy.',
    scoreTrendTitle: 'Évolution des scores',
    scoreTrendSubtitle: 'Scans récents',
    activeDietaryProfile: 'Filtres alimentaires actifs',
    compareFoodsDesc: 'Comparer',

    adminCornerLabel: 'Admin',
    adminPasscodeTitle: 'Accès Administrateur',
    adminPasscodeDesc: 'Entrez le code administrateur pour accéder au tableau de bord d’Umar Suhail.',
    adminPasscodePlaceholder: 'Code d’accès',
    adminUnlockBtn: 'Vérifier',
    adminWrongPasscodeNotice: 'Code invalide. Veuillez vous connecter avec votre compte utilisateur.',
    adminWelcomeBanner: 'Bonjour Umar Suhail, Bienvenue sur la Page Admin',
    adminWelcomeSubtitle: 'Centre de contrôle NutriScan AI · Comptes utilisateurs et retours privés',
    adminSignOut: 'Quitter Admin',
    adminAccountsTab: 'Comptes utilisateurs',
    adminFeedbackTab: 'Retours utilisateurs',
    adminTotalAccounts: 'Comptes',
    adminTotalFeedback: 'Retours reçus',
    adminPendingReplies: 'En attente',
    adminSearchAccounts: 'Rechercher nom ou e-mail...',
    adminNoAccountsYet: 'Aucun compte enregistré pour le moment.',
    adminNoFeedbackYet: 'Aucun retour envoyé pour le moment.',
    adminReplyPlaceholder: 'Écrire une réponse privée visible uniquement par cet utilisateur...',
    adminSendReply: 'Envoyer',
    adminReplySent: 'Réponse privée envoyée',
    adminRepliedBadge: 'Répondu',
    adminPendingBadge: 'En attente',
    myFeedbackTitle: 'Mes retours et réponses Admin',
    myFeedbackEmpty: 'Vous n’avez pas encore envoyé de retour.',
    adminReplyFromLabel: 'Réponse de l’Admin (Umar Suhail)',
    waitingAdminReply: 'Envoyé en privé — en attente de réponse',
  },

  German: {
    appName: 'NutriScan',
    online: 'Online',
    offline: 'Offline',
    installApp: 'App installieren',
    install: 'Installieren',
    signIn: 'Anmelden',
    toggleTheme: 'Design wechseln',
    home: 'Start',
    search: 'Suche',
    scanAI: 'KI-Scan',
    history: 'Verlauf',
    settings: 'Einstellungen',
    cancel: 'Abbrechen',
    submit: 'Absenden',
    loading: 'Laden...',
    score: 'Punkte',
    grade: 'Note',
    serving: 'Portion',

    riskVeryHealthy: 'Sehr gesund',
    riskHealthy: 'Gesund',
    riskModerate: 'Mäßig',
    riskUnhealthy: 'Ungesund',
    riskAvoidFrequently: 'Häufigen Verzehr meiden',

    aiHealthCompanion: 'KI-Gesundheitsbegleiter',
    hello: 'Hallo',
    nutritionist: 'Ernährungsfreund',
    scansCount: 'Scans',
    instantFoodAnalysis: 'Sofort-Analyse',
    instantFoodDesc: 'Fotos machen oder Barcodes scannen, um Zusatzstoffe zu erkennen!',
    quickActions: 'Schnellaktionen',
    takePhoto: 'Foto',
    barcode: 'Barcode',
    upload: 'Hochladen',
    dailyHealthReport: 'Täglicher Gesundheitsbericht',
    overallChoice: 'Gesamtwahl',
    totalScans: 'Scans gesamt',
    healthyPercent: 'Gesund %',
    favorites: 'Favoriten',
    viewAll: 'Alle ansehen',
    recentScans: 'Letzte Scans',
    seeAll: 'Alle',
    loadingRecentScans: 'Lade letzte Scans...',
    noScansYet: 'Noch keine Produkte gescannt.',
    startFirstScan: 'Ersten KI-Scan starten',
    foodItem: 'Lebensmittel',

    aiFoodScanner: 'KI-Lebensmittelscanner',
    camera: 'Kamera',
    cameraUnavailable: 'Kamera nicht verfügbar. Bild stattdessen hochladen.',
    switchToUpload: 'Zum Hochladen wechseln',
    alignFoodLabel: 'Nährwerttabelle hier ausrichten',
    tapToUpload: 'Tippen zum Hochladen eines Fotos',
    fileSizeHint: 'PNG, JPG, WEBP bis 20 MB',
    optionalNoteLabel: 'Optionale Notiz (z. B. "Diabetiker" oder "Erdnüsse prüfen"):',
    optionalNotePlaceholder: 'Ernährungshinweis oder Frage hinzufügen...',
    retakePhoto: 'Neues Foto',
    analyzeWithAI: 'Mit Gemini KI analysieren',
    snapFoodPhoto: 'Produktfoto aufnehmen',
    geminiInspecting: 'Gemini KI prüft...',
    analyzingDetails: 'Analysiere Zutaten, Zusatzstoffe, Zucker & Risiken',
    analysisFailed: 'Analyse fehlgeschlagen. Bitte auf klares Bild achten.',

    noScanSelected: 'Kein Scan ausgewählt',
    noScanSelectedDesc: 'Scanne ein Produkt oder wähle eines aus dem Verlauf.',
    scanProductNow: 'Jetzt scannen',
    aiHealthResult: 'KI-Gesundheitsergebnis',
    summaryCopied: 'Zusammenfassung in Zwischenablage kopiert!',
    aiVerdict: 'KI-Urteil:',
    nutritionFacts: 'Nährwerte',
    per: 'pro',
    calories: 'Kalorien',
    protein: 'Eiweiß',
    sugar: 'Zucker',
    fat: 'Fett',
    salt: 'Salz',
    fiber: 'Ballaststoffe',
    carbs: 'Kohlenhydr.',
    carbohydrates: 'Kohlenhydrate',
    amount: 'Menge',
    noMacroData: 'Keine Makronährstoffdaten',
    macronutrientBreakdown: 'Makronährstoff-Verteilung',
    ingredientsAdditiveAnalysis: 'Zutaten & Zusatzstoffe',
    additiveLabel: 'Zusatzstoff',
    colorLabel: 'Farbstoff',
    sweetenerLabel: 'Süßstoff',
    allergenLabel: 'Allergen',
    fullIngredientsList: 'Vollständige Zutatenliste:',
    ingredientsNotParsed: 'Zutaten nicht explizit erkannt.',
    positivesGoodPoints: 'Vorteile & Pluspunkte',
    drawbacksBadPoints: 'Nachteile & Minuspunkte',
    warningsPrecautions: 'Warnungen & Hinweise',
    dailyConsumptionAdvice: 'Tägliche Verzehrempfehlung',
    healthierAlternatives: 'Gesündere Alternativen',
    scanAnotherProduct: 'Weiteres Produkt scannen',
    outOf100: 'Von 100',

    populationSuitability: 'Eignung nach Zielgruppen',
    children: 'Kinder',
    diabetics: 'Diabetiker',
    pregnantWomen: 'Schwangere',
    elderlyPeople: 'Senioren',
    gymAthletes: 'Sportler & Fitness',
    safe: 'Geeignet',
    caution: 'Vorsicht',

    searchFoodProducts: 'Lebensmittel Suchen',
    searchPlaceholder: 'Nach Namen suchen (z. B. Nutella, Joghurt)...',
    popularSearches: 'Beliebte Suchen',
    noExactMatch: 'Kein exakter Treffer. Suche ändern oder Foto scannen!',
    searchFailed: 'Suche fehlgeschlagen. Internetverbindung prüfen.',
    scanPackagingInstead: 'Stattdessen Verpackungsfoto scannen',
    productPartial: 'Produktdaten unvollständig. Bitte Foto aufnehmen.',
    failedAnalyzeProduct: 'Produkt konnte nicht analysiert werden.',

    scanHistory: 'Scan-Verlauf',
    searchHistoryPlaceholder: 'Nach Name oder Marke suchen...',
    filterAll: 'Alle',
    filterFavorites: 'Favoriten',
    filterHealthy: 'Gesund',
    filterUnhealthy: 'Ungesund',
    sortNewest: 'Neueste',
    sortOldest: 'Älteste',
    sortHighScore: 'Höchste Punkte',
    sortLowScore: 'Niedrigste Punkte',
    loadingHistory: 'Lade Verlauf...',
    noScansFound: 'Keine Scans gefunden',
    noProductMatchesFilter: 'Kein Produkt passt zu diesem Filter.',
    scanFoodProduct: 'Lebensmittel scannen',
    deleteConfirmTitle: 'Scan löschen',
    deleteConfirmMsg: 'Diesen Eintrag aus dem Verlauf löschen?',
    deleteBtn: 'Löschen',

    guestUser: 'Gast',
    guestMode: 'Gastmodus',
    healthyLabel: 'Gesund',
    unhealthyLabel: 'Ungesund',
    unlockableAchievements: 'Erfolge',
    unlocked: 'Freigeschaltet',
    achHealthExplorer: 'Gesundheits-Entdecker',
    achHealthExplorerDesc: 'Erstes Lebensmittelprodukt gescannt',
    achAdditiveInspector: 'Zusatzstoff-Prüfer',
    achAdditiveInspectorDesc: '5 Zutatenanalysen abgeschlossen',
    achGreenEater: 'Grüner Genießer',
    achGreenEaterDesc: '3 sehr gesunde Produkte gescannt (80+ Punkte)',
    achNutriScanPro: 'NutriScan Pro',
    achNutriScanProDesc: 'Über 10 Scans im Gesundheitskonto gespeichert',
    signOutSwitch: 'Abmelden / Konto wechseln',
    signInCreateAccount: 'Anmelden / Konto erstellen',

    preferencesSettings: 'Einstellungen & Präferenzen',
    appearance: 'Darstellung',
    themeMode: 'Farbmodus',
    darkMode: 'Dunkelmodus',
    lightMode: 'Hellmodus',
    languageLabel: 'Sprache',
    dietaryPreferences: 'Ernährungspräferenzen',
    dietaryDesc: 'Ausgewählte Präferenzen werden bei der KI-Risikobewertung priorisiert.',
    dietDiabeticFriendly: 'Diabetikerfreundlich',
    dietVegan: 'Vegan',
    dietGlutenFree: 'Glutenfrei',
    dietNutFree: 'Nussfrei',
    dietLowSodium: 'Natriumarm',
    dietPregnancySafe: 'Schwangerschaftssicher',
    dietKetoFriendly: 'Keto-freundlich',
    aboutLegal: 'Info & Rechtliches',
    sendFeedback: 'Feedback & Vorschläge senden',
    privacyEncryption: 'Datenschutz & Verschlüsselung',
    privacyDesc: 'NutriScan AI speichert deinen Verlauf sicher ohne Datenverkauf.',
    aboutNutriScan: 'Über NutriScan AI v2.5',
    aboutDesc: 'Angetrieben von Google Gemini AI und Open Food Facts.',
    sendAppFeedback: 'App-Feedback senden',
    feedbackThanks: 'Danke für dein Feedback! NutriScan AI wird stetig verbessert.',
    feedbackPlaceholder: 'Teile deine Gedanken oder Wünsche mit...',

    welcomeTitle: 'Willkommen bei NutriScan AI',
    welcomeSubtitle: 'Synchronisiere Verlauf, Gesundheitsprofile & Erfolge',
    createAccount: 'Konto erstellen',
    fullName: 'Vollständiger Name',
    fullNamePlaceholder: 'Max Mustermann',
    emailAddress: 'E-Mail-Adresse',
    emailPlaceholder: 'name@beispiel.de',
    password: 'Passwort',
    forgotPassword: 'Passwort vergessen?',
    processing: 'Verarbeite...',
    orContinueWith: 'Oder fortfahren mit',
    googleAccount: 'Google-Konto',
    continueAsGuest: 'Als Gast fortfahren',
    encryptedSecureAuth: 'Verschlüsselte & sichere Anmeldung',
    resetPassword: 'Passwort zurücksetzen',
    resetPasswordDesc: 'E-Mail eingeben, um Anweisungen zu erhalten.',
    resetLocalDesc: 'Registrierte E-Mail eingeben und neues Passwort wählen.',
    newPassword: 'Neues Passwort',
    sendResetLink: 'Link senden',
    updatePassword: 'Passwort ändern',
    resetEmailSent: 'Anweisungen wurden per E-Mail gesendet!',
    passwordUpdated: 'Passwort aktualisiert! Du kannst dich jetzt anmelden.',

    scanProductBarcode: 'Barcode scannen',
    pointCameraBarcode: 'Kamera auf EAN/UPC-Code richten',
    typeBarcodeManually: 'Oder Barcode manuell eingeben:',
    barcodePlaceholder: 'z. B. 737628064502',
    scanBtn: 'Scannen',
    enterValidBarcode: 'Bitte gültigen Barcode eingeben',
    barcodeNotFoundPrompt: 'Barcode unleserlich oder nicht gefunden?',
    uploadPhotoInstead: 'Stattdessen Produktfoto hochladen',
    barcodeUnavailableMsg: 'Produktdaten nicht verfügbar. Bitte Foto aufnehmen.',
    barcodeFailedMsg: 'Barcode-Analyse fehlgeschlagen.',
    pwaInstallTitle: 'NutriScan AI installieren',
    pwaInstallDesc: 'Schneller Zugriff & sofortiges Scannen!',
    splashTagline: 'KI-gestützte Lebensmittel- & Barcode-Analyse',
    splashReady: 'VERSION 2.5 • KI BEREIT',

    creatorTitle: 'Ersteller & Entwickler',
    creatorByLabel: 'Erstellt von',
    creatorName: 'Umar Suhail',
    creatorRole: 'Ingenieurstudent, Bearys Institute of Technology',
    creatorDept: 'Abteilung für Künstliche Intelligenz & Data Science',
    addToHomeScreen: 'Zum Startbildschirm hinzufügen',
    addToHomeScreenDesc: 'Installiere NutriScan AI auf deinem Startbildschirm für schnellen Zugriff.',
    alreadyInstalled: 'Auf Startbildschirm installiert',
    installGuideTitle: 'Zum Startbildschirm hinzufügen',
    installGuideAndroid: 'Android (Chrome): Tippe oben rechts auf das Menü (⋮) und wähle „Zum Startbildschirm hinzufügen“ oder „App installieren“.',
    installGuideIOS: 'iPhone / iPad (Safari): Tippe unten auf Teilen und dann auf „Zum Home-Bildschirm“.',
    installGuideDesktop: 'Desktop (Chrome / Edge): Klicke auf das Installieren-Symbol in der Adressleiste.',
    gotIt: 'Verstanden',
    readResult: 'Vorlesen',
    readingResult: 'Liest vor...',
    stopReading: 'Stopp',
    changeVoice: 'Stimme ändern',
    voiceAccessibility: 'Sprach- & Vorleseassistent',
    voiceAccessibilityDesc: 'Höre Ergebnisse in klaren Sätzen. Wähle deine bevorzugte Stimme und Geschwindigkeit.',
    selectVoice: 'Stimme wählen',
    readingSpeed: 'Lesegeschwindigkeit',
    speedSlow: '0.8x Langsamer (Seniorenfreundlich)',
    speedNormal: '1.0x Normal',
    speedFast: '1.15x Schneller',
    testVoice: 'Stimme testen',
    aiVoicesGroup: 'Natürliche KI-Stimmen (Alle Sprachen)',
    deviceVoicesGroup: 'Geräte- / Browser-Stimmen',
    sampleTestSentence: 'Hallo! Ich bin NutriScan AI. Ich lese deine Gesundheitsergebnisse klar und deutlich vor.',
    voiceLoadHint: 'Tipp: Wähle eine natürliche KI-Stimme für klare Aussprache in jeder Sprache.',

    compare: 'Vergleich',
    compareTitle: 'Produktvergleich',
    compareSubtitle: 'Vergleiche zwei Lebensmittel oder Barcodes direkt miteinander.',
    productA: 'Produkt A',
    productB: 'Produkt B',
    selectFromHistory: 'Aus Verlauf wählen...',
    enterBarcodePrompt: 'Barcode eingeben...',
    lookupBarcode: 'Laden',
    compareWithAI: 'KI-Urteil',
    analyzingComparison: 'Nährwerte werden verglichen...',
    winner: 'Gesündere Wahl',
    tieResult: 'Ausgeglichen',
    keyDifferences: 'Wichtige Unterschiede',
    nutritionRecommendation: 'Ernährungsempfehlung',
    readComparison: 'Urteil vorlesen',
    swapProducts: 'A / B tauschen',
    compareEmptyHint: 'Wähle zwei gescannte Produkte oder gib oben Barcodes ein.',
    compareThisProduct: 'Produkt vergleichen',
    askNutritionist: 'KI-Ernährungsberater fragen',
    askNutritionistDesc: 'Frage alles zu Zutaten, Portionen oder Verträglichkeit.',
    askPlaceholder: 'z. B. Ist das abends geeignet?',
    sendQuestion: 'Fragen',
    thinkingAnswer: 'Prüfe Etikett...',
    listenAnswer: 'Anhören',
    quickQKids: 'Für Kinder geeignet?',
    quickQWeight: 'Zum Abnehmen gut?',
    quickQSwap: 'Gesündere Alternative?',
    quickQTime: 'Beste Tageszeit?',
    dietaryMatchTitle: 'Dein Ernährungsprofil',
    dietaryCompatible: 'Geeignet',
    dietaryCaution: 'Vorsicht',
    noDietaryPrefsSet: 'Lege Filter in den Einstellungen für persönliche Hinweise fest.',
    configurePrefs: 'Filter wählen',
    dailyGuidelineTitle: 'Tagesrichtwert-Check',
    dailyGuidelineSub: 'Anteil am empfohlenen Tagesbedarf pro Portion',
    statusLow: 'Niedrig',
    statusModerate: 'Mäßig',
    statusHigh: 'Hoch',
    statusGood: 'Gut',
    avgScore: 'Ø Score',
    scoreTrendTitle: 'Score-Verlauf',
    scoreTrendSubtitle: 'Letzte Scans',
    activeDietaryProfile: 'Aktive Ernährungsfilter',
    compareFoodsDesc: 'Vergleichen',

    adminCornerLabel: 'Admin',
    adminPasscodeTitle: 'Admin-Zugang',
    adminPasscodeDesc: 'Gib den Administrator-Passcode ein, um Umar Suhails Dashboard zu öffnen.',
    adminPasscodePlaceholder: 'Passcode eingeben',
    adminUnlockBtn: 'Prüfen & Öffnen',
    adminWrongPasscodeNotice: 'Ungültiger Admin-Passcode. Bitte melde dich als Benutzer an.',
    adminWelcomeBanner: 'Hallo Umar Suhail, Willkommen auf der Admin-Seite',
    adminWelcomeSubtitle: 'NutriScan AI Kontrollzentrum · Benutzerkonten & privates Feedback',
    adminSignOut: 'Admin verlassen',
    adminAccountsTab: 'Benutzerkonten',
    adminFeedbackTab: 'Feedback',
    adminTotalAccounts: 'Konten gesamt',
    adminTotalFeedback: 'Feedbacks',
    adminPendingReplies: 'Offen',
    adminSearchAccounts: 'Name oder E-Mail suchen...',
    adminNoAccountsYet: 'Noch keine registrierten Konten.',
    adminNoFeedbackYet: 'Noch kein Feedback eingegangen.',
    adminReplyPlaceholder: 'Private Antwort nur für diesen Benutzer schreiben...',
    adminSendReply: 'Antwort senden',
    adminReplySent: 'Privat gesendet',
    adminRepliedBadge: 'Beantwortet',
    adminPendingBadge: 'Ausstehend',
    myFeedbackTitle: 'Mein Feedback & Antworten',
    myFeedbackEmpty: 'Du hast noch kein Feedback gesendet.',
    adminReplyFromLabel: 'Antwort vom Admin (Umar Suhail)',
    waitingAdminReply: 'Privat an Admin gesendet — warte auf Antwort',
  },

  Hindi: {
    appName: 'NutriScan',
    online: 'ऑनलाइन',
    offline: 'ऑफ़लाइन',
    installApp: 'ऐप इंस्टॉल करें',
    install: 'इंस्टॉल',
    signIn: 'साइन इन',
    toggleTheme: 'थीम बदलें',
    home: 'होम',
    search: 'खोजें',
    scanAI: 'AI स्कैन',
    history: 'इतिहास',
    settings: 'सेटिंग्स',
    cancel: 'रद्द करें',
    submit: 'सबमिट करें',
    loading: 'लोड हो रहा है...',
    score: 'स्कोर',
    grade: 'ग्रेड',
    serving: 'सर्विंग',

    riskVeryHealthy: 'बहुत स्वास्थ्यवर्धक',
    riskHealthy: 'स्वास्थ्यवर्धक',
    riskModerate: 'मध्यम',
    riskUnhealthy: 'अस्वास्थ्यकर',
    riskAvoidFrequently: 'बार-बार खाने से बचें',

    aiHealthCompanion: 'AI स्वास्थ्य साथी',
    hello: 'नमस्ते',
    nutritionist: 'उपयोगकर्ता',
    scansCount: 'स्कैन',
    instantFoodAnalysis: 'त्वरित खाद्य विश्लेषण',
    instantFoodDesc: 'तस्वीरें लें या बारकोड स्कैन करें और पोषण व एडिटिव्स जानें!',
    quickActions: 'त्वरित कार्य',
    takePhoto: 'फोटो लें',
    barcode: 'बारकोड',
    upload: 'अपलोड',
    dailyHealthReport: 'दैनिक स्वास्थ्य रिपोर्ट',
    overallChoice: 'कुल चयन',
    totalScans: 'कुल स्कैन',
    healthyPercent: 'स्वस्थ %',
    favorites: 'पसंदीदा',
    viewAll: 'सभी देखें',
    recentScans: 'हाल के स्कैन',
    seeAll: 'सभी देखें',
    loadingRecentScans: 'हाल के स्कैन लोड हो रहे हैं...',
    noScansYet: 'अभी तक कोई उत्पाद स्कैन नहीं किया गया।',
    startFirstScan: 'पहला AI स्कैन शुरू करें',
    foodItem: 'खाद्य उत्पाद',

    aiFoodScanner: 'AI फूड स्कैनर',
    camera: 'कैमरा',
    cameraUnavailable: 'कैमरा उपलब्ध नहीं है। आप इमेज अपलोड कर सकते हैं।',
    switchToUpload: 'अपलोड मोड पर जाएं',
    alignFoodLabel: 'फूड लेबल / पोषण जानकारी यहाँ रखें',
    tapToUpload: 'पैकेजिंग फोटो अपलोड करने के लिए टैप करें',
    fileSizeHint: 'PNG, JPG, WEBP (20MB तक)',
    optionalNoteLabel: 'वैकल्पिक नोट (जैसे "मुझे डायबिटीज है" या "मूंगफली जांचें"):',
    optionalNotePlaceholder: 'कोई आहार नोट या प्रश्न लिखें...',
    retakePhoto: 'दोबारा फोटो लें',
    analyzeWithAI: 'Gemini AI से विश्लेषण करें',
    snapFoodPhoto: 'पैकेजिंग की फोटो लें',
    geminiInspecting: 'Gemini AI जांच कर रहा है...',
    analyzingDetails: 'सामग्री, एडिटिव्स, शुगर और जोखिम स्कोर का विश्लेषण',
    analysisFailed: 'AI विश्लेषण विफल। कृपया साफ तस्वीर अपलोड करें।',

    noScanSelected: 'कोई स्कैन चयनित नहीं',
    noScanSelectedDesc: 'कोई उत्पाद स्कैन करें या इतिहास से चुनें।',
    scanProductNow: 'अभी स्कैन करें',
    aiHealthResult: 'AI स्वास्थ्य परिणाम',
    summaryCopied: 'सारांश क्लिपबोर्ड पर कॉपी हो गया!',
    aiVerdict: 'AI निष्कर्ष:',
    nutritionFacts: 'पोषण तथ्य',
    per: 'प्रति',
    calories: 'कैलोरी',
    protein: 'प्रोटीन',
    sugar: 'चीनी (शुगर)',
    fat: 'वसा (फैट)',
    salt: 'नमक',
    fiber: 'फाइबर',
    carbs: 'कार्ब्स',
    carbohydrates: 'कार्बोहाइड्रेट',
    amount: 'मात्रा',
    noMacroData: 'मैक्रो डेटा उपलब्ध नहीं',
    macronutrientBreakdown: 'मैक्रोन्यूट्रिएंट विवरण',
    ingredientsAdditiveAnalysis: 'सामग्री और एडिटिव्स विश्लेषण',
    additiveLabel: 'एडिटिव',
    colorLabel: 'रंग',
    sweetenerLabel: 'स्वीटनर',
    allergenLabel: 'एलर्जेन',
    fullIngredientsList: 'पूरी सामग्री सूची:',
    ingredientsNotParsed: 'सामग्री स्पष्ट रूप से उपलब्ध नहीं।',
    positivesGoodPoints: 'अच्छे बिंदु (लाभ)',
    drawbacksBadPoints: 'कमियां और नुकसान',
    warningsPrecautions: 'चेतावनियां और सावधानियां',
    dailyConsumptionAdvice: 'दैनिक सेवन सलाह',
    healthierAlternatives: 'बेहतर और स्वस्थ विकल्प',
    scanAnotherProduct: 'अन्य उत्पाद स्कैन करें',
    outOf100: '100 में से',

    populationSuitability: 'विभिन्न वर्गों के लिए उपयुक्तता',
    children: 'बच्चे',
    diabetics: 'मधुमेह (डायबिटीज)',
    pregnantWomen: 'गर्भवती महिलाएं',
    elderlyPeople: 'बुजुर्ग',
    gymAthletes: 'जिम और एथलीट',
    safe: 'सुरक्षित',
    caution: 'सावधानी',

    searchFoodProducts: 'खाद्य उत्पाद खोजें',
    searchPlaceholder: 'नाम से खोजें (जैसे Nutella, Yogurt)...',
    popularSearches: 'लोकप्रिय खोजें',
    noExactMatch: 'कोई सटीक मिलान नहीं मिला। पैकेजिंग फोटो स्कैन करें!',
    searchFailed: 'खोज विफल। इंटरनेट कनेक्शन जांचें।',
    scanPackagingInstead: 'पैकेजिंग फोटो स्कैन करें',
    productPartial: 'उत्पाद विवरण अधूरा है। कृपया फोटो लें।',
    failedAnalyzeProduct: 'चयनित उत्पाद का विश्लेषण विफल।',

    scanHistory: 'स्कैन इतिहास',
    searchHistoryPlaceholder: 'नाम या ब्रांड से इतिहास खोजें...',
    filterAll: 'सभी',
    filterFavorites: 'पसंदीदा',
    filterHealthy: 'स्वस्थ',
    filterUnhealthy: 'अस्वस्थ',
    sortNewest: 'नवीनतम',
    sortOldest: 'सबसे पुराना',
    sortHighScore: 'उच्चतम स्कोर',
    sortLowScore: 'न्यूनतम स्कोर',
    loadingHistory: 'इतिहास लोड हो रहा है...',
    noScansFound: 'कोई स्कैन नहीं मिला',
    noProductMatchesFilter: 'इस फ़िल्टर से कोई उत्पाद मेल नहीं खाता।',
    scanFoodProduct: 'उत्पाद स्कैन करें',
    deleteConfirmTitle: 'स्कैन हटाएं',
    deleteConfirmMsg: 'क्या आप इस रिकॉर्ड को इतिहास से हटाना चाहते हैं?',
    deleteBtn: 'हटाएं',

    guestUser: 'अतिथि उपयोगकर्ता',
    guestMode: 'अतिथि मोड',
    healthyLabel: 'स्वस्थ',
    unhealthyLabel: 'अस्वस्थ',
    unlockableAchievements: 'उपलब्धियां',
    unlocked: 'अनलॉक',
    achHealthExplorer: 'हेल्थ एक्सप्लोरर',
    achHealthExplorerDesc: 'अपना पहला खाद्य उत्पाद स्कैन किया',
    achAdditiveInspector: 'एडिटिव इंस्पेक्टर',
    achAdditiveInspectorDesc: '5 सामग्री विश्लेषण पूरे किए',
    achGreenEater: 'ग्रीन ईटर',
    achGreenEaterDesc: '3 उच्च गुणवत्ता वाले स्वस्थ उत्पाद स्कैन किए (स्कोर 80+)',
    achNutriScanPro: 'NutriScan प्रो',
    achNutriScanProDesc: '10 से अधिक स्कैन सहेजे',
    signOutSwitch: 'साइन आउट / खाता बदलें',
    signInCreateAccount: 'साइन इन / नया खाता बनाएं',

    preferencesSettings: 'प्राथमिकताएं और सेटिंग्स',
    appearance: 'दिखावट (थीम)',
    themeMode: 'थीम मोड',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    languageLabel: 'भाषा',
    dietaryPreferences: 'आहार प्राथमिकताएं',
    dietaryDesc: 'Gemini AI खाद्य जोखिम मूल्यांकन में चुनी गई प्राथमिकताओं को महत्व देता है।',
    dietDiabeticFriendly: 'डायबिटीज-अनुकूल',
    dietVegan: 'वीगन (शाकाहारी)',
    dietGlutenFree: 'ग्लूटेन-मुक्त',
    dietNutFree: 'नट-मुक्त',
    dietLowSodium: 'कम नमक (सोडियम)',
    dietPregnancySafe: 'गर्भावस्था सुरक्षित',
    dietKetoFriendly: 'कीटो-अनुकूल',
    aboutLegal: 'जानकारी और गोपनीयता',
    sendFeedback: 'सुझाव और प्रतिक्रिया भेजें',
    privacyEncryption: 'गोपनीयता और सुरक्षा',
    privacyDesc: 'NutriScan AI आपका इतिहास सुरक्षित रखता है और डेटा साझा नहीं करता।',
    aboutNutriScan: 'NutriScan AI v2.5 के बारे में',
    aboutDesc: 'Google Gemini AI और Open Food Facts द्वारा संचालित।',
    sendAppFeedback: 'प्रतिक्रिया भेजें',
    feedbackThanks: 'आपकी प्रतिक्रिया के लिए धन्यवाद!',
    feedbackPlaceholder: 'अपने विचार या सुझाव लिखें...',

    welcomeTitle: 'NutriScan AI में आपका स्वागत है',
    welcomeSubtitle: 'अपना पोषण इतिहास, स्वास्थ्य प्रोफ़ाइल और उपलब्धियां सिंक करें',
    createAccount: 'खाता बनाएं',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'राहुल शर्मा',
    emailAddress: 'ईमेल पता',
    emailPlaceholder: 'name@example.com',
    password: 'पासवर्ड',
    forgotPassword: 'पासवर्ड भूल गए?',
    processing: 'प्रक्रिया जारी है...',
    orContinueWith: 'या इसके साथ जारी रखें',
    googleAccount: 'Google खाता',
    continueAsGuest: 'अतिथि के रूप में जारी रखें',
    encryptedSecureAuth: 'एन्क्रिप्टेड और सुरक्षित प्रमाणीकरण',
    resetPassword: 'पासवर्ड रीसेट करें',
    resetPasswordDesc: 'अपना ईमेल दर्ज करें और हम निर्देश भेजेंगे।',
    resetLocalDesc: 'अपना पंजीकृत ईमेल दर्ज करें और नया पासवर्ड चुनें।',
    newPassword: 'नया पासवर्ड',
    sendResetLink: 'रीसेट लिंक भेजें',
    updatePassword: 'पासवर्ड अपडेट करें',
    resetEmailSent: 'रीसेट निर्देश आपके ईमेल पर भेजे गए!',
    passwordUpdated: 'पासवर्ड अपडेट हो गया! अब आप साइन इन कर सकते हैं।',

    scanProductBarcode: 'उत्पाद बारकोड स्कैन करें',
    pointCameraBarcode: 'कैमरा EAN/UPC कोड पर रखें',
    typeBarcodeManually: 'या बारकोड नंबर टाइप करें:',
    barcodePlaceholder: 'उदा. 737628064502',
    scanBtn: 'स्कैन',
    enterValidBarcode: 'कृपया सही बारकोड दर्ज करें',
    barcodeNotFoundPrompt: 'बारकोड पढ़ने में समस्या या नहीं मिला?',
    uploadPhotoInstead: 'पैकेजिंग फोटो अपलोड करें',
    barcodeUnavailableMsg: 'बारकोड विवरण उपलब्ध नहीं। कृपया पैकेजिंग की फोटो लें।',
    barcodeFailedMsg: 'बारकोड विश्लेषण विफल।',
    pwaInstallTitle: 'NutriScan AI ऐप इंस्टॉल करें',
    pwaInstallDesc: 'तेज़ एक्सेस और तुरंत फोटो स्कैनिंग!',
    splashTagline: 'AI-संचालित खाद्य और बारकोड स्वास्थ्य विश्लेषण',
    splashReady: 'संस्करण 2.5 • AI तैयार',

    creatorTitle: 'निर्माता और डेवलपर',
    creatorByLabel: 'निर्माता',
    creatorName: 'उमर सुहैल (Umar Suhail)',
    creatorRole: 'इंजीनियरिंग छात्र, बियरीज़ इंस्टीट्यूट ऑफ टेक्नोलॉजी (Bearys Institute of Technology)',
    creatorDept: 'आर्टिफिशियल इंटेलिजेंस और डेटा साइंस विभाग',
    addToHomeScreen: 'होम स्क्रीन पर जोड़ें',
    addToHomeScreenDesc: 'तुरंत उपयोग के लिए NutriScan AI को अपनी होम स्क्रीन पर इंस्टॉल करें।',
    alreadyInstalled: 'होम स्क्रीन पर इंस्टॉल है',
    installGuideTitle: 'होम स्क्रीन पर जोड़ें',
    installGuideAndroid: 'Android (Chrome): ऊपर दाईं ओर 3-डॉट मेनू (⋮) पर टैप करें और "Add to Home screen" या "Install app" चुनें।',
    installGuideIOS: 'iPhone / iPad (Safari): नीचे Share बटन पर टैप करें और "Add to Home Screen" चुनें।',
    installGuideDesktop: 'Desktop (Chrome / Edge): एड्रेस बार में इंस्टॉल आइकन पर क्लिक करें।',
    gotIt: 'समझ गया',
    readResult: 'पढ़कर सुनाएं',
    readingResult: 'पढ़ रहा है...',
    stopReading: 'रोकें',
    changeVoice: 'आवाज़ बदलें',
    voiceAccessibility: 'आवाज़ और पठन सहायक',
    voiceAccessibilityDesc: 'परिणामों को स्पष्ट वाक्यों में सुनें। अपनी पसंदीदा आवाज़ और गति चुनें।',
    selectVoice: 'आवाज़ चुनें',
    readingSpeed: 'पढ़ने की गति',
    speedSlow: '0.8x धीमा (बुजुर्गों के लिए आसान)',
    speedNormal: '1.0x सामान्य',
    speedFast: '1.15x तेज़',
    testVoice: 'आवाज़ जांचें',
    aiVoicesGroup: 'प्राकृतिक AI आवाज़ें (सभी भाषाएं)',
    deviceVoicesGroup: 'डिवाइस / ब्राउज़र आवाज़ें',
    sampleTestSentence: 'नमस्ते! मैं NutriScan AI हूँ। मैं आपके उत्पाद के स्वास्थ्य परिणाम साफ़ शब्दों में पढ़कर सुनाऊँगा।',
    voiceLoadHint: 'सुझाव: हर भाषा में स्पष्ट उच्चारण के लिए प्राकृतिक AI आवाज़ चुनें।',

    compare: 'तुलना',
    compareTitle: 'उत्पाद तुलना',
    compareSubtitle: 'बेहतर विकल्प चुनने के लिए दो खाद्य उत्पादों या बारकोड की तुलना करें।',
    productA: 'उत्पाद A',
    productB: 'उत्पाद B',
    selectFromHistory: 'इतिहास से चुनें...',
    enterBarcodePrompt: 'बारकोड नंबर लिखें...',
    lookupBarcode: 'लोड करें',
    compareWithAI: 'AI निर्णय लें',
    analyzingComparison: 'पोषण तुलना हो रही है...',
    winner: 'बेहतर स्वास्थ्य विकल्प',
    tieResult: 'बराबरी',
    keyDifferences: 'मुख्य अंतर',
    nutritionRecommendation: 'पोषण विशेषज्ञ की सलाह',
    readComparison: 'निर्णय सुनें',
    swapProducts: 'A / B बदलें',
    compareEmptyHint: 'तुलना करने के लिए ऊपर दो स्कैन किए गए उत्पाद चुनें या बारकोड डालें।',
    compareThisProduct: 'तुलना करें',
    askNutritionist: 'AI पोषण विशेषज्ञ से पूछें',
    askNutritionistDesc: 'सामग्री, मात्रा या अपने आहार के बारे में कुछ भी पूछें।',
    askPlaceholder: 'जैसे: क्या यह शाम के नाश्ते के लिए सही है?',
    sendQuestion: 'पूछें',
    thinkingAnswer: 'जांच हो रही है...',
    listenAnswer: 'सुनें',
    quickQKids: 'बच्चों के लिए सुरक्षित?',
    quickQWeight: 'वजन घटाने में मददगार?',
    quickQSwap: 'बेहतर विकल्प क्या है?',
    quickQTime: 'खाने का सही समय?',
    dietaryMatchTitle: 'आपका आहार मिलान',
    dietaryCompatible: 'अनुकूल',
    dietaryCaution: 'सावधानी',
    noDietaryPrefsSet: 'व्यक्तिगत जांच के लिए सेटिंग्स में आहार फ़िल्टर चुनें।',
    configurePrefs: 'फ़िल्टर चुनें',
    dailyGuidelineTitle: 'दैनिक पोषण मानक',
    dailyGuidelineSub: 'प्रति सर्विंग दैनिक अनुशंसित सीमा का हिस्सा',
    statusLow: 'कम',
    statusModerate: 'मध्यम',
    statusHigh: 'अधिक',
    statusGood: 'उत्तम',
    avgScore: 'औसत स्कोर',
    scoreTrendTitle: 'स्वास्थ्य स्कोर ट्रेंड',
    scoreTrendSubtitle: 'हाल के स्कैन किए गए उत्पाद',
    activeDietaryProfile: 'सक्रिय आहार फ़िल्टर',
    compareFoodsDesc: 'तुलना करें',

    adminCornerLabel: 'एडमिन',
    adminPasscodeTitle: 'एडमिन पासकोड सत्यापन',
    adminPasscodeDesc: 'उमर सुहैल का एडमिन डैशबोर्ड खोलने के लिए पासकोड दर्ज करें।',
    adminPasscodePlaceholder: 'पासकोड लिखें',
    adminUnlockBtn: 'सत्यापित करें',
    adminWrongPasscodeNotice: 'गलत एडमिन पासकोड। कृपया अपने यूज़र खाते से लॉग इन करें।',
    adminWelcomeBanner: 'नमस्ते उमर सुहैल, एडमिन पेज पर आपका स्वागत है',
    adminWelcomeSubtitle: 'NutriScan AI कंट्रोल सेंटर · पंजीकृत खाते और निजी फ़ीडबैक',
    adminSignOut: 'एडमिन से बाहर निकलें',
    adminAccountsTab: 'यूज़र खाते',
    adminFeedbackTab: 'यूज़र फ़ीडबैक',
    adminTotalAccounts: 'कुल खाते',
    adminTotalFeedback: 'कुल फ़ीडबैक',
    adminPendingReplies: 'जवाब बाकी',
    adminSearchAccounts: 'नाम या ईमेल खोजें...',
    adminNoAccountsYet: 'अभी तक कोई यूज़र खाता नहीं बना है।',
    adminNoFeedbackYet: 'अभी तक कोई फ़ीडबैक नहीं मिला है।',
    adminReplyPlaceholder: 'केवल इस यूज़र के लिए निजी जवाब लिखें...',
    adminSendReply: 'जवाब भेजें',
    adminReplySent: 'निजी जवाब भेजा गया',
    adminRepliedBadge: 'जवाब दिया गया',
    adminPendingBadge: 'प्रतीक्षारत',
    myFeedbackTitle: 'मेरा फ़ीडबैक और एडमिन के जवाब',
    myFeedbackEmpty: 'आपने अभी कोई फ़ीडबैक नहीं भेजा है। यह केवल आपको और एडमिन उमर सुहैल को दिखता है।',
    adminReplyFromLabel: 'एडमिन (उमर सुहैल) का जवाब',
    waitingAdminReply: 'एडमिन को निजी रूप से भेजा गया — जवाब की प्रतीक्षा है',
  },

  Arabic: {
    appName: 'NutriScan',
    online: 'متصل',
    offline: 'غير متصل',
    installApp: 'تثبيت التطبيق',
    install: 'تثبيت',
    signIn: 'تسجيل الدخول',
    toggleTheme: 'تبديل المظهر',
    home: 'الرئيسية',
    search: 'بحث',
    scanAI: 'مسح ذكي',
    history: 'السجل',
    settings: 'الإعدادات',
    cancel: 'إلغاء',
    submit: 'إرسال',
    loading: 'جارٍ التحميل...',
    score: 'النتيجة',
    grade: 'التقييم',
    serving: 'الحصة',

    riskVeryHealthy: 'صحي جداً',
    riskHealthy: 'صحي',
    riskModerate: 'معتدل',
    riskUnhealthy: 'غير صحي',
    riskAvoidFrequently: 'تجنب التكرار',

    aiHealthCompanion: 'مساعد الصحة الذكي',
    hello: 'مرحباً',
    nutritionist: 'مستخدم',
    scansCount: 'عمليات المسح',
    instantFoodAnalysis: 'تحليل فوري للطعام',
    instantFoodDesc: 'التقط صوراً أو امسح الباركود لكشف المضافات والدرجة الصحية!',
    quickActions: 'إجراءات سريعة',
    takePhoto: 'التقاط صورة',
    barcode: 'باركود',
    upload: 'رفع صورة',
    dailyHealthReport: 'التقرير الصحي اليومي',
    overallChoice: 'الاختيار العام',
    totalScans: 'إجمالي المسح',
    healthyPercent: 'نسبة الصحي %',
    favorites: 'المفضلة',
    viewAll: 'عرض الكل',
    recentScans: 'عمليات المسح الأخيرة',
    seeAll: 'عرض الكل',
    loadingRecentScans: 'جارٍ تحميل السجل...',
    noScansYet: 'لم يتم مسح أي منتجات غذائية بعد.',
    startFirstScan: 'ابدأ أول مسح ذكي',
    foodItem: 'منتج غذائي',

    aiFoodScanner: 'ماسح الطعام الذكي',
    camera: 'الكاميرا',
    cameraUnavailable: 'الكاميرا غير متاحة. يمكنك رفع صورة بدلاً من ذلك.',
    switchToUpload: 'التبديل لوضع الرفع',
    alignFoodLabel: 'ضع ملصق المعلومات الغذائية هنا',
    tapToUpload: 'اضغط لرفع صورة عبوة المنتج',
    fileSizeHint: 'PNG, JPG, WEBP حتى 20 ميجابايت',
    optionalNoteLabel: 'ملاحظة اختيارية (مثلاً "مصاب بالسكري" أو "تحقق من الفول السوداني"):',
    optionalNotePlaceholder: 'أضف ملاحظة غذائية أو سؤالاً...',
    retakePhoto: 'إعادة التصوير',
    analyzeWithAI: 'تحليل بواسطة Gemini AI',
    snapFoodPhoto: 'التقاط صورة العبوة',
    geminiInspecting: 'Gemini AI يفحص المنتج...',
    analyzingDetails: 'تحليل المكونات والمضافات والسكريات والمخاطر',
    analysisFailed: 'فشل التحليل الذكي. تأكد من وضوح الصورة وحاول مجدداً.',

    noScanSelected: 'لم يتم اختيار مسح',
    noScanSelectedDesc: 'امسح منتجاً غذائياً أو اختر من السجل.',
    scanProductNow: 'امسح منتجاً الآن',
    aiHealthResult: 'نتيجة التحليل الصحي',
    summaryCopied: 'تم نسخ الملخص إلى الحافظة!',
    aiVerdict: 'حكم الذكاء الاصطناعي:',
    nutritionFacts: 'الحقائق التغذوية',
    per: 'لكل',
    calories: 'السعرات',
    protein: 'البروتين',
    sugar: 'السكر',
    fat: 'الدهون',
    salt: 'الملح',
    fiber: 'الألياف',
    carbs: 'الكربوهيدرات',
    carbohydrates: 'الكربوهيدرات',
    amount: 'الكمية',
    noMacroData: 'لا توجد بيانات مغذيات',
    macronutrientBreakdown: 'توزيع المغذيات الكبرى',
    ingredientsAdditiveAnalysis: 'تحليل المكونات والمضافات',
    additiveLabel: 'مضاف',
    colorLabel: 'ملون',
    sweetenerLabel: 'محلي صناعي',
    allergenLabel: 'مسبب حساسية',
    fullIngredientsList: 'قائمة المكونات الكاملة:',
    ingredientsNotParsed: 'لم يتم استخراج المكونات بدقة.',
    positivesGoodPoints: 'الإيجابيات والنقاط الجيدة',
    drawbacksBadPoints: 'السلبيات ونقاط الضعف',
    warningsPrecautions: 'تحذيرات واحتياطات',
    dailyConsumptionAdvice: 'نصيحة الاستهلاك اليومي',
    healthierAlternatives: 'بدائل أكثر صحة',
    scanAnotherProduct: 'مسح منتج آخر',
    outOf100: 'من 100',

    populationSuitability: 'الملاءمة الصحية للفئات',
    children: 'الأطفال',
    diabetics: 'مرضى السكري',
    pregnantWomen: 'الحوامل',
    elderlyPeople: 'كبار السن',
    gymAthletes: 'الرياضيون',
    safe: 'آمن',
    caution: 'حذر',

    searchFoodProducts: 'البحث عن المنتجات الغذائية',
    searchPlaceholder: 'ابحث بالاسم (مثل نوتيلا، زبادي)...',
    popularSearches: 'عمليات البحث الشائعة',
    noExactMatch: 'لم يتم العثور على تطابق. جرب بحثاً آخر أو التقط صورة!',
    searchFailed: 'فشل البحث. تحقق من اتصال الإنترنت.',
    scanPackagingInstead: 'امسح صورة العبوة بدلاً من ذلك',
    productPartial: 'تفاصيل المنتج غير مكتملة. يرجى التقاط صورة للعبوة.',
    failedAnalyzeProduct: 'فشل تحليل المنتج المحدد.',

    scanHistory: 'سجل المسح',
    searchHistoryPlaceholder: 'ابحث في السجل بالاسم أو العلامة...',
    filterAll: 'الكل',
    filterFavorites: 'المفضلة',
    filterHealthy: 'صحي',
    filterUnhealthy: 'غير صحي',
    sortNewest: 'الأحدث',
    sortOldest: 'الأقدم',
    sortHighScore: 'الأعلى تقييماً',
    sortLowScore: 'الأقل تقييماً',
    loadingHistory: 'جارٍ تحميل السجل...',
    noScansFound: 'لا توجد نتائج',
    noProductMatchesFilter: 'لا يوجد منتج يطابق هذا الفلتر.',
    scanFoodProduct: 'امسح منتجاً غذائياً',
    deleteConfirmTitle: 'حذف السجل',
    deleteConfirmMsg: 'هل تريد حذف هذا السجل من تاريخ المسح؟',
    deleteBtn: 'حذف',

    guestUser: 'مستخدم زائر',
    guestMode: 'وضع الزائر',
    healthyLabel: 'صحي',
    unhealthyLabel: 'غير صحي',
    unlockableAchievements: 'الإنجازات',
    unlocked: 'مفتوح',
    achHealthExplorer: 'مستكشف الصحة',
    achHealthExplorerDesc: 'مسحت أول منتج غذائي لك',
    achAdditiveInspector: 'مفتش المضافات',
    achAdditiveInspectorDesc: 'أكملت 5 تحليلات عميقة للمكونات',
    achGreenEater: 'آكل صحي',
    achGreenEaterDesc: 'مسحت 3 منتجات صحية عالية التقييم (80+)',
    achNutriScanPro: 'NutriScan محترف',
    achNutriScanProDesc: 'سجلت أكثر من 10 عمليات مسح',
    signOutSwitch: 'تسجيل الخروج / تبديل الحساب',
    signInCreateAccount: 'تسجيل الدخول / إنشاء حساب',

    preferencesSettings: 'التفضيلات والإعدادات',
    appearance: 'المظهر',
    themeMode: 'وضع العرض',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    languageLabel: 'اللغة',
    dietaryPreferences: 'التفضيلات الغذائية',
    dietaryDesc: 'تُعطى الأولوية للخيارات المحددة أثناء تقييم المخاطر بالذكاء الاصطناعي.',
    dietDiabeticFriendly: 'مناسب للسكري',
    dietVegan: 'نباتي صرف',
    dietGlutenFree: 'خالي من الجلوتين',
    dietNutFree: 'خالي من المكسرات',
    dietLowSodium: 'قليل الصوديوم',
    dietPregnancySafe: 'آمن للحمل',
    dietKetoFriendly: 'مناسب للكيتو',
    aboutLegal: 'حول التطبيق والخصوصية',
    sendFeedback: 'إرسال الملاحظات والاقتراحات',
    privacyEncryption: 'الخصوصية والتشفير',
    privacyDesc: 'يحفظ NutriScan AI سجلك بأمان دون بيع بياناتك أو استغلالها.',
    aboutNutriScan: 'حول NutriScan AI v2.5',
    aboutDesc: 'مدعوم بـ Google Gemini AI وقاعدة بيانات Open Food Facts.',
    sendAppFeedback: 'إرسال ملاحظات التطبيق',
    feedbackThanks: 'شكراً لملاحظاتك! نحن نعمل دائماً على تحسين NutriScan AI.',
    feedbackPlaceholder: 'شاركنا أفكارك أو اقتراحاتك...',

    welcomeTitle: 'مرحباً بك في NutriScan AI',
    welcomeSubtitle: 'زامن سجلك الغذائي وملفاتك الصحية وإنجازاتك',
    createAccount: 'إنشاء حساب',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'أحمد محمد',
    emailAddress: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    processing: 'جارٍ المعالجة...',
    orContinueWith: 'أو المتابعة باستخدام',
    googleAccount: 'حساب Google',
    continueAsGuest: 'المتابعة كزائر',
    encryptedSecureAuth: 'مصادقة مشفرة وآمنة',
    resetPassword: 'إعادة تعيين كلمة المرور',
    resetPasswordDesc: 'أدخل بريدك الإلكتروني وسنرسل لك تعليمات الاستعادة.',
    resetLocalDesc: 'أدخل بريدك المسجل واختر كلمة مرور جديدة.',
    newPassword: 'كلمة المرور الجديدة',
    sendResetLink: 'إرسال الرابط',
    updatePassword: 'تحديث كلمة المرور',
    resetEmailSent: 'تم إرسال تعليمات إعادة التعيين إلى بريدك!',
    passwordUpdated: 'تم تحديث كلمة المرور! يمكنك تسجيل الدخول الآن.',

    scanProductBarcode: 'مسح باركود المنتج',
    pointCameraBarcode: 'وجّه الكاميرا نحو رمز EAN/UPC',
    typeBarcodeManually: 'أو أدخل رقم الباركود يدوياً:',
    barcodePlaceholder: 'مثال: 737628064502',
    scanBtn: 'مسح',
    enterValidBarcode: 'يرجى إدخال رقم باركود صحيح',
    barcodeNotFoundPrompt: 'الباركود غير واضح أو غير موجود؟',
    uploadPhotoInstead: 'رفع صورة العبوة بدلاً من ذلك',
    barcodeUnavailableMsg: 'بيانات الباركود غير متوفرة. يرجى تصوير العبوة.',
    barcodeFailedMsg: 'فشل تحليل الباركود.',
    pwaInstallTitle: 'تثبيت تطبيق NutriScan AI',
    pwaInstallDesc: 'وصول سريع ومسح فوري للصور!',
    splashTagline: 'تحليل صحي ذكي للأغذية والباركود',
    splashReady: 'الإصدار 2.5 • الذكاء الاصطناعي جاهز',

    creatorTitle: 'المُنشئ والمطوّر',
    creatorByLabel: 'تم الإنشاء بواسطة',
    creatorName: 'عمر سهيل (Umar Suhail)',
    creatorRole: 'طالب هندسة، معهد بيريز للتكنولوجيا (Bearys Institute of Technology)',
    creatorDept: 'قسم الذكاء الاصطناعي وعلوم البيانات',
    addToHomeScreen: 'إضافة إلى الشاشة الرئيسية',
    addToHomeScreenDesc: 'ثبّت NutriScan AI على شاشتك الرئيسية للوصول السريع بلمسة واحدة.',
    alreadyInstalled: 'مثبّت على الشاشة الرئيسية',
    installGuideTitle: 'إضافة إلى الشاشة الرئيسية',
    installGuideAndroid: 'أندرويد (Chrome): اضغط على قائمة النقاط الثلاث (⋮) أعلى اليمين واختر "الإضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق".',
    installGuideIOS: 'آيفون / آيباد (Safari): اضغط على زر المشاركة في الأسفل ثم اختر "إضافة إلى الصفحة الرئيسية".',
    installGuideDesktop: 'سطح المكتب (Chrome / Edge): انقر على أيقونة التثبيت في شريط العنوان.',
    gotIt: 'حسناً',
    readResult: 'قراءة',
    readingResult: 'جارٍ القراءة...',
    stopReading: 'إيقاف',
    changeVoice: 'تغيير الصوت',
    voiceAccessibility: 'مساعد الصوت والقراءة',
    voiceAccessibilityDesc: 'استمع إلى النتائج بجمل واضحة ومناسبة لكبار السن. اختر الصوت والسرعة المفضلة.',
    selectVoice: 'اختر الصوت',
    readingSpeed: 'سرعة القراءة',
    speedSlow: '0.8x أبطأ (مناسب لكبار السن)',
    speedNormal: '1.0x عادي',
    speedFast: '1.15x أسرع',
    testVoice: 'تجربة الصوت',
    aiVoicesGroup: 'أصوات الذكاء الاصطناعي الطبيعية (كل اللغات)',
    deviceVoicesGroup: 'أصوات الجهاز / المتصفح',
    sampleTestSentence: 'مرحباً! أنا NutriScan AI. سأقرأ لك نتائج التحليل الصحي بوضوح.',
    voiceLoadHint: 'نصيحة: اختر أحد أصوات الذكاء الاصطناعي الطبيعية لنطق واضح بكل اللغات.',

    compare: 'مقارنة',
    compareTitle: 'مقارنة المنتجات',
    compareSubtitle: 'قارن بين منتجين أو باركودين لاختيار الخيار الأكثر صحة.',
    productA: 'المنتج أ',
    productB: 'المنتج ب',
    selectFromHistory: 'اختر من السجل...',
    enterBarcodePrompt: 'أدخل رقم الباركود...',
    lookupBarcode: 'تحميل',
    compareWithAI: 'تحليل الذكاء الاصطناعي',
    analyzingComparison: 'جارٍ مقارنة القيم الغذائية...',
    winner: 'الخيار الأكثر صحة',
    tieResult: 'متقاربان',
    keyDifferences: 'أبرز الفروقات',
    nutritionRecommendation: 'توصية خبير التغذية',
    readComparison: 'قراءة النتيجة',
    swapProducts: 'تبديل أ / ب',
    compareEmptyHint: 'اختر منتجين من السجل أو أدخل الباركود للمقارنة.',
    compareThisProduct: 'مقارنة المنتج',
    askNutritionist: 'اسأل خبير التغذية AI',
    askNutritionistDesc: 'اسأل عن المكونات أو الحصص أو ملاءمة المنتج لنظامك.',
    askPlaceholder: 'مثال: هل هو مناسب كوجبة خفيفة؟',
    sendQuestion: 'اسأل',
    thinkingAnswer: 'جارٍ الفحص...',
    listenAnswer: 'استماع',
    quickQKids: 'آمن للأطفال؟',
    quickQWeight: 'مناسب لإنقاص الوزن؟',
    quickQSwap: 'بديل صحي؟',
    quickQTime: 'أفضل وقت لتناوله؟',
    dietaryMatchTitle: 'توافق نظامك الغذائي',
    dietaryCompatible: 'متوافق',
    dietaryCaution: 'تنبيه',
    noDietaryPrefsSet: 'حدّد تفضيلاتك الغذائية في الإعدادات للحصول على تنبيهات مخصصة.',
    configurePrefs: 'تحديد الفلاتر',
    dailyGuidelineTitle: 'المعيار اليومي المرجعي',
    dailyGuidelineSub: 'النسبة من الحد اليومي الموصى به لكل حصة',
    statusLow: 'منخفض',
    statusModerate: 'متوسط',
    statusHigh: 'مرتفع',
    statusGood: 'جيد',
    avgScore: 'متوسط النتيجة',
    scoreTrendTitle: 'مؤشر النتائج الصحية',
    scoreTrendSubtitle: 'أحدث المنتجات المفحوصة',
    activeDietaryProfile: 'الفلاتر الغذائية النشطة',
    compareFoodsDesc: 'مقارنة',

    adminCornerLabel: 'المدير',
    adminPasscodeTitle: 'التحقق من رمز المدير',
    adminPasscodeDesc: 'أدخل رمز المرور الخاص بالمدير لفتح لوحة تحكم عمر سهيل.',
    adminPasscodePlaceholder: 'أدخل رمز المرور',
    adminUnlockBtn: 'تحقق ودخول',
    adminWrongPasscodeNotice: 'رمز المدير غير صحيح. يرجى تسجيل الدخول بحساب المستخدم.',
    adminWelcomeBanner: 'مرحباً عمر سهيل، أهلاً بك في صفحة المدير',
    adminWelcomeSubtitle: 'مركز تحكم NutriScan AI · حسابات المستخدمين والملاحظات الخاصة',
    adminSignOut: 'خروج المدير',
    adminAccountsTab: 'حسابات المستخدمين',
    adminFeedbackTab: 'ملاحظات المستخدمين',
    adminTotalAccounts: 'الحسابات المسجلة',
    adminTotalFeedback: 'الملاحظات',
    adminPendingReplies: 'بانتظار الرد',
    adminSearchAccounts: 'ابحث بالاسم أو البريد...',
    adminNoAccountsYet: 'لا توجد حسابات مسجلة بعد.',
    adminNoFeedbackYet: 'لا توجد ملاحظات مرسلة بعد.',
    adminReplyPlaceholder: 'اكتب رداً خاصاً يظهر لهذا المستخدم فقط...',
    adminSendReply: 'إرسال الرد',
    adminReplySent: 'تم إرسال الرد بشكل خاص',
    adminRepliedBadge: 'تم الرد',
    adminPendingBadge: 'قيد الانتظار',
    myFeedbackTitle: 'ملاحظاتي وردود المدير',
    myFeedbackEmpty: 'لم ترسل أي ملاحظات بعد. رسائلك خاصة بك وبالمدير عمر سهيل فقط.',
    adminReplyFromLabel: 'رد المدير (عمر سهيل)',
    waitingAdminReply: 'أُرسلت للمدير بشكل خاص — بانتظار الرد',
  },
};

export function translateRiskLevel(riskLevel: string, t: Translations): string {
  switch (riskLevel) {
    case 'Very Healthy':
      return t.riskVeryHealthy;
    case 'Healthy':
      return t.riskHealthy;
    case 'Moderate':
      return t.riskModerate;
    case 'Unhealthy':
      return t.riskUnhealthy;
    case 'Avoid Frequently':
      return t.riskAvoidFrequently;
    default:
      return riskLevel;
  }
}

export const DIETARY_KEYS = [
  'Diabetic-Friendly',
  'Vegan',
  'Gluten-Free',
  'Nut-Free',
  'Low-Sodium',
  'Pregnancy-Safe',
  'Keto-Friendly',
] as const;

export function translateDietaryOption(key: string, t: Translations): string {
  switch (key) {
    case 'Diabetic-Friendly':
      return t.dietDiabeticFriendly;
    case 'Vegan':
      return t.dietVegan;
    case 'Gluten-Free':
      return t.dietGlutenFree;
    case 'Nut-Free':
      return t.dietNutFree;
    case 'Low-Sodium':
      return t.dietLowSodium;
    case 'Pregnancy-Safe':
      return t.dietPregnancySafe;
    case 'Keto-Friendly':
      return t.dietKetoFriendly;
    default:
      return key;
  }
}
