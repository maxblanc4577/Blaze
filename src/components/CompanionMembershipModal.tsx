import React, { useState } from 'react';
import { X, ShieldCheck, Crown, Sparkles, CheckCircle2, Plane, ShoppingBag, User, Briefcase, CreditCard, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface CompanionMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateAccountType: (tier: 'Free' | 'Elite Companion', isCompanionPro: boolean, rate?: string) => void;
  showToast: (msg: string) => void;
}

export const CompanionMembershipModal: React.FC<CompanionMembershipModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateAccountType,
  showToast,
}) => {
  if (!isOpen) return null;

  const isCurrentlyPro = currentUser.membershipTier === 'Elite Companion' || currentUser.isCompanionPro;

  const [selectedProfileType, setSelectedProfileType] = useState<'regular' | 'professional'>(
    isCurrentlyPro ? 'professional' : 'regular'
  );
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'one_time'>('monthly');
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [paymentCard, setPaymentCard] = useState('4242 •••• •••• 4242');

  const handleProceed = () => {
    if (selectedProfileType === 'regular') {
      onUpdateAccountType('Free', false);
      showToast('👤 Switched to Regular User Profile successfully.');
      onClose();
    } else {
      setShowPaymentStep(true);
    }
  };

  const handleCompletePayment = () => {
    const rate = selectedPlan === 'monthly' ? '$19.99/mo' : selectedPlan === 'annual' ? '$10.99/mo' : '$49.99 one-time';
    onUpdateAccountType('Elite Companion', true, rate);
    showToast('👑 Professional / Elite Companion Profile activated successfully!');
    setShowPaymentStep(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!showPaymentStep ? (
          <>
            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFC107]">
                <Crown className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Choose Your Profile Registration</h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Select whether you are registering as a Regular User or a Professional Companion. You can view associated fees and switch back between either choice at any time.
              </p>
            </div>

            {/* Profile Type Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Regular User Option */}
              <button
                type="button"
                onClick={() => setSelectedProfileType('regular')}
                className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedProfileType === 'regular'
                    ? 'bg-neutral-800/80 border-[#FFC107] ring-1 ring-[#FFC107]'
                    : 'bg-[#222222] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 bg-neutral-700/50 rounded-xl text-neutral-200">
                      <User className="w-5 h-5" />
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      Free ($0/mo)
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">Regular User Profile</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Standard community membership for discovering friends, chatting, and browsing profiles.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-700/50 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>No monthly fees</span>
                  {selectedProfileType === 'regular' && <Check className="w-4 h-4 text-[#FFC107]" />}
                </div>
              </button>

              {/* Professional / Companion Option */}
              <button
                type="button"
                onClick={() => setSelectedProfileType('professional')}
                className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                  selectedProfileType === 'professional'
                    ? 'bg-amber-500/10 border-[#FFC107] ring-1 ring-[#FFC107]'
                    : 'bg-[#222222] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span className="absolute top-3 right-3 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Pro / Companion
                </span>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 bg-amber-500/20 rounded-xl text-[#FFC107]">
                      <Briefcase className="w-5 h-5" />
                    </span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      Fee: $19.99/mo
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">Professional Companion</h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    Offer travel companion, shopping buddy, and event escort services with verified pro badge.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-500/30 flex items-center justify-between text-xs font-semibold text-[#FFC107]">
                  <span>Priority Discovery</span>
                  {selectedProfileType === 'professional' && <Check className="w-4 h-4 text-[#FFC107]" />}
                </div>
              </button>
            </div>

            {/* Fee & Plan Details if Professional selected */}
            {selectedProfileType === 'professional' && (
              <div className="space-y-4 mb-6 bg-[#222222] p-4 rounded-2xl border border-amber-500/30 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Select Professional Fee Plan</span>
                  <span className="text-xs text-[#FFC107] font-semibold">Associated Professional Fees</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedPlan === 'monthly' ? 'bg-[#FFC107] text-black font-bold border-[#FFC107]' : 'bg-[#1A1A1A] border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase block opacity-80">Monthly</span>
                    <span className="text-sm font-black">$19.99</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('annual')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedPlan === 'annual' ? 'bg-[#FFC107] text-black font-bold border-[#FFC107]' : 'bg-[#1A1A1A] border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase block opacity-80">Annual (Save)</span>
                    <span className="text-sm font-black">$10.99/mo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('one_time')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedPlan === 'one_time' ? 'bg-[#FFC107] text-black font-bold border-[#FFC107]' : 'bg-[#1A1A1A] border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase block opacity-80">Setup Fee</span>
                    <span className="text-sm font-black">$49.99</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Includes Verified Pro Companion Badge & Secure ID Badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Switch back to Regular User Profile for free at any time</span>
                  </div>
                </div>
              </div>
            )}

            {/* Proceed Action Button */}
            <button
              onClick={handleProceed}
              className="w-full py-3.5 rounded-xl bg-[#FFC107] text-[#121212] font-black text-sm hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20 flex items-center justify-center space-x-2"
            >
              <span>{selectedProfileType === 'regular' ? 'Confirm Regular User Profile' : `Proceed to Pay Fee (${selectedPlan === 'monthly' ? '$19.99/mo' : selectedPlan === 'annual' ? '$10.99/mo' : '$49.99'})`}</span>
            </button>
          </>
        ) : (
          /* Payment Step for Professional Fee */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-[#FFC107]">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Pay Professional Registration Fee</h3>
              <p className="text-xs text-neutral-400">
                Secure payment for Professional Companion Profile activation.
              </p>
            </div>

            <div className="bg-[#222222] p-4 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Profile Type:</span>
                <span className="font-bold text-white">Professional Companion</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Billing Plan:</span>
                <span className="font-bold text-[#FFC107]">
                  {selectedPlan === 'monthly' ? 'Monthly ($19.99/mo)' : selectedPlan === 'annual' ? 'Annual ($10.99/mo)' : 'One-Time Professional Fee ($49.99)'}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-700 flex justify-between text-sm font-bold text-white">
                <span>Total Due Today:</span>
                <span className="text-[#FFC107]">
                  {selectedPlan === 'monthly' ? '$19.99' : selectedPlan === 'annual' ? '$10.99' : '$49.99'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Payment Method</label>
              <div className="bg-[#252525] border border-neutral-700 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-neutral-800 rounded-lg">💳</span>
                  <div>
                    <p className="font-bold text-white">Mastercard ending in 4242</p>
                    <p className="text-[10px] text-neutral-400">Expires 12/28 • Secure 256-bit encryption</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">Default</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentStep(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompletePayment}
                className="flex-1 py-3 rounded-xl bg-[#FFC107] text-black font-black text-xs hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20"
              >
                Pay & Activate Profile
              </button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-neutral-500 text-center mt-4">
          You can switch back between Regular User and Professional profiles at any time without penalty.
        </p>

      </div>
    </div>
  );
};
