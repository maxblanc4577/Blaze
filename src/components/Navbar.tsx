import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Flame, Sparkles, MapPin, Bell, Users, Sun, Moon, Globe, Zap, EyeOff, Settings, Crown } from 'lucide-react';
import { BuzzSimulator } from './BuzzSimulator';
import { UserProfile } from '../types';
import { BuzzEvent } from '../utils/buzz';

interface NavbarProps {
  onOpenFilters: () => void;
  onShareLocation: () => void;
  onOpenContacts: () => void;
  onOpenSettings: () => void;
  onOpenGettingStarted?: () => void;
  gridColumns: number;
  setGridColumns: (cols: number) => void;
  activeTab: string;
  unreadBuzzCount: number;
  onOpenNotifications: () => void;
  profiles: UserProfile[];
  onTriggerBuzzEvent: (event: BuzzEvent) => void;
  autoSimulatorActive: boolean;
  setAutoSimulatorActive: (active: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  boostActiveUntil: number | null;
  onActivateBoost: () => void;
  currentUser?: UserProfile;
  onOpenSubscription: () => void;
  viewedCount: number;
  subscription: { type: string; expiresAt: number };
  gridSubTab?: 'all' | 'recently_viewed';
  setGridSubTab?: (tab: 'all' | 'recently_viewed') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenFilters,
  onShareLocation,
  onOpenContacts,
  onOpenSettings,
  onOpenGettingStarted,
  gridColumns,
  setGridColumns,
  activeTab,
  unreadBuzzCount,
  onOpenNotifications,
  profiles,
  onTriggerBuzzEvent,
  autoSimulatorActive,
  setAutoSimulatorActive,
  isDarkMode,
  onToggleTheme,
  currentLanguage,
  onLanguageChange,
  boostActiveUntil,
  onActivateBoost,
  currentUser,
  onOpenSubscription,
  viewedCount,
  subscription,
  gridSubTab,
  setGridSubTab,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!boostActiveUntil) return;
    const interval = setInterval(() => {
      const remaining = boostActiveUntil - Date.now();
      if (remaining <= 0) {
        setTimeLeft('');
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [boostActiveUntil]);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ja', label: '日本語' },
  ];
  return (
    <header className="sticky top-0 z-30 bg-[#1A1A1A] border-b border-neutral-800 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-[#FFC107] flex items-center justify-center font-black text-[#121212] text-xl shadow-lg shadow-[#FFC107]/20">
          B
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
            Blaze
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFC107]/20 text-[#FFC107] font-semibold border border-[#FFC107]/30">
              PRO
            </span>
          </h1>
          <p className="text-xs text-neutral-400 capitalize">{activeTab} • Nearby Buzz Active</p>
        </div>
      </div>

      {/* Grid Sub-Tabs in Header when activeTab === 'grid' */}
      {activeTab === 'grid' && gridSubTab && setGridSubTab && (
        <div className="hidden sm:flex items-center space-x-1 bg-[#252525] p-1 rounded-xl border border-neutral-700">
          <button
            onClick={() => setGridSubTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              gridSubTab === 'all'
                ? 'bg-[#FFC107] text-[#121212] shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🌟 All
          </button>
          <button
            onClick={() => setGridSubTab('recently_viewed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              gridSubTab === 'recently_viewed'
                ? 'bg-[#FFC107] text-[#121212] shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🕒 Recent</span>
            {viewedCount > 0 && (
              <span className={`px-1 py-0.2 rounded-full text-[10px] ${gridSubTab === 'recently_viewed' ? 'bg-[#121212] text-[#FFC107]' : 'bg-neutral-800 text-neutral-300'}`}>
                {viewedCount}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        {/* Ghost Mode Stealth Badge */}
        {currentUser?.isGhostMode && (
          <div className="flex items-center gap-1 bg-neutral-800 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-full text-xs font-bold shadow-md" title="Ghost Mode Active: Browsing stealthily">
            <EyeOff className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Ghost</span>
          </div>
        )}

        {/* Language Selector */}
        <div className="relative flex items-center bg-[#252525] border border-neutral-700 rounded-xl px-2 py-1 text-xs">
          <Globe className="w-3.5 h-3.5 text-neutral-400 mr-1" />
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-transparent text-white text-xs outline-none cursor-pointer"
            title="Select App Language"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[#1A1A1A] text-white">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Boost Feature Button / Countdown */}
        {boostActiveUntil && boostActiveUntil > Date.now() ? (
          <div className="flex items-center gap-1 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-black shadow-lg animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Boost: {timeLeft || '30:00'}</span>
          </div>
        ) : (
          <button
            onClick={onActivateBoost}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black px-3 py-1.5 rounded-full text-xs font-extrabold shadow transition active:scale-95"
            title="Boost profile for 30 minutes"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Boost</span>
          </button>
        )}
        {/* Buzz Simulator */}
        <BuzzSimulator
          profiles={profiles}
          onTriggerBuzzEvent={onTriggerBuzzEvent}
          autoSimulatorActive={autoSimulatorActive}
          setAutoSimulatorActive={setAutoSimulatorActive}
        />

        {/* Notifications / Buzz Feed Bell */}
        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-xl bg-[#252525] hover:bg-[#333333] border border-neutral-700 text-neutral-200 transition relative"
          title="Buzz & Notification Feed"
        >
          <Bell className="w-5 h-5 text-[#FFC107]" />
          {unreadBuzzCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FFC107] text-[#121212] font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-[#1A1A1A] animate-bounce">
              {unreadBuzzCount}
            </span>
          )}
        </button>

        {/* Share Location Button */}
        <button
          onClick={onShareLocation}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#252525] hover:bg-[#333333] border border-neutral-700 text-[#FFC107] font-semibold text-xs shadow transition active:scale-95"
          title="Share Approximate Location & Sort by Proximity"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Location</span>
        </button>

        {/* Subscription / Pass Status Button */}
        <button
          onClick={onOpenSubscription}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-[#FFC107]/40 text-[#FFC107] font-bold text-xs shadow hover:bg-amber-500/30 transition active:scale-95"
          title="Profile Passes & Subscription"
        >
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>
            {subscription.type !== 'none' && subscription.expiresAt > Date.now()
              ? `Pass Active (${subscription.type})`
              : `Free: ${Math.min(viewedCount, 20)}/20`}
          </span>
        </button>







        {/* Getting Started Guide button */}
        {onOpenGettingStarted && (
          <button
            onClick={onOpenGettingStarted}
            className="p-2 rounded-xl bg-[#252525] hover:bg-[#333333] border border-neutral-700 text-neutral-200 transition relative"
            title="Getting Started Guide"
          >
            <Sparkles className="w-5 h-5 text-[#FFC107]" />
          </button>
        )}

        {/* Filter button */}
        <button
          onClick={onOpenFilters}
          className="p-2 rounded-xl bg-[#252525] hover:bg-[#333333] border border-neutral-700 text-neutral-200 transition relative"
          title="Filter profiles"
        >
          <SlidersHorizontal className="w-5 h-5 text-[#FFC107]" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-[#252525] hover:bg-[#333333] border border-neutral-700 text-neutral-200 transition relative"
          title="App Settings & Privacy"
        >
          <Settings className="w-5 h-5 text-[#FFC107]" />
        </button>
      </div>
    </header>
  );
};

