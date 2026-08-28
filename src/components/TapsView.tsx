import React from 'react';
import { UserProfile } from '../types';
import { ProfileCard } from './ProfileCard';
import { Flame } from 'lucide-react';

interface TapsViewProps {
  tappedProfiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onSendTap: (e: React.MouseEvent, profile: UserProfile) => void;
}

export const TapsView: React.FC<TapsViewProps> = ({
  tappedProfiles,
  onSelectProfile,
  onSendTap,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="flex items-center space-x-2 mb-4">
        <Flame className="w-6 h-6 text-[#FFC107] fill-current" />
        <h2 className="text-white font-bold text-xl">Your Taps</h2>
      </div>

      {tappedProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 text-neutral-400">
          <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mb-4 text-[#FFC107]">
            <Flame className="w-8 h-8" />
          </div>
          <h3 className="text-white font-bold text-lg mb-1">No Taps Yet</h3>
          <p className="text-sm max-w-xs text-neutral-400">
            Tap on profiles in the grid to show interest and see who taps you back!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tappedProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onClick={() => onSelectProfile(profile)}
              onTap={onSendTap}
            />
          ))}
        </div>
      )}
    </div>
  );
};
