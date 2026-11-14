import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PWAProvider, usePWAInstall } from './context/PWAContext';
import { SpeechProvider } from './context/SpeechContext';
import { FoodScan } from './types';
import { analyzeBarcodeWithAI, saveScanToFirestore } from './services/scanService';
import { Loader2, Barcode } from 'lucide-react';

// Components
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { ResultPage } from './pages/ResultPage';
import { SearchPage } from './pages/SearchPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { ComparePage } from './pages/ComparePage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const navigate = useNavigate();
  const { t } = useTheme();
  const { userProfile, updateUserStats } = useAuth();
  const { deferredPrompt, installApp } = usePWAInstall();

  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [currentScan, setCurrentScan] = useState<FoodScan | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const openUserLoginOnWrongPasscode = () => {
    setShowAdminPrompt(false);
    setAuthNotice(t.adminWrongPasscodeNotice);
    setShowAuthModal(true);
    navigate('/');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleInstallPWA = () => {
    void installApp();
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowBarcodeModal(false);
    setBarcodeLoading(true);
    try {
      const res = await analyzeBarcodeWithAI(barcode);
      if (res.found && res.data) {
        const aiData = res.data;
        const isHealthy = (aiData.healthScore || 50) >= 60;
        const scanPayload: Omit<FoodScan, 'id'> = {
          userId: userProfile?.uid || 'guest',
          productName: aiData.productName || `Barcode ${barcode}`,
          brand: aiData.brand || 'Unknown Brand',
          barcode: aiData.barcode || barcode,
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
        const saved = await saveScanToFirestore(scanPayload, userProfile?.uid || 'guest');
        await updateUserStats(isHealthy);
        setCurrentScan(saved);
        navigate('/result');
      } else {
        showToast(res.message || t.barcodeUnavailableMsg);
        navigate('/scan', { state: { mode: 'photo' } });
      }
    } catch {
      showToast(t.barcodeFailedMsg);
    } finally {
      setBarcodeLoading(false);
    }
  };

  const handleSelectScan = (scan: FoodScan) => {
    setCurrentScan(scan);
    navigate('/result');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-emerald-500 selection:text-white transition-colors">
      <Header
        onOpenAuth={() => {
          setAuthNotice(null);
          setShowAuthModal(true);
        }}
        onOpenProfile={() => navigate('/profile')}
        deferredPrompt={deferredPrompt}
        onInstallPWA={handleInstallPWA}
      />

      <PWAInstallBanner />

      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl border border-slate-700 text-center">
          {toastMsg}
        </div>
      )}

      {barcodeLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-sm p-6 text-white text-center space-y-3">
          <div className="relative p-4 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl">
            <Barcode className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
          </div>
          <p className="text-sm font-bold font-['Outfit']">{t.geminiInspecting}</p>
          <p className="text-xs text-slate-300 max-w-xs">{t.analyzingDetails}</p>
        </div>
      )}

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                onOpenBarcodeScanner={() => setShowBarcodeModal(true)}
                onSelectScan={handleSelectScan}
                onOpenAdmin={() => setShowAdminPrompt(true)}
              />
            }
          />
          <Route
            path="/scan"
            element={
              <ScannerPage
                onScanComplete={(scan) => setCurrentScan(scan)}
                onOpenBarcodeScanner={() => setShowBarcodeModal(true)}
              />
            }
          />
          <Route
            path="/result"
            element={
              <ResultPage
                scan={currentScan}
                onBack={() => navigate('/')}
              />
            }
          />
          <Route
            path="/search"
            element={<SearchPage onSelectScan={handleSelectScan} />}
          />
          <Route
            path="/history"
            element={<HistoryPage onSelectScan={handleSelectScan} />}
          />
          <Route
            path="/profile"
            element={
              <ProfilePage
                onOpenAuth={() => {
                  setAuthNotice(null);
                  setShowAuthModal(true);
                }}
              />
            }
          />
          <Route
            path="/compare"
            element={<ComparePage onSelectScan={handleSelectScan} />}
          />
          <Route
            path="/admin"
            element={
              <AdminPage
                onExitAdmin={() => navigate('/')}
                onWrongPasscode={openUserLoginOnWrongPasscode}
              />
            }
          />
          <Route
            path="/login"
            element={
              <AuthPage
                onSuccess={() => navigate('/')}
                onOpenAdmin={() => setShowAdminPrompt(true)}
                noticeMessage={authNotice}
              />
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Barcode Scanner Modal */}
      {showBarcodeModal && (
        <BarcodeScannerModal
          onScanBarcode={handleBarcodeScan}
          onClose={() => setShowBarcodeModal(false)}
          onFallbackToPhotos={() => {
            setShowBarcodeModal(false);
            navigate('/scan', { state: { mode: 'photo' } });
          }}
        />
      )}

      {/* Admin Passcode Modal */}
      {showAdminPrompt && (
        <AdminPasscodeModal
          onClose={() => setShowAdminPrompt(false)}
          onSuccess={() => {
            setShowAdminPrompt(false);
            setShowAuthModal(false);
            setAuthNotice(null);
            navigate('/admin');
          }}
          onWrongPasscode={openUserLoginOnWrongPasscode}
        />
      )}

      {/* Auth Screen Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <button
            onClick={() => {
              setShowAuthModal(false);
              setAuthNotice(null);
            }}
            className="fixed top-4 right-4 z-50 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-md"
          >
            ✕
          </button>
          <AuthPage
            onClose={() => {
              setShowAuthModal(false);
              setAuthNotice(null);
            }}
            onOpenAdmin={() => {
              setShowAuthModal(false);
              setShowAdminPrompt(true);
            }}
            noticeMessage={authNotice}
          />
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PWAProvider>
        <SpeechProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </SpeechProvider>
      </PWAProvider>
    </ThemeProvider>
  );
}
