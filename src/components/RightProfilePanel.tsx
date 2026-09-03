import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, getFilterStyle, PHOTO_FILTERS } from '../types';
import { ShieldAlert, Sparkles, Heart, Share2, Check, ShieldCheck, Flag, AlertTriangle, Music, Play, Pause, Smile, Mic, Image as ImageIcon, Users, Shield, Trash2, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { SafetyCheckInModal } from './SafetyCheckInModal';

interface RightProfilePanelProps {
  profile: UserProfile | null;
  currentUser?: UserProfile | null;
  onClose: () => void;
  onStartChat: (profile: UserProfile) => void;
  onSendTap: (profile: UserProfile) => void;
  onBlockUser?: (profileId: string) => void;
  onDelete?: (profileId: string) => void;
  onInviteToGroup?: (profile: UserProfile, groupName: string) => void;
  showToast?: (msg: string) => void;
  onReportSubmitted?: (profile: UserProfile, reason: string, details: string) => void;
  hasWinked?: boolean;
  hasMessaged?: boolean;
  conversationMessages?: Array<{ id: string; sender: 'me' | 'them'; text: string; timestamp?: number }>;
}

export const RightProfilePanel: React.FC<RightProfilePanelProps> = ({
  profile,
  currentUser,
  onClose,
  onStartChat,
  onSendTap,
  onBlockUser,
  onDelete,
  onInviteToGroup,
  showToast,
  onReportSubmitted,
  hasWinked = false,
  hasMessaged = false,
  conversationMessages = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'history'>('overview');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [quickReactionSent, setQuickReactionSent] = useState<string | null>(null);

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
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [giftSentConfirmation, setGiftSentConfirmation] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [photoVerificationStatus, setPhotoVerificationStatus] = useState<'none' | 'pending' | 'verified'>('none');
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [blockReason, setBlockReason] = useState('Spam');
  const [showFullStatsModal, setShowFullStatsModal] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>(profile.friendStatus || 'none');
  const [privateNote, setPrivateNote] = useState<string>(() => {
    return profile ? localStorage.getItem(`blaze_private_note_${profile.id}`) || '' : '';
  });
  const [isSavingNote, setIsSavingNote] = useState(false);

  const handleSavePrivateNote = (noteText: string) => {
    setPrivateNote(noteText);
    if (profile) {
      localStorage.setItem(`blaze_private_note_${profile.id}`, noteText);
    }
    setIsSavingNote(true);
    setTimeout(() => setIsSavingNote(false), 1000);
  };

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



  const handleShare = () => {
    const profileUrl = `${window.location.origin}${window.location.pathname}?profile=${profile.id}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleBlock = () => {
    setShowBlockConfirmModal(true);
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
      if (onReportSubmitted) {
        onReportSubmitted(profile, reportReason, 'Reported via Right Profile Panel');
      } else {
        const msg = `🛡️ Report successfully sent to the moderation team for ${profile.name} (Reason: ${reportReason}). Thank you for keeping our community safe.`;
        if (showToast) {
          showToast(msg);
        } else {
          alert(msg);
        }
      }
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
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
      />
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-900 text-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-neutral-800"
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
              <span className="inline-flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full text-[10px] font-bold" title="Verified Email Address & Live Photo Authentication">
                <Check className="w-3 h-3 text-cyan-400" /> Verified (Email & Live Photo)
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm" title="Last Active Availability">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active {profile.lastActiveMinutes ? `${profile.lastActiveMinutes} minutes ago` : (profile.lastActive || '5 minutes ago')}
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

        {/* Quick Action Row */}
        <div className="flex items-center gap-2 mb-4 bg-neutral-800/80 p-2 rounded-xl border border-neutral-700/60 shadow">
          <button
            type="button"
            onClick={() => {
              if (showToast) showToast(`📌 Pinned ${profile.name} to top of matches.`);
            }}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold text-[11px] py-2 rounded-lg flex items-center justify-center gap-1 transition border border-neutral-700"
          >
            <span>📌</span> Pin
          </button>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-rose-400 font-bold text-[11px] py-2 rounded-lg flex items-center justify-center gap-1 transition border border-neutral-700"
          >
            <span>🚩</span> Report
          </button>
          <button
            type="button"
            onClick={() => setShowFullStatsModal(true)}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-cyan-400 font-bold text-[11px] py-2 rounded-lg flex items-center justify-center gap-1 transition border border-neutral-700"
          >
            <span>📊</span> Stats
          </button>
          <button
            type="button"
            onClick={() => onStartChat(profile)}
            className="flex-1 bg-[#FFC107] hover:bg-[#ffcd38] text-black font-extrabold text-[11px] py-2 rounded-lg flex items-center justify-center gap-1 transition shadow"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Message
          </button>
        </div>

        {(profile.phone || profile.whatsapp) && (
          <div className="flex items-center gap-2 mb-4">
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <span>📞</span> Call {profile.phone}
              </a>
            )}
            {profile.whatsapp && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-300 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <span>💬</span> WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Tab Selector: Overview vs Interaction History */}
        <div className="flex border-b border-neutral-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveProfileTab('overview')}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition ${
              activeProfileTab === 'overview' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveProfileTab('history')}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeProfileTab === 'history' ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <span>⏳ Interaction History</span>
          </button>
        </div>

        {activeProfileTab === 'history' && (
          <div className="space-y-3 py-2">
            <div className="bg-neutral-800/80 border border-neutral-700/80 p-3.5 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-white">Timestamped Interaction Log</h4>
              <p className="text-[11px] text-neutral-400">Complete chronological record of all winks, taps, and messages sent between you and {profile.name}.</p>
            </div>

            <div className="space-y-2.5">
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  👁️
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Profile Viewed & Discovered</p>
                  <p className="text-[11px] text-neutral-300">You discovered and viewed {profile.name}'s profile.</p>
                  <p className="text-[10px] text-neutral-500 mt-1">Today at 12:30 PM</p>
                </div>
              </div>

              {(hasWinked || profile.isTapped || profile.isWinked) && (
                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    🔥
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">Wink / Tap Sent</p>
                    <p className="text-[11px] text-neutral-300">Mutual connection established via wink/tap.</p>
                    <p className="text-[10px] text-neutral-500 mt-1">Today at 1:05 PM</p>
                  </div>
                </div>
              )}

              {conversationMessages && conversationMessages.length > 0 ? (
                conversationMessages.map((msg, idx) => (
                  <div key={msg.id || idx} className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      msg.sender === 'me' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {msg.sender === 'me' ? '💬' : '📩'}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">
                        {msg.sender === 'me' ? 'You sent a message' : `${profile.name} replied`}
                      </p>
                      <p className="text-[11px] text-neutral-300 italic">"{msg.text}"</p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center">
                  <p className="text-xs text-neutral-400">No chat messages exchanged yet in this conversation.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeProfileTab === 'overview' && (
          <div>
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

        {/* Safety Check-In Button for meeting match for first time */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 rounded-xl p-3 mb-3 flex items-center justify-between shadow">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">First-Time Meetup Safety</h4>
              <p className="text-[10px] text-amber-300/80">Share live location for 2h with a friend</p>
            </div>
          </div>
          <button
            onClick={() => setShowSafetyModal(true)}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow flex items-center gap-1"
          >
            <span>🛡️ Check-In</span>
          </button>
        </div>

        {/* Request Photo Verification Section */}
        <div className="bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/30 rounded-xl p-3 mb-3 flex items-center justify-between shadow">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Photo Verification Status</h4>
              <p className="text-[10px] text-blue-300/80">
                {photoVerificationStatus === 'pending' ? 'Verification Request Pending Admin Review' : photoVerificationStatus === 'verified' ? 'Photos Authenticated & Verified' : 'Verify authenticity of profile photos'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPhotoVerificationStatus('pending');
              if (showToast) showToast(`📸 Photo verification requested for ${profile.name}. Status: Pending.`);
            }}
            disabled={photoVerificationStatus !== 'none'}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-400 disabled:bg-neutral-700 text-black disabled:text-neutral-400 font-extrabold text-xs rounded-xl transition shadow flex items-center gap-1"
          >
            <span>{photoVerificationStatus === 'pending' ? '⏳ Pending' : photoVerificationStatus === 'verified' ? '✓ Verified' : 'Request Verification'}</span>
          </button>
        </div>

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

        {/* Recent Activity Log & Interaction Indicator */}
        <div className="bg-gradient-to-r from-amber-500/15 via-neutral-800 to-neutral-800 border border-amber-500/30 rounded-xl p-3 mb-3 flex items-center justify-between text-xs shadow">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              ⚡
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>Interaction Status</span>
                {(hasWinked || hasMessaged || profile.isTapped || profile.isWinked) && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Interacted ✓
                  </span>
                )}
              </p>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                {hasMessaged ? '💬 Previous chat messages exchanged' : ''}
                {hasMessaged && (hasWinked || profile.isTapped || profile.isWinked) ? ' • ' : ''}
                {(hasWinked || profile.isTapped || profile.isWinked) ? '🔥 Wink / Tap sent' : ''}
                {(!hasMessaged && !hasWinked && !profile.isTapped && !profile.isWinked) ? (profile.recentActivity || 'No prior winks or messages recorded yet.') : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasMessaged && <span className="text-xs" title="Messaged">💬</span>}
            {(hasWinked || profile.isTapped || profile.isWinked) && <span className="text-xs" title="Winked/Tapped">🔥</span>}
          </div>
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
                  {profile.photoCaptions?.[idx] && (
                    <div style={{ fontSize: '12px', lineHeight: '15px' }} className="absolute bottom-3 left-3 right-16 bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl text-white truncate z-10">
                      💬 "{profile.photoCaptions[idx]}"
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

        {/* Private Locked Album Section */}
        <div className="mb-4 bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              {profile.isAlbumOpen || (currentUser && profile.grantedAccessUserIds?.includes(currentUser.id)) ? (
                <span className="text-emerald-400">🔓</span>
              ) : (
                <span>🔒</span>
              )}
              <span>Private Locked Album ({profile.lockedAlbum?.photos?.length || 0} Photos, {profile.lockedAlbum?.videos?.length || 0} Videos)</span>
            </span>
            {profile.isAlbumOpen && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                🔓 Album Open
              </span>
            )}
          </div>

          {profile.isAlbumOpen || (currentUser && profile.grantedAccessUserIds?.includes(currentUser.id)) ? (
            <div className="space-y-3">
              {profile.lockedAlbum?.photos && profile.lockedAlbum.photos.length > 0 && (
                <div>
                  <p className="text-[11px] text-neutral-400 mb-1.5 font-semibold">Private Photos ({profile.lockedAlbum.photos.length}/10)</p>
                  <div className="grid grid-cols-5 gap-2">
                    {profile.lockedAlbum.photos.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-neutral-700 cursor-pointer hover:border-amber-400 transition">
                        <img src={url} alt={`Locked ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.lockedAlbum?.videos && profile.lockedAlbum.videos.length > 0 && (
                <div>
                  <p className="text-[11px] text-neutral-400 mb-1.5 font-semibold">Private Videos ({profile.lockedAlbum.videos.length}/10)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {profile.lockedAlbum.videos.map((url, idx) => (
                      <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-neutral-700 bg-black relative flex items-center justify-center">
                        <video src={url} className="w-full h-full object-cover opacity-80" />
                        <span className="absolute text-xs text-white font-bold bg-black/60 px-2 py-1 rounded">▶ Video</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!profile.lockedAlbum?.photos || profile.lockedAlbum.photos.length === 0) && (!profile.lockedAlbum?.videos || profile.lockedAlbum.videos.length === 0) && (
                <p className="text-xs text-neutral-400 text-center py-2">No media uploaded in this private album yet.</p>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900/90 rounded-lg p-3.5 border border-neutral-700 text-center space-y-2">
              <span className="text-2xl">🔒</span>
              <p className="text-xs text-neutral-300">
                This private album is locked. Request access from <span className="text-white font-semibold">{profile.name}</span> to view up to 10 private photos and videos.
              </p>
              <button
                type="button"
                onClick={() => {
                  const requests = profile.albumRequests || [];
                  const alreadyRequested = requests.some(r => r.userId === currentUser?.id);
                  if (!alreadyRequested) {
                    profile.albumRequests = [
                      ...requests,
                      {
                        userId: currentUser?.id || 'current-user',
                        userName: currentUser?.name || 'Alex',
                        userPhoto: currentUser?.photos[0] || '',
                        timestamp: Date.now(),
                        status: 'pending'
                      }
                    ];
                    alert(`🔒 Access request sent successfully to ${profile.name}!`);
                  } else {
                    alert(`You already requested access to ${profile.name}'s private album.`);
                  }
                }}
                className="w-full py-2 bg-[#FFC107] hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow transition"
              >
                Request Private Album Access
              </button>
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



        {/* Relationship Goals Section */}
        <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <span>🎯 Relationship Goals</span>
            </span>
            <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-bold border border-pink-500/30">
              Looking For
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(profile.lookingFor && profile.lookingFor.length > 0 ? profile.lookingFor : ['Chat', 'Friends', 'Dates', 'Relationship']).map((goal, gIdx) => {
              const goalColors: Record<string, string> = {
                'Chat': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                'Friends': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                'Dates': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                'Networking': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                'Relationship': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                'Right Now': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                '1-1 Fun': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                'Casual Encounter': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
                '1-1 meet': 'bg-teal-500/20 text-teal-300 border-teal-500/40',
                '1-2 Fun': 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
                'Party fun': 'bg-red-500/20 text-red-300 border-red-500/40',
              };
              const colorClass = goalColors[goal] || 'bg-neutral-700 text-neutral-300 border-neutral-600';
              return (
                <span key={gIdx} className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1 ${colorClass}`}>
                  <span>✨</span>
                  <span>{goal}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Private Notes Section */}
        <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>🔒 Private Notes (Only You Can See)</span>
            </span>
            {isSavingNote && (
              <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
                Saved! ✓
              </span>
            )}
          </div>
          <textarea
            value={privateNote}
            onChange={(e) => handleSavePrivateNote(e.target.value)}
            placeholder="Add private reminders or thoughts about this profile (e.g. met at coffee shop, loves indie music)..."
            rows={2}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-stone-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 resize-none transition"
          />
          <p className="text-[10px] text-neutral-400 italic">
            Saved locally and securely to your browser storage for your personal reference.
          </p>
        </div>

        {/* Collapsible / Expandable Biography Section */}
        <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-3 mb-4 space-y-1.5 transition">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsBioExpanded(!isBioExpanded)}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">About / Biography</h4>
            <span className="text-[11px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg border border-amber-500/30 font-semibold hover:underline">
              {isBioExpanded ? 'Show Less ▴' : 'Read More ▾'}
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


      </div>)}
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
      {/* Safety Check-In Modal */}
      <SafetyCheckInModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        matchName={profile.name}
        matchPhoto={profile.photos[0]}
      />

      {/* Block User Confirmation Modal */}
      {showBlockConfirmModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center text-xl">
                🚫
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Block {profile.name}?</h3>
                <p className="text-xs text-neutral-400">Select reason & confirm block action.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1">Reason for Blocking</label>
              <select
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Spam">Spam or Commercial Solicitation</option>
                <option value="Inappropriate Behavior">Inappropriate Behavior / Messages</option>
                <option value="Fake Profile">Fake Profile / Catfishing</option>
                <option value="Harassment">Harassment or Bullying</option>
              </select>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 text-xs text-neutral-300 space-y-1.5">
              <p>• {profile.name} will be permanently hidden from your view.</p>
              <p>• All messages and notifications will be stopped.</p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBlockConfirmModal(false);
                  if (showToast) showToast(`🚫 Blocked ${profile.name} (Reason: ${blockReason}).`);
                  if (onBlockUser) {
                    onBlockUser(profile.id);
                  }
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-lg shadow-red-600/30"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Stats Modal */}
      {showFullStatsModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">📊</span>
                <div>
                  <h3 className="text-base font-black text-white">{profile.name}'s Activity & Stats</h3>
                  <p className="text-[10px] text-neutral-400">Popularity trends & interaction history</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFullStatsModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-300">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Community Trust Score</span>
                  <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">4.9 / 5.0 ★</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Response Rate</span>
                  <span className="text-amber-400 font-extrabold">98.4% (Usually replies in 10m)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Profile Views This Week</span>
                  <span className="text-cyan-400 font-extrabold">1,420 views</span>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-white text-[11px] mb-2">📈 Popularity Trend (Last 7 Days)</p>
                <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2 bg-neutral-950/60 rounded-xl">
                  {[45, 60, 55, 80, 95, 88, 100].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-amber-500/80 rounded-t" style={{ height: `${val}%` }} />
                      <span className="text-[9px] text-neutral-500">Day {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFullStatsModal(false)}
              className="w-full py-3 bg-[#FFC107] text-black font-extrabold rounded-xl text-xs hover:opacity-90 transition"
            >
              Close Stats
            </button>
          </div>
        </div>
      )}
    </motion.div>
    </>
  );
};
