import React, { useState } from 'react';
import { X, ShieldCheck, Crown, Sparkles, CheckCircle2, Plane, ShoppingBag, Calendar, HeartHandshake } from 'lucide-react';

interface CompanionMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (tier: 'Elite Companion') => void;
  currentTier?: string;
}

export const CompanionMembershipModal: React.FC<CompanionMembershipModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  currentTier,
}) => {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFC107]">
            <Crown className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Blaze Elite Companion Pass</h2>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Upgrade your profile to offer professional companion, travel partner, shopping buddy, and event escort services with monthly membership benefits.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="space-y-3 mb-6 bg-[#222222] p-4 rounded-2xl border border-neutral-800">
          <div className="flex items-center space-x-3 text-sm text-neutral-200">
            <Plane className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
            <span>Travel & City Tour Companion matching</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-neutral-200">
            <ShoppingBag className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
            <span>Shopping buddy & event partner listings</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-neutral-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Official Elite Pro Badge & Verified ID status</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-neutral-200">
            <Sparkles className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
            <span>Priority discovery placement & unlimited locked album access</span>
          </div>
        </div>

        {/* Pricing selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            className={`p-4 rounded-2xl border text-left transition ${
              selectedPlan === 'monthly'
                ? 'bg-[#FFC107]/10 border-[#FFC107] text-white'
                : 'bg-[#222222] border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <span className="text-xs uppercase tracking-wider block font-semibold text-neutral-400">Monthly Pass</span>
            <span className="text-xl font-black text-[#FFC107] mt-1 block">$29.99<span className="text-xs font-normal text-neutral-400">/mo</span></span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('annual')}
            className={`p-4 rounded-2xl border text-left transition relative overflow-hidden ${
              selectedPlan === 'annual'
                ? 'bg-[#FFC107]/10 border-[#FFC107] text-white'
                : 'bg-[#222222] border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <span className="absolute top-2 right-2 bg-[#FFC107] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Save 40%</span>
            <span className="text-xs uppercase tracking-wider block font-semibold text-neutral-400">Annual Pass</span>
            <span className="text-xl font-black text-[#FFC107] mt-1 block">$17.99<span className="text-xs font-normal text-neutral-400">/mo</span></span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onSubscribe('Elite Companion');
            onClose();
          }}
          className="w-full py-3.5 rounded-xl bg-[#FFC107] text-[#121212] font-black text-sm hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20 flex items-center justify-center space-x-2"
        >
          <Crown className="w-4 h-4" />
          <span>{currentTier === 'Elite Companion' ? 'Manage Elite Subscription' : 'Upgrade to Elite Companion ($29.99/mo)'}</span>
        </button>

        <p className="text-[11px] text-neutral-500 text-center mt-4">
          Cancel anytime. Compliant with community safety guidelines. All companion arrangements must be social, non-commercial adult services are strictly prohibited.
        </p>

      </div>
    </div>
  );
};
