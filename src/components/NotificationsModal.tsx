import React, { useState } from 'react';
import { X, Eye, Bell, Sparkles, Flame, CheckCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buzzEvents: any[];
  profiles: UserProfile[];
  onSelectProfile: (p: UserProfile) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  buzzEvents,
  profiles,
  onSelectProfile,
  onMarkAllAsRead,
}) => {
  const [activeTab, setActiveTab] = useState<'whoViewedMe' | 'buzz'>('whoViewedMe');
  const [viewedStatuses, setViewedStatuses] = useState<Record<string, boolean>>({});
  const [birthdaySent, setBirthdaySent] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Mock favorite profile with upcoming birthday
  const favoriteProfile = profiles[0] || profiles[1];

  // Mock "Who Viewed Me" visitors list from profiles
  const recentVisitors = profiles.slice(0, 6).map((p, idx) => ({
    profile: p,
    visitTime: Date.now() - (idx * 1800000 + 300000), // staggered timestamps
    isNew: idx < 2, // first 2 are new
  })).sort((a, b) => b.visitTime - a.visitTime);

  const markAllSeen = () => {
    const updated: Record<string, boolean> = {};
    recentVisitors.forEach(v => { updated[v.profile.id] = true; });
    setViewedStatuses(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#FFC107]" />
            <h3 className="text-lg font-bold">Activity & Notifications</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-neutral-800 mb-4 bg-neutral-900/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('whoViewedMe')}
            className={`flex-1 py-2 text-xs font-bold transition rounded-lg flex items-center justify-center gap-1.5 ${
              activeTab === 'whoViewedMe'
                ? 'bg-[#FFC107] text-[#121212] shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Who Viewed Me</span>
          </button>
          <button
            onClick={() => setActiveTab('buzz')}
            className={`flex-1 py-2 text-xs font-bold transition rounded-lg flex items-center justify-center gap-1.5 ${
              activeTab === 'buzz'
                ? 'bg-[#FFC107] text-[#121212] shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Buzz Feed ({buzzEvents.length})</span>
          </button>
        </div>

        {/* Birthday Alert for Favorite Profile */}
        {favoriteProfile && (
          <div className="bg-gradient-to-r from-amber-500/20 via-[#222222] to-amber-500/10 border border-amber-500/40 rounded-xl p-3.5 mb-4 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl flex-shrink-0">
                🎂
              </div>
              <div>
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Upcoming Birthday!</span>
                  <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.2 rounded-full font-black">Today</span>
                </h4>
                <p className="text-[11px] text-neutral-300">Your favorite <span className="text-[#FFC107] font-semibold">{favoriteProfile.name}</span> is celebrating their birthday today!</p>
              </div>
            </div>
            {birthdaySent[favoriteProfile.id] ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap">
                ✓ Sent!
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setBirthdaySent(prev => ({ ...prev, [favoriteProfile.id]: true }))}
                className="bg-[#FFC107] text-[#121212] hover:opacity-90 font-black text-xs px-3 py-2 rounded-xl shadow transition whitespace-nowrap"
              >
                🎉 Send Greeting
              </button>
            )}
          </div>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {activeTab === 'whoViewedMe' ? (
            <>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-neutral-400">Profiles that opened your card recently</span>
                <button onClick={markAllSeen} className="text-[11px] text-[#FFC107] font-semibold hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all as seen</span>
                </button>
              </div>

              {recentVisitors.map(({ profile, visitTime, isNew }) => {
                const isSeen = viewedStatuses[profile.id] || !isNew;
                const timeAgo = Math.round((Date.now() - visitTime) / 60000);
                const timeStr = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`;

                return (
                  <div
                    key={profile.id}
                    onClick={() => {
                      setViewedStatuses(prev => ({ ...prev, [profile.id]: true }));
                      onSelectProfile(profile);
                      onClose();
                    }}
                    className="p-3 bg-[#222222] hover:bg-[#282828] border border-neutral-800 rounded-xl flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={profile.photos[0]}
                          alt={profile.name}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-700"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#222222]"></span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-[#FFC107] transition flex items-center gap-1.5">
                          <span>{profile.name}</span>
                          {!isSeen && (
                            <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              New
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-neutral-400">{profile.headline || 'Viewed your profile'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-neutral-400 font-medium">{timeStr}</span>
                      <p className="text-[10px] text-[#FFC107] mt-0.5 font-semibold opacity-0 group-hover:opacity-100 transition">View Profile →</p>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {buzzEvents.length === 0 ? (
                <p className="text-neutral-400 text-sm text-center py-8">No recent buzz events.</p>
              ) : (
                buzzEvents.map((ev, i) => (
                  <div key={i} className="p-3.5 bg-[#222222] border border-neutral-800 rounded-xl text-sm text-neutral-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      🔥
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{ev.text || `Buzz event #${i + 1}`}</p>
                      <p className="text-[10px] text-neutral-400">Just now</p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
          <span>Privacy Protected</span>
          <button onClick={onMarkAllAsRead} className="text-[#FFC107] font-semibold hover:underline">Clear Notifications</button>
        </div>
      </div>
    </div>
  );
};
