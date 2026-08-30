import React from 'react';
import { UserProfile } from '../types';
import { X, ShieldCheck, Sparkles, Star, Flame } from 'lucide-react';

interface QuickPreviewModalProps {
  profile: UserProfile | null;
  onClose: () => void;
  onTap: (profile: UserProfile) => void;
}

export const QuickPreviewModal: React.FC<QuickPreviewModalProps> = ({ profile, onClose, onTap }) => {
  if (!profile) return null;

  const topThreeInterests = (profile.interestTags || ['Fitness', 'Coffee', 'Music']).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="relative h-64 bg-neutral-900">
          <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-black/50" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black text-white transition backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
              <span>{profile.name}, {profile.age}</span>
              {profile.isVerified && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
            </h3>
            <p className="text-xs text-neutral-300">{profile.locationName} • {profile.distance === 0 ? 'Here' : `${profile.distance} mi`}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFC107] mb-1">About Me</h4>
            <p className="text-xs text-neutral-300 leading-relaxed">{profile.aboutMe || profile.headline || 'No bio yet.'}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFC107] mb-2">Top 3 Interests</h4>
            <div className="flex flex-wrap gap-1.5">
              {topThreeInterests.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium">
                  ✨ {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                onTap(profile);
                onClose();
              }}
              className="flex-1 py-2.5 bg-[#FFC107] text-[#121212] font-black text-xs rounded-xl hover:opacity-90 transition flex items-center justify-center space-x-1 shadow"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Send Tap</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-800 text-neutral-300 font-semibold text-xs rounded-xl hover:bg-neutral-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
