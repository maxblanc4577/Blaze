import React, { useState } from 'react';
import { X, Crown, ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (type: '1-day' | '7-day' | 'monthly', price: string) => void;
  currentSubscription: { type: string; expiresAt: number };
  viewedCount: number;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  currentSubscription,
  viewedCount,
}) => {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState<'1-day' | '7-day' | 'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: '1-day' as const,
      name: '1-Day Pass',
      price: '$1.99',
      period: '24 hours',
      popular: false,
      desc: 'Full access to all profiles and unlimited viewing for 1 day.',
    },
    {
      id: '7-day' as const,
      name: '7-Day Pass',
      price: '$4.99',
      period: '7 days',
      popular: false,
      desc: 'Most popular for travelers and weekend connections.',
    },
    {
      id: 'monthly' as const,
      name: 'Monthly Pass',
      price: '$9.99',
      period: '30 days',
      popular: true,
      desc: 'Billed monthly. Auto-renewing unless cancelled 24h prior.',
    },
    {
      id: 'yearly' as const,
      name: 'Yearly Pass (Save 50%)',
      price: '$59.99',
      period: '365 days',
      popular: false,
      desc: 'Ultimate value! Full VIP privileges for a full year ($4.99/mo equivalent).',
    },
  ];

  const hasActiveSub = currentSubscription.type !== 'none' && currentSubscription.expiresAt > Date.now();

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

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFC107]">
            <Crown className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Unlock Unlimited Profiles</h2>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            You have viewed {Math.min(viewedCount, 20)} of 20 free profiles. Subscribe to view unlimited profiles and connect instantly.
          </p>
        </div>

        {hasActiveSub && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3 text-emerald-400">
            <ShieldCheck className="w-6 h-6 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold block uppercase tracking-wider">Active Pass ({currentSubscription.type})</span>
              <span>Expires: {new Date(currentSubscription.expiresAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-3 mb-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition relative flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#FFC107]/10 border-[#FFC107] text-white shadow-lg'
                    : 'bg-[#222222] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 right-4 bg-[#FFC107] text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm">{plan.name}</span>
                    <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-400">{plan.period}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">{plan.desc}</p>
                </div>
                <div className="text-right pl-3 flex-shrink-0">
                  <span className="text-lg font-black text-[#FFC107] block">{plan.price}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ml-auto mt-1 ${
                    isSelected ? 'bg-[#FFC107] border-[#FFC107] text-black' : 'border-neutral-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 mb-5 text-[11px] text-neutral-300 space-y-1">
          <p className="font-bold text-amber-400 flex items-center gap-1">
            <span>⚡ Automatic Billing Policy</span>
          </p>
          <p className="text-neutral-400 leading-relaxed">
            Subscriptions are billed automatically each billing cycle unless cancelled at least <strong>24 hours before</strong> the subscription renewal date. You may cancel anytime in your settings.
          </p>
        </div>

        {/* Subscribe Action */}
        <button
          onClick={() => {
            const plan = plans.find(p => p.id === selectedPlan)!;
            onSubscribe(plan.id, plan.price);
            onClose();
          }}
          className="w-full py-3.5 rounded-xl bg-[#FFC107] text-[#121212] font-black text-sm hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Get {plans.find(p => p.id === selectedPlan)?.name} ({plans.find(p => p.id === selectedPlan)?.price})</span>
        </button>

        <p className="text-[10px] text-neutral-500 text-center mt-3">
          Secure payment • Auto-renewing subscription • Cancel 24h prior to avoid charges.
        </p>

      </div>
    </div>
  );
};
