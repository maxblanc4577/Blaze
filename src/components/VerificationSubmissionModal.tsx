import React, { useState } from 'react';
import { X, ShieldCheck, Camera, CheckCircle2, Upload, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface VerificationSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  showToast: (msg: string) => void;
}

export const VerificationSubmissionModal: React.FC<VerificationSubmissionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  showToast,
}) => {
  const [selectedSelfie, setSelectedSelfie] = useState<string>(currentUser.verificationPhoto || currentUser.photos[0] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const sampleSelfies = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
  ];

  const handleSubmitVerification = () => {
    if (!selectedSelfie) {
      showToast('⚠️ Please select or upload a selfie for verification.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const updated: UserProfile = {
        ...currentUser,
        verificationPhoto: selectedSelfie,
        verificationPending: true,
        isVerified: false, // will be verified once reviewed or auto-approved
      };
      onUpdateUser(updated);
      showToast('🛡️ Selfie submitted successfully! Verification is now pending review.');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#252525]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Identity Verification Selfie</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Camera className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white">Upload Verification Selfie</h4>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
              Take or upload a clear photo of your face matching your profile photos to confirm your identity and receive your trusted checkmark.
            </p>
          </div>

          {/* Selected Selfie Preview */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-neutral-900 shadow-xl">
              {selectedSelfie ? (
                <img src={selectedSelfie} alt="Verification Selfie" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-xs text-center p-2">
                  <Camera className="w-8 h-8 mb-1 text-neutral-600" />
                  <span>No selfie selected</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-cyan-400 font-medium">✨ Selfie ready for verification check</span>
          </div>

          {/* Sample / Quick Select Selfies */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-400">Choose from existing photos or sample selfie:</label>
            <div className="grid grid-cols-4 gap-2">
              {currentUser.photos.map((p, idx) => (
                <div
                  key={`user-photo-${idx}`}
                  onClick={() => setSelectedSelfie(p)}
                  className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                    selectedSelfie === p ? 'border-cyan-400 scale-95 shadow-md' : 'border-neutral-800 hover:border-neutral-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt={`Option ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
              {sampleSelfies.map((sp, idx) => (
                <div
                  key={`sample-photo-${idx}`}
                  onClick={() => setSelectedSelfie(sp)}
                  className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                    selectedSelfie === sp ? 'border-cyan-400 scale-95 shadow-md' : 'border-neutral-800 hover:border-neutral-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={sp} alt={`Sample ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-400">Or paste selfie image URL:</label>
            <input
              type="url"
              value={selectedSelfie}
              onChange={(e) => setSelectedSelfie(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || !selectedSelfie}
              onClick={handleSubmitVerification}
              className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Submit for Verification
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
