import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Clock, Share2, Copy, Check, AlertTriangle, Send } from 'lucide-react';

interface SafetyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName?: string;
  matchPhoto?: string;
}

export const SafetyCheckInModal: React.FC<SafetyCheckInModalProps> = ({
  isOpen,
  onClose,
  matchName = 'Your Match',
  matchPhoto,
}) => {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [isShared, setIsShared] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const shareToken = `blaze-safe-${Math.random().toString(36).substring(2, 9)}`;
  const shareUrl = `${window.location.origin}/safety?token=${shareToken}&expires=${durationHours}h`;

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;
    setIsShared(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-[#161616]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Blaze Safety Check-In</h3>
              <p className="text-[11px] text-neutral-400">Share your live location securely when meeting for the first time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Meeting context */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center gap-4">
            {matchPhoto ? (
              <img src={matchPhoto} alt={matchName} className="w-12 h-12 rounded-full object-cover border border-amber-500/50" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">🤝</div>
            )}
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">First-Time Meetup</span>
              <h4 className="text-sm font-bold text-white">Meeting {matchName}</h4>
              <p className="text-xs text-neutral-400">Your temporary live location link expires automatically in {durationHours} hours.</p>
            </div>
          </div>

          {!isShared ? (
            <form onSubmit={handleShare} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Trusted Friend / Family Member Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Phone Number or Email (Optional)</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834 or sarah@example.com"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Live Link Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 4].map(hours => (
                    <button
                      type="button"
                      key={hours}
                      onClick={() => setDurationHours(hours)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        durationHours === hours
                          ? 'bg-amber-500 text-black shadow'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{hours} Hours</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Your exact GPS coordinates are encrypted and only accessible via the unique link you share. The link deactivates automatically after {durationHours} hours.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Generate & Share Live Check-In Link</span>
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Live Check-In Active for {contactName}!</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Your secure tracking link has been created and will expire in {durationHours} hours.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-neutral-300 flex-1 outline-none font-mono truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setIsShared(false)}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition"
                >
                  Create New Link
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
