import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FoodScan, ScanMode } from '../types';
import {
  analyzeImageWithAI,
  saveScanToFirestore,
} from '../services/scanService';
import {
  Camera,
  Upload,
  Barcode,
  Sparkles,
  RefreshCw,
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

  const initialMode: ScanMode = location.state?.mode || 'photo';
  const [mode, setMode] = useState<ScanMode>(initialMode);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Rear camera is the default
  const [cameraFacing, setCameraFacing] = useState<
    'user' | 'environment'
  >('environment');

  const [cameraError, setCameraError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------
  // STOP CAMERA
  // --------------------------------------------------
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;

      stream.getTracks().forEach((track) => {
        track.stop();
      });

      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  // --------------------------------------------------
  // START CAMERA
  // --------------------------------------------------
  const startCamera = async (
    facing: 'user' | 'environment' = cameraFacing
  ) => {
    setCameraError(null);

    // Stop previous camera before starting another one
    stopCamera();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Camera access is not supported by this browser.'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: facing,
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      videoRef.current.srcObject = stream;

      try {
        await videoRef.current.play();
      } catch (playError) {
        console.warn('Video play error:', playError);
      }

      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);

      setCameraActive(false);

      if (facing === 'environment') {
        setCameraError(
          'Rear camera could not be opened. Try switching to the front camera.'
        );
      } else {
        setCameraError(
          'Front camera could not be opened. Try switching to the rear camera.'
        );
      }
    }
  };

  // --------------------------------------------------
  // SWITCH FRONT / REAR CAMERA
  // --------------------------------------------------
  const switchCamera = async () => {
    const newFacing: 'user' | 'environment' =
      cameraFacing === 'environment' ? 'user' : 'environment';

    setCameraFacing(newFacing);

    await startCamera(newFacing);
  };

  // --------------------------------------------------
  // INITIALIZE CAMERA
  // --------------------------------------------------
  useEffect(() => {
    if (mode === 'photo' && !selectedImage) {
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, selectedImage]);

  // --------------------------------------------------
  // CAPTURE PHOTO
  // --------------------------------------------------
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const dataUrl = canvas.toDataURL(
        'image/jpeg',
        0.85
      );

      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  // --------------------------------------------------
  // FILE UPLOAD
  // --------------------------------------------------
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Basic image validation
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // 20 MB limit
    if (file.size > 20 * 1024 * 1024) {
      setError('Image size must be less than 20MB.');
      return;
    }

    setError(null);

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };

    reader.onerror = () => {
      setError('Unable to read the selected image.');
    };

    reader.readAsDataURL(file);
  };

  // --------------------------------------------------
  // AI ANALYSIS
  // --------------------------------------------------
  const runAnalysis = async () => {
    if (!selectedImage) {
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const aiData = await analyzeImageWithAI(
        selectedImage,
        'image/jpeg',
        userPrompt
      );

      const isHealthy =
        (aiData.healthScore || 50) >= 60;

      const scanPayload: Omit<FoodScan, 'id'> = {
        userId: userProfile?.uid || 'guest',

        productName:
          aiData.productName ||
          'Scanned Food Product',

        brand:
          aiData.brand ||
          'Unknown',

        healthScore:
          aiData.healthScore ?? 65,

        grade:
          aiData.grade ||
          'B',

        riskLevel:
          aiData.riskLevel ||
          'Healthy',

        calories:
          aiData.calories ||
          '200 kcal',

        protein:
          aiData.protein ||
          '5g',

        fat:
          aiData.fat ||
          '4g',

        sugar:
          aiData.sugar ||
          '3g',

        salt:
          aiData.salt ||
          '0.2g',

        fiber:
          aiData.fiber ||
          '2g',

        carbohydrates:
          aiData.carbohydrates ||
          '25g',

        servingSize:
          aiData.servingSize ||
          '100g',

        ingredients:
          aiData.ingredients ||
          [],

        artificialColors:
          aiData.artificialColors ||
          [],

        preservatives:
          aiData.preservatives ||
          [],

        artificialSweeteners:
          aiData.artificialSweeteners ||
          [],

        additives:
          aiData.additives ||
          [],

        allergens:
          aiData.allergens ||
          [],

        suitability:
          aiData.suitability || {
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

        goodPoints:
          aiData.goodPoints ||
          [],

        badPoints:
          aiData.badPoints ||
          [],

        warnings:
          aiData.warnings ||
          [],

        benefits:
          aiData.benefits ||
          [],

        dailyAdvice:
          aiData.dailyAdvice ||
          '',

        alternatives:
          aiData.alternatives ||
          [],

        summary:
          aiData.summary ||
          'Nutritional analysis complete.',

        imageUrl:
          selectedImage,

        createdAt:
          new Date().toISOString(),

        isFavorite: false,
      };

      // Login required for history
      if (!userProfile?.uid) {
        throw new Error(
          'Please login before saving scan history'
        );
      }

      const saved =
        await saveScanToFirestore(
          scanPayload,
          userProfile.uid
        );

      await updateUserStats(isHealthy);

      onScanComplete(saved);

      navigate('/result');
    } catch (err: any) {
      console.error(
        'Analysis error:',
        err
      );

      setError(
        err?.message ||
          'AI Analysis failed. Please ensure the image is clear and try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">

      {/* TOP BAR */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Camera className="w-5 h-5" />
          </div>

          <h2 className="text-base font-bold font-['Outfit']">
            AI Food Scanner
          </h2>

        </div>

        {/* MODE SWITCHER */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">

          <button
            onClick={() => {
              setMode('photo');
              setSelectedImage(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'photo'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400'
            }`}
          >
            Camera
          </button>

          <button
            onClick={() => {
              setMode('upload');
              setSelectedImage(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'upload'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400'
            }`}
          >
            Upload
          </button>

          <button
            onClick={onOpenBarcodeScanner}
            className="px-3 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1"
          >
            <Barcode className="w-3.5 h-3.5" />
            Barcode
          </button>

        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">

        {/* ERROR */}
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">

            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* CAMERA VIEWPORT */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 aspect-[4/3] flex items-center justify-center shadow-2xl">

          {/* ANALYZING OVERLAY */}
          {analyzing && (
            <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">

              <div className="relative w-20 h-20 flex items-center justify-center">

                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />

                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">

                  <Sparkles
                    className="w-8 h-8 text-white animate-spin"
                    style={{
                      animationDuration: '3s',
                    }}
                  />

                </div>

              </div>

              <div>

                <h4 className="text-base font-extrabold text-white font-['Outfit']">
                  Gemini AI Inspecting...
                </h4>

                <p className="text-xs text-emerald-300 mt-1">
                  Analyzing ingredients, additives, sugars & risk scores
                </p>

              </div>

              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">

                <div className="h-full bg-emerald-400 animate-pulse w-full" />

              </div>

            </div>
          )}

          {/* SELECTED IMAGE */}
          {selectedImage ? (

            <div className="relative w-full h-full">

              <img
                src={selectedImage}
                alt="Captured food packaging"
                className="w-full h-full object-cover"
              />

              {!analyzing && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 p-2 bg-slate-950/80 text-white rounded-full hover:bg-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

            </div>

          ) : mode === 'photo' ? (

            /* CAMERA MODE */

            cameraError ? (

              <div className="p-6 text-center space-y-3">

                <Camera className="w-10 h-10 text-slate-600 mx-auto" />

                <p className="text-xs text-slate-400">
                  {cameraError}
                </p>

                <div className="flex gap-2 justify-center">

                  <button
                    type="button"
                    onClick={() => {
                      setCameraError(null);
                      startCamera(
                        cameraFacing
                      );
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                  >
                    Retry Camera
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setMode('upload')
                    }
                    className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
                  >
                    Upload Instead
                  </button>

                </div>

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

                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {/* CAMERA SWITCH BUTTON */}
                {cameraActive && !analyzing && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="absolute top-3 right-3 z-10 p-3 bg-slate-950/80 backdrop-blur-sm text-white rounded-full border border-slate-700 hover:bg-slate-900 active:scale-95 transition-all shadow-lg"
                    title="Switch camera"
                    aria-label="Switch between front and rear camera"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}

                {/* CAMERA LABEL */}
                {cameraActive && !analyzing && (
                  <div className="absolute top-4 left-4 z-10 bg-slate-950/70 backdrop-blur-sm text-[10px] font-bold text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30">
                    {cameraFacing === 'environment'
                      ? 'Rear Camera'
                      : 'Front Camera'}
                  </div>
                )}

                {/* TARGET FRAME */}
                <div className="absolute inset-8 border-2 border-dashed border-emerald-400/70 rounded-2xl pointer-events-none flex items-center justify-center">

                  <span className="bg-slate-950/70 backdrop-blur-sm text-[11px] font-semibold text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                    Align food label / nutrition facts here
                  </span>

                </div>

              </div>
            )

          ) : (

            /* UPLOAD MODE */

            <label className="w-full h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl cursor-pointer bg-slate-950/50 transition-all group">

              <FileImage className="w-12 h-12 text-slate-500 group-hover:text-emerald-400 transition-colors mb-2" />

              <span className="text-xs font-bold text-slate-200">
                Tap to upload food packaging photo
              </span>

              <span className="text-[10px] text-slate-500 mt-1">
                PNG, JPG, WEBP up to 20MB
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

            </label>
          )}

        </div>

        {/* ACTION CONTROLS */}

        {selectedImage ? (

          <div className="space-y-3">

            <div>

              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Optional note (e.g. "I am diabetic" or "Check for peanuts"):
              </label>

              <input
                type="text"
                placeholder="Add dietary note or question..."
                value={userPrompt}
                onChange={(e) =>
                  setUserPrompt(e.target.value)
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  setSelectedImage(null)
                }
                className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl transition-all"
              >
                Retake Photo
              </button>

              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >

                <Sparkles className="w-4 h-4 text-emerald-200" />

                {analyzing
                  ? 'Analyzing...'
                  : 'Analyze with Gemini AI'}

              </button>

            </div>

          </div>

        ) : mode === 'photo' && cameraActive ? (

          <button
            type="button"
            onClick={capturePhoto}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all"
          >

            <Camera className="w-5 h-5" />

            Snap Food Packaging Photo

          </button>

        ) : null}

      </div>

    </div>
  );
};