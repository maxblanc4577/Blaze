import React, { useState } from 'react';
import { X, Share2, Download, Check, Sparkles, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { UserProfile } from '../types';

interface ExportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const ExportProfileModal: React.FC<ExportProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`Check out ${profile.name}'s profile on Blaze! 🔥 ${profile.headline || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSnapshot = () => {
    // Generate a downloadable text/card summary or trigger download
    const cardData = `--- BLAZE PROFILE SNAPSHOT ---
Name: ${profile.name}, ${profile.age}
Headline: ${profile.headline || 'Exploring the city'}
Compatibility: ${profile.compatibilityScore || 92}% Match
Tribes: ${(profile.tribes || []).join(', ')}
Interests: ${(profile.interestTags || []).join(', ')}
About: ${profile.aboutMe || ''}
--------------------------------`;
    const blob = new Blob([cardData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blaze-profile-${profile.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#222222]">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✨</span>
            <h3 className="text-base font-bold text-white">Export & Share Profile Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-neutral-400">
            Generate a shareable snapshot card of {profile.name}'s profile statistics and stats to post on social media or share with friends.
          </p>

          {/* Shareable Profile Preview Card */}
          <div className="bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#121212] border border-amber-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-lg text-white">{profile.name}, {profile.age}</h4>
                  {profile.isVerified && <ShieldCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />}
                </div>
                <p className="text-xs text-amber-300 font-medium">{profile.headline || 'Blaze Creator'}</p>
                <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span>{profile.distance || '1.2 miles away'} • Active recently</span>
                </p>
              </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-3 mb-3 border border-neutral-800 flex items-center justify-around text-center">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Compatibility</p>
                <p className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{profile.compatibilityScore || 94}%</span>
                </p>
              </div>
              <div className="w-[1px] h-8 bg-neutral-800" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Tribes</p>
                <p className="text-xs font-bold text-white mt-1">{(profile.tribes || ['Geek', 'Jock']).slice(0, 2).join(', ')}</p>
              </div>
              <div className="w-[1px] h-8 bg-neutral-800" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Status</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">Verified Pro</p>
              </div>
            </div>

            {profile.interestTags && profile.interestTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.interestTags.slice(0, 4).map((tag, idx) => (
                  <span key={idx} className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-semibold border border-amber-500/30">
                    ✨ {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-right pt-2 border-t border-neutral-800/80">
              <span className="text-[10px] font-black tracking-widest uppercase text-neutral-500">Powered by Blaze Connect</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition flex items-center justify-center space-x-2 border border-neutral-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Share Link'}</span>
            </button>
            <button
              onClick={handleDownloadSnapshot}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 text-[#121212] font-black text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4 fill-current" />
              <span>Download Snapshot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
