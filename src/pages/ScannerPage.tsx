import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FoodScan, ScanMode } from '../types';
import { analyzeImageWithAI, saveScanToFirestore } from '../services/scanService';
import {
  Camera,
  Barcode,
  Sparkles,
  AlertCircle,
  X,
  FileImage,
} from 'lucide-react';

interface ScannerPageProps {
  onScanComplete: (scan: FoodScan) => void;
  onOpenBarcodeScanner: () => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  onScanComplete,
  onOpenBarcodeScanner,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, updateUserStats } = useAuth();
  const { t } = useTheme();

  const initialMode: ScanMode = location.state?.mode || 'photo';
  const [mode, setMode] = useState<ScanMode>(initialMode);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'photo' && !selectedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, selectedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(t.cameraUnavailable);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    setError(null);

    try {
      const aiData = await analyzeImageWithAI(selectedImage, 'image/jpeg', userPrompt);

      const isHealthy = (aiData.healthScore || 50) >= 60;
      const scanPayload: Omit<FoodScan, 'id'> = {
        userId: userProfile?.uid || 'guest',
        productName: aiData.productName || 'Scanned Food Product',
        brand: aiData.brand || 'Unknown',
        healthScore: aiData.healthScore ?? 65,
        grade: aiData.grade || 'B',
        riskLevel: aiData.riskLevel || 'Healthy',
        calories: aiData.calories || '200 kcal',
        protein: aiData.protein || '5g',
        fat: aiData.fat || '4g',
        sugar: aiData.sugar || '3g',
        salt: aiData.salt || '0.2g',
        fiber: aiData.fiber || '2g',
        carbohydrates: aiData.carbohydrates || '25g',
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
        imageUrl: selectedImage,
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };

      const saved = await saveScanToFirestore(scanPayload, userProfile?.uid || 'guest');
      await updateUserStats(isHealthy);
      onScanComplete(saved);
      navigate('/result');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || t.analysisFailed);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-10 transition-colors">
      {/* Top Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold font-['Outfit']">{t.aiFoodScanner}</h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setMode('photo');
                setSelectedImage(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'photo' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.camera}
            </button>
            <button
              onClick={() => {
                setMode('upload');
                setSelectedImage(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'upload' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.upload}
            </button>
            <button
              onClick={onOpenBarcodeScanner}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1"
            >
              <Barcode className="w-3.5 h-3.5" /> {t.barcode}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Viewport Area */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-[4/3] lg:aspect-[16/10] flex items-center justify-center shadow-xl">
              {analyzing && (
                <div className="absolute inset-0 z-20 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                      <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white font-['Outfit']">{t.geminiInspecting}</h4>
                    <p className="text-xs text-emerald-300 mt-1">{t.analyzingDetails}</p>
                  </div>
                  <div className="w-full max-w-xs h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 animate-pulse w-full" />
                  </div>
                </div>
              )}

              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img src={selectedImage} alt="Captured food packaging" className="w-full h-full object-cover" />
                  {!analyzing && (
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-3 right-3 p-2 bg-slate-950/80 text-white rounded-full hover:bg-slate-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ) : mode === 'photo' ? (
                cameraError ? (
                  <div className="p-6 text-center space-y-3">
                    <Camera className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cameraError}</p>
                    <button
                      onClick={() => setMode('upload')}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                    >
                      {t.switchToUpload}
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-8 border-2 border-dashed border-emerald-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
                      <span className="bg-slate-950/75 backdrop-blur-sm text-[11px] font-semibold text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                        {t.alignFoodLabel}
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-3xl cursor-pointer bg-slate-50 dark:bg-slate-950/50 transition-all group">
                  <FileImage className="w-12 h-12 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.tapToUpload}</span>
                  <span className="text-[10px] text-slate-500 mt-1">{t.fileSizeHint}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right Column: Action controls & Barcode/Tips */}
          <div className="lg:col-span-5 space-y-4">
            {selectedImage ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t.optionalNoteLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.optionalNotePlaceholder}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition-all"
                  >
                    {t.retakePhoto}
                  </button>
                  <button
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-900/20 dark:shadow-emerald-950/50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-100" />
                    {t.analyzeWithAI}
                  </button>
                </div>
              </div>
            ) : mode === 'photo' && cameraActive ? (
              <button
                onClick={capturePhoto}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5" /> {t.snapFoodPhoto}
              </button>
            ) : null}

            {/* Quick Barcode & Upload Alternative Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {t.instantFoodAnalysis}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.instantFoodDesc}
              </p>
              <button
                onClick={onOpenBarcodeScanner}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Barcode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{t.scanProductBarcode}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
