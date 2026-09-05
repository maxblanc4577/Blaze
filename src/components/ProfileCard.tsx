import React, { useState, useEffect } from 'react';
import { UserProfile, getFilterStyle, getStyleTagIcon } from '../types';
import { Flame, Star, ShieldCheck, Sparkles, Lock, Trash2, Crown, ShieldAlert, Phone, MessageSquare } from 'lucide-react';
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
  layout?: 'expanded' | 'compact';
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index = 0, onClick, onTap, onPass, onDelete, onBlockUser, onToggleFavorite, onOpenChat, currentUserInterests, onBadgeClick, viewedCount = 0, hasActiveSubscription = false, showToast, onReportSubmitted, hasActiveConversation = false, layout = 'expanded' }) => {
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
  const [isExpanded, setIsExpanded] = useState(false);

  const showAge = localStorage.getItem('blaze_card_show_age') !== 'false';
  const showDistance = localStorage.getItem('blaze_card_show_distance') !== 'false';
  const showStatus = localStorage.getItem('blaze_card_show_status') !== 'false';
  const showContacts = localStorage.getItem('blaze_card_show_contacts') !== 'false';
  const showDots = localStorage.getItem('blaze_card_show_dots') !== 'false';
  const showTap = localStorage.getItem('blaze_card_show_tap') !== 'false';

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
  const isProElite = isBoostOrPremium || profile.membershipTier === 'Elite' || profile.isFeePaid;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "50px" }}
        whileHover={{ scale: 1.02, y: -3 }}
        exit={{ opacity: 0, scale: 0.8, x: swipeX < 0 ? -150 : 150 }}
        transition={{ duration: 0.4, delay: (index % 8) * 0.05, ease: 'easeOut' }}
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
        className={`relative group bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.03] ${
          layout === 'compact' ? 'aspect-square' : 'aspect-[3/4]'
        } flex flex-col select-none ${
          isProElite
            ? 'border-2 border-amber-400 bg-gradient-to-tr from-amber-500/20 via-[#1E1E1E] to-amber-500/10 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/40'
            : 'border border-neutral-800/80 hover:border-[#FFC107]/50'
        }`}
      >
        {/* Pro Elite Status Ribbon */}
        {isProElite && (
          <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-yellow-200 uppercase tracking-wider">
            <Crown className="w-3 h-3 fill-current" />
            <span>Pro Elite</span>
          </div>
        )}

        {/* Status Indicator Dot (Green for online, amber for away, grey for offline) */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full border border-neutral-700 text-[10px] font-bold text-white shadow">
          <span className={`w-2.5 h-2.5 rounded-full ${
            profile.status === 'online' ? 'bg-emerald-500 animate-pulse' : profile.status === 'away' ? 'bg-amber-400' : 'bg-neutral-500'
          }`} />
          <span className="capitalize">{profile.status || 'offline'}</span>
        </div>
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
          {showDots && photos.length > 1 && (
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

          <div />
        </div>

        {/* Bottom Info Overlay with Name, Age, and Distance */}
        <div className="relative z-10 mt-auto p-2.5 flex items-end justify-between">
          <div className="w-full flex items-center gap-2 flex-wrap">
            <h3 style={{ fontSize: '14px', lineHeight: '18px' }} className="font-normal text-white inline-flex items-center gap-1.5 drop-shadow-md">
              <span>{profile.name}</span>
              {showAge && <span>,{profile.age}</span>}
              {profile.isBirthdayToday && (
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-md animate-bounce">
                  🎂 Birthday
                </span>
              )}
              {profile.isFeePaid && (profile.membershipTier === 'Elite Companion' || profile.isCompanionPro) && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-md">
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
                  className="focus:outline-none inline-flex items-center justify-center p-0.5 rounded-full hover:bg-white/10 transition"
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


            </h3>

            {/* Distance and Last Active Status on One Line */}
            {(showDistance || showStatus) && (
              <p style={{ fontSize: '6px', lineHeight: '10px' }} className={`font-semibold inline-flex items-center gap-1.5 ${
                (profile.distance || 0) < 1 ? 'text-emerald-400' : (profile.distance || 0) <= 5 ? 'text-yellow-400' : 'text-neutral-300'
              }`}>
                {showDistance && <span>• 📍 {profile.distance === 0 ? 'Here' : `${profile.distance} mi away`}</span>}
                {showDistance && showStatus && <span className="text-neutral-500">•</span>}
                {showStatus && (
                  <span className="inline-flex items-center gap-1 text-neutral-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'online' ? 'bg-emerald-500 animate-pulse' : profile.status === 'away' ? 'bg-yellow-500' : 'bg-neutral-500'}`} />
                    <span style={{ fontSize: '6px', lineHeight: '10.5px', width: '43.6562px', height: '13px', display: 'inline-block' }}>
                      {profile.status === 'online' 
                        ? 'Online' 
                        : (profile.lastActive || (profile.lastLogin ? `Active ${Math.max(1, Math.floor((Date.now() - profile.lastLogin) / 60000))}m ago` : 'Active 1h ago'))}
                    </span>
                  </span>
                )}
              </p>
            )}


            {showContacts && (profile.phone || profile.whatsapp) && (
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

            {/* Expandable Details Section */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                {profile.aboutMe && (
                  <p className="text-xs text-neutral-200 leading-relaxed font-normal bg-black/40 p-2.5 rounded-xl border border-white/5">
                    "{profile.aboutMe}"
                  </p>
                )}
                {profile.interestTags && profile.interestTags.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Interests & Vibe</span>
                    <div className="flex flex-wrap gap-1">
                      {profile.interestTags.map((tag, tIdx) => (
                        <span key={tIdx} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Message, Expand Toggle, & Quick Tap Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(20);
                setIsExpanded(!isExpanded);
              }}
              className="p-2.5 rounded-full bg-black/60 hover:bg-amber-500 text-amber-400 hover:text-black backdrop-blur-md border border-white/10 transition group/exp active:scale-90 shadow-lg"
              title={isExpanded ? "Collapse details" : "Expand bio & interests"}
            >
              <Sparkles className="w-4 h-4 group-hover/exp:scale-110 transition-transform" />
            </button>
            {onOpenChat && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(25);
                  onOpenChat(profile);
                }}
                className="p-2.5 rounded-full bg-black/60 hover:bg-cyan-500 text-cyan-400 hover:text-black backdrop-blur-md border border-white/10 transition group/msg active:scale-90 shadow-lg"
                title={`Quick Message ${profile.name}`}
              >
                <MessageSquare className="w-4 h-4 group-hover/msg:scale-110 transition-transform" />
              </button>
            )}
            {showTap && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(30);
                  onTap(e, profile);
                }}
                className="p-2.5 rounded-full bg-black/60 hover:bg-[#FFC107] text-[#FFC107] hover:text-[#121212] backdrop-blur-md border border-white/10 transition group/btn active:scale-90 shadow-lg"
              >
                <Flame className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
              </button>
            )}
          </div>
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

          <div className="text-center mt-3 space-y-1">
            <h3 style={{ fontSize: '9px', lineHeight: '12px' }} className="font-bold text-white uppercase tracking-wider truncate px-4">
              {profile.name}, {profile.age} • Photo {currentPhotoIndex + 1} of {photos.length}
            </h3>
            {profile.photoCaptions?.[currentPhotoIndex] && (
              <p style={{ fontSize: '5px', lineHeight: '6.5px' }} className="text-neutral-300 italic truncate px-4">
                "{profile.photoCaptions[currentPhotoIndex]}"
              </p>
            )}
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

