import React, { useState } from 'react';
import { UserProfile, getFilterStyle, getStyleTagIcon } from '../types';
import { Flame, Star, ShieldCheck, Sparkles, Lock, Flag, Eye, Trash2, MessageCircle, Crown, MoreVertical, ShieldAlert, Phone, MessageSquare } from 'lucide-react';
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
  onBlockUser?: (profileId: string) => void;
  onToggleFavorite?: (profileId: string) => void;
  onOpenChat?: (profile: UserProfile) => void;
  currentUserInterests?: string[];
  onBadgeClick?: (badge: string) => void;
  viewedCount?: number;
  hasActiveSubscription?: boolean;
  showToast?: (msg: string) => void;
  onReportSubmitted?: (profile: UserProfile, reason: string, details: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index = 0, onClick, onTap, onPass, onDelete, onBlockUser, onToggleFavorite, onOpenChat, currentUserInterests, onBadgeClick, viewedCount = 0, hasActiveSubscription = false, showToast, onReportSubmitted }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);

  const [showCardMenu, setShowCardMenu] = useState(false);
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
        className={`relative group bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-[#FFC107]/50 transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.03] aspect-[3/4] flex flex-col select-none ${
          isBoostOrPremium ? 'ring-2 ring-amber-500/40 animate-pulse' : ''
        }`}
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




        </div>

        {/* Top badges: Distance & Quick Preview */}
        <div className="relative z-10 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {/* Distance Radius Indicator Ring */}
            {(() => {
              const d = profile.distance || 5;
              const ringColor = d <= 10 ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : d <= 25 ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-rose-400 bg-rose-500/20 text-rose-300';
              return (
                <div className={`flex items-center space-x-1.5 backdrop-blur-md px-2.5 py-1 rounded-full border ${ringColor} shadow`}>
                  <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
                  <span className="text-xs font-bold tracking-wide">
                    {profile.distance === 0 ? 'Here' : `${profile.distance} mi`}
                  </span>
                </div>
              );
            })()}


          </div>

          <div className="flex items-center space-x-1.5">
            {/* Direct Chat Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenChat) onOpenChat(profile);
              }}
              className="w-7 h-7 rounded-full bg-blue-500/80 hover:bg-blue-500 backdrop-blur-md flex items-center justify-center border border-blue-400/30 text-white transition shadow"
              title="Open Chat & View History"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>

            {/* Quick Preview Eye Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-neutral-800 transition shadow"
              title="Quick Bio Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Hidden Dropdown Menu in Top-Right Corner for Quick Block */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardMenu(!showCardMenu);
                }}
                className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-neutral-800 transition shadow"
                title="Quick Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showCardMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-30 py-1 text-xs text-left">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCardMenu(false);
                      if (onBlockUser) {
                        onBlockUser(profile.id);
                      } else if (onPass) {
                        onPass(profile.id);
                      }
                      if (showToast) showToast(`🚫 Blocked and removed ${profile.name} from discovery.`);
                    }}
                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-neutral-800 flex items-center gap-1.5 font-bold"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Block User
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Info Overlay with Name, Age, and Distance */}
        <div className="relative z-10 mt-auto p-2.5 flex items-end justify-between">
          <div className="w-full">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5 drop-shadow-md flex-wrap">
              <span>{profile.name},</span>
              <span>{profile.age}</span>
              {profile.isFeePaid && (profile.membershipTier === 'Elite Companion' || profile.isCompanionPro) && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                  <Crown className="w-3 h-3" /> Verified Elite
                </span>
              )}
              {/* Visual Verified Blue Checkmark Badge */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVerifiedTooltip(!showVerifiedTooltip);
                  }}
                  className="focus:outline-none flex items-center justify-center p-0.5 rounded-full hover:bg-white/10 transition"
                  title="Click to view Verification Levels"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400/20 cursor-pointer" />
                </button>

                {showVerifiedTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-neutral-900 border border-neutral-700 text-white text-[11px] rounded-2xl p-3.5 shadow-2xl z-35 animate-in fade-in zoom-in-95 text-left space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <p className="font-bold text-amber-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-400" /> Verification Level
                      </p>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                        {profile.membershipTier === 'Elite Companion' ? 'Gold / Platinum' : profile.verified ? 'Silver Level' : 'Bronze Level'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-neutral-300">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-300 font-semibold">🥉 Bronze:</span>
                        <span>Email & Phone Confirmed</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-neutral-200 font-semibold">🥈 Silver:</span>
                        <span>Government ID Submitted</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-yellow-400 font-semibold">🥇 Gold:</span>
                        <span>Biometric Live Selfie Confirmed</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-400 font-bold">💎 Platinum Elite:</span>
                        <span>Full Background & Fee Verified</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-semibold pt-1 border-t border-neutral-800">✓ Safety & Age Verified ({profile.age}+)</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                  </div>
                )}
              </div>

              {/* Document Verification Status Icon for Elite Companions */}
              {(profile.membershipTier === 'Elite Companion' || profile.isCompanionPro) && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  profile.verified || profile.isVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {profile.verified || profile.isVerified ? '✓ ID Verified' : '⏳ ID Pending Verification'}
                </span>
              )}

              {/* Safety Status Badge (Elite/Pro Only) */}
              {(profile.isCompanionPro || profile.membershipTier === 'Elite Companion' || profile.membershipTier === 'Pro') && (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  🛡️ Safety Verified ({profile.age}+)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-300 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>📍 {profile.distance === 0 ? 'Here' : `${profile.distance} mi`}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  profile.status === 'online' ? 'bg-emerald-400' : profile.status === 'away' ? 'bg-amber-400' : 'bg-neutral-500'
                }`} />
                <span className="text-[10px] text-neutral-400">
                  {profile.status === 'online' ? 'Online now' : profile.status === 'away' ? 'Away' : (profile.lastLogin ? (() => {
                    const diffM = Math.floor((Date.now() - profile.lastLogin) / 60000);
                    if (diffM < 60) return `Seen ${diffM}m ago`;
                    const diffH = Math.floor(diffM / 60);
                    if (diffH < 24) return `Seen ${diffH}h ago`;
                    return `Seen ${Math.floor(diffH / 24)}d ago`;
                  })() : 'Offline')}
                </span>
              </span>
            </p>

            {(profile.phone || profile.whatsapp) && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500/30 transition"
                    title={`Call ${profile.name}`}
                  >
                    <Phone className="w-3 h-3 text-emerald-400" /> Call
                  </a>
                )}
                {profile.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-600/30 transition"
                    title="WhatsApp Chat"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-400" /> WhatsApp
                  </a>
                )}
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
            if (onReportSubmitted) {
              onReportSubmitted(profile, reason, details);
            } else {
              console.log('🚨 Profile Reported:', { profileId: profile.id, name: profile.name, reason, details, timestamp: Date.now() });
              if (showToast) {
                showToast(`🛡️ Report successfully sent to the moderation team for ${profile.name} (${reason}). Thank you for keeping our community safe.`);
              }
            }
          }}
        />
      )}
    </>
  );
};

