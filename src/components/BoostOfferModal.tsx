import React from 'react';
import { X, Zap, Check, ShieldCheck } from 'lucide-react';

interface BoostOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  areaName: string;
}

export const BoostOfferModal: React.FC<BoostOfferModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  areaName,
}) => {
  if (!isOpen) return null;

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
          <h2 className="text-2xl font-black text-white">20 Free Views Reached!</h2>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
            You've explored all 20 free profile views in <span className="text-amber-400 font-bold">{areaName}</span>. Would you like to activate a 30-minute Profile Boost & get unlimited access now?
          </p>
        </div>

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
            Deny
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-extrabold py-3 px-4 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition text-center flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Accept & Boost</span>
          </button>
        </div>

      </div>
    </div>
  );
};
