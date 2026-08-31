import React, { useState } from 'react';
import { UserProfile, Tribe, PositionRole, PHOTO_FILTERS, getFilterStyle } from '../types';
import { Edit3, ShieldCheck, MapPin, Check, Plus, Trash2, Lock, Video, Image as ImageIcon, Tag, Sparkles, AlertCircle, TrendingUp, Share2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ExportProfileModal } from './ExportProfileModal';

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenCompanionModal: () => void;
}

const ALL_TRIBES: Tribe[] = [
  'Bear', 'Clean', 'Daddy', 'Discreet', 'Geek', 'Jock', 'Leather', 'Otter', 'Poz', 'Trans', 'Twink'
];

const POPULAR_INTERESTS = [
  'Coffee', 'Gym', 'Photography', 'Hiking', 'Gaming', 'Cooking', 'Travel', 'Music', 'Art', 'Reading', 'Dogs', 'Yoga', 'Running', 'Wine', 'Movies', 'Coding', 'Fashion', 'Surfing', 'Fitness'
];

const COMPANION_SERVICE_OPTIONS = [
  'Travel Companion',
  'Shopping Companion',
  'Event Partner',
  'City Tour Guide',
  'Coffee Date',
  'Activity Partner'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateUser, onOpenCompanionModal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({ ...currentUser });
  const [successMsg, setSuccessMsg] = useState('');
  const [photoInputType, setPhotoInputType] = useState<'url' | 'preset'>('url');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Verification modal / state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationPoseUrl, setVerificationPoseUrl] = useState('');

  // Locked album input states
  const [newLockedPhotoUrl, setNewLockedPhotoUrl] = useState('');
  const [newLockedVideoUrl, setNewLockedVideoUrl] = useState('');
  const [interestSearch, setInterestSearch] = useState('');

  const presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(formData);
    setIsEditing(false);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const toggleTribe = (tribe: Tribe) => {
    setFormData(prev => {
      const tribes = prev.tribes || [];
      const exists = tribes.includes(tribe);
      return {
        ...prev,
        tribes: exists ? tribes.filter(t => t !== tribe) : [...tribes, tribe],
      };
    });
  };

  const toggleCompanionService = (service: string) => {
    setFormData(prev => {
      const services = prev.companionServices || [];
      const exists = services.includes(service);
      return {
        ...prev,
        companionServices: exists ? services.filter(s => s !== service) : [...services, service],
      };
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      const interests = prev.interestTags || [];
      const exists = interests.includes(interest);
      return {
        ...prev,
        interestTags: exists ? interests.filter(i => i !== interest) : [...interests, interest],
      };
    });
  };

  const toggleLookingFor = (item: LookingFor) => {
    setFormData(prev => {
      const looking = prev.lookingFor || [];
      const exists = looking.includes(item);
      return {
        ...prev,
        lookingFor: exists ? looking.filter(l => l !== item) : [...looking, item],
      };
    });
  };

  const handleRequestVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationPoseUrl) return;
    const updated = {
      ...currentUser,
      isVerified: true,
      verificationPhoto: verificationPoseUrl
    };
    onUpdateUser(updated);
    setFormData(updated);
    setShowVerificationModal(false);
    setSuccessMsg('Verification successful! Your verified badge is now active.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Locked Album CRUD
  const addLockedPhoto = () => {
    if (!newLockedPhotoUrl.trim()) return;
    const currentPhotos = formData.lockedAlbum?.photos || [];
    if (currentPhotos.length >= 10) {
      alert('Maximum 10 photos allowed in locked album.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      lockedAlbum: {
        photos: [...currentPhotos, newLockedPhotoUrl.trim()],
        videos: prev.lockedAlbum?.videos || []
      }
    }));
    setNewLockedPhotoUrl('');
  };

  const removeLockedPhoto = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      lockedAlbum: {
        photos: (prev.lockedAlbum?.photos || []).filter((_, i) => i !== idx),
        videos: prev.lockedAlbum?.videos || []
      }
    }));
  };

  const addLockedVideo = () => {
    if (!newLockedVideoUrl.trim()) return;
    const currentVideos = formData.lockedAlbum?.videos || [];
    if (currentVideos.length >= 10) {
      alert('Maximum 10 videos allowed in locked album.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      lockedAlbum: {
        photos: prev.lockedAlbum?.photos || [],
        videos: [...currentVideos, newLockedVideoUrl.trim()]
      }
    }));
    setNewLockedVideoUrl('');
  };

  const handleGrantAccess = (userId: string) => {
    setFormData(prev => {
      const currentGranted = prev.grantedAccessUserIds || [];
      const updatedRequests = (prev.albumRequests || []).map(r => r.userId === userId ? { ...r, status: 'granted' as const } : r);
      return {
        ...prev,
        grantedAccessUserIds: currentGranted.includes(userId) ? currentGranted : [...currentGranted, userId],
        albumRequests: updatedRequests
      };
    });
  };

  const handleDenyAccess = (userId: string) => {
    setFormData(prev => {
      const updatedRequests = (prev.albumRequests || []).map(r => r.userId === userId ? { ...r, status: 'denied' as const } : r);
      return {
        ...prev,
        albumRequests: updatedRequests
      };
    });
  };

  const removeLockedVideo = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      lockedAlbum: {
        photos: prev.lockedAlbum?.photos || [],
        videos: (prev.lockedAlbum?.videos || []).filter((_, i) => i !== idx)
      }
    }));
  };

  const filteredInterests = POPULAR_INTERESTS.filter(i => 
    i.toLowerCase().includes(interestSearch.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-6 text-white">
      
      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-sm font-medium flex items-center justify-between animate-in fade-in">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header banner */}
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-neutral-800 border-2 border-[#FFC107]/50 shadow-md flex-shrink-0">
            <img
              src={currentUser.photos[0]}
              alt={currentUser.name}
              style={{ filter: getFilterStyle(currentUser.photoFilter) }}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {currentUser.isVerified && (
              <div className="absolute bottom-1 right-1 bg-black/70 p-1 rounded-full backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h2 className="text-2xl font-black text-white">{currentUser.name}, {currentUser.age}</h2>
              {currentUser.isVerified ? (
                <span className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1 rounded-full font-semibold transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Request Verification
                </button>
              )}
            </div>
            <p className="text-sm text-neutral-300 mt-1">{currentUser.headline || 'Blaze Member'}</p>
            <p className="text-xs text-neutral-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>{currentUser.locationName || 'Nearby'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition flex items-center space-x-1.5 border border-neutral-700"
              title="Export & Share Profile Card"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Export Card</span>
            </button>
            <button
              onClick={() => {
                setFormData({ ...currentUser });
                setIsEditing(!isEditing);
              }}
              className="px-4 py-2 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-sm hover:opacity-90 transition flex items-center space-x-2 shadow-lg shadow-[#FFC107]/20"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Strength Indicator */}
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#FFC107]" />
            <h3 className="text-sm font-bold text-white">Profile Strength</h3>
          </div>
          <span className="text-sm font-black text-[#FFC107]">
            {Math.min(
              100,
              (currentUser.aboutMe ? 25 : 0) +
                (currentUser.headline ? 15 : 0) +
                (currentUser.locationName ? 10 : 0) +
                (currentUser.photos && currentUser.photos.length >= 2 ? 25 : currentUser.photos?.length ? 15 : 0) +
                (currentUser.interestTags && currentUser.interestTags.length >= 3 ? 15 : currentUser.interestTags?.length ? 8 : 0) +
                (currentUser.tribes && currentUser.tribes.length >= 1 ? 10 : 0)
            )}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(
                100,
                (currentUser.aboutMe ? 25 : 0) +
                  (currentUser.headline ? 15 : 0) +
                  (currentUser.locationName ? 10 : 0) +
                  (currentUser.photos && currentUser.photos.length >= 2 ? 25 : currentUser.photos?.length ? 15 : 0) +
                  (currentUser.interestTags && currentUser.interestTags.length >= 3 ? 15 : currentUser.interestTags?.length ? 8 : 0) +
                  (currentUser.tribes && currentUser.tribes.length >= 1 ? 10 : 0)
              )}%`,
            }}
          />
        </div>
        <p className="text-xs text-neutral-400">
          💡 Tip: Add more photos, interests, and a detailed bio to reach 100% profile strength.
        </p>
      </div>

      {/* Profile Card Background Theme Customization */}
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Profile Card Customization</h3>
        </div>
        <p className="text-xs text-neutral-400">
          Choose a custom background gradient theme for your profile card when viewed by others:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {[
            { id: 'default', label: 'Obsidian', bg: 'bg-[#1E1E1E]', border: 'border-neutral-700' },
            { id: 'amber', label: 'Gold Noir', bg: 'bg-gradient-to-br from-neutral-900 via-amber-950/40 to-black', border: 'border-amber-500/50' },
            { id: 'emerald', label: 'Emerald Luxe', bg: 'bg-gradient-to-br from-neutral-900 via-emerald-950/40 to-black', border: 'border-emerald-500/50' },
            { id: 'purple', label: 'Cyber Violet', bg: 'bg-gradient-to-br from-neutral-900 via-purple-950/40 to-black', border: 'border-purple-500/50' },
            { id: 'cyan', label: 'Neon Cyan', bg: 'bg-gradient-to-br from-neutral-900 via-cyan-950/40 to-black', border: 'border-cyan-500/50' },
          ].map((theme) => {
            const isSelected = (currentUser.profileTheme || 'default') === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  const updated = { ...currentUser, profileTheme: theme.id };
                  onUpdateUser(updated);
                  setFormData(updated);
                  setSuccessMsg(`Theme updated to ${theme.label}!`);
                  setTimeout(() => setSuccessMsg(''), 2500);
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${theme.bg} ${
                  isSelected ? 'ring-2 ring-amber-400 ' + theme.border : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <span className="text-[11px] font-bold text-white">{theme.label}</span>
                {isSelected && <span className="text-[10px] text-amber-400 font-extrabold">Active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 font-bold">📜</span>
            <h3 className="text-sm font-bold text-white">Recent Activity Logs</h3>
          </div>
          <span className="text-xs text-neutral-400">Timestamped Feed</span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-neutral-200 font-medium">Changed profile photo filter to "Vivid"</span>
            </div>
            <span className="text-neutral-400 text-[11px]">10m ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-neutral-200 font-medium">Sent a Tap to Marcus V.</span>
            </div>
            <span className="text-neutral-400 text-[11px]">1h ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="text-neutral-200 font-medium">Updated bio and added new interest tags</span>
            </div>
            <span className="text-neutral-400 text-[11px]">3h ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span className="text-neutral-200 font-medium">Activated 30-minute Grid Boost</span>
            </div>
            <span className="text-neutral-400 text-[11px]">Yesterday</span>
          </div>
        </div>
      </div>

      {/* Elite Companion Membership Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-[#1E1E1E] to-amber-500/10 border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-[#FFC107] font-bold text-xl">
            👑
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>Blaze Elite Companion Pass</span>
              <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black uppercase">
                {currentUser.membershipTier || 'Free'}
              </span>
            </h3>
            <p className="text-xs text-neutral-300 mt-0.5">
              Offer professional travel companion, shopping buddy, and social escort services with monthly membership.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCompanionModal}
          className="px-5 py-2.5 rounded-xl bg-[#FFC107] text-[#121212] font-black text-xs hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20 whitespace-nowrap"
        >
          {currentUser.membershipTier === 'Elite Companion' ? 'Manage Elite Pass' : 'Upgrade to Elite ($29.99/mo)'}
        </button>
      </div>

      {/* Edit Form or Display View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white border-b border-neutral-800 pb-3">Edit Profile & Details</h3>

          {/* Username & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Username</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Age</label>
              <input
                type="number"
                min="18"
                max="100"
                required
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              />
            </div>
          </div>

          {/* Profile Picture Upload / URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Profile Picture</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setPhotoInputType('url')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${photoInputType === 'url' ? 'bg-[#FFC107] text-[#121212]' : 'bg-[#252525] text-neutral-300'}`}
              >
                Image URL
              </button>
              <button
                type="button"
                onClick={() => setPhotoInputType('preset')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${photoInputType === 'preset' ? 'bg-[#FFC107] text-[#121212]' : 'bg-[#252525] text-neutral-300'}`}
              >
                Preset Avatars
              </button>
            </div>

            {photoInputType === 'url' ? (
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={formData.photos[0] || ''}
                onChange={e => setFormData({ ...formData, photos: [e.target.value] })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              />
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {presetAvatars.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setFormData({ ...formData, photos: [url] })}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 aspect-square ${formData.photos[0] === url ? 'border-[#FFC107]' : 'border-neutral-800 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aesthetic Photo Filters */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Photo Aesthetic Filter</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PHOTO_FILTERS.map(filter => {
                const isSelected = (formData.photoFilter || 'none') === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, photoFilter: filter.id })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[#FFC107] text-black border-[#FFC107] font-bold shadow-lg'
                        : 'bg-[#252525] text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span>{filter.label}</span>
                    {formData.photos[0] && (
                      <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 border border-black/30">
                        <img
                          src={formData.photos[0]}
                          alt={filter.label}
                          style={{ filter: filter.style }}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Online Status Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Online Status Visibility</label>
            <div className="grid grid-cols-3 gap-2">
              {(['online', 'away', 'offline'] as const).map(st => {
                const isSelected = formData.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: st })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition ${
                      isSelected
                        ? 'bg-[#FFC107] text-black border-[#FFC107] font-bold shadow'
                        : 'bg-[#252525] text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {st === 'offline' ? 'Invisible' : st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Mood Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Current Mood Status</label>
            <div className="flex flex-wrap gap-2">
              {['🔥 Working out', '☕ Coffee run', '😎 Chilling', '🚀 Exploring', '😴 Rest day', '🎉 Party time', '💻 Coding', '🌴 Vacation', '🎨 Creating', '⚡ Energetic'].map(mood => {
                const isSelected = formData.currentMood === mood;
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData({ ...formData, currentMood: mood })}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-[#FFC107] text-black border-[#FFC107] font-bold shadow'
                        : 'bg-[#252525] text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location / Worldwide Country */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Country & City (Worldwide)</label>
            <input
              type="text"
              placeholder="e.g. France (Paris), Japan (Tokyo), United States (New York)..."
              value={formData.locationName}
              onChange={e => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107] mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                'United States (New York, NY)',
                'United Kingdom (London, UK)',
                'France (Paris, France)',
                'Japan (Tokyo, Japan)',
                'Australia (Sydney, Australia)',
                'Brazil (Rio de Janeiro)',
                'Germany (Berlin)',
                'Canada (Toronto)',
                'Spain (Barcelona)',
                'Italy (Rome)',
                'United Arab Emirates (Dubai)',
                'Thailand (Bangkok)',
                'South Korea (Seoul)',
                'Mexico (Mexico City)',
                'South Africa (Cape Town)'
              ].map(loc => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setFormData({ ...formData, locationName: loc })}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition ${
                    formData.locationName === loc 
                      ? 'bg-[#FFC107] text-black border-[#FFC107] font-bold' 
                      : 'bg-[#222] text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Headline & Bio */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={e => setFormData({ ...formData, headline: e.target.value })}
              className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Short Bio / About Me</label>
            <textarea
              rows={3}
              value={formData.aboutMe}
              onChange={e => setFormData({ ...formData, aboutMe: e.target.value })}
              className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107] resize-none"
            />
          </div>

          {/* Relationship Goals (Looking For) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Relationship Goals (Looking For)</label>
            <div className="flex flex-wrap gap-2 bg-[#222] p-3 rounded-xl border border-neutral-800">
              {(['Chat', 'Friends', 'Dates', 'Networking', 'Relationship', 'Right Now', '1-1 Fun', 'Casual Encounter', '1-1 meet', '1-2 Fun', 'Party fun'] as LookingFor[]).map(goal => {
                const selected = (formData.lookingFor || []).includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleLookingFor(goal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      selected
                        ? 'bg-[#FFC107] text-black border-[#FFC107] shadow'
                        : 'bg-[#282828] text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '} {goal}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Height</label>
              <input
                type="text"
                value={formData.height || ''}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Weight</label>
              <input
                type="text"
                value={formData.weight || ''}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Position</label>
              <select
                value={formData.position || 'Vers'}
                onChange={e => setFormData({ ...formData, position: e.target.value as PositionRole })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              >
                {['Top', 'Vers Top', 'Vers', 'Vers Bottom', 'Bottom', 'Side', 'Oral'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Pronouns</label>
              <input
                type="text"
                placeholder="e.g. He/Him, They/Them"
                value={formData.pronouns || ''}
                onChange={e => setFormData({ ...formData, pronouns: e.target.value })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Zodiac Sign</label>
              <input
                type="text"
                placeholder="e.g. Scorpio, Leo"
                value={formData.zodiac || ''}
                onChange={e => setFormData({ ...formData, zodiac: e.target.value })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Relationship Status</label>
              <input
                type="text"
                placeholder="e.g. Single, Open, Taken"
                value={formData.relationshipStatus || ''}
                onChange={e => setFormData({ ...formData, relationshipStatus: e.target.value })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Smoking</label>
              <select
                value={formData.smoking || 'Non-smoker'}
                onChange={e => setFormData({ ...formData, smoking: e.target.value })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              >
                {['Non-smoker', 'Social smoker', 'Smoker', 'Vaper'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Drinking</label>
              <select
                value={formData.drinking || 'Socially'}
                onChange={e => setFormData({ ...formData, drinking: e.target.value })}
                className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
              >
                {['Non-drinker', 'Socially', 'Regularly'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Social Links & Music */}
          <div className="space-y-3 bg-[#222222] p-4 rounded-xl border border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FFC107]">Social Links & Music</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Instagram Handle</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.socialLinks?.instagram || ''}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  className="w-full bg-[#1A1A1A] border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#FFC107]"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">TikTok Handle</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.socialLinks?.tiktok || ''}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, tiktok: e.target.value }
                  })}
                  className="w-full bg-[#1A1A1A] border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#FFC107]"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Twitter Handle</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  className="w-full bg-[#1A1A1A] border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#FFC107]"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Snapchat</label>
                <input
                  type="text"
                  placeholder="Snap username"
                  value={formData.socialLinks?.snapchat || ''}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, snapchat: e.target.value }
                  })}
                  className="w-full bg-[#1A1A1A] border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#FFC107]"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Spotify Favorite Track/Artist</label>
                <input
                  type="text"
                  placeholder="Song - Artist"
                  value={formData.socialLinks?.spotify || ''}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, spotify: e.target.value }
                  })}
                  className="w-full bg-[#1A1A1A] border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#FFC107]"
                />
              </div>
            </div>
          </div>

          {/* Interest Tags Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#FFC107]" />
                <span>Interest Tags & Hobbies</span>
              </label>
              <input
                type="text"
                placeholder="Search interests..."
                value={interestSearch}
                onChange={e => setInterestSearch(e.target.value)}
                className="bg-[#252525] border border-neutral-800 rounded-lg px-3 py-1 text-xs text-white outline-none w-40 focus:border-[#FFC107]"
              />
            </div>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-[#222] rounded-xl border border-neutral-800">
              {filteredInterests.map(interest => {
                const selected = (formData.interestTags || []).includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                      selected
                        ? 'bg-[#FFC107] text-[#121212] font-bold'
                        : 'bg-[#2a2a2a] text-neutral-300 hover:bg-[#333] border border-neutral-700'
                    }`}
                  >
                    <span>✨</span>
                    <span>{interest}</span>
                    {selected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Locked Album Management Section */}
          <div className="bg-[#222222] border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#FFC107]" />
                <h4 className="font-bold text-sm text-white">Manage Private Locked Album (Up to 10 Photos & 10 Videos)</h4>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAlbumOpen || false}
                  onChange={e => setFormData(prev => ({ ...prev, isAlbumOpen: e.target.checked }))}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-[#FFC107] focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-amber-300">Open Album to All</span>
              </label>
            </div>

            {/* Locked Photos */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Private Photos</span>
                <span>{(formData.lockedAlbum?.photos || []).length}/10</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste photo URL for private album..."
                  value={newLockedPhotoUrl}
                  onChange={e => setNewLockedPhotoUrl(e.target.value)}
                  className="flex-1 bg-[#1A1A1A] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                />
                <button
                  type="button"
                  onClick={addLockedPhoto}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Photo
                </button>
              </div>

              {(formData.lockedAlbum?.photos || []).length > 0 && (
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {(formData.lockedAlbum?.photos || []).map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-700 group">
                      <img src={url} alt={`Locked ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => removeLockedPhoto(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Locked Videos */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-blue-400" /> Private Videos</span>
                <span>{(formData.lockedAlbum?.videos || []).length}/10</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste video URL (MP4)..."
                  value={newLockedVideoUrl}
                  onChange={e => setNewLockedVideoUrl(e.target.value)}
                  className="flex-1 bg-[#1A1A1A] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                />
                <button
                  type="button"
                  onClick={addLockedVideo}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Video
                </button>
              </div>

              {(formData.lockedAlbum?.videos || []).length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {(formData.lockedAlbum?.videos || []).map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-neutral-700 bg-black group flex items-center justify-center">
                      <video src={url} className="w-full h-full object-cover opacity-70" />
                      <button
                        type="button"
                        onClick={() => removeLockedVideo(idx)}
                        className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition"
                      >
                        <Trash2 className="w-5 h-5" /> Delete Video
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Private Album Access Requests Section */}
            <div className="pt-3 border-t border-neutral-800 space-y-3">
              <h5 className="text-xs font-bold text-white flex items-center justify-between">
                <span>🔒 Private Album Access Requests</span>
                <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-400">
                  {(formData.albumRequests || []).filter(r => r.status === 'pending').length} Pending
                </span>
              </h5>

              {(!formData.albumRequests || formData.albumRequests.length === 0) ? (
                <p className="text-[11px] text-neutral-500 italic py-1">No pending access requests from other users yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.albumRequests.map((req) => (
                    <div key={req.userId} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img src={req.userPhoto} alt={req.userName} className="w-9 h-9 rounded-xl object-cover border border-neutral-700" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-xs font-bold text-white">{req.userName}</p>
                          <p className="text-[10px] text-neutral-400">Requested album access</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {req.status === 'granted' ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-xl font-bold border border-emerald-500/30">
                            ✓ Access Granted
                          </span>
                        ) : req.status === 'denied' ? (
                          <span className="text-[10px] bg-red-500/20 text-red-300 px-2.5 py-1 rounded-xl font-bold border border-red-500/30">
                            ✕ Denied
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleGrantAccess(req.userId)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition"
                            >
                              Grant
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDenyAccess(req.userId)}
                              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-[11px] rounded-lg transition"
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ghost Mode Stealth Browsing Setting */}
          <div className="bg-[#222222] border border-neutral-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👻</span>
                <div>
                  <h4 className="font-bold text-sm text-white">Ghost Mode (Stealth Browsing)</h4>
                  <p className="text-[11px] text-neutral-400">Browse profiles invisibly without appearing in visitor history.</p>
                </div>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGhostMode || false}
                  onChange={e => setFormData({ ...formData, isGhostMode: e.target.checked })}
                  className="rounded bg-[#1A1A1A] border-neutral-700 text-[#FFC107] focus:ring-0 w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#FFC107]">
                  {formData.isGhostMode ? 'Active (Stealth)' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Companion Services & Rate Configuration */}
          <div className="bg-[#222222] border border-amber-500/30 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👑</span>
                <h4 className="font-bold text-sm text-[#FFC107]">Professional Companion Services</h4>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCompanionPro || false}
                  onChange={e => setFormData({ ...formData, isCompanionPro: e.target.checked })}
                  className="rounded bg-[#1A1A1A] border-neutral-700 text-[#FFC107] focus:ring-0 w-4 h-4"
                />
                <span className="text-xs font-semibold text-white">Enable Companion Mode</span>
              </label>
            </div>

            {formData.isCompanionPro && (
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Companion Rate / Fee</label>
                  <input
                    type="text"
                    placeholder="e.g. $45/hr or $299/mo"
                    value={formData.companionRate || ''}
                    onChange={e => setFormData({ ...formData, companionRate: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">Offered Services</label>
                  <div className="flex flex-wrap gap-2">
                    {COMPANION_SERVICE_OPTIONS.map(service => {
                      const selected = (formData.companionServices || []).includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleCompanionService(service)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1 ${
                            selected
                              ? 'bg-amber-500 text-black font-bold'
                              : 'bg-[#1A1A1A] text-neutral-300 hover:bg-[#333333] border border-neutral-800'
                          }`}
                        >
                          <span>✨ {service}</span>
                          {selected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">Tribes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TRIBES.map(tribe => {
                const selected = (formData.tribes || []).includes(tribe);
                return (
                  <button
                    key={tribe}
                    type="button"
                    onClick={() => toggleTribe(tribe)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1 ${
                      selected
                        ? 'bg-[#FFC107] text-[#121212] font-bold'
                        : 'bg-[#252525] text-neutral-300 hover:bg-[#333333] border border-neutral-800'
                    }`}
                  >
                    <span>#{tribe}</span>
                    {selected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-sm hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-sm hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* Profile Display */
        <div className="space-y-6">
          
          {/* Bio Section */}
          <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">About Me</h3>
            <p className="text-neutral-200 text-sm leading-relaxed">{currentUser.aboutMe || 'No bio provided yet.'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {currentUser.height && (
                <div className="bg-[#252525] p-3 rounded-xl border border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Height</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.height}</span>
                </div>
              )}
              {currentUser.weight && (
                <div className="bg-[#252525] p-3 rounded-xl border border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Weight</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.weight}</span>
                </div>
              )}
              {currentUser.bodyType && (
                <div className="bg-[#252525] p-3 rounded-xl border border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Body Type</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.bodyType}</span>
                </div>
              )}
              {currentUser.position && (
                <div className="bg-[#252525] p-3 rounded-xl border border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">Position</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{currentUser.position}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interest Tags Display */}
          {currentUser.interestTags && currentUser.interestTags.length > 0 && (
            <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#FFC107]" />
                <span>Interests & Hobbies</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.interestTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl bg-[#252525] border border-neutral-800 text-xs font-medium text-amber-300 flex items-center gap-1.5"
                  >
                    <span>✨</span>
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Locked Album Display */}
          <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#FFC107]" />
                <h3 className="font-bold text-base text-white">Your Locked Album</h3>
              </div>
              <button
                onClick={() => {
                  setFormData({ ...currentUser });
                  setIsEditing(true);
                }}
                className="text-xs text-[#FFC107] hover:underline font-semibold"
              >
                Edit Album
              </button>
            </div>

            <div className="space-y-3">
              {(currentUser.lockedAlbum?.photos || []).length > 0 && (
                <div>
                  <p className="text-xs text-neutral-400 mb-2">Locked Photos ({(currentUser.lockedAlbum?.photos || []).length}/5)</p>
                  <div className="grid grid-cols-5 gap-2">
                    {(currentUser.lockedAlbum?.photos || []).map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-neutral-700">
                        <img src={url} alt={`Locked ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(currentUser.lockedAlbum?.videos || []).length > 0 && (
                <div>
                  <p className="text-xs text-neutral-400 mb-2">Locked Videos ({(currentUser.lockedAlbum?.videos || []).length}/2)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(currentUser.lockedAlbum?.videos || []).map((url, idx) => (
                      <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-neutral-700 bg-black flex items-center justify-center relative">
                        <video src={url} className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!currentUser.lockedAlbum || ((currentUser.lockedAlbum.photos || []).length === 0 && (currentUser.lockedAlbum.videos || []).length === 0)) && (
                <div className="text-center py-6 bg-[#252525] rounded-xl border border-neutral-800 p-4">
                  <Lock className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Your locked album is currently empty. Click 'Edit Profile' to add up to 5 photos and 2 videos.</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights Section with Recharts */}
          <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#FFC107]" />
                <h3 className="text-sm font-bold text-white">Profile Insights & Views (Last 7 Days)</h3>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                +24% this week
              </span>
            </div>
            <p className="text-xs text-neutral-400">Track how many people viewed your profile and interacted with your cards daily.</p>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { day: 'Mon', views: 42, taps: 14 },
                  { day: 'Tue', views: 68, taps: 22 },
                  { day: 'Wed', views: 55, taps: 19 },
                  { day: 'Thu', views: 92, taps: 31 },
                  { day: 'Fri', views: 145, taps: 48 },
                  { day: 'Sat', views: 180, taps: 62 },
                  { day: 'Sun', views: 165, taps: 55 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '12px', color: '#fff' }} />
                  <Line type="monotone" dataKey="views" name="Profile Views" stroke="#FFC107" strokeWidth={3} dot={{ r: 4, fill: '#FFC107' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="taps" name="Taps & Winks" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3, fill: '#38bdf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Chat Activity Volume Chart */}
          <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">💬</span>
                <h3 className="text-sm font-bold text-white">Weekly Chat Activity Volume</h3>
              </div>
              <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-semibold border border-cyan-500/35">
                Peak: Sat Evenings
              </span>
            </div>
            <p className="text-xs text-neutral-400">Visualizing message frequency and conversation activity across days of the week.</p>
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { day: 'Mon', messages: 28 },
                  { day: 'Tue', messages: 45 },
                  { day: 'Wed', messages: 35 },
                  { day: 'Thu', messages: 62 },
                  { day: 'Fri', messages: 95 },
                  { day: 'Sat', messages: 140 },
                  { day: 'Sun', messages: 110 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="messages" name="Messages Sent/Received" fill="#FFC107" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {currentUser.tribes && currentUser.tribes.length > 0 && (
            <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 space-y-3 shadow-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Tribes</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.tribes.map((tribe) => (
                  <span
                    key={tribe}
                    className="px-3 py-1.5 rounded-xl bg-[#252525] border border-neutral-800 text-xs font-medium text-neutral-200"
                  >
                    #{tribe}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center space-x-2 text-[#FFC107]">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Get Verified</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              To get your official <strong className="text-cyan-400">Verified Badge</strong>, upload a pose photo holding your hand up with 2 fingers or matching our community safety check pose. This builds trust across the Blaze community!
            </p>

            <form onSubmit={handleRequestVerification} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">Pose Photo URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={verificationPoseUrl}
                  onChange={e => setVerificationPoseUrl(e.target.value)}
                  className="w-full bg-[#252525] border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFC107]"
                />
              </div>

              {verificationPoseUrl && (
                <div className="aspect-square w-32 mx-auto rounded-xl overflow-hidden border-2 border-[#FFC107]">
                  <img src={verificationPoseUrl} alt="Pose preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Profile Card Modal */}
      <ExportProfileModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={currentUser}
      />

    </div>
  );
};
