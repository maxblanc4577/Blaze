import React from 'react';
import { Sparkles, Gift, Flame, CheckCircle, X } from 'lucide-react';

interface DailyCheckinModalProps {
  onClaim: (rewardSparks: number) => void;
  onClose: () => void;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({ onClaim, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#252525] to-[#181818] border border-amber-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-white text-center p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-[#121212] flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 mb-5 animate-bounce">
          <Gift className="w-10 h-10" />
        </div>

        <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest">
          Daily Reward Available
        </span>

        <h2 className="text-2xl font-black mt-3 mb-1">Daily Check-In Bonus! 🎉</h2>
        <p className="text-sm text-neutral-300 mb-6 max-w-xs mx-auto">
          Thanks for opening Blaze today! Claim your daily check-in reward to boost your visibility and earn Spark currency.
        </p>

        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 mb-6 flex items-center justify-around">
          <div className="text-center">
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5 fill-amber-400" /> +50
            </div>
            <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mt-0.5">Spark Coins</div>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <div className="text-center">
            <div className="text-xl font-black text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-orange-400" /> 30 Min
            </div>
            <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mt-0.5">Visibility Boost</div>
          </div>
        </div>

        <button
          onClick={() => onClaim(50)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-[#121212] font-black text-base shadow-xl shadow-amber-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Claim Daily Reward</span>
        </button>
      </div>
    </div>
  );
};
