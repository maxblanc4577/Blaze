import React, { useState } from 'react';
import { X, CreditCard, Lock, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTitle: string;
  planAmount: string;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  planTitle,
  planAmount,
  onSuccess,
  showToast,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [cardHolder, setCardHolder] = useState('Alex Morgan');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) {
      showToast('⚠️ Please fill in all credit card details.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      showToast('💳 Stripe payment verified successfully! Professional Companion upgrade activated.');
      onSuccess();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFC107]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Stripe Secure Checkout</h3>
          <p className="text-xs text-neutral-400">
            {planTitle} • <strong className="text-[#FFC107]">{planAmount}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Cardholder Name</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full bg-[#252525] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC107]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                className="w-full bg-[#252525] border border-neutral-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC107] font-mono"
                required
              />
              <CreditCard className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Expires (MM/YY)</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength={5}
                className="w-full bg-[#252525] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC107] font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">CVC</label>
              <input
                type="password"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                maxLength={4}
                className="w-full bg-[#252525] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC107] font-mono"
                required
              />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-center gap-2.5 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Encrypted and verified via Stripe Gateway. 256-bit SSL protection.</span>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 rounded-xl bg-[#FFC107] text-black font-black text-sm hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20 flex items-center justify-center space-x-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-black" />
                <span>Verifying Payment...</span>
              </>
            ) : (
              <span>Confirm & Pay {planAmount}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
