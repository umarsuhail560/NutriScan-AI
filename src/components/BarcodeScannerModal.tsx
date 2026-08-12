import React, { useEffect, useRef, useState } from 'react';
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode';
import {
  X,
  Camera,
  Barcode,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface BarcodeScannerModalProps {
  onScanBarcode: (barcode: string) => void;
  onClose: () => void;
  onFallbackToPhotos: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onScanBarcode,
  onClose,
  onFallbackToPhotos,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  // Store repeated barcode readings.
  const barcodeVotesRef = useRef<Map<string, number>>(new Map());
  const scanLockedRef = useRef(false);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>(
    'environment'
  );
  const [switchingCamera, setSwitchingCamera] = useState(false);
  const [scanStatus, setScanStatus] = useState(
    'Position the barcode inside the scanning area'
  );

  /**
   * Clean a barcode returned by the scanner.
   */
  const normalizeBarcode = (value: string): string => {
    return value.replace(/\D/g, '').trim();
  };

  /**
   * Basic validation for common retail barcode lengths.
   *
   * NOTE:
   * We deliberately do not rely only on checksum validation because
   * an optical misread can still produce another mathematically valid
   * barcode.
   */
  const isPossibleRetailBarcode = (value: string): boolean => {
    return (
      value.length === 8 ||
      value.length === 12 ||
      value.length === 13 ||
      value.length === 14
    );
  };

  /**
   * Reset repeated barcode readings.
   */
  const resetBarcodeVotes = () => {
    barcodeVotesRef.current.clear();

    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    scanLockedRef.current = false;
  };

  /**
   * Select the barcode which appeared most frequently.
   *
   * A barcode must be detected multiple times before we accept it.
   */
  const registerBarcodeReading = (decodedText: string) => {
    if (!mountedRef.current || scanLockedRef.current) return;

    const barcode = normalizeBarcode(decodedText);

    if (!isPossibleRetailBarcode(barcode)) {
      return;
    }

    const votes = barcodeVotesRef.current;
    const currentVotes = votes.get(barcode) ?? 0;
    const newVotes = currentVotes + 1;

    votes.set(barcode, newVotes);

    setScanStatus(`Barcode detected — confirming (${newVotes}/3)`);

    /*
     * Require the exact same barcode to be detected 3 times.
     *
     * This prevents one incorrect camera frame from immediately
     * being sent to the backend.
     */
    if (newVotes >= 3) {
      scanLockedRef.current = true;

      setScanStatus('Barcode confirmed');

      // Give the UI a tiny moment to show confirmation.
      scanTimerRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;

        await stopScanner();

        if (mountedRef.current) {
          onScanBarcode(barcode);
        }
      }, 250);
    }
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      if (mountedRef.current) {
        setCameraActive(false);
      }
      return;
    }

    try {
      const state = scanner.getState();

      // 2 = SCANNING
      if (state === 2) {
        await scanner.stop();
      }
    } catch (error) {
      console.warn('Scanner stop error:', error);
    }

    try {
      scanner.clear();
    } catch (error) {
      console.warn('Scanner clear error:', error);
    }

    scannerRef.current = null;

    if (mountedRef.current) {
      setCameraActive(false);
    }
  };

  const startScanner = async (
    facing: 'environment' | 'user' = cameraFacing
  ) => {
    setErrorMsg(null);
    setScanStatus('Position the barcode inside the scanning area');

    resetBarcodeVotes();

    try {
      // Stop previous scanner first.
      await stopScanner();

      if (!mountedRef.current) return;

      const scanner = new Html5Qrcode('barcode-reader', {
        verbose: false,
      });

      scannerRef.current = scanner;

      const config = {
        /*
         * 10 FPS is okay for normal phones.
         * Increasing it unnecessarily can increase processing load.
         */
        fps: 10,

        /*
         * A wider rectangle works better for horizontal EAN/UPC
         * barcodes.
         */
        qrbox: {
          width: 300,
          height: 160,
        },

        aspectRatio: 1.7777778,

        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
        ],
      };

      await scanner.start(
        {
          facingMode: facing,
        },
        config,

        /*
         * IMPORTANT:
         * Do NOT immediately accept the first decoded value.
         *
         * We collect repeated readings instead.
         */
        (decodedText) => {
          registerBarcodeReading(decodedText);
        },

        /*
         * Normal frame-by-frame failures are ignored.
         */
        () => {}
      );

      if (mountedRef.current) {
        setCameraActive(true);
        setScanStatus(
          'Keep the barcode steady until it is confirmed'
        );
      }
    } catch (error: any) {
      console.error('Barcode camera error:', error);

      if (mountedRef.current) {
        setCameraActive(false);

        setErrorMsg(
          facing === 'environment'
            ? 'Rear camera could not be opened. Please allow camera permission or switch to the front camera.'
            : 'Front camera could not be opened. Please allow camera permission or switch to the rear camera.'
        );
      }
    }
  };

  const switchCamera = async () => {
    if (switchingCamera) return;

    setSwitchingCamera(true);
    setErrorMsg(null);

    const newFacing =
      cameraFacing === 'environment' ? 'user' : 'environment';

    setCameraFacing(newFacing);

    try {
      await startScanner(newFacing);
    } finally {
      if (mountedRef.current) {
        setSwitchingCamera(false);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const code = normalizeBarcode(manualCode);

    if (!code || !isPossibleRetailBarcode(code)) {
      setErrorMsg(
        'Please enter a valid 8, 12, 13, or 14 digit barcode number.'
      );
      return;
    }

    onScanBarcode(code);
  };

  useEffect(() => {
    mountedRef.current = true;

    // Start rear camera automatically.
    startScanner('environment');

    return () => {
      mountedRef.current = false;

      resetBarcodeVotes();

      const scanner = scannerRef.current;

      if (scanner) {
        try {
          if (scanner.getState() === 2) {
            scanner.stop().catch(() => {});
          }
        } catch {
          // Ignore cleanup errors.
        }

        try {
          scanner.clear();
        } catch {
          // Ignore cleanup errors.
        }
      }

      scannerRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Barcode className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-base font-bold">
                Scan Product Barcode
              </h2>

              <p className="text-xs text-slate-400">
                Point camera at EAN / UPC code
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              await stopScanner();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto space-y-4">

          {/* CAMERA */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800">

            <div
              id="barcode-reader"
              className="w-full min-h-[280px] text-slate-200"
            />

            {/* Camera switch */}
            {cameraActive && (
              <button
                onClick={switchCamera}
                disabled={switchingCamera}
                className="absolute top-3 right-3 z-10 p-3 rounded-full bg-slate-950/80 border border-slate-700 text-white shadow-lg hover:bg-slate-800 disabled:opacity-50"
                title="Switch camera"
                aria-label="Switch between front and rear camera"
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    switchingCamera ? 'animate-spin' : ''
                  }`}
                />
              </button>
            )}

            {/* Camera label */}
            {cameraActive && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                <div className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-xs font-semibold text-emerald-300">
                  {cameraFacing === 'environment'
                    ? 'Rear Camera'
                    : 'Front Camera'}
                </div>
              </div>
            )}
          </div>

          {/* SCAN STATUS */}
          {cameraActive && !errorMsg && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-xs text-emerald-300 font-medium">
                {scanStatus}
              </p>
            </div>
          )}

          {/* CAMERA ERROR */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />

                <div className="flex-1">
                  <p className="text-xs text-rose-300">
                    {errorMsg}
                  </p>

                  {!cameraActive && (
                    <button
                      onClick={() => startScanner(cameraFacing)}
                      className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold text-white"
                    >
                      Retry Camera
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MANUAL BARCODE */}
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">

            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Or type barcode manually:
            </label>

            <form
              onSubmit={handleManualSubmit}
              className="flex gap-2"
            >
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 737628064502"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  setErrorMsg(null);
                }}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1 transition-all"
              >
                Scan
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* FALLBACK */}
          <div className="p-3 bg-slate-800/30 rounded-2xl border border-slate-800 text-center space-y-2">

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-amber-400" />

              <span>
                Barcode hard to read or not found?
              </span>
            </div>

            <button
              onClick={async () => {
                await stopScanner();
                onFallbackToPhotos();
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Camera className="w-4 h-4" />
              Upload Packaging Photo Instead
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};