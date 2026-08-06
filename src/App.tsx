import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FoodScan } from './types';
import { analyzeBarcodeWithAI } from './services/scanService';

// Components
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
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
  const { userProfile } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [currentScan, setCurrentScan] = useState<FoodScan | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);


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
    if (deferredPrompt) {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };


  const handleBarcodeScan = async (barcode: string) => {

    setShowBarcodeModal(false);

    try {

      const res = await analyzeBarcodeWithAI(barcode);

      if (res.found && res.data) {

        setCurrentScan(res.data);

        navigate('/result');

      } 
      else {

        alert(
          res.message ||
          'Product details unavailable. Please upload package image.'
        );

        navigate('/scan', {
          state:{
            mode:'photo'
          }
        });

      }

    } catch(error){

      alert('Failed to analyze barcode');

    }

  };


  const handleSelectScan = (scan: FoodScan)=>{

    setCurrentScan(scan);

    navigate('/result');

  };



  if(showSplash){

    return(
      <SplashScreen
        onFinish={()=>setShowSplash(false)}
      />
    );

  }



  return (

    <div className="
      min-h-screen 
      bg-slate-950 
      text-slate-100 
      flex 
      flex-col 
      font-['Plus_Jakarta_Sans']
    ">


      <Header

        onOpenAuth={()=>setShowAuthModal(true)}

        onOpenProfile={()=>navigate('/profile')}

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

                onOpenBarcodeScanner={
                  ()=>setShowBarcodeModal(true)
                }

                onSelectScan={
                  handleSelectScan
                }

              />

            }

          />



          <Route

            path="/scan"

            element={

              <ScannerPage

                onScanComplete={
                  (scan)=>setCurrentScan(scan)
                }

                onOpenBarcodeScanner={
                  ()=>setShowBarcodeModal(true)
                }

              />

            }

          />



          <Route

            path="/result"

            element={

              <ResultPage

                scan={currentScan}

                onBack={()=>
                  navigate('/')
                }

              />

            }

          />



          <Route

            path="/search"

            element={

              <SearchPage

                onSelectScan={
                  handleSelectScan
                }

              />

            }

          />




          {/* PROTECTED ROUTES */}



          <Route

            path="/history"

            element={

              <ProtectedRoute>

                <HistoryPage

                  onSelectScan={
                    handleSelectScan
                  }

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




      {/* Barcode Scanner Modal */}


      {
        showBarcodeModal && (

          <BarcodeScannerModal

            onScanBarcode={
              handleBarcodeScan
            }

            onClose={()=>
              setShowBarcodeModal(false)
            }


            onFallbackToPhotos={()=>{

              setShowBarcodeModal(false);

              navigate('/scan',{
                state:{
                  mode:'photo'
                }
              });

            }}

          />

        )
      }





      {/* LOGIN MODAL */}



      {
        showAuthModal && (

          <div
            className="
            fixed 
            inset-0 
            z-50 
            overflow-y-auto 
            bg-slate-950
            "
          >


            <button

              onClick={()=>
                setShowAuthModal(false)
              }

              className="
              fixed 
              top-4 
              right-4 
              z-50 
              p-2 
              text-slate-400 
              hover:text-white 
              bg-slate-900 
              rounded-full 
              border 
              border-slate-800
              "

            >

              ✕

            </button>



            <AuthPage

              onClose={()=>
                setShowAuthModal(false)
              }

            />


          </div>

        )
      }



      <BottomNav />


    </div>

  );

}




export default function App(){

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