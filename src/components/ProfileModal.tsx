import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Flame, MessageSquare, Star, Sparkles, MapPin, ShieldCheck, ChevronLeft, ChevronRight, Lock, Unlock, Video, Image as ImageIcon, Tag, UserX, AlertTriangle } from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile | null;
  onClose: () => void;
  onStartChat: (profile: UserProfile) => void;
  onToggleFavorite: (profileId: string) => void;
  onSendTap: (profile: UserProfile) => void;
  onOpenAIIcebreaker: (profile: UserProfile) => void;
  onBlockUser?: (profileId: string) => void;
  onSuspendUser?: (profileId: string) => void;
  onSendWink: (profile: UserProfile) => void;
  onSendLetsMeet: (profile: UserProfile) => void;
  onMarkInterested: (profileId: string, interested: boolean) => void;
  onMatchUp: (profileId: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onStartChat,
  onToggleFavorite,
  onSendTap,
  onOpenAIIcebreaker,
  onBlockUser,
  onSuspendUser,
  onSendWink,
  onSendLetsMeet,
  onMarkInterested,
  onMatchUp,
}) => {
  if (!profile) return null;

  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isAlbumUnlocked, setIsAlbumUnlocked] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'photo' | 'video'; url: string } | null>(null);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.photos.length > 1) {
      setCurrentPhotoIdx((prev) => (prev + 1) % profile.photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.photos.length > 1) {
      setCurrentPhotoIdx((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
    }
  };

  const lockedPhotos = profile.lockedAlbum?.photos || [];
  const lockedVideos = profile.lockedAlbum?.videos || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1A1A1A] w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl border border-neutral-800 text-white max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Photo Section with Carousel */}
        <div className="relative w-full aspect-[4/5] bg-black">
          <img
            src={profile.photos[currentPhotoIdx] || profile.photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Photo Navigation Indicators */}
          {profile.photos.length > 1 && (
            <>
              <div className="absolute top-4 left-4 right-16 z-10 flex space-x-1">
                {profile.photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      idx === currentPhotoIdx ? 'bg-[#FFC107]' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Name & Distance Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white flex items-center gap-1.5">
                  <span>{profile.name}</span>
                  <span className="font-normal text-neutral-300">, {profile.age}</span>
                  {profile.isVerified && (
                    <ShieldCheck className="w-5 h-5 text-cyan-400 fill-cyan-400/20" title="Verified Profile" />
                  )}
                </h2>
                <div className={`w-3 h-3 rounded-full ${profile.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>
              <p className="text-xs text-neutral-300 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#FFC107]" />
                <span>{profile.distance === 0 ? 'Less than a mile away' : `${profile.distance} miles away`} ({profile.locationName})</span>
              </p>
            </div>

            <button
              onClick={() => onToggleFavorite(profile.id)}
              className={`p-3 rounded-full backdrop-blur-md border transition ${
                profile.isFavorite
                  ? 'bg-[#FFC107] text-[#121212] border-[#FFC107]'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black'
              }`}
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Scrollable Bio & Stats */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Headline & Bio */}
          {profile.headline && (
            <div className="bg-[#252525] p-3.5 rounded-xl border border-neutral-800">
              <p className="font-semibold text-[#FFC107] text-sm">{profile.headline}</p>
              <p className="text-neutral-300 text-sm mt-1 leading-relaxed">{profile.aboutMe}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.height && (
              <div className="bg-[#222222] p-3 rounded-xl border border-neutral-800/80">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Height</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{profile.height}</span>
              </div>
            )}
            {profile.weight && (
              <div className="bg-[#222222] p-3 rounded-xl border border-neutral-800/80">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Weight</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{profile.weight}</span>
              </div>
            )}
            {profile.bodyType && (
              <div className="bg-[#222222] p-3 rounded-xl border border-neutral-800/80">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Body Type</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{profile.bodyType}</span>
              </div>
            )}
            {profile.position && (
              <div className="bg-[#222222] p-3 rounded-xl border border-neutral-800/80">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Position</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{profile.position}</span>
              </div>
            )}
            {profile.lookingFor && profile.lookingFor.length > 0 && (
              <div className="bg-[#222222] p-3 rounded-xl border border-neutral-800/80 col-span-2">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Looking For</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{profile.lookingFor.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Professional Companion Services Card */}
          {profile.isCompanionPro && (
            <div className="bg-gradient-to-br from-amber-500/15 via-[#222222] to-amber-500/5 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">👑</span>
                  <h3 className="font-bold text-sm text-[#FFC107]">Elite Companion & Travel Partner</h3>
                </div>
                {profile.companionRate && (
                  <span className="text-xs bg-amber-500 text-black font-bold px-2.5 py-1 rounded-lg">
                    {profile.companionRate}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-300">
                Verified professional companion available for travel, social events, shopping sessions, and city tours.
              </p>
              {profile.companionServices && profile.companionServices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.companionServices.map((service) => (
                    <span
                      key={service}
                      className="px-2.5 py-1 rounded-lg bg-black/40 border border-amber-500/30 text-[11px] font-semibold text-amber-300"
                    >
                      ✨ {service}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interest Tags */}
          {profile.interestTags && profile.interestTags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#FFC107]" />
                <span>Interests & Hobbies</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interestTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-xl bg-[#252525] border border-neutral-800 text-xs font-medium text-amber-300 flex items-center gap-1.5"
                  >
                    <span>✨</span>
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Locked Album Section */}
          <div className="bg-[#222222] border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isAlbumUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-[#FFC107]" />}
                <h3 className="font-bold text-sm text-white">Private Locked Album</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700">
                {lockedPhotos.length} Photos • {lockedVideos.length} Videos
              </span>
            </div>

            {isAlbumUnlocked ? (
              <div className="space-y-3 pt-1">
                {lockedPhotos.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-1.5 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Photos ({lockedPhotos.length}/5)
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {lockedPhotos.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedMedia({ type: 'photo', url })}
                          className="aspect-square rounded-lg overflow-hidden border border-neutral-700 cursor-pointer hover:border-[#FFC107] transition"
                        >
                          <img src={url} alt={`Locked ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lockedVideos.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-1.5 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-blue-400" /> Videos ({lockedVideos.length}/2)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {lockedVideos.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedMedia({ type: 'video', url })}
                          className="aspect-video rounded-lg overflow-hidden border border-neutral-700 cursor-pointer bg-black relative flex items-center justify-center hover:border-[#FFC107] transition"
                        >
                          <video src={url} className="w-full h-full object-cover opacity-80" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lockedPhotos.length === 0 && lockedVideos.length === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-3">No locked media uploaded by this user yet.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4 bg-[#1A1A1A] rounded-xl border border-neutral-800 p-4">
                <Lock className="w-8 h-8 text-[#FFC107] mx-auto mb-2 opacity-80" />
                <p className="text-xs text-neutral-300 mb-3">This user's private album is locked. Request access or unlock to view.</p>
                <button
                  onClick={() => setIsAlbumUnlocked(true)}
                  className="px-4 py-2 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-xs hover:opacity-90 transition shadow-md"
                >
                  Unlock Album (Grant Access)
                </button>
              </div>
            )}
          </div>

          {/* Tribes */}
          {profile.tribes && profile.tribes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Tribes</h3>
              <div className="flex flex-wrap gap-2">
                {profile.tribes.map((tribe) => (
                  <span
                    key={tribe}
                    className="px-3 py-1 rounded-lg bg-[#252525] border border-neutral-800 text-xs font-medium text-neutral-200"
                  >
                    #{tribe}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Icebreaker generator suggestion button */}
          <button
            onClick={() => onOpenAIIcebreaker(profile)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-[#FFC107]/40 text-[#FFC107] font-bold text-sm flex items-center justify-center space-x-2 hover:bg-[#FFC107]/10 transition"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Generate AI Icebreaker for {profile.name}</span>
          </button>

          {/* Moderation: Block & Suspend */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to block ${profile.name}?`)) {
                  onBlockUser?.(profile.id);
                  onClose();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition"
            >
              <UserX className="w-3.5 h-3.5" /> Block Profile
            </button>
            <button
              onClick={() => {
                const reason = window.prompt(`Reason for suspending ${profile.name}:`, 'Violation of safety guidelines');
                if (reason) {
                  onSuspendUser?.(profile.id);
                  onClose();
                }
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Suspend Profile (Admin)
            </button>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#141414] space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSendWink(profile)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1 transition ${
                profile.isWinked
                  ? 'bg-amber-500/20 text-[#FFC107] border-amber-500/40'
                  : 'bg-[#222222] text-neutral-200 border-neutral-800 hover:bg-[#333333]'
              }`}
            >
              <span>😉</span>
              <span>{profile.isWinked ? 'Winked!' : 'Wink'}</span>
            </button>

            <button
              onClick={() => onSendLetsMeet(profile)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1 transition ${
                profile.isLetsMet
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#222222] text-neutral-200 border-neutral-800 hover:bg-[#333333]'
              }`}
            >
              <span>🤝</span>
              <span>{profile.isLetsMet ? "Let's Meet!" : "Let's Meet"}</span>
            </button>

            <button
              onClick={() => onSendTap(profile)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1 transition ${
                profile.isTapped
                  ? 'bg-amber-500 text-black border-amber-500 font-black'
                  : 'bg-[#222222] text-[#FFC107] border-neutral-800 hover:bg-[#333333]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{profile.isTapped ? 'Tapped!' : 'Tap'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onMarkInterested(profile.id, true)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1 transition ${
                profile.interestStatus === 'interested'
                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                  : 'bg-[#222222] text-neutral-300 border-neutral-800 hover:bg-emerald-950/30'
              }`}
            >
              <span>👍 Interested</span>
            </button>

            <button
              onClick={() => onMarkInterested(profile.id, false)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1 transition ${
                profile.interestStatus === 'not_interested'
                  ? 'bg-red-600 text-white border-red-500 font-bold'
                  : 'bg-[#222222] text-neutral-300 border-neutral-800 hover:bg-red-950/30'
              }`}
            >
              <span>👎 Not Interested</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onStartChat(profile);
              }}
              className="py-2 px-3 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-xs flex items-center justify-center space-x-1 hover:opacity-90 transition shadow-md shadow-[#FFC107]/20"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>Chat</span>
            </button>
          </div>

          <button
            onClick={() => onMatchUp(profile.id)}
            className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center space-x-2 transition shadow-lg ${
              profile.isMatchedUp
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-amber-500/20 hover:opacity-95'
            }`}
          >
            <span>🔥</span>
            <span>{profile.isMatchedUp ? 'Matched Up! (Accepted)' : `Match Up with ${profile.name}`}</span>
          </button>
        </div>

      </div>

      {/* Media Viewer Lightbox */}
      {selectedMedia && (
        <div className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <button onClick={() => setSelectedMedia(null)} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-800 text-white">
              <X className="w-6 h-6" />
            </button>
            {selectedMedia.type === 'photo' ? (
              <img src={selectedMedia.url} alt="Fullscreen" className="max-h-[85vh] max-w-full rounded-xl object-contain" referrerPolicy="no-referrer" />
            ) : (
              <video src={selectedMedia.url} controls autoPlay className="max-h-[85vh] max-w-full rounded-xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
