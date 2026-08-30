import React, { useState } from 'react';
import { X, ShieldCheck, Camera, FileCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface VerificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifiedSuccess: () => void;
}

export const VerificationCenterModal: React.FC<VerificationCenterModalProps> = ({
  isOpen,
  onClose,
  onVerifiedSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selfieUrl, setSelfieUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  if (!isOpen) return null;

  const sampleSelfies = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
  ];

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setStep(4);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#252525]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Verification Center</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center space-x-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? 'bg-[#FFC107] text-black' : step > s ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 4 && <div className={`w-10 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-neutral-800'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Earn Your Verified Checkmark</h4>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
                  Get up to 3x more matches and build trust with the community by completing our quick, secure 2-step verification.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Confirms you are a real person</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Protects against catfishing and spam</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Takes less than 30 seconds</span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-[#FFC107] text-[#121212] font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg active:scale-95"
              >
                Start Verification
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-white">Step 1: Gesture Selfie</h4>
                <p className="text-xs text-neutral-400">Choose a pose sample or simulate camera capture holding up 2 fingers.</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {sampleSelfies.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setSelfieUrl(url)}
                    className={`h-32 rounded-xl overflow-hidden border-2 cursor-pointer relative transition ${
                      selfieUrl === url ? 'border-[#FFC107] scale-105 shadow-lg' : 'border-neutral-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Sample ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {selfieUrl === url && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-[#FFC107] fill-black" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                disabled={!selfieUrl}
                onClick={() => setStep(3)}
                className={`w-full py-3 font-black text-sm rounded-xl transition shadow ${
                  selfieUrl ? 'bg-[#FFC107] text-black hover:opacity-90 active:scale-95' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Continue to ID Scan
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-white">Step 2: Biometric Scan</h4>
                <p className="text-xs text-neutral-400">Our secure system is matching your selfie features against anti-fraud models.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center space-y-4">
                <div className="w-20 h-20 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto relative animate-pulse">
                  <Camera className="w-10 h-10" />
                </div>

                {isScanning ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-white">Scanning biometrics... {scanProgress}%</p>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleStartScan}
                    className="px-6 py-2.5 bg-cyan-500 text-black font-extrabold text-xs rounded-xl hover:bg-cyan-400 transition shadow"
                  >
                    Run Biometric Scan Now
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Sparkles className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Verification Complete!</h4>
                <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto">
                  You have successfully earned your Verified checkmark badge. Your profile is now highlighted across the grid.
                </p>
              </div>

              <button
                onClick={() => {
                  onVerifiedSuccess();
                  onClose();
                }}
                className="w-full py-3 bg-[#FFC107] text-[#121212] font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg active:scale-95"
              >
                Return to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
