import React, { useState } from 'react';
import { UserProfile, getFilterStyle, getStyleTagIcon } from '../types';
import { Flame, Star, ShieldCheck, Sparkles, Lock, Flag, Eye, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { QuickPreviewModal } from './QuickPreviewModal';

interface ProfileCardProps {
  profile: UserProfile;
  index?: number;
  onClick: () => void;
  onTap: (e: React.MouseEvent, profile: UserProfile) => void;
  onPass?: (profileId: string) => void;
  onDelete?: (profileId: string) => void;
  onToggleFavorite?: (profileId: string) => void;
  currentUserInterests?: string[];
  onBadgeClick?: (badge: string) => void;
  viewedCount?: number;
  hasActiveSubscription?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index = 0, onClick, onTap, onPass, onDelete, onToggleFavorite, currentUserInterests, onBadgeClick, viewedCount = 0, hasActiveSubscription = false }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const minSwipeDistance = 60;

  // Shared interests computation
  const userInterests = currentUserInterests || ['Coffee', 'Fitness', 'Music', 'Tech', 'Travel', 'Art'];
  const profileInterests = profile.interestTags || ['Fitness', 'Coffee', 'Design', 'Music'];
  const sharedInterests = profileInterests.filter(tag => userInterests.includes(tag));
  const displayInterests = sharedInterests.length > 0 ? sharedInterests : profileInterests.slice(0, 3);
  const top3Common = sharedInterests.length > 0 ? sharedInterests.slice(0, 3) : profileInterests.slice(0, 3);

  // Calculate compatibility score based on overlapping interest tags, tribes, and age proximity
  const currentUserAge = 26;
  const profileAge = profile.age || 26;
  const ageDiff = Math.abs(currentUserAge - profileAge);
  const ageProximityScore = Math.max(0, 100 - ageDiff * 6);

  const userTribes = ['Tech', 'Music', 'Fitness', 'Art'];
  const profileTribes = profile.tribes || [];
  const sharedTribesCount = profileTribes.filter(t => userTribes.includes(t)).length;
  const tribeScore = Math.min(100, sharedTribesCount * 35 + 25);

  const interestMatchCount = sharedInterests.length;
  const interestScore = Math.min(100, interestMatchCount * 30 + 20);

  const matchScore = Math.min(99, Math.max(45, Math.round(
    ageProximityScore * 0.25 + tribeScore * 0.35 + interestScore * 0.4
  )));

  // Privacy blur if not favorite and not matched up
  const isPrivacyBlurred = !profile.isFavorite && !profile.isMatchedUp;

  const triggerHaptic = (pattern: number | number[] = 40) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setTouchEnd(null);
    setTouchStart(clientX);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setTouchEnd(clientX);
    const distance = clientX - touchStart;
    setSwipeX(distance);
    if (distance > 40) setSwipeDirection('right');
    else if (distance < -40) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  const handleTouchEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!touchStart || !touchEnd) {
      setSwipeX(0);
      setSwipeDirection(null);
      return;
    }
    const distance = touchEnd - touchStart;
    if (distance > minSwipeDistance) {
      // Swipe Right -> Tap / Like
      e.stopPropagation();
      triggerHaptic([50, 50, 50]);
      onTap(e as any, profile);
    } else if (distance < -minSwipeDistance) {
      // Swipe Left -> Pass
      e.stopPropagation();
      triggerHaptic(30);
      if (onPass) {
        onPass(profile.id);
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeX(0);
    setSwipeDirection(null);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = prompt(`Select report reason for ${profile.name}:\n1. Spam\n2. Harassment\n3. Fake profile\n4. Inappropriate content`, 'Spam');
    if (reason) {
      console.log('🚨 Profile Reported:', { profileId: profile.id, name: profile.name, reason, timestamp: Date.now() });
      alert(`Report submitted for ${profile.name} (Reason: ${reason}). Thank you for keeping our community safe.`);
    }
  };

  const isOnline = profile.status === 'online';
  const isBoostOrPremium = profile.membershipTier === 'Pro' || profile.membershipTier === 'Elite Companion' || profile.isCompanionPro;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: swipeX < 0 ? -150 : 150 }}
        transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
        onClick={onClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        style={{
          transform: `translateX(${swipeX * 0.4}px) rotate(${swipeX * 0.03}deg)`,
          transition: touchStart === null ? 'transform 0.2s ease' : 'none',
        }}
        className={`relative group bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-105 aspect-[3/4] flex flex-col select-none ${
          isOnline ? 'border-emerald-500/50 shadow-emerald-500/10' : 'border-neutral-800/80 hover:border-[#FFC107]/50'
        } ${isBoostOrPremium ? 'ring-2 ring-amber-500/40 animate-pulse' : ''}`}
      >
        {/* Swipe Feedback Overlay */}
        {swipeDirection === 'right' && (
          <div className="absolute inset-0 z-20 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none border-4 border-emerald-500/60 rounded-xl">
            <span className="bg-emerald-500 text-black font-black text-lg px-4 py-2 rounded-xl shadow-2xl tracking-wider uppercase rotate-[-12deg]">
              LIKE 🔥
            </span>
          </div>
        )}
        {swipeDirection === 'left' && (
          <div className="absolute inset-0 z-20 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none border-4 border-red-500/60 rounded-xl">
            <span className="bg-red-500 text-white font-black text-lg px-4 py-2 rounded-xl shadow-2xl tracking-wider uppercase rotate-[12deg]">
              NOPE ✕
            </span>
          </div>
        )}

        {/* Photo */}
        <div className="absolute inset-0 w-full h-full bg-neutral-900">
          <img
            src={profile.photos[0]}
            alt={profile.name}
            style={{ filter: getFilterStyle(profile.photoFilter) }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 pointer-events-none ${
              isPrivacyBlurred ? 'blur-[8px] group-hover:blur-none' : ''
            }`}
            referrerPolicy="no-referrer"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Top badges: Online status with ping dot & Top-right Action Icons (Eye preview & Red Report flag) */}
        <div className="relative z-10 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
              {isOnline ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-neutral-500" />
              )}
              <span className="text-[11px] font-semibold text-white tracking-wide">
                {profile.distance === 0 ? 'Here' : `${profile.distance} mi`}
              </span>
            </div>
            {profile.currentMood && (
              <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-xs border border-white/10 shadow" title={`Mood: ${profile.currentMood}`}>
                {profile.currentMood}
              </span>
            )}
            {isPrivacyBlurred && (
              <span className="bg-black/60 text-amber-300 border border-amber-500/30 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Lock className="w-2.5 h-2.5" /> Blur
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Quick Preview Eye Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(20);
                setShowPreview(true);
              }}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-neutral-800 transition shadow"
              title="Quick Bio Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Red Report Flag Icon */}
            <button
              onClick={handleReport}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-red-400 hover:bg-red-500/20 transition shadow"
              title="Report Profile"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>

            {/* Delete / Remove from Platform Button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(40);
                  if (window.confirm(`Are you sure you want to delete and remove ${profile.name} from the platform?`)) {
                    onDelete(profile.id);
                  }
                }}
                className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-neutral-400 hover:text-red-400 hover:bg-red-500/20 transition shadow"
                title="Delete and remove from platform"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {matchScore >= 50 && (
              <div className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black text-black tracking-wider uppercase shadow">
                <Sparkles className="w-3 h-3" />
                <span>{matchScore}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Info Overlay with Interest Cloud */}
        <div className="relative z-10 mt-auto p-2.5 flex items-end justify-between">
          <div className="w-full">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
              <span>{profile.name}</span>
              <span className="text-neutral-300 font-normal">{profile.age}</span>
              {profile.isVerified && (
                <ShieldCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" title="Verified Profile" />
              )}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] bg-black/50 backdrop-blur-md text-emerald-300 px-1.5 py-0.5 rounded font-medium border border-white/10">
                {profile.lastActive || 'Active 10m ago'}
              </span>
              {profile.headline && (
                <p className="text-[11px] text-neutral-300 line-clamp-1 opacity-90">
                  {profile.headline}
                </p>
              )}
            </div>

            {/* Visual Interest Cloud with variable sizing based on commonality */}
            {displayInterests.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {displayInterests.map((tag) => {
                  const isCommon = sharedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onBadgeClick) onBadgeClick(tag);
                      }}
                      className={`px-2 py-0.5 rounded-full font-semibold transition flex items-center gap-1 ${
                        isCommon
                          ? 'text-[11px] bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:bg-amber-500/40 font-bold'
                          : 'text-[9px] bg-black/40 text-neutral-300 border border-white/10 hover:bg-black/60'
                      }`}
                      title={isCommon ? `Common interest: ${tag} (High Match)` : tag}
                    >
                      <span>{isCommon ? '🔥' : '•'}</span>
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Compatibility Highlight: 3 Common Interest Tags */}
            {top3Common.length > 0 && (
              <div className="mt-2 bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-lg p-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Compatibility Highlight
                  </span>
                  <span className="text-neutral-300">{top3Common.length} Shared</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {top3Common.map(tag => (
                    <span key={tag} className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Tap Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(30);
              onTap(e, profile);
            }}
            className="p-2 rounded-full bg-black/50 hover:bg-[#FFC107] text-[#FFC107] hover:text-[#121212] backdrop-blur-md border border-white/10 transition group/btn active:scale-90 flex-shrink-0 ml-1.5"
            title="Send Tap"
          >
            <Flame className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </motion.div>

      {showPreview && (
        <QuickPreviewModal
          profile={profile}
          onClose={() => setShowPreview(false)}
          onTap={(p) => onTap({} as any, p)}
        />
      )}
    </>
  );
};

