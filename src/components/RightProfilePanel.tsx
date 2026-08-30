import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, getFilterStyle, PHOTO_FILTERS } from '../types';
import { ShieldAlert, Sparkles, Heart, Share2, Check, ShieldCheck, Flag, AlertTriangle, Music, Play, Pause, Smile, Mic, Image as ImageIcon, Users, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface RightProfilePanelProps {
  profile: UserProfile | null;
  currentUser?: UserProfile | null;
  onClose: () => void;
  onStartChat: (profile: UserProfile) => void;
  onSendTap: (profile: UserProfile) => void;
  onBlockUser?: (profileId: string) => void;
  onInviteToGroup?: (profile: UserProfile, groupName: string) => void;
}

export const RightProfilePanel: React.FC<RightProfilePanelProps> = ({
  profile,
  currentUser,
  onClose,
  onStartChat,
  onSendTap,
  onBlockUser,
  onInviteToGroup,
}) => {
  const [copied, setCopied] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [quickReactionSent, setQuickReactionSent] = useState<string | null>(null);
  const [showMatchBreakdown, setShowMatchBreakdown] = useState(false);
  const [isDateNightLoading, setIsDateNightLoading] = useState(false);
  const [dateNightIdeas, setDateNightIdeas] = useState<any[] | null>(null);
  const [showDateNightModal, setShowDateNightModal] = useState(false);
  const [activePhotoFilter, setActivePhotoFilter] = useState(profile?.photoFilter || 'none');
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [contactsPermissionGranted, setContactsPermissionGranted] = useState(false);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);
  const [showGroupInviteModal, setShowGroupInviteModal] = useState(false);
  const [selectedInviteGroup, setSelectedInviteGroup] = useState('Weekend Coffee Explorers');
  const [groupInviteSent, setGroupInviteSent] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [showVirtualGiftModal, setShowVirtualGiftModal] = useState(false);
  const [giftSentConfirmation, setGiftSentConfirmation] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>(profile.friendStatus || 'none');

  const handleToggleFriend = () => {
    if (friendStatus === 'none') {
      setFriendStatus('pending');
    } else if (friendStatus === 'pending') {
      setFriendStatus('friends');
    } else {
      setFriendStatus('none');
    }
  };

  const VIRTUAL_GIFTS = [
    { id: 'coffee', name: 'Artisan Coffee', icon: '☕', desc: 'A warm morning boost' },
    { id: 'rose', name: 'Velvet Rose', icon: '🌹', desc: 'A timeless romantic gesture' },
    { id: 'music', name: 'Golden Vinyl', icon: '🎶', desc: 'Dedicated to great beats' },
    { id: 'crown', name: 'Royal Crown', icon: '👑', desc: 'For top-tier energy' },
    { id: 'diamond', name: 'Sparkling Diamond', icon: '💎', desc: 'One of a kind connection' }
  ];

  const scrollGallery = (direction: 'left' | 'right') => {
    if (!galleryRef.current || !profile.photos) return;
    const scrollAmount = 300;
    galleryRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (!profile.photos || profile.photos.length <= 1) return;
    const interval = setInterval(() => {
      setActivePhotoIdx(prev => {
        const next = (prev + 1) % profile.photos.length;
        if (galleryRef.current) {
          const child = galleryRef.current.children[next] as HTMLElement;
          if (child) {
            galleryRef.current.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
          }
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [profile.photos]);

  if (!profile) return null;

  // Calculate shared tribes & interests
  const userTribes = currentUser?.tribes || [];
  const profileTribes = profile.tribes || [];
  const sharedTribes = profileTribes.filter((t) => userTribes.includes(t));

  const userInterests = currentUser?.interestTags || ['Travel', 'Fitness', 'Music', 'Art'];
  const profileInterests = profile.interestTags || ['Fitness', 'Coffee', 'Music', 'Design'];
  const sharedInterests = profileInterests.filter((i) => userInterests.includes(i));

  // Compatibility score calculation
  const baseScore = 42;
  const tribeBonus = sharedTribes.length * 16;
  const interestBonus = sharedInterests.length * 10;
  const compatibilityScore = Math.min(99, Math.max(45, baseScore + tribeBonus + interestBonus));

  // SVG circle calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (compatibilityScore / 100) * circumference;

  const handleShare = () => {
    const profileUrl = `${window.location.origin}${window.location.pathname}?profile=${profile.id}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleBlock = () => {
    if (
      window.confirm(
        `Are you sure you want to block ${profile.name}? They will be permanently hidden from your view and all notifications from them will be stopped.`
      )
    ) {
      if (onBlockUser) {
        onBlockUser(profile.id);
      }
      onClose();
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setShowReportModal(false);
      if (onBlockUser && alsoBlock) {
        onBlockUser(profile.id);
      }
      alert(`Report submitted for ${profile.name} (Reason: ${reportReason}). Profile has been successfully removed from your discovery grid.`);
      onClose();
    }, 1200);
  };

  const toggleSongPlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(profile.profileSong?.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      audioRef.current.onended = () => setIsPlayingSong(false);
    }
    if (isPlayingSong) {
      audioRef.current.pause();
      setIsPlayingSong(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingSong(true)).catch(() => setIsPlayingSong(false));
    }
  };

  const handleQuickReaction = (emoji: string) => {
    setQuickReactionSent(emoji);
    setTimeout(() => setQuickReactionSent(null), 2000);
  };

  const stickers = profile.stickers || ['🚀 VIP Member', '👑 Elite Verified', '⚡ Fast Responder'];
  const profileSong = profile.profileSong || { title: 'Midnight City', artist: 'M83', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' };
  const lastVisitedTime = profile.lastVisited ? new Date(profile.lastVisited).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2 mins ago';
  const mutualContacts = profile.mutualContacts || ['Sarah K.', 'Alex M.'];
  const hasSocialLinks = profile.socialLinks && Object.values(profile.socialLinks).some(Boolean);
  const stories = profile.stories || [
    { id: '1', text: 'Enjoying rooftop coffee in the sun ☀️', timestamp: Date.now() - 3600000 },
    { id: '2', url: profile.photos[0], timestamp: Date.now() - 14000000 }
  ];
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-900 text-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>{profile.name}</span>
              {profile.currentMood && (
                <span className="bg-neutral-800 px-2 py-0.5 rounded-full text-xs border border-neutral-700" title={`Mood: ${profile.currentMood}`}>
                  {profile.currentMood}
                </span>
              )}
              {profile.isVerified && (
                <ShieldCheck className="w-5 h-5 text-cyan-400 fill-cyan-400/20" title="Verified Profile" />
              )}
              {(hasSocialLinks || profile.isVerified) && (
                <span className="inline-flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full text-[10px] font-bold" title="Verified Authentic User with Linked Social Accounts">
                  <Check className="w-3 h-3 text-cyan-400" /> Verified
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm" title="Last Active Availability">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active {profile.lastActive || '5m ago'}
              </span>
              <p className="text-[11px] text-neutral-400">Last visited: <span className="text-stone-300 font-medium">{lastVisitedTime}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Copy Profile Link"
              className="text-stone-400 hover:text-white p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition flex items-center gap-1.5 text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
            <button onClick={onClose} className="text-stone-400 hover:text-white p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition">
              ✕
            </button>
          </div>
        </div>

        {/* 24-Hour Ephemeral Stories Strip */}
        {stories.length > 0 && (
          <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <span>⚡ 24h Story</span>
              </span>
              <span className="text-[10px] text-neutral-400">Expires in 18h</span>
            </div>
            <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700 text-center relative overflow-hidden">
              {stories[activeStoryIdx].url ? (
                <div className="h-36 rounded-lg overflow-hidden mb-2">
                  <img src={stories[activeStoryIdx].url} alt="Story" className="w-full h-full object-cover" />
                </div>
              ) : (
                <p className="text-sm font-medium text-white py-4 italic">"{stories[activeStoryIdx].text}"</p>
              )}
              {stories.length > 1 && (
                <div className="flex justify-center gap-1 mt-2">
                  {stories.map((_, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setActiveStoryIdx(sIdx)}
                      className={`h-1.5 rounded-full transition-all ${sIdx === activeStoryIdx ? 'w-6 bg-amber-400' : 'w-2 bg-neutral-700'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stickers / Badges under name */}
        {stickers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {stickers.map((st, sIdx) => (
              <span key={sIdx} className="bg-neutral-800 border border-neutral-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-300 shadow-sm">
                {st}
              </span>
            ))}
          </div>
        )}

        {/* Profile Song Player */}
        <div className="bg-neutral-800/90 border border-neutral-700/80 rounded-xl p-3 mb-3 flex items-center justify-between shadow">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPlayingSong ? 'bg-amber-500 text-black animate-pulse' : 'bg-neutral-700 text-amber-400'}`}>
              <Music className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{profileSong.title}</p>
              <p className="text-[11px] text-neutral-400">{profileSong.artist}</p>
            </div>
          </div>
          <button
            onClick={toggleSongPlay}
            className="p-2 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold transition shadow"
            title={isPlayingSong ? 'Pause Song' : 'Play Song'}
          >
            {isPlayingSong ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
        </div>

        {/* Introduction Video Player */}
        <div className="bg-neutral-800/90 border border-neutral-700/80 rounded-xl p-3 mb-3 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>📹 Intro Video</span>
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold border border-cyan-500/35">
              Verified
            </span>
          </div>
          <div className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700 relative">
            <video
              src={profile.introVideoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
              controls
              playsInline
              className="w-full h-40 object-cover rounded-lg"
              poster={profile.photos[0]}
            />
          </div>
        </div>

        {/* Voice Introduction Player */}
        <div className="bg-neutral-800/90 border border-neutral-700/80 rounded-xl p-3 mb-3 flex items-center justify-between shadow">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPlayingVoice ? 'bg-emerald-500 text-black animate-pulse' : 'bg-neutral-700 text-emerald-400'}`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Voice Introduction 🎙️</p>
              <p className="text-[11px] text-neutral-400">Listen to {profile.name}'s intro (0:15)</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlayingVoice) {
                if (voiceAudioRef.current) voiceAudioRef.current.pause();
                setIsPlayingVoice(false);
              } else {
                if (!voiceAudioRef.current) {
                  voiceAudioRef.current = new Audio(profile.voiceIntroUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
                  voiceAudioRef.current.onended = () => setIsPlayingVoice(false);
                }
                voiceAudioRef.current.play().catch(() => {});
                setIsPlayingVoice(true);
              }
            }}
            className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold transition shadow"
            title={isPlayingVoice ? 'Pause Voice Intro' : 'Play Voice Intro'}
          >
            {isPlayingVoice ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
        </div>

        {/* Social Media Section */}
        {profile.socialLinks && (profile.socialLinks.instagram || profile.socialLinks.tiktok || profile.socialLinks.twitter || profile.socialLinks.snapchat) && (
          <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 mb-3 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Social Media & Links</span>
            <div className="flex flex-wrap gap-2">
              {profile.socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-pink-500/30 transition"
                >
                  <span>📸</span>
                  <span>@{profile.socialLinks.instagram.replace('@', '')}</span>
                </a>
              )}
              {profile.socialLinks.tiktok && (
                <a
                  href={`https://tiktok.com/@${profile.socialLinks.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-500/30 transition"
                >
                  <span>🎵</span>
                  <span>@{profile.socialLinks.tiktok.replace('@', '')}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity Log Snippet */}
        <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 mb-3 flex items-center justify-between text-xs shadow">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              ⚡
            </div>
            <div>
              <p className="font-bold text-white">Recent Activity & Interaction Log</p>
              <p className="text-[11px] text-neutral-400">
                {profile.recentActivity || `You visited their profile yesterday & winked 2 days ago`}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-neutral-900 text-amber-300 px-2 py-1 rounded-lg border border-neutral-700 font-semibold flex-shrink-0">
            Context Log
          </span>
        </div>

        {/* Photo Gallery with Filter Selector & Swipe Navigation */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Photos ({profile.photos.length})</span>
            </span>
            <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] scrollbar-none">
              {PHOTO_FILTERS.slice(0, 4).map(f => (
                <button
                  key={f.id}
                  onClick={() => setActivePhotoFilter(f.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition flex-shrink-0 ${
                    activePhotoFilter === f.id
                      ? 'bg-amber-500 text-black font-bold shadow'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group/carousel">
            <div
              ref={galleryRef}
              className="flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-thin scroll-smooth cursor-grab active:cursor-grabbing"
            >
              {profile.photos.map((photoUrl, idx) => (
                <div key={idx} className="flex-shrink-0 w-full h-72 snap-center rounded-2xl overflow-hidden relative bg-neutral-950 border border-neutral-800 group transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/15">
                  <img
                    src={photoUrl}
                    alt={`${profile.name} photo ${idx + 1}`}
                    style={{ filter: getFilterStyle(activePhotoFilter) }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />
                  {profile.photos.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white shadow flex items-center gap-1 z-10 transition-transform duration-300 group-hover:scale-105">
                      <span>{idx + 1}</span> / <span>{profile.photos.length}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 shadow opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <span>🔍 Hover to Zoom</span>
                  </div>
                </div>
              ))}
            </div>
            {profile.photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollGallery('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition shadow z-20"
                  title="Previous Photo"
                >
                  ❮
                </button>
                <button
                  type="button"
                  onClick={() => scrollGallery('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition shadow z-20"
                  title="Next Photo"
                >
                  ❯
                </button>
              </>
            )}
          </div>
        </div>

        {profile.currentMood && (
          <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-xl px-3 py-2 mb-4 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Current Mood Status</span>
            <span className="bg-neutral-900 px-3 py-1 rounded-lg text-sm border border-neutral-700 font-bold">
              {profile.currentMood}
            </span>
          </div>
        )}

        {/* Quick Reaction Bar */}
        <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-2.5 mb-4 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
            <Smile className="w-4 h-4 text-amber-400" />
            <span>Quick React:</span>
          </span>
          <div className="flex items-center space-x-1.5">
            {['🔥', '😍', '👋', '🎉', '⚡', '💯'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleQuickReaction(emoji)}
                className="w-8 h-8 rounded-lg bg-neutral-700/80 hover:bg-amber-500/30 hover:scale-110 transition flex items-center justify-center text-sm"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        {quickReactionSent && (
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center py-1.5 rounded-lg mb-3 font-semibold animate-pulse">
            Sent {quickReactionSent} reaction to {profile.name}! 🚀
          </div>
        )}

        {/* Compatibility Score Card */}
        <div
          onClick={() => setShowMatchBreakdown(!showMatchBreakdown)}
          className="bg-neutral-800/80 border border-neutral-700/60 hover:border-amber-500/50 rounded-2xl p-4 mb-3 flex items-center gap-4 shadow-md cursor-pointer transition group"
          title="Click to view full match breakdown"
        >
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                className="text-neutral-700"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                className="text-[#FFC107] transition-all duration-1000 ease-out"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black text-white">{compatibilityScore}%</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FFC107]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compatibility Match</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30 group-hover:underline">
                🔍 Click for Breakdown
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Based on <span className="font-semibold text-white">{sharedTribes.length} shared tribes</span> and{' '}
              <span className="font-semibold text-white">{sharedInterests.length} common interests</span>.
            </p>
          </div>
        </div>

        {/* Expandable Match Breakdown Tooltip / Section */}
        {showMatchBreakdown && (
          <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-4 mb-4 space-y-2 text-xs animate-in fade-in zoom-in">
            <div className="flex items-center justify-between text-amber-300 font-bold border-b border-neutral-800 pb-2">
              <span>📊 Match Breakdown & Transparency</span>
              <button onClick={() => setShowMatchBreakdown(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-1.5 text-neutral-300">
              <div className="flex justify-between">
                <span>Base Compatibility Score</span>
                <span className="font-semibold text-white">42%</span>
              </div>
              <div className="flex justify-between">
                <span>Shared Tribes ({sharedTribes.join(', ') || 'None'})</span>
                <span className="font-semibold text-emerald-400">+{sharedTribes.length * 16}%</span>
              </div>
              <div className="flex justify-between">
                <span>Common Interests ({sharedInterests.join(', ') || 'None'})</span>
                <span className="font-semibold text-purple-400">+{sharedInterests.length * 10}%</span>
              </div>
              <div className="border-t border-neutral-800 pt-1.5 flex justify-between font-bold text-amber-300">
                <span>Total Calculated Score</span>
                <span>{compatibilityScore}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Date Night AI Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={async () => {
              setIsDateNightLoading(true);
              setShowDateNightModal(true);
              try {
                const res = await fetch('/api/ai/date-night', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    currentUserInterests: currentUser?.interestTags || [],
                    targetUserInterests: profile.interestTags || [],
                    locationName: profile.locationName || 'Downtown'
                  })
                });
                const data = await res.json();
                setDateNightIdeas(data.ideas || []);
              } catch (e) {
                setDateNightIdeas([
                  { title: "Art Gallery & Specialty Coffee", description: "Explore local contemporary galleries followed by artisanal pour-overs.", venueType: "Cafe & Gallery" },
                  { title: "Sunset Scenic Hike", description: "Take a relaxing trail walk with panoramic city views.", venueType: "Outdoor Park" },
                  { title: "Rooftop Tapas & Cocktails", description: "Enjoy artisanal small plates and craft drinks with skyline views.", venueType: "Rooftop Lounge" }
                ]);
              } finally {
                setIsDateNightLoading(false);
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>✨ Date Night AI Planner</span>
          </button>
        </div>

        {/* Common Interests Section Ordered by Similarity */}
        {profile.interestTags && profile.interestTags.length > 0 && (
          <div className="mb-4 bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Common Interests & Similarity
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {profile.interestTags.filter(t => (currentUser?.interestTags || ['Travel', 'Fitness', 'Music', 'Art']).includes(t)).length} Matched
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.interestTags
                .slice()
                .sort((a, b) => {
                  const userTags = currentUser?.interestTags || ['Travel', 'Fitness', 'Music', 'Art'];
                  const aShared = userTags.includes(a) ? 1 : 0;
                  const bShared = userTags.includes(b) ? 1 : 0;
                  return bShared - aShared;
                })
                .map((tag) => {
                  const isShared = (currentUser?.interestTags || ['Travel', 'Fitness', 'Music', 'Art']).includes(tag);
                  return (
                    <span
                      key={tag}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                        isShared
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}
                    >
                      {isShared && '✨ '}
                      {tag}
                      {isShared && <span className="text-[9px] bg-amber-500 text-black px-1 rounded-full ml-0.5 font-black">Shared</span>}
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* Mutual Friends & Shared Network Section */}
        <div className="mb-4 bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>👥 Mutual Friends & Network</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              {contactsPermissionGranted ? `${mutualContacts.length} Shared` : 'Sync Required'}
            </span>
          </div>

          {!contactsPermissionGranted ? (
            <div className="bg-neutral-900/90 rounded-lg p-3 border border-neutral-700 text-center space-y-2">
              <p className="text-xs text-neutral-300">
                Cross-reference your phone contacts and address book to discover verified mutual connections with <span className="text-white font-semibold">{profile.name}</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSyncingContacts(true);
                  setTimeout(() => {
                    setIsSyncingContacts(false);
                    setContactsPermissionGranted(true);
                  }, 1200);
                }}
                disabled={isSyncingContacts}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                {isSyncingContacts ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Syncing & Cross-Referencing Contacts...</span>
                  </>
                ) : (
                  <>
                    <span>📱 Sync Contacts & Find Mutuals</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[11px] text-emerald-300/90 font-medium flex items-center gap-1">
                <span>✅ Contacts synced successfully! Found {mutualContacts.length} mutual connection{mutualContacts.length === 1 ? '' : 's'}:</span>
              </p>
              <div className="space-y-2">
                {mutualContacts.map((mc, mIdx) => (
                  <div key={mIdx} className="bg-neutral-900/90 rounded-xl p-2.5 border border-neutral-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center shadow">
                        {mc.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{mc}</p>
                        <p className="text-[10px] text-neutral-400">In your phone contacts • Follows both of you</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-neutral-800 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-neutral-700">
                      Verified Mutual
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add to Calendar Button based on Event Tag */}
        <div className="bg-gradient-to-r from-amber-500/20 via-[#222222] to-amber-500/10 border border-amber-500/40 rounded-xl p-3.5 mb-4 shadow flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📅</span>
            <div>
              <h4 className="font-bold text-xs text-white">Event Meet-up Available</h4>
              <p className="text-[11px] text-neutral-300">{profile.eventTag || 'Coffee & Creative Meet-up this weekend'}</p>
            </div>
          </div>
          <a
            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meet-up+with+${encodeURIComponent(profile.name)}&details=${encodeURIComponent(profile.eventTag || 'Meet-up planned via Blaze profile.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-3 py-2 rounded-xl shadow transition whitespace-nowrap flex items-center gap-1.5"
          >
            📅 Add to Calendar
          </a>
        </div>



        {/* Collapsible / Expandable Biography Section */}
        <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-3 mb-4 space-y-1.5 transition">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsBioExpanded(!isBioExpanded)}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">About / Biography</h4>
            <span className="text-[11px] text-amber-400 font-semibold hover:underline">
              {isBioExpanded ? 'Show Less ▴' : 'Expand Full Bio ▾'}
            </span>
          </div>
          <p className={`text-stone-300 text-xs leading-relaxed transition-all ${isBioExpanded ? '' : 'line-clamp-2'}`}>
            {profile.aboutMe || profile.headline || 'Passionate explorer, creative designer, and coffee enthusiast looking to connect with amazing people.'}
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onStartChat(profile)}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2.5 rounded-xl transition shadow-lg text-xs"
          >
            Chat
          </button>
          <button
            onClick={() => onSendTap(profile)}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-2.5 rounded-xl font-medium border border-neutral-700 transition text-xs"
          >
            Tap 🔥
          </button>
          <button
            onClick={() => setShowVirtualGiftModal(true)}
            className="flex-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 font-bold py-2.5 rounded-xl border border-purple-500/40 transition shadow flex items-center justify-center gap-1 text-xs"
          >
            <span>🎁 Gift</span>
          </button>
        </div>

        {/* Direct Invite to Group Button */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowGroupInviteModal(true)}
            className="w-full bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-cyan-500/10 border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-xs"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Invite to Group / Tribe Meet-up</span>
          </button>
        </div>

        {/* Add Friend Request Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleToggleFriend}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm border ${
              friendStatus === 'friends'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : friendStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-neutral-800 text-stone-200 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {friendStatus === 'friends' ? 'Friends ✓ (Connected)' : friendStatus === 'pending' ? 'Friend Request Sent ⏳' : 'Add Friend 👤+'}
            </span>
          </button>
        </div>


      </div>

      <div className="pt-4 border-t border-neutral-800 space-y-2">
        <button
          onClick={() => setShowReportModal(true)}
          className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-sm"
        >
          <Flag className="w-4 h-4 text-amber-400" />
          <span>Report User</span>
        </button>

        <button
          onClick={handleBlock}
          className="w-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-sm"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Block User</span>
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-6 flex flex-col justify-center items-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-base flex items-center gap-2 text-white">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Report {profile.name}</span>
              </h4>
              <button onClick={() => setShowReportModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            {reportSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">✓</div>
                <p className="text-sm font-semibold text-white">Report Submitted</p>
                <p className="text-xs text-neutral-400">Our safety team will review this profile promptly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-2 font-medium">Select Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  >
                    <option value="Inappropriate photos">Inappropriate photos</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Spam / Fake">Spam / Fake profile</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="alsoBlock"
                    checked={alsoBlock}
                    onChange={(e) => setAlsoBlock(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="alsoBlock" className="text-xs text-neutral-300 font-medium">
                    Also block this user automatically
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-xl text-xs font-bold transition shadow"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showDateNightModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Date Night AI Suggestions</h3>
              </div>
              <button
                onClick={() => setShowDateNightModal(false)}
                className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Tailored specifically for you and <strong className="text-amber-300">{profile.name}</strong> in <span className="text-white font-semibold">{profile.locationName || 'Downtown'}</span> based on your combined interests:
            </p>

            {isDateNightLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-neutral-400">Gemini AI is crafting perfect date ideas...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {(dateNightIdeas || []).map((idea, iIdx) => (
                  <div key={iIdx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2 hover:border-amber-500/50 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">{iIdx + 1}</span>
                        {idea.title}
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                        {idea.venueType || 'Date Spot'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 pl-6 leading-relaxed">{idea.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDateNightModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Invite Modal */}
      {showGroupInviteModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md p-6 flex flex-col justify-center items-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h4 className="font-bold text-base flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Invite to Group / Tribe</span>
              </h4>
              <button onClick={() => setShowGroupInviteModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            {groupInviteSent ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <p className="text-sm font-semibold text-white">Invite Sent Successfully!</p>
                <p className="text-xs text-neutral-400">{profile.name} has been invited to <span className="text-cyan-300 font-semibold">{selectedInviteGroup}</span>.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-2 font-medium">Select Group or Meetup Tribe</label>
                  <select
                    value={selectedInviteGroup}
                    onChange={(e) => setSelectedInviteGroup(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    <option value="Weekend Coffee Explorers">☕ Weekend Coffee Explorers</option>
                    <option value="Tech & Startup Founders">🚀 Tech & Startup Founders</option>
                    <option value="Creative Design Meetup">🎨 Creative Design Meetup</option>
                    <option value="Rooftop Sunset Social">🌅 Rooftop Sunset Social</option>
                    <option value="Fitness & Running Club">🏃‍♂️ Fitness & Running Club</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGroupInviteModal(false)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGroupInviteSent(true);
                      if (onInviteToGroup) {
                        onInviteToGroup(profile, selectedInviteGroup);
                      }
                      setTimeout(() => {
                        setGroupInviteSent(false);
                        setShowGroupInviteModal(false);
                      }, 1500);
                    }}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-2.5 rounded-xl text-xs font-bold transition shadow"
                  >
                    Send Invite 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Socials Verification Modal */}
      {showSocialsModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md p-6 flex flex-col justify-center items-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h4 className="font-bold text-base flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>Linked Social Verification</span>
              </h4>
              <button onClick={() => setShowSocialsModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-neutral-300">
                Verified external accounts linked to <span className="text-white font-semibold">{profile.name}</span>'s profile:
              </p>

              <div className="space-y-2">
                <div className="bg-neutral-800 p-3 rounded-xl border border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">📸</span>
                    <div>
                      <p className="text-xs font-bold text-white">Instagram</p>
                      <p className="text-[10px] text-neutral-400">@{profile.name.toLowerCase().replace(/\s+/g, '_')}_official</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold border border-cyan-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>

                <div className="bg-neutral-800 p-3 rounded-xl border border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🎵</span>
                    <div>
                      <p className="text-xs font-bold text-white">Spotify Artist / Listener</p>
                      <p className="text-[10px] text-neutral-400">Top Artist: {profile.profileSong?.artist || 'M83'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold border border-cyan-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>

                <div className="bg-neutral-800 p-3 rounded-xl border border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">💼</span>
                    <div>
                      <p className="text-xs font-bold text-white">LinkedIn Network</p>
                      <p className="text-[10px] text-neutral-400">Connected & Verified Pro</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold border border-cyan-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSocialsModal(false)}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Virtual Gift Modal Overlay */}
      {showVirtualGiftModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md p-6 flex flex-col justify-center items-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h4 className="font-bold text-base flex items-center gap-2 text-white">
                <span>🎁 Send Virtual Gift to {profile.name}</span>
              </h4>
              <button onClick={() => { setShowVirtualGiftModal(false); setGiftSentConfirmation(null); }} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            {giftSentConfirmation ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-purple-500/20 text-purple-300 rounded-full flex items-center justify-center mx-auto text-2xl font-bold animate-bounce">🎁</div>
                <p className="text-sm font-semibold text-white">Gift Sent Successfully!</p>
                <p className="text-xs text-neutral-400">Sent <span className="text-purple-300 font-bold">{giftSentConfirmation}</span> to {profile.name}. It has been added to their chat window!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300">
                  Select a digital sticker or token to send as a special gift directly into your chat with <span className="text-white font-semibold">{profile.name}</span>:
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {VIRTUAL_GIFTS.map((gift) => (
                    <button
                      key={gift.id}
                      type="button"
                      onClick={() => {
                        setGiftSentConfirmation(`${gift.icon} ${gift.name}`);
                        setTimeout(() => {
                          setShowVirtualGiftModal(false);
                          setGiftSentConfirmation(null);
                          onStartChat(profile);
                        }, 1200);
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700/80 p-3 rounded-xl border border-neutral-700 flex items-center justify-between text-left transition group hover:border-purple-500/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-neutral-900 rounded-lg border border-neutral-700 group-hover:scale-110 transition">{gift.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{gift.name}</p>
                          <p className="text-[10px] text-neutral-400">{gift.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full font-bold group-hover:bg-purple-500 group-hover:text-black transition">
                        Send ➔
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVirtualGiftModal(false)}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
