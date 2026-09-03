import React, { useState } from 'react';
import { X, ShieldCheck, Crown, Sparkles, CheckCircle2, User, Briefcase, CreditCard, Check, Upload } from 'lucide-react';
import { UserProfile } from '../types';
import { PaymentVerificationModal } from './PaymentVerificationModal';

interface CompanionMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateAccountType: (tier: 'Free' | 'Elite Companion', isCompanionPro: boolean, rate?: string, isFeePaid?: boolean) => void;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [idDocUploaded, setIdDocUploaded] = useState(false);
  const [idDocName, setIdDocName] = useState('');
  const [billingTab, setBillingTab] = useState<'upgrade' | 'manage_billing'>('upgrade');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [billingAddress, setBillingAddress] = useState('742 Evergreen Terrace, Springfield');
  const [autoRenew, setAutoRenew] = useState(true);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp || '');

  const planTitle = selectedPlan === 'monthly' ? 'Professional Companion Monthly' : selectedPlan === 'annual' ? 'Professional Companion Annual' : 'Professional Companion Setup';
  const planAmount = selectedPlan === 'monthly' ? '$19.99/mo' : selectedPlan === 'annual' ? '$10.99/mo' : '$19.99/mo';

  const handleProceed = () => {
    if (selectedProfileType === 'regular') {
      onUpdateAccountType('Free', false);
      showToast('👤 Switched to Regular User Profile successfully.');
      onClose();
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    const rate = planAmount;
    onUpdateAccountType('Elite Companion', true, rate, true);
    currentUser.phone = phone;
    currentUser.whatsapp = whatsapp;
    setSuccessState(true);
    showToast('👑 MintBoy Elite Companion Profile & $19.99/mo Fee Paid successfully!');
    setTimeout(() => {
      setSuccessState(false);
      onClose();
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocName(file.name);
      setIdDocUploaded(true);
      showToast(`📄 ID Document "${file.name}" uploaded successfully for admin verification.`);
    }
  };

  const handleSaveBilling = () => {
    showToast('💳 Billing settings & payment method updated successfully.');
    setBillingTab('upgrade');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {successState ? (
          <div className="py-12 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Upgrade Successful!</h3>
            <p className="text-sm text-neutral-300 max-w-sm mx-auto">
              Your Stripe payment has been confirmed. Welcome to Elite Professional Companion tier.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFC107]">
                <Crown className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Elite Companion & Billing Hub</h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Manage your membership status, secure ID verification documents, and active monthly billing subscriptions.
              </p>
            </div>

            {/* Sub-tabs if already Elite Companion */}
            {isCurrentlyPro && (
              <div className="flex bg-[#222222] p-1 rounded-xl mb-6 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setBillingTab('upgrade')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    billingTab === 'upgrade' ? 'bg-[#FFC107] text-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Membership & Verification
                </button>
                <button
                  type="button"
                  onClick={() => setBillingTab('manage_billing')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    billingTab === 'manage_billing' ? 'bg-[#FFC107] text-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Manage Merchant Billing
                </button>
              </div>
            )}

            {billingTab === 'manage_billing' ? (
              <div className="space-y-4 bg-[#222222] p-5 rounded-2xl border border-neutral-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FFC107]" />
                  <span>Merchant Subscription & Billing Management</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Update your active payment method, view billing renewal cycles, and manage automatic subscription renewals.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1">Active Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-neutral-700 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFC107]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-neutral-700 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFC107]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1">CVC</label>
                      <input
                        type="password"
                        value="•••"
                        readOnly
                        className="w-full bg-[#1A1A1A] border border-neutral-700 text-neutral-500 text-xs px-3.5 py-2.5 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1">Billing Address</label>
                    <input
                      type="text"
                      value={billingAddress}
                      onChange={e => setBillingAddress(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-neutral-700 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFC107]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-bold text-white">Auto-Renew Monthly Subscription</p>
                      <p className="text-[10px] text-neutral-400">Next renewal charge: $19.99 on Oct 2, 2026</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRenew}
                        onChange={e => setAutoRenew(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC107]"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveBilling}
                    className="flex-1 py-3 rounded-xl bg-[#FFC107] text-black font-black text-xs hover:opacity-90 transition shadow"
                  >
                    Save Billing Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateAccountType('Free', false, undefined, false);
                      showToast('⚠️ Elite Companion subscription cancelled.');
                      onClose();
                    }}
                    className="px-4 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-xs hover:bg-red-500/30 transition"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                        <span className="text-sm font-black">$19.99</span>
                      </button>
                    </div>

                    {/* Contact Fields for Elite/Pro */}
                    <div className="pt-2 border-t border-neutral-800 space-y-2">
                      <label className="text-xs font-bold text-white block">Phone Number & WhatsApp (Elite/Pro Benefit)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Phone e.g. +1 555-0199"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFC107]"
                        />
                        <input
                          type="text"
                          placeholder="WhatsApp e.g. +15550199"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFC107]"
                        />
                      </div>
                    </div>

                    {/* ID Document Upload Interface for Admin Verification */}
                    <div className="pt-2 border-t border-neutral-800">
                      <label className="text-xs font-bold text-white block mb-1 flex items-center justify-between">
                        <span>Government ID / Verification Document</span>
                        <span className="text-[10px] text-amber-400">Required for Verified Badge</span>
                      </label>
                      <p className="text-[11px] text-neutral-400 mb-2">
                        Upload passport, driver's license, or official ID for secure admin verification.
                      </p>
                      
                      <label className="border-2 border-dashed border-neutral-700 hover:border-[#FFC107] rounded-xl p-3 flex items-center justify-center cursor-pointer bg-[#1A1A1A] transition group">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="flex items-center space-x-2 text-xs text-neutral-300 group-hover:text-white">
                          <Upload className="w-4 h-4 text-[#FFC107]" />
                          <span>{idDocUploaded ? `Uploaded: ${idDocName}` : 'Click to upload ID document (PDF/JPG)'}</span>
                        </div>
                      </label>
                      {idDocUploaded && (
                        <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Document submitted for admin review.
                        </p>
                      )}
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
                  type="button"
                  onClick={handleProceed}
                  className="w-full py-3.5 rounded-xl bg-[#FFC107] text-[#121212] font-black text-sm hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20 flex items-center justify-center space-x-2"
                >
                  <span>{selectedProfileType === 'regular' ? 'Confirm Regular User Profile' : `Proceed to Pay Fee (${planAmount})`}</span>
                </button>
              </>
            )}
          </>
        )}

        <p className="text-[11px] text-neutral-500 text-center mt-4">
          You can switch back between Regular User and Professional profiles at any time without penalty.
        </p>

      </div>

      {showPaymentModal && (
        <PaymentVerificationModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          planTitle={planTitle}
          planAmount={planAmount}
          onSuccess={handlePaymentSuccess}
          showToast={showToast}
        />
      )}
    </div>
  );
};
