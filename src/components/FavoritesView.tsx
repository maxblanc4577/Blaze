import React from 'react';
import { UserProfile } from '../types';
import { ProfileCard } from './ProfileCard';
import { Star } from 'lucide-react';

interface FavoritesViewProps {
  favoriteProfiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onSendTap: (e: React.MouseEvent, profile: UserProfile) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteProfiles,
  onSelectProfile,
  onSendTap,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="flex items-center space-x-2 mb-4">
        <Star className="w-6 h-6 text-[#FFC107] fill-current" />
        <h2 className="text-white font-bold text-xl">Favorite Profiles</h2>
      </div>

      {favoriteProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 text-neutral-400">
          <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mb-4 text-[#FFC107]">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="text-white font-bold text-lg mb-1">No Favorites Saved</h3>
          <p className="text-sm max-w-xs text-neutral-400">
            Tap the star icon on any profile to save them to your favorites list for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {favoriteProfiles.map((profile) => (
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
