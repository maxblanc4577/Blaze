import React from 'react';
import { UserProfile } from '../types';
import { Flame, Star, ShieldCheck } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
  onClick: () => void;
  onTap: (e: React.MouseEvent, profile: UserProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onClick, onTap }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500 shadow-emerald-500/50';
      case 'away':
        return 'bg-amber-500 shadow-amber-500/50';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative group bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-[#FFC107]/50 transition-all duration-200 shadow-md hover:shadow-xl aspect-[3/4] flex flex-col"
    >
      {/* Photo */}
      <div className="absolute inset-0 w-full h-full bg-neutral-900">
        <img
          src={profile.photos[0]}
          alt={profile.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Top badges: Online status & Distance */}
      <div className="relative z-10 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            <span className={`w-2 h-2 rounded-full shadow-sm ${getStatusColor(profile.status)}`} />
            <span className="text-[11px] font-semibold text-white tracking-wide">
              {profile.distance === 0 ? 'Here' : `${profile.distance} mi`}
            </span>
          </div>
          {profile.isNewUser && (
            <span className="bg-amber-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              New
            </span>
          )}
          {profile.lastPhotoUpdated && !profile.isNewUser && (
            <span className="bg-cyan-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              New Photo
            </span>
          )}
        </div>

        {profile.isFavorite && (
          <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-[#FFC107]">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
        )}

        {profile.isCompanionPro && (
          <div className="bg-amber-500/90 text-black font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
            Elite Pro
          </div>
        )}
      </div>

      {/* Bottom Info Overlay */}
      <div className="relative z-10 mt-auto p-2.5 flex items-end justify-between">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
            <span>{profile.name}</span>
            <span className="text-neutral-300 font-normal">{profile.age}</span>
            {profile.isVerified && (
              <ShieldCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" title="Verified Profile" />
            )}
          </h3>
          {profile.headline && (
            <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5 opacity-90">
              {profile.headline}
            </p>
          )}
        </div>

        {/* Quick Tap Button */}
        <button
          onClick={(e) => onTap(e, profile)}
          className="p-2 rounded-full bg-black/50 hover:bg-[#FFC107] text-[#FFC107] hover:text-[#121212] backdrop-blur-md border border-white/10 transition group/btn active:scale-90"
          title="Send Tap"
        >
          <Flame className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};
