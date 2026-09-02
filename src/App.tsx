import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FoodScan } from './types';

// Components
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { ResultPage } from './pages/ResultPage';
import { SearchPage } from './pages/SearchPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

function AppContent() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentScan, setCurrentScan] = useState<FoodScan | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const isDark = theme === 'dark';

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstall
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstall
      );
    };
  }, []);

  const handleInstallPWA = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
    });
  };

  // Select an existing scan
  const handleSelectScan = (scan: FoodScan) => {
    setCurrentScan(scan);
    navigate('/result');
  };

  // Scanner completed
  const handleScanComplete = (scan: FoodScan) => {
    setCurrentScan(scan);
    navigate('/result');
  };

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans'] transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      <Header
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => navigate('/profile')}
        deferredPrompt={deferredPrompt}
        onInstallPWA={handleInstallPWA}
      />

      <PWAInstallBanner />

      <main className="flex-1">
        <Routes>

          {/* PUBLIC ROUTES */}

          <Route
            path="/"
            element={
              <DashboardPage
                onSelectScan={handleSelectScan}
              />
            }
          />

          <Route
            path="/scan"
            element={
              <ScannerPage
                onScanComplete={handleScanComplete}
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
            element={
              <SearchPage
                onSelectScan={handleSelectScan}
              />
            }
          />

          {/* PROTECTED ROUTES */}

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage
                  onSelectScan={handleSelectScan}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>

      {/* LOGIN MODAL */}

      {showAuthModal && (
        <div
          className={`fixed inset-0 z-50 overflow-y-auto transition-colors duration-300 ${
            isDark
              ? 'bg-slate-950'
              : 'bg-slate-100'
          }`}
        >
          <button
            onClick={() => setShowAuthModal(false)}
            className={`fixed top-4 right-4 z-50 p-2 rounded-full border transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white bg-slate-900 border-slate-800'
                : 'text-slate-500 hover:text-slate-900 bg-white border-slate-200'
            }`}
            aria-label="Close login"
          >
            ✕
          </button>

          <AuthPage
            onClose={() => setShowAuthModal(false)}
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
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}