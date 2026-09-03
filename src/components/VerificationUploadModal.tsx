import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, CreditCard, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface VerificationUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  showToast: (msg: string) => void;
}

export const VerificationUploadModal: React.FC<VerificationUploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  showToast,
}) => {
  const [docType, setDocType] = useState<'passport' | 'drivers_license' | 'national_id'>('passport');
  const [documentUrl, setDocumentUrl] = useState<string>(currentUser.verificationPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600');
  const [isFeePaid, setIsFeePaid] = useState<boolean>(currentUser.isFeePaid || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  if (!isOpen) return null;

  const handlePayFee = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsFeePaid(true);
      setShowSuccessAnim(true);
      const newTx = {
        id: `tx_${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: '$19.99/mo',
        status: 'Success'
      };
      const existingTxs = currentUser.transactionHistory || [];
      const updated = {
        ...currentUser,
        isFeePaid: true,
        transactionHistory: [newTx, ...existingTxs]
      };
      onUpdateUser(updated);
      showToast('✅ $19.99 monthly subscription fee processed successfully! Membership Activated.');
      setTimeout(() => {
        setShowSuccessAnim(false);
      }, 3500);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setDocumentUrl(reader.result);
          showToast('📸 Document thumbnail loaded successfully.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFeePaid) {
      showToast('⚠️ Please complete the $19.99 subscription payment first.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const updated: UserProfile = {
        ...currentUser,
        isFeePaid: true,
        verificationPending: true,
        verificationPhoto: documentUrl,
      };
      onUpdateUser(updated);
      showToast('🛡️ ID documents submitted successfully for Admin review!');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col relative">
        
        {showSuccessAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 bg-[#1E1E1E]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-2xl shadow-emerald-500/50"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Payment Successful!</h3>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Membership Activated • $19.99/mo</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-2">
                Your subscription has been processed securely via Stripe. You can now upload your ID verification documents below.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </motion.div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#252525] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ID Verification & Subscription Payment</h3>
              <p className="text-[10px] text-neutral-400">Professional & Elite Membership Activation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">Mandatory Membership Steps</span>
              Step 1: Pay the $19.99 monthly subscription fee. Step 2: Upload your government ID scan for Admin verification and platform publication.
            </div>
          </div>

          {/* Step 1: Payment */}
          <div className={`p-4 rounded-2xl border transition ${isFeePaid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-neutral-900 border-amber-500/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${isFeePaid ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>
                  {isFeePaid ? '✓' : '1'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">$19.99/mo Monthly Subscription Fee</h4>
                  <p className="text-[10px] text-neutral-400">Required payment before document upload</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFeePaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {isFeePaid ? 'Payment Complete ✓' : 'Pending Payment'}
              </span>
            </div>

            {!isFeePaid && (
              <button
                type="button"
                onClick={handlePayFee}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-500 text-black font-black text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing Payment...' : '💳 Pay $19.99 Subscription Now'}
              </button>
            )}
          </div>

          {/* Step 2: ID Document Upload (Enabled only after payment) */}
          <div className={`space-y-4 transition ${!isFeePaid ? 'opacity-50 pointer-events-none' : 'opacity-150'}`}>
            <div className="flex items-center space-x-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${currentUser.isVerified ? 'bg-emerald-500 text-black' : 'bg-cyan-500 text-black'}`}>
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Upload Government ID Document</h4>
                <p className="text-[10px] text-neutral-400">{isFeePaid ? 'Upload enabled. Submit for Admin review.' : 'Complete payment above to unlock document upload.'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Document Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'passport', label: 'Passport' },
                  { id: 'drivers_license', label: "Driver's License" },
                  { id: 'national_id', label: 'National ID' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDocType(t.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      docType === t.id ? 'bg-[#FFC107]/20 border-[#FFC107] text-[#FFC107]' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Document Thumbnail Preview</label>
              <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-4 text-center bg-neutral-950/50 flex items-center gap-4">
                <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-neutral-700 bg-black shrink-0">
                  <img src={documentUrl} alt="ID Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-xs font-bold text-white">ID Scan Ready</p>
                  <label className="inline-block px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-400 text-xs font-bold cursor-pointer transition">
                    Choose File
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFeePaid || isSubmitting}
              className="w-full py-3 rounded-xl bg-[#FFC107] text-black font-black text-xs hover:bg-[#ffcd38] transition shadow-lg shadow-[#FFC107]/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : '🛡️ Submit ID Documents for Admin Approval'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
