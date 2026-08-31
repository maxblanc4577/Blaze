import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, FileText, X } from 'lucide-react';

interface RegistrationConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDeny: () => void;
}

export const RegistrationConsentModal: React.FC<RegistrationConsentModalProps> = ({ isOpen, onAccept, onDeny }) => {
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTls, setAcceptTls] = useState(false);
  const [acceptCommunity, setAcceptCommunity] = useState(false);
  const [denied, setDenied] = useState(false);

  if (!isOpen) return null;

  const allAccepted = acceptPrivacy && acceptTls && acceptCommunity;

  if (denied) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-[#1C1C1E] text-white border border-red-500/30 rounded-3xl w-full max-w-md p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Registration Denied</h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            You declined the Data Privacy Protocols and Community Standards. In order to use Blaze and ensure a secure, encrypted community, acceptance of our privacy terms is required.
          </p>
          <button
            onClick={() => {
              setDenied(false);
            }}
            className="w-full py-3 bg-[#FFC107] text-black font-bold rounded-xl text-xs transition shadow hover:bg-amber-400"
          >
            Review Terms & Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1C1C1E] text-white border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 bg-[#252528] text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC107] text-black flex items-center justify-center font-black text-2xl mx-auto shadow-lg mb-2">
            B
          </div>
          <h2 className="text-lg font-bold text-white">Welcome to Blaze</h2>
          <p className="text-xs text-neutral-400">Please review and accept our Data Privacy Protocols & Standards to complete registration</p>
        </div>

        {/* Body Consent Checkboxes */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-neutral-300">
          
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="privacy"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-neutral-700 bg-neutral-800 text-[#FFC107] focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="privacy" className="cursor-pointer space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Data Privacy Protocols & Erasure Rights
                </p>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  I accept Blaze's data collection policies guaranteeing zero data selling, complete confidentiality, and my absolute right to request instant account data erasure at any time.
                </p>
              </label>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="tls"
                checked={acceptTls}
                onChange={(e) => setAcceptTls(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-neutral-700 bg-neutral-800 text-[#FFC107] focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="tls" className="cursor-pointer space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  End-to-End TLS 1.3 & AES-256 Encryption
                </p>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  I acknowledge that all chat messages, private media albums, and location telemetry are secured using industry-standard TLS 1.3 in transit and AES-256 encryption at rest.
                </p>
              </label>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="community"
                checked={acceptCommunity}
                onChange={(e) => setAcceptCommunity(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-neutral-700 bg-neutral-800 text-[#FFC107] focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="community" className="cursor-pointer space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#FFC107]" />
                  Community Guidelines & Anti-Nude Policy
                </p>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  I agree to keep public profile pictures family-friendly (PG-13). Nudes and explicit content will be uploaded exclusively to private albums. Violations result in instant suspension.
                </p>
              </label>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 text-center">
            You must check all three protocol agreements above to register and access Blaze.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-[#252528] flex items-center justify-between gap-3">
          <button
            onClick={() => setDenied(true)}
            className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition"
          >
            Deny & Exit
          </button>
          <button
            onClick={onAccept}
            disabled={!allAccepted}
            className={`flex-1 py-3 font-bold rounded-xl text-xs transition shadow ${
              allAccepted
                ? 'bg-[#FFC107] hover:bg-amber-400 text-black cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Accept & Register
          </button>
        </div>

      </div>
    </div>
  );
};
