import React, { useState, useRef } from 'react';
import { UserProfile, getFilterStyle } from '../types';
import { ShieldAlert, Sparkles, Heart, Share2, Check, ShieldCheck, Flag, AlertTriangle, Music, Play, Pause, Smile, Mic } from 'lucide-react';
import { VennDiagram } from './VennDiagram';

interface RightProfilePanelProps {
  profile: UserProfile | null;
  currentUser?: UserProfile | null;
  onClose: () => void;
  onStartChat: (profile: UserProfile) => void;
  onSendTap: (profile: UserProfile) => void;
  onBlockUser?: (profileId: string) => void;
}

export const RightProfilePanel: React.FC<RightProfilePanelProps> = ({
  profile,
  currentUser,
  onClose,
  onStartChat,
  onSendTap,
  onBlockUser,
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
      if (alsoBlock && onBlockUser) {
        onBlockUser(profile.id);
      }
      alert(`Report submitted for ${profile.name}. ${alsoBlock ? 'User has also been blocked automatically.' : ''} Thank you for keeping our community safe.`);
      if (alsoBlock) onClose();
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
  const stories = profile.stories || [
    { id: '1', text: 'Enjoying rooftop coffee in the sun ☀️', timestamp: Date.now() - 3600000 },
    { id: '2', url: profile.photos[0], timestamp: Date.now() - 14000000 }
  ];
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-900 text-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
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
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[11px] text-neutral-400">Last visited: <span className="text-emerald-400 font-medium">{lastVisitedTime}</span></p>
              <span className="text-[10px] bg-neutral-800 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-neutral-700">
                👁️ {profile.totalViews ?? 1245} Views
              </span>
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

        {/* Photo Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 snap-x scrollbar-thin">
          {profile.photos.map((photoUrl, idx) => (
            <div key={idx} className="flex-shrink-0 w-full h-64 snap-center rounded-xl overflow-hidden relative bg-neutral-950">
              <img
                src={photoUrl}
                alt={`${profile.name} photo ${idx + 1}`}
                style={{ filter: getFilterStyle(profile.photoFilter) }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {profile.photos.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-white">
                  {idx + 1} / {profile.photos.length}
                </div>
              )}
            </div>
          ))}
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

        {/* Shared Tribes & Interests Badges */}
        {(sharedTribes.length > 0 || sharedInterests.length > 0) && (
          <div className="mb-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Shared Connections</h4>
            <div className="flex flex-wrap gap-1.5">
              {sharedTribes.map((t, idx) => (
                <span
                  key={`t-${idx}`}
                  className="bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/40 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>⚡ {t}</span>
                  <span className="bg-[#FFC107] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">Mutual</span>
                </span>
              ))}
              {sharedInterests.map((i, idx) => (
                <span
                  key={`i-${idx}`}
                  className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>✨ {i}</span>
                  <span className="bg-purple-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">Mutual</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* D3 Shared Interest Venn Diagram Visualization */}
        <div className="mb-4">
          <VennDiagram
            currentUserInterests={currentUser?.interestTags || ['Tech', 'Coffee', 'Design', 'Travel']}
            targetUserInterests={profile.interestTags || []}
            currentUserName={currentUser?.name || 'You'}
            targetUserName={profile.name}
          />
        </div>

        {/* Mutual Contacts Section */}
        {mutualContacts.length > 0 && (
          <div className="mb-4 bg-neutral-800/70 border border-neutral-700/60 rounded-xl p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Mutual Contacts ({mutualContacts.length})</h4>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {mutualContacts.map((mc, mIdx) => (
                  <div key={mIdx} className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-neutral-900 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                    {mc.charAt(0)}
                  </div>
                ))}
              </div>
              <span className="text-xs text-neutral-300">
                Connected via <span className="text-white font-semibold">{mutualContacts.join(', ')}</span>
              </span>
            </div>
          </div>
        )}

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

        {/* Dedicated Conversation Starter Section */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-3.5 mb-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">AI Conversation Starter</h4>
          </div>
          <p className="text-xs text-neutral-200 mb-2.5 leading-relaxed">
            You both share interest in <span className="font-bold text-amber-300">{sharedInterests[0] || profile.interestTags?.[0] || 'Design'}</span> and belong to the <span className="font-bold text-amber-300">{sharedTribes[0] || profile.tribes?.[0] || 'Explorers'}</span> tribe!
          </p>
          <button
            onClick={() => onStartChat(profile)}
            className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 shadow"
          >
            <span>💬 Send Icebreaker: "Hey! Saw we're both into {sharedInterests[0] || profile.interestTags?.[0] || 'Design'}!"</span>
          </button>
        </div>

        <p className="text-stone-300 mb-4 text-sm leading-relaxed">{profile.aboutMe || profile.headline}</p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => onStartChat(profile)}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2.5 rounded-xl transition shadow-lg"
          >
            Chat
          </button>
          <button
            onClick={() => onSendTap(profile)}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-2.5 rounded-xl font-medium border border-neutral-700 transition"
          >
            Tap 🔥
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
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Spam">Spam or Scam</option>
                    <option value="Fake Profile">Fake Profile / Impostor</option>
                    <option value="Harassment">Harassment or Abuse</option>
                    <option value="Underage">Underage Suspected</option>
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
    </div>
  );
};
