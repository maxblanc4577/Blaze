import React, { useState, useEffect } from 'react';
import { X, Zap, Check, ShieldCheck } from 'lucide-react';

interface BoostOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  areaName: string;
  boostActiveUntil?: number | null;
}

export const BoostOfferModal: React.FC<BoostOfferModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  areaName,
  boostActiveUntil,
}) => {
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (!boostActiveUntil) {
      setRemainingMs(0);
      return;
    }
    const update = () => {
      const diff = boostActiveUntil - Date.now();
      setRemainingMs(Math.max(0, diff));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [boostActiveUntil]);

  if (!isOpen) return null;

  const isActive = remainingMs > 0;
  const progressPercent = Math.max(0, Math.min(100, (remainingMs / (30 * 60 * 1000)) * 100));
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto text-black shadow-lg shadow-amber-500/20 animate-pulse">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {isActive ? '⚡ Boost Active Window' : '20 Free Views Reached!'}
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
            {isActive ? (
              <span>Your 30-minute Profile Boost is currently live across <span className="text-amber-400 font-bold">{areaName}</span> with maximum grid visibility.</span>
            ) : (
              <span>You've explored all 20 free profile views in <span className="text-amber-400 font-bold">{areaName}</span>. Would you like to activate a 30-minute Profile Boost & get unlimited access now?</span>
            )}
          </p>
        </div>

        {isActive && (
          <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-4 mb-6 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Activation Window Remaining
              </span>
              <span className="font-mono text-white bg-black/50 px-2 py-0.5 rounded border border-neutral-800">
                {mins}m {secs}s
              </span>
            </div>
            {/* Real-time progress bar of the 30-minute activation window */}
            <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 rounded-full transition-all duration-1000 shadow-lg shadow-amber-500/30"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
              <span>0 min</span>
              <span>15 min</span>
              <span>30 min (Max)</span>
            </div>
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6 space-y-2 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Top placement in discovery grid for 30 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Unlimited profile views across all regions</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Priority read receipts & direct message alerts</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-3 px-4 rounded-xl text-sm transition text-center"
          >
            {isActive ? 'Close' : 'Deny'}
          </button>
          {!isActive && (
            <button
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-extrabold py-3 px-4 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition text-center flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Accept & Boost</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

