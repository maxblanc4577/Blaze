import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ProfileCard } from './ProfileCard';
import { Sparkles, Hash, Users, Compass } from 'lucide-react';

interface TribesViewProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onStartChat: (profile: UserProfile) => void;
  onSendTap: (profile: UserProfile) => void;
}

export const TribesView: React.FC<TribesViewProps> = ({
  profiles,
  onSelectProfile,
  onStartChat,
  onSendTap,
}) => {
  const [selectedTribe, setSelectedTribe] = useState<string>('Geek');

  const tribesList = [
    { name: 'Geek', count: 18, emoji: '💻', desc: 'Tech enthusiasts, developers, and gamers' },
    { name: 'Clean', count: 24, emoji: '✨', desc: 'Minimalist, tidy, and wellness-focused' },
    { name: 'Jock', count: 14, emoji: '⚡', desc: 'Fitness buffs, athletes, and outdoor runners' },
    { name: 'Bear', count: 8, emoji: '🐻', desc: 'Rugged, warm, and friendly community' },
    { name: 'Twink', count: 12, emoji: '🦊', desc: 'Energetic, youthful, and trendy' },
    { name: 'Daddy', count: 10, emoji: '👑', desc: 'Mature, sophisticated, and mentors' },
    { name: 'Otter', count: 9, emoji: '🦦', desc: 'Active, lean, and adventurous' },
    { name: 'Discreet', count: 7, emoji: '🕶️', desc: 'Private, selective, and low-key' },
    { name: 'Fitness', count: 20, emoji: '🏋️', desc: 'Gym rats and yoga lovers' },
    { name: 'Coffee', count: 22, emoji: '☕', desc: 'Café hoppers and espresso connoisseurs' },
    { name: 'Music', count: 19, emoji: '🎵', desc: 'Festival goers and vinyl collectors' },
    { name: 'Travel', count: 16, emoji: '✈️', desc: 'Globe trotters and weekend explorers' },
  ];

  const filteredProfiles = profiles.filter(p => {
    const matchesTribe = p.tribes?.includes(selectedTribe as any);
    const matchesInterest = p.interestTags?.includes(selectedTribe as any);
    return matchesTribe || matchesInterest;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-28 text-white">
      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-stone-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span>Discover Tribes & Interests</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                Community Cloud
              </span>
            </h2>
            <p className="text-xs text-neutral-400">Explore and connect with people who share your exact passions and vibe.</p>
          </div>
        </div>
      </div>

      {/* Dynamic Tribe Cloud / Carousel */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-amber-400" />
          <span>Popular Tribes & Passions ({tribesList.length})</span>
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {tribesList.map((tribe) => {
            const isSelected = selectedTribe === tribe.name;
            return (
              <button
                key={tribe.name}
                onClick={() => setSelectedTribe(tribe.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-md border ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 scale-105 shadow-amber-500/20'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                }`}
              >
                <span className="text-sm">{tribe.emoji}</span>
                <span>{tribe.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-black/20 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                  {tribe.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Profiles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>Profiles in <span className="text-amber-400">#{selectedTribe}</span></span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium">
              {filteredProfiles.length} members
            </span>
          </h3>
          <span className="text-xs text-neutral-400">Click any card to view full profile & connect</span>
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-base font-bold text-white mb-1">No profiles found in #{selectedTribe}</p>
            <p className="text-xs text-neutral-400">Try selecting another tribe from the cloud above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onSelect={(p) => onSelectProfile(p)}
                onTap={(e, p) => onSendTap(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
