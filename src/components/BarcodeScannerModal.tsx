import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Barcode, AlertCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { t } = useTheme();
  const [manualCode, setManualCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'barcode-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 160 },
        aspectRatio: 1.5,
      },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (decodedText) {
          scanner.clear().catch(() => {});
          onScanBarcode(decodedText);
        }
      },
      () => {
        // Ignore minor frame errors
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onScanBarcode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setErrorMsg(t.enterValidBarcode);
      return;
    }
    onScanBarcode(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md md:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t.scanProductBarcode}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.pointCameraBarcode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Container */}
        <div className="p-4 overflow-y-auto space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div id="barcode-reader" className="w-full text-slate-800 dark:text-slate-200" />
          </div>

          {/* Manual Enter Box */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.typeBarcodeManually}
            </label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={t.barcodePlaceholder}
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  setErrorMsg(null);
                }}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1 transition-all"
              >
                {t.scanBtn} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            {errorMsg && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errorMsg}</p>}
          </div>

          {/* Fallback option */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>{t.barcodeNotFoundPrompt}</span>
            </div>
            <button
              onClick={onFallbackToPhotos}
              className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Camera className="w-4 h-4" />
              {t.uploadPhotoInstead}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
