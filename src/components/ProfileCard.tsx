import React, { useState } from 'react';
import { UserProfile, getFilterStyle, getStyleTagIcon } from '../types';
import { Flame, Star, ShieldCheck, Sparkles, Lock, X, MoreVertical, Flag, Eye, CheckCircle2, Camera } from 'lucide-react';
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
  viewedCount?: number;
  hasActiveSubscription?: boolean;
  onRemove?: (profileId: string) => void;
  onVerify?: (profileId: string) => void;
  onSpark?: (profile: UserProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index = 0, onClick, onTap, onPass, onToggleFavorite, currentUserInterests, onBadgeClick, viewedCount = 0, hasActiveSubscription = false, onRemove, onVerify, onSpark }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isBursting, setIsBursting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'scanning' | 'success'>('idle');

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [showBioPreviewModal, setShowBioPreviewModal] = useState(false);

  const minSwipeDistance = 60;

  // Shared interests computation
  const userInterests = currentUserInterests || ['Coffee', 'Fitness', 'Music', 'Tech', 'Travel', 'Art'];
  const profileInterests = profile.interestTags || ['Fitness', 'Coffee', 'Design', 'Music'];
  const sharedInterests = profileInterests.filter(tag => userInterests.includes(tag));
  const displayInterests = sharedInterests.length > 0 ? sharedInterests : profileInterests.slice(0, 2);

  // Calculate compatibility score for badge (>80%)
  const sharedTribes = profile.tribes?.length || 2;
  const score = Math.min(99, 45 + sharedTribes * 18);

  // Privacy blur if not favorite
  const isPrivacyBlurred = !profile.isFavorite;

  const triggerHaptic = (pattern: number | number[] = 40) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // ignore
      }
    }
  };

  const playSparkSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio context restricted
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
      playSparkSound();
      setIsBursting(true);
      setTimeout(() => setIsBursting(false), 900);
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
      case 'dnd':
        return 'bg-rose-500 shadow-rose-500/50';
      default:
        return 'bg-neutral-500';
    }
  };

  const getDistanceColor = (dist: number) => {
    if (dist === 0 || dist < 1) return 'text-emerald-400 font-bold';
    if (dist < 5) return 'text-amber-400 font-semibold';
    return 'text-white font-medium';
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowReportModal(true);
  };

  const handleReportSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[REPORT_PROFILE] Profile ID: ${profile.id}, Name: ${profile.name}, Reason: ${reportReason}, Timestamp: ${new Date().toISOString()}`);
    setShowReportModal(false);
    alert(`Report logged for "${profile.name}" with reason: "${reportReason}". Thank you for helping keep our community safe.`);
  };

  const handleStartVerification = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVerificationModal(true);
    setVerificationStep('scanning');
    setTimeout(() => {
      setVerificationStep('success');
      setTimeout(() => {
        setShowVerificationModal(false);
        if (onVerify) onVerify(profile.id);
        setVerificationStep('idle');
      }, 1500);
    }, 2000);
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
      className={`relative group ${profile.cardGradient || 'bg-[#1E1E1E]'} rounded-xl overflow-hidden cursor-pointer border ${
        profile.membershipTier === 'Elite Companion' || profile.membershipTier === 'Pro' || profile.stickers?.some(s => s.toLowerCase().includes('boost') || s.toLowerCase().includes('vip'))
          ? 'border-amber-400/80 shadow-[0_0_25px_rgba(255,193,7px,0.35)]'
          : 'border-neutral-800/80 hover:border-[#FFC107]/50'
      } transition-all duration-300 hover:scale-105 aspect-[3/4] flex flex-col select-none ${
        profile.status === 'online' ? 'shadow-[0_0_22px_rgba(34,197,94,0.3)]' : 'shadow-lg'
      }`}
    >
      {/* Subtle ping animation effect on background for premium/boosted users */}
      {(profile.membershipTier === 'Elite Companion' || profile.membershipTier === 'Pro' || profile.stickers?.some(s => s.toLowerCase().includes('boost') || s.toLowerCase().includes('vip'))) && (
        <div className="absolute inset-0 bg-amber-500/10 pointer-events-none animate-ping opacity-25 duration-1000" />
      )}
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

      {/* Heart Burst / Spark Animation Overlay */}
      {isBursting && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-amber-500/60 to-rose-500/60 blur-xl"
          />
          {/* Custom Expanding SVG Spark Icon Animation */}
          <motion.svg
            initial={{ scale: 0.2, rotate: -45, opacity: 1 }}
            animate={{ scale: 3.5, rotate: 45, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute w-24 h-24 text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(255,193,7,0.8)]"
            viewBox="0 0 24 24"
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </motion.svg>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0.8, 1.4, 0.4],
                x: Math.cos((i * Math.PI) / 3) * 75,
                y: Math.sin((i * Math.PI) / 3) * 75,
                opacity: 0,
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute text-amber-400 text-xl font-black"
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}

      {/* Photo */}
      <div 
        className="absolute inset-0 w-full h-full bg-neutral-900 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setShowLightbox(true);
        }}
      >
        <img
          src={profile.photos[0]}
          alt={profile.name}
          style={{ filter: getFilterStyle(profile.photoFilter) }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
            isPrivacyBlurred ? 'blur-[8px] group-hover:blur-none' : ''
          }`}
          referrerPolicy="no-referrer"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        
        {/* Lightbox Hint Icon */}
        <div className="absolute top-12 right-2 z-20 bg-black/50 hover:bg-black/80 backdrop-blur-md p-1.5 rounded-full text-white/80 hover:text-white transition shadow border border-white/10" title="View photo in detail">
          <Eye className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Verified Badge Top Corner OR Complete Verification button */}
      {profile.isVerified ? (
        <div className="absolute top-2 left-2 z-20 bg-cyan-500/90 backdrop-blur-md text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-cyan-300 pointer-events-none">
          <ShieldCheck className="w-3 h-3 fill-black text-cyan-500" /> Verified
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartVerification}
          className="absolute top-2 left-2 z-20 bg-neutral-900/80 hover:bg-cyan-500 hover:text-black backdrop-blur-md text-cyan-400 font-bold text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg border border-cyan-500/40 transition"
          title="Click to complete ID verification"
        >
          <Camera className="w-3 h-3" /> Complete Verification
        </button>
      )}

      {/* Top badges: Online status & Distance & Mood */}
      <div className="relative z-10 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 relative">
            <span className={`w-2 h-2 rounded-full shadow-sm ${getStatusColor(profile.status)}`} />
            {profile.status === 'online' && (
              <span className="absolute left-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75 pointer-events-none" />
            )}
            <span className={`text-[11px] tracking-wide ${getDistanceColor(profile.distance)}`}>
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

        <div className="flex items-center space-x-1">
          {profile.isFavorite && (
            <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-[#FFC107]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          )}

          {/* Quick Bio & Interests Preview Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBioPreviewModal(true);
            }}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center border border-white/20 text-neutral-300 hover:text-white transition shadow"
            title="Quick Bio & Interests Preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Prominent Red Report Flag Icon Button */}
          <button
            onClick={handleReport}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-rose-500/20 backdrop-blur-md flex items-center justify-center border border-rose-500/40 text-rose-500 hover:text-rose-400 transition shadow"
            title="Report Profile"
          >
            <Flag className="w-3.5 h-3.5 fill-rose-500/30" />
          </button>

          {/* Interactions Menu / More Options */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center border border-white/20 text-neutral-300 hover:text-white transition shadow"
              title="Profile Options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-40 w-48 bg-[#1E1E1E] border border-neutral-700 rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
                {onSpark && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onSpark(profile);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-neutral-800 flex items-center space-x-2 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>Spark (Super-Like)</span>
                  </button>
                )}
                <button
                  onClick={handleReport}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-neutral-800 flex items-center space-x-2 transition border-t border-neutral-800"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Profile</span>
                </button>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onRemove(profile.id);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-red-500/20 hover:text-red-400 flex items-center space-x-2 transition border-t border-neutral-800"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove from Platform</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Circular Progress Bar for Remaining Free Views */}
        {(() => {
          const remaining = Math.max(0, 20 - viewedCount);
          const percent = hasActiveSubscription ? 100 : (remaining / 20) * 100;
          return (
            <div className="relative w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-neutral-700 shadow-lg ml-1.5 flex-shrink-0" title={hasActiveSubscription ? 'Pass Active: Unlimited Views' : `${remaining} free views remaining`}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={hasActiveSubscription ? 'text-[#FFC107]' : remaining <= 5 ? 'text-red-400' : 'text-[#FFC107]'}
                  strokeDasharray={`${percent}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                {hasActiveSubscription ? '👑' : remaining}
              </div>
            </div>
          );
        })()}


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
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] bg-black/50 backdrop-blur-md text-emerald-300 px-1.5 py-0.5 rounded font-medium border border-white/10">
              {profile.lastActive || 'Active 10m ago'}
            </span>
            <span className="text-[10px] bg-black/50 backdrop-blur-md text-purple-300 px-1.5 py-0.5 rounded font-medium border border-white/10 flex items-center gap-1">
              <span>👥</span> {profile.mutualFriendsCount || Math.floor((profile.id.charCodeAt(0) % 4) + 1)} mutual friends
            </span>
            {profile.headline && (
              <p className="text-[11px] text-neutral-300 line-clamp-1 opacity-90 w-full mt-0.5">
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
            triggerHaptic([60, 40, 60]);
            playSparkSound();
            setIsBursting(true);
            setTimeout(() => setIsBursting(false), 900);
            onTap(e, profile);
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-[#FFC107] text-[#FFC107] hover:text-[#121212] backdrop-blur-md border border-white/10 transition group/btn active:scale-90"
          title="Send Tap"
        >
          <Flame className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>



      {/* Hover-triggered Quick Snapshot Tooltip */}
      <div className="absolute inset-x-3 bottom-20 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-neutral-900/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-3 shadow-2xl flex flex-col gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Quick Snapshot</span>
          {profile.interestTags?.[0] && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
              ⭐ {profile.interestTags[0]}
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed italic">
          "{profile.aboutMe || profile.headline || 'Passionate explorer & creator ready to connect.'}"
        </p>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowLightbox(false);
          }}
        >
          <div className="relative max-w-2xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-12 right-0 bg-neutral-800 text-white p-2 rounded-full hover:bg-neutral-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={profile.photos[0]}
              alt={profile.name}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-neutral-800"
              referrerPolicy="no-referrer"
            />
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-white">{profile.name}, {profile.age}</h2>
              <p className="text-sm text-neutral-400 mt-1">{profile.headline || profile.aboutMe}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fake Verification Modal */}
      {showVerificationModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#1E1E1E] border border-neutral-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">ID & Facial Verification</h3>
            {verificationStep === 'scanning' && (
              <div className="py-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mb-4" />
                <p className="text-sm text-cyan-400 font-medium">Scanning biometric markers & verifying identity...</p>
              </div>
            )}
            {verificationStep === 'success' && (
              <div className="py-6 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3 animate-bounce" />
                <p className="text-base font-bold text-emerald-300">Identity Verified Successfully!</p>
                <p className="text-xs text-neutral-400 mt-1">Badge granted to {profile.name}.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Profile Modal */}
      {showReportModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#1E1E1E] border border-neutral-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-400" />
                <span>Report {profile.name}</span>
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-300">Please select a reason for reporting this profile:</p>
            <div className="space-y-2">
              {['Inappropriate content', 'Spam', 'Fake profile', 'Harassment or abuse'].map((reason) => (
                <label key={reason} className="flex items-center gap-2.5 p-2.5 bg-neutral-900 rounded-xl cursor-pointer hover:bg-neutral-800 border border-neutral-800">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-amber-500"
                  />
                  <span className="text-xs font-medium text-white">{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition shadow"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Bio & Interests Preview Modal */}
      {showBioPreviewModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#1E1E1E] border border-neutral-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-500/50"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{profile.name}, {profile.age}</h3>
                  <span className="text-[10px] text-amber-400 font-semibold">{profile.headline || 'Active Member'}</span>
                </div>
              </div>
              <button
                onClick={() => setShowBioPreviewModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1">About Me</h4>
                <p className="text-xs text-neutral-200 leading-relaxed bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                  {profile.aboutMe || profile.headline || 'Passionate explorer & creator ready to connect.'}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1">Top Three Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.interestTags || ['Fitness', 'Coffee', 'Design']).slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                      ⭐ {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowBioPreviewModal(false)}
                className="w-full py-2.5 bg-[#FFC107] hover:opacity-90 text-[#121212] font-bold text-xs rounded-xl transition shadow"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

