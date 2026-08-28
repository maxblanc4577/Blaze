import React, { useState } from 'react';
import { UserProfile, getFilterStyle, getStyleTagIcon } from '../types';
import { Flame, Star, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileCardProps {
  profile: UserProfile;
  index?: number;
  onClick: () => void;
  onTap: (e: React.MouseEvent, profile: UserProfile) => void;
  onPass?: (profileId: string) => void;
  onToggleFavorite?: (profileId: string) => void;
  currentUserInterests?: string[];
  onBadgeClick?: (badge: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index = 0, onClick, onTap, onPass, onToggleFavorite, currentUserInterests, onBadgeClick }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80'];
  const minSwipeDistance = 60;

  // Shared interests computation
  const userInterests = currentUserInterests || ['Coffee', 'Fitness', 'Music', 'Tech', 'Travel', 'Art'];
  const profileInterests = profile.interestTags || ['Fitness', 'Coffee', 'Design', 'Music'];
  const sharedInterests = profileInterests.filter(tag => userInterests.includes(tag));
  const displayInterests = sharedInterests.length > 0 ? sharedInterests : profileInterests.slice(0, 2);

  // Calculate compatibility score for badge (>80%)
  const sharedTribes = profile.tribes?.length || 2;
  const score = Math.min(99, 45 + sharedTribes * 18);

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
      className="relative group bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-[#FFC107]/50 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 hover:scale-[1.02] aspect-[3/4] flex flex-col select-none"
    >
      {/* Swipe Feedback Overlay */}
      {swipeDirection === 'right' && (
        <div className="absolute inset-0 z-20 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none border-4 border-emerald-500/60 rounded-xl">
          <span className="bg-emerald-500 text-black font-black text-lg px-4 py-2 rounded-xl shadow-2xl tracking-wider uppercase rotate-[-12deg]">
            TAP 🔥
          </span>
        </div>
      )}
      {swipeDirection === 'left' && (
        <div className="absolute inset-0 z-20 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none border-4 border-red-500/60 rounded-xl">
          <span className="bg-red-500 text-white font-black text-lg px-4 py-2 rounded-xl shadow-2xl tracking-wider uppercase rotate-[12deg]">
            PASS ✕
          </span>
        </div>
      )}

      {/* Photo with scroll/cycle */}
      <div className="absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden">
        <img
          src={photos[activePhotoIdx]}
          alt={profile.name}
          style={{ filter: getFilterStyle(profile.photoFilter) }}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isPrivacyBlurred ? 'blur-[8px] group-hover:blur-none' : ''
          }`}
          referrerPolicy="no-referrer"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Click zones for photo navigation */}
        {photos.length > 1 && (
          <>
            <div
              className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-w-resize"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx(prev => (prev > 0 ? prev - 1 : photos.length - 1));
              }}
              title="Previous Photo"
            />
            <div
              className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-e-resize"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx(prev => (prev < photos.length - 1 ? prev + 1 : 0));
              }}
              title="Next Photo"
            />
          </>
        )}
      </div>

      {/* Photo Indicator Bars */}
      {photos.length > 1 && (
        <div className="relative z-20 px-3 pt-2 flex gap-1 w-full">
          {photos.map((_, pIdx) => (
            <div
              key={pIdx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                pIdx === activePhotoIdx ? 'bg-white shadow-md' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Top badges: Online status & Distance & Mood */}
      <div className="relative z-10 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            <span className={`w-2 h-2 rounded-full shadow-sm ${getStatusColor(profile.status)}`} />
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
              <Lock className="w-2.5 h-2.5" /> Privacy Blur
            </span>
          )}
          {profile.isNewUser && (
            <span className="bg-amber-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              New
            </span>
          )}
        </div>

        {profile.isFavorite && (
          <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-[#FFC107]">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
        )}

        {score >= 80 && (
          <div className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black text-black tracking-wider uppercase shadow">
            <Sparkles className="w-3 h-3" />
            <span>{score}% Match</span>
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

          {/* Shared Interest Badges */}
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
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition flex items-center gap-1 ${
                      isCommon
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-black/40 text-neutral-300 border border-white/10 hover:bg-black/60'
                    }`}
                    title={isCommon ? `Common interest: ${tag}` : tag}
                  >
                    <span>{isCommon ? '✨' : '•'}</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Style Aesthetic Tags */}
          {profile.styleTags && profile.styleTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.styleTags.map((style) => {
                const styleInfo = getStyleTagIcon(style);
                return (
                  <span
                    key={style}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border flex items-center gap-1 ${styleInfo.color}`}
                    title={`Aesthetic: ${style}`}
                  >
                    <span>{styleInfo.icon}</span>
                    <span>{style}</span>
                  </span>
                );
              })}
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
          className="p-2 rounded-full bg-black/50 hover:bg-[#FFC107] text-[#FFC107] hover:text-[#121212] backdrop-blur-md border border-white/10 transition group/btn active:scale-90"
          title="Send Tap"
        >
          <Flame className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
