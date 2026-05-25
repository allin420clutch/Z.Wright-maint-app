'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { ScanLine, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ScannerPage() {
  const router = useRouter();
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      // Direct navigation if it's a relative equipment path
      if (result.startsWith('/equipment/')) {
        router.push(result);
      } else {
        // Assume the raw value is an equipment ID
        router.push(`/equipment/${result}`);
      }
    }
  };

  const handleError = (error: unknown) => {
    console.error('QR Scanner error:', error);
    if (error instanceof Error && error.name !== 'NotFoundException') {
      setScanError(error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-light tracking-tight text-zinc-100">QR Scanner</h1>
            <p className="text-zinc-500 mt-1 uppercase font-mono text-sm tracking-widest">Scan Asset Tags for Details</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-zinc-800 border border-zinc-700 rounded-2xl flex flex-col overflow-hidden relative">
        {scanError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-zinc-900/90 z-20 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Scanner Error</h2>
            <p className="text-zinc-400 mb-6">{scanError}</p>
            <button 
              onClick={() => setScanError(null)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : null}

        <div className="flex-1 bg-black relative">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            scanDelay={1000}
          />
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur rounded-full border border-white/10 z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-amber-500" />
              Align QR code within frame
            </span>
          </div>
        </div>
        
        <div className="p-6 bg-zinc-900 border-t border-zinc-700 shrink-0">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">Instructions</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Point your camera at the QR code located near the manufacturer&apos;s plate on the equipment. 
            The scanner will automatically decode the tag and route you to the asset&apos;s active profile and diagnostic context.
          </p>
        </div>
      </div>
    </div>
  );
}
