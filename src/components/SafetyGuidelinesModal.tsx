import React, { useState } from 'react';
import { X, ShieldCheck, Lock, EyeOff, BookOpen, FileText, CheckCircle2, AlertTriangle, UserX, Heart } from 'lucide-react';

interface SafetyGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuidelinesModal: React.FC<SafetyGuidelinesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'safety' | 'community' | 'privacy'>('safety');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1C1C1E] text-white border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#252528]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trust, Safety & Compliance Center</h2>
              <p className="text-xs text-neutral-400">Community standards, anti-nude policy, and data privacy guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-[#18181A] px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-3 px-3 text-xs font-bold rounded-t-xl transition flex items-center justify-center gap-2 border-t border-x ${
              activeTab === 'safety'
                ? 'bg-[#252528] text-white border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety Guidelines</span>
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-3 px-3 text-xs font-bold rounded-t-xl transition flex items-center justify-center gap-2 border-t border-x ${
              activeTab === 'community'
                ? 'bg-[#252528] text-white border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FFC107]" />
            <span>Community Rules & Nudes Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 px-3 text-xs font-bold rounded-t-xl transition flex items-center justify-center gap-2 border-t border-x ${
              activeTab === 'privacy'
                ? 'bg-[#252528] text-white border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Data Privacy</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-neutral-300 leading-relaxed">
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Your Safety is Our Top Priority
                </h3>
                <p className="text-neutral-300">
                  Blaze is engineered to be a respectful, authentic, and secure space for meaningful connections, networking, and friendships.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <span>📍</span> Location Privacy
                  </h4>
                  <p className="text-neutral-400 text-[11px]">
                    Your exact GPS coordinates are never disclosed. Distance is calculated relative to your general neighborhood. You can toggle ghost mode anytime.
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <span>🛡️</span> Zero Tolerance for Harassment
                  </h4>
                  <p className="text-neutral-400 text-[11px]">
                    Threats, hate speech, stalking, or harassment result in instant permanent bans across all linked devices and IP addresses.
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <span>🔍</span> Meet in Public Places
                  </h4>
                  <p className="text-neutral-400 text-[11px]">
                    When meeting someone new offline, always choose well-lit public coffee shops, restaurants, or parks and inform a trusted friend.
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <span>⚠️</span> Report Suspicious Behavior
                  </h4>
                  <p className="text-neutral-400 text-[11px]">
                    Use the report button on any profile or chat to instantly alert our 24/7 moderation team for review and abuse investigation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Strict Anti-Nude Profile Picture Policy
                </h3>
                <p className="text-neutral-300">
                  To keep Blaze safe and welcoming for all members, <strong>public profile pictures must be PG-13 and family-friendly</strong>. Nudes, explicit photos, or lingerie/swimwear considered NSFW are strictly prohibited on public feeds.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <span>🔒 Nudes Belong in Private Albums Only</span>
                  </h4>
                  <p className="text-neutral-400 text-[11px]">
                    If you wish to share explicit or intimate photos, they must be uploaded exclusively to your <strong>Private Locked Album</strong>, which requires mutual permission or subscription access to view. Any nude photo detected on public profile cards will be automatically rejected or moved to private storage by moderators.
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <span>💬 Authentic Community Standards</span>
                  </h4>
                  <ul className="list-disc list-inside space-x-0 space-y-1 text-neutral-400 text-[11px]">
                    <li>Must be 18 years or older to register.</li>
                    <li>No catfishing, impersonation, or fake profiles.</li>
                    <li>No commercial spam, solicitation, or bot activity.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Your Data Privacy Rights
                </h3>
                <p className="text-neutral-300">
                  We adhere to strict global data protection standards (GDPR / CCPA) to ensure your personal information remains confidential and secure.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-white">1. Encryption in Transit & Storage</h4>
                  <p className="text-neutral-400 text-[11px]">
                    All messages, private photos, and personal profile data are encrypted with industry-standard TLS 1.3 and AES-256 protocols.
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-white">2. No Data Selling or Third-Party Sharing</h4>
                  <p className="text-neutral-400 text-[11px]">
                    We never sell your personal data, phone numbers, or private conversations to advertisers or data brokers.
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-white">3. Account Deletion & Data Erasure</h4>
                  <p className="text-neutral-400 text-[11px]">
                    You can permanently delete your account and wipe all server records instantly anytime through your account settings menu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-[#252528] flex items-center justify-between text-xs text-neutral-400">
          <span>Blaze Trust & Safety v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FFC107] text-black font-bold rounded-xl transition"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
