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

  const [selectedTier, setSelectedTier] = useState<'regular' | 'mintboys_elite' | 'pro_elite'>(
    isCurrentlyPro ? (currentUser.membershipTier === 'Pro' ? 'pro_elite' : 'mintboys_elite') : 'regular'
  );
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
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

  const tierName = selectedTier === 'pro_elite' ? 'Pro Elite' : selectedTier === 'mintboys_elite' ? 'Mintboys Elite' : 'Regular';
  const planAmount = selectedTier === 'pro_elite' ? '$29.99/mo' : selectedTier === 'mintboys_elite' ? '$19.99/mo' : '$0';
  const planTitle = `${tierName} Automatic Subscription (${selectedPlan})`;

  const handleProceed = () => {
    if (selectedTier === 'regular') {
      onUpdateAccountType('Free', false);
      showToast('👤 Switched to Regular User Profile successfully.');
      onClose();
    } else {
      showToast(`📝 Registration saved for ${tierName}. Proceeding to secure payment & automatic billing setup.`);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    const assignedTier = selectedTier === 'pro_elite' ? 'Pro' : 'Elite Companion';
    onUpdateAccountType(assignedTier, true, planAmount, true);
    currentUser.phone = phone;
    currentUser.whatsapp = whatsapp;
    setSuccessState(true);
    showToast(`👑 ${tierName} Registration & Automatic Billing (${planAmount}) activated successfully!`);
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
                {/* Tier Selector Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {/* Regular User Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedTier('regular')}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedTier === 'regular'
                        ? 'bg-neutral-800/80 border-[#FFC107] ring-1 ring-[#FFC107]'
                        : 'bg-[#222222] border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 bg-neutral-700/50 rounded-xl text-neutral-200">
                          <User className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white">Regular</h3>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Standard community profile.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-neutral-700/50 flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                      <span>$0/mo</span>
                      {selectedTier === 'regular' && <Check className="w-3.5 h-3.5 text-[#FFC107]" />}
                    </div>
                  </button>

                  {/* Mintboys Elite Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedTier('mintboys_elite')}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                      selectedTier === 'mintboys_elite'
                        ? 'bg-amber-500/10 border-[#FFC107] ring-1 ring-[#FFC107]'
                        : 'bg-[#222222] border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span className="absolute top-2 right-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      Elite
                    </span>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 bg-amber-500/20 rounded-xl text-[#FFC107]">
                          <Crown className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                          $19.99/mo
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white">Mintboys Elite</h3>
                      <p className="text-[11px] text-neutral-300 mt-1">
                        Priority radar, verified badge, & auto billing.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-amber-500/30 flex items-center justify-between text-[11px] font-semibold text-[#FFC107]">
                      <span>Auto Billing</span>
                      {selectedTier === 'mintboys_elite' && <Check className="w-3.5 h-3.5 text-[#FFC107]" />}
                    </div>
                  </button>

                  {/* Pro Elite Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedTier('pro_elite')}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                      selectedTier === 'pro_elite'
                        ? 'bg-cyan-500/10 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-[#222222] border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span className="absolute top-2 right-2 bg-cyan-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      VIP
                    </span>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 bg-cyan-500/20 rounded-xl text-cyan-300">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full">
                          $29.99/mo
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white">Pro Elite</h3>
                      <p className="text-[11px] text-neutral-300 mt-1">
                        All VIP perks, spotlight radar & auto renewal.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-cyan-500/30 flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                      <span>Auto Billing</span>
                      {selectedTier === 'pro_elite' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  </button>
                </div>

                {/* Dynamic Selection Description, Reasoning & Thank You Note */}
                <div className="mb-6 bg-[#252525] border border-neutral-700/60 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <span className="w-2 h-2 rounded-full bg-[#FFC107]"></span>
                    <span>Selected Tier Overview: {tierName}</span>
                  </div>

                  {selectedTier === 'regular' && (
                    <div className="space-y-2 text-xs text-neutral-300">
                      <p><strong className="text-white">What it entails:</strong> Standard community membership giving you full access to discover local profiles, chat, and connect in the Blaze community completely free of charge ($0/mo).</p>
                      <p><strong className="text-amber-400">Why choose this:</strong> Choose this option if you want a relaxed, free experience to explore local connections at your own pace without any financial commitments.</p>
                      <div className="pt-2 border-t border-neutral-800 text-emerald-400 font-medium italic">
                        🙏 Thank you so much for choosing a Regular User profile! We appreciate you joining our community and hope you enjoy connecting with others.
                      </div>
                    </div>
                  )}

                  {selectedTier === 'mintboys_elite' && (
                    <div className="space-y-2 text-xs text-neutral-300">
                      <p><strong className="text-white">What it entails:</strong> Verified professional tier ($19.99/mo with automatic billing) featuring priority discovery radar, verified badge, WhatsApp & phone display, and direct local connections.</p>
                      <p><strong className="text-amber-400">Why choose this:</strong> Choose Mint Boys Elite if you want maximum visibility, verified trust badges, and direct contact options so local connections can reach you instantly.</p>
                      <div className="pt-2 border-t border-neutral-800 text-amber-400 font-medium italic">
                        👑 Thank you for choosing Mint Boys Elite! We are thrilled to welcome you to our exclusive verified network. Your automatic billing is set up to ensure uninterrupted elite access.
                      </div>
                    </div>
                  )}

                  {selectedTier === 'pro_elite' && (
                    <div className="space-y-2 text-xs text-neutral-300">
                      <p><strong className="text-white">What it entails:</strong> Ultimate VIP tier ($29.99/mo with automatic billing) including top-tier spotlight placement, premium discovery, and priority concierge support.</p>
                      <p><strong className="text-cyan-400">Why choose this:</strong> Choose Pro Elite if you want absolute top-tier exposure, premier status, and unmatched priority across the entire platform.</p>
                      <div className="pt-2 border-t border-neutral-800 text-cyan-300 font-medium italic">
                        ⭐ Thank you for choosing Pro Elite VIP! We deeply appreciate your commitment to our highest tier. Automatic billing ensures continuous VIP status.
                      </div>
                    </div>
                  )}
                </div>

                {/* Registration & Details Form if Mintboys Elite or Pro Elite selected */}
                {selectedTier !== 'regular' && (
                  <div className="space-y-4 mb-6 bg-[#222222] p-4 rounded-2xl border border-amber-500/30 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">1. Complete {tierName} Registration Details</span>
                      <span className="text-xs text-[#FFC107] font-semibold">Automatic Billing Applies</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-3 rounded-xl border text-center transition ${
                          selectedPlan === 'monthly' ? 'bg-[#FFC107] text-black font-bold border-[#FFC107]' : 'bg-[#1A1A1A] border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase block opacity-80">Monthly Auto-Bill</span>
                        <span className="text-sm font-black">{planAmount}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('annual')}
                        className={`p-3 rounded-xl border text-center transition ${
                          selectedPlan === 'annual' ? 'bg-[#FFC107] text-black font-bold border-[#FFC107]' : 'bg-[#1A1A1A] border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase block opacity-80">Annual (Save 20%)</span>
                        <span className="text-sm font-black">Discounted</span>
                      </button>
                    </div>

                    {/* Contact Fields */}
                    <div className="pt-2 border-t border-neutral-800 space-y-2">
                      <label className="text-xs font-bold text-white block">Phone Number & WhatsApp</label>
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

                    {/* ID Document Upload Interface */}
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

                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-[11px] text-neutral-300 space-y-1">
                      <p className="font-bold text-amber-400">⚡ Automatic Billing Notice</p>
                      <p className="text-neutral-400">
                        After registering, you will securely input payment details. Your subscription will renew automatically each month ({planAmount}). Cancel anytime.
                      </p>
                    </div>
                  </div>
                )}

                {/* Proceed Action Button */}
                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full py-3.5 rounded-xl bg-[#FFC107] text-[#121212] font-black text-sm hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20 flex items-center justify-center space-x-2"
                >
                  <span>{selectedTier === 'regular' ? 'Confirm Regular User Profile' : `Register & Proceed to Pay (${planAmount})`}</span>
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
