import React, { useState, useEffect } from 'react';
import { UserProfile, getFilterStyle, getStyleTagIcon } from '../types';
import { Flame, Star, ShieldCheck, Sparkles, Lock, Flag, Eye, Trash2, MessageCircle, Crown, MoreVertical, ShieldAlert, Phone, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { QuickPreviewModal } from './QuickPreviewModal';
import { ReportModal } from './ReportModal';
import { BlockConfirmationModal } from './BlockConfirmationModal';

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
  hasActiveConversation?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index = 0, onClick, onTap, onPass, onDelete, onBlockUser, onToggleFavorite, onOpenChat, currentUserInterests, onBadgeClick, viewedCount = 0, hasActiveSubscription = false, showToast, onReportSubmitted, hasActiveConversation = false }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);

  const [showCardMenu, setShowCardMenu] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  useEffect(() => {
    const isAutoAdvance = localStorage.getItem('blaze_auto_advance_photos') === 'true';
    if (!isAutoAdvance || (profile.photos && profile.photos.length <= 1)) return;
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % (profile.photos?.length || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [profile.photos]);

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
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowLightbox(true);
          }}
          className="absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden cursor-zoom-in"
          title="Click to view high-resolution photo"
        >
          <motion.img
            src={photos[currentPhotoIndex]}
            alt={profile.name}
            style={{ filter: getFilterStyle(profile.photoFilter) }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`w-full h-full object-cover pointer-events-none ${
              isPrivacyBlurred ? 'blur-[8px] group-hover:blur-none' : ''
            }`}
            referrerPolicy="no-referrer"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Visual Pagination Dots */}
          {photos.length > 1 && (
            <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center space-x-1.5 px-4 pointer-events-none">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 shadow ${
                    idx === currentPhotoIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top actions */}
        <div className="absolute top-0 left-0 right-0 z-10 p-2 flex items-center justify-between pointer-events-none">
          {hasActiveConversation ? (
            <div className="pointer-events-auto bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-blue-400/50 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-cyan-300" />
              <span>Active Chat</span>
            </div>
          ) : <div />}

          <div className="flex items-center space-x-1.5 pointer-events-auto">
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

            {/* Flag / Report Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReportModal(true);
              }}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 text-neutral-300 hover:text-red-400 hover:bg-neutral-800 transition shadow"
              title="Report Profile"
            >
              <Flag className="w-3.5 h-3.5" />
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
                      setShowBlockModal(true);
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

            {/* Distance under the name and age */}
            <p className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${
              (profile.distance || 0) < 1 ? 'text-emerald-400' : (profile.distance || 0) <= 5 ? 'text-yellow-400' : 'text-neutral-300'
            }`}>
              <span>📍 {profile.distance === 0 ? 'Here' : `${profile.distance} mi away`}</span>
            </p>

            {/* Last Active Time Indicator */}
            <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${profile.status === 'online' ? 'bg-emerald-500 animate-pulse' : profile.status === 'away' ? 'bg-yellow-500' : 'bg-neutral-500'}`} />
              <span>{profile.lastActive || (profile.lastLogin ? `Active ${Math.max(1, Math.floor((Date.now() - profile.lastLogin) / 60000))}m ago` : profile.status === 'online' ? 'Active now' : 'Active 1h ago')}</span>
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

      {showLightbox && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowLightbox(false);
          }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLightbox(false);
            }}
            className="absolute top-6 right-6 p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white shadow-2xl transition"
          >
            ✕
          </button>

          <div className="relative max-w-2xl w-full max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[currentPhotoIndex]}
              alt={profile.name}
              style={{ filter: getFilterStyle(profile.photoFilter) }}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-neutral-700"
            />

            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-xl transition text-lg font-bold"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-xl transition text-lg font-bold"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex items-center space-x-2 mt-4" onClick={(e) => e.stopPropagation()}>
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPhotoIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition ${
                    idx === currentPhotoIndex ? 'border-amber-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="text-center mt-3">
            <h3 style={{ fontSize: '9px', lineHeight: '12px' }} className="font-bold text-white uppercase tracking-wider truncate px-4">
              {profile.name}, {profile.age} • Photo {currentPhotoIndex + 1} of {photos.length}
              {profile.photoCaptions?.[currentPhotoIndex] && ` • "${profile.photoCaptions[currentPhotoIndex]}"`}
            </h3>
          </div>
        </div>
      )}
      <BlockConfirmationModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        profileName={profile.name}
        profilePhoto={photos[0]}
        onConfirm={(reason, alsoReport) => {
          if (onBlockUser) {
            onBlockUser(profile.id);
          } else if (onPass) {
            onPass(profile.id);
          }
          if (showToast) showToast(`🚫 Blocked ${profile.name}${alsoReport ? ` (Reported: ${reason})` : ''}.`);
        }}
      />
    </>
  );
};

