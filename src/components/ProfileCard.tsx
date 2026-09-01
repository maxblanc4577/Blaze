import React, { useState } from 'react';
import { UserProfile, getFilterStyle, getStyleTagIcon } from '../types';
import { Flame, Star, ShieldCheck, Sparkles, Lock, Flag, Eye, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { QuickPreviewModal } from './QuickPreviewModal';
import { ReportModal } from './ReportModal';

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
  showToast?: (msg: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index = 0, onClick, onTap, onPass, onDelete, onToggleFavorite, currentUserInterests, onBadgeClick, viewedCount = 0, hasActiveSubscription = false, showToast }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const minSwipeDistance = 60;

  const profileInterests = profile.interestTags || ['Fitness', 'Coffee', 'Design', 'Music'];
  const displayInterests = profileInterests.slice(0, 3);



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
    setShowReportModal(true);
  };

  const isOnline = profile.status === 'online';
  const isBoostOrPremium = profile.membershipTier === 'Pro' || profile.membershipTier === 'Elite Companion' || profile.isCompanionPro;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.03, y: -4 }}
        exit={{ opacity: 0, scale: 0.8, x: swipeX < 0 ? -150 : 150 }}
        transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={(e, info) => {
          setSwipeX(info.offset.x);
          if (info.offset.x > 40) setSwipeDirection('right');
          else if (info.offset.x < -40) setSwipeDirection('left');
          else setSwipeDirection(null);
        }}
        onDragEnd={(e, info) => {
          if (info.offset.x > 80) {
            triggerHaptic([50, 50, 50]);
            onTap(e as any, profile);
          } else if (info.offset.x < -80) {
            triggerHaptic(30);
            if (onPass) onPass(profile.id);
          }
          setSwipeX(0);
          setSwipeDirection(null);
        }}
        onClick={onClick}
        style={{
          transform: `translateX(${swipeX * 0.4}px) rotate(${swipeX * 0.03}deg)`,
          transition: swipeX === 0 ? 'transform 0.2s ease' : 'none',
        }}
        className={`relative group bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.03] aspect-[3/4] flex flex-col select-none ${
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

        {/* Photo Carousel */}
        <div className="absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden">
          <img
            src={photos[currentPhotoIndex]}
            alt={profile.name}
            style={{ filter: getFilterStyle(profile.photoFilter) }}
            className={`w-full h-full object-cover transition-all duration-300 pointer-events-none ${
              isPrivacyBlurred ? 'blur-[8px] group-hover:blur-none' : ''
            }`}
            referrerPolicy="no-referrer"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Photo Pagination Indicator Bars */}
          {photos.length > 1 && (
            <div className="absolute top-2 left-3 right-3 z-20 flex gap-1 items-center pointer-events-none">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all shadow ${
                    idx === currentPhotoIndex ? 'bg-white opacity-100' : 'bg-white/40 opacity-60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Clickable Left/Right areas for Carousel navigation */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-0 top-0 bottom-0 w-1/3 z-20 opacity-0 hover:opacity-100 flex items-center justify-start pl-2 transition cursor-pointer"
                aria-label="Previous photo"
              >
                <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold shadow">‹</div>
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-0 top-0 bottom-0 w-1/3 z-20 opacity-0 hover:opacity-100 flex items-center justify-end pr-2 transition cursor-pointer"
                aria-label="Next photo"
              >
                <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold shadow">›</div>
              </button>
            </>
          )}
        </div>

        {/* Top badges: Distance & Top-right Action Icons */}
        <div className="relative z-10 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-white tracking-wide">
                {profile.distance === 0 ? 'Here' : `${profile.distance} mi`}
              </span>
            </div>
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
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Info Overlay with Name, Age, and Distance */}
        <div className="relative z-10 mt-auto p-3 flex items-end justify-between">
          <div className="w-full">
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2 drop-shadow-md">
              <span>{profile.name},</span>
              <span>{profile.age}</span>
              {(profile.verified || profile.isVerified) && (
                <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" title="Verified Profile" />
              )}
            </h3>
            <p className="text-xs text-neutral-300 font-medium mt-0.5 flex items-center gap-1">
              <span>📍 {profile.distance === 0 ? 'Less than a mile away' : `${profile.distance} miles away`}</span>
            </p>
          </div>

          {/* Quick Tap Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(30);
              onTap(e, profile);
            }}
            className="p-2.5 rounded-full bg-black/60 hover:bg-[#FFC107] text-[#FFC107] hover:text-[#121212] backdrop-blur-md border border-white/10 transition group/btn active:scale-90 flex-shrink-0 ml-1.5 shadow-lg"
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

      {showReportModal && (
        <ReportModal
          profile={profile}
          onClose={() => setShowReportModal(false)}
          onReasonSelect={(reason) => {
            if (showToast) {
              showToast(`⚠️ Reason selected: ${reason}`);
            }
          }}
          onReportSubmitted={(reason, details) => {
            console.log('🚨 Profile Reported:', { profileId: profile.id, name: profile.name, reason, details, timestamp: Date.now() });
            if (showToast) {
              showToast(`🛡️ Report successfully sent to the moderation team for ${profile.name} (${reason}). Thank you for keeping our community safe.`);
            } else {
              alert(`Report successfully sent to the moderation team for ${profile.name} (${reason}). Thank you for keeping our community safe.`);
            }
          }}
        />
      )}
    </>
  );
};

