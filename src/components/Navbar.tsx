import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Flame, Sparkles, MapPin, Bell, Users, Sun, Moon, Globe, Zap, EyeOff, Settings, Crown, ShieldCheck, Smartphone } from 'lucide-react';
import { BuzzSimulator } from './BuzzSimulator';
import { UserProfile } from '../types';
import { BuzzEvent } from '../utils/buzz';

interface NavbarProps {
  onOpenFilters: () => void;
  onShareLocation: () => void;
  onOpenContacts: () => void;
  onOpenSettings: () => void;
  onOpenDownloadApp: () => void;
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
  currentUser?: UserProfile;
  onOpenSubscription: () => void;
  viewedCount: number;
  subscription: { type: string; expiresAt: number };
  gridSubTab?: 'all' | 'recently_viewed';
  setGridSubTab?: (tab: 'all' | 'recently_viewed') => void;
  onOpenAdmin: () => void;
  deviceMode: 'responsive' | 'ios' | 'android';
  onDeviceModeChange: (mode: 'responsive' | 'ios' | 'android') => void;
  boostActiveUntil?: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenFilters,
  onShareLocation,
  onOpenContacts,
  onOpenSettings,
  onOpenDownloadApp,
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
  currentUser,
  onOpenSubscription,
  viewedCount,
  subscription,
  gridSubTab,
  setGridSubTab,
  onOpenAdmin,
  deviceMode,
  onDeviceModeChange,
  boostActiveUntil,
}) => {
  const [remainingBoostMs, setRemainingBoostMs] = useState<number>(0);

  useEffect(() => {
    if (!boostActiveUntil) {
      setRemainingBoostMs(0);
      return;
    }
    const update = () => {
      const diff = boostActiveUntil - Date.now();
      if (diff <= 0) {
        setRemainingBoostMs(0);
      } else {
        setRemainingBoostMs(diff);
      }
    };
    update();
    const interval = setInterval(update, 1000);
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



      <div className="flex items-center space-x-2">
        {/* Active Boost Progress & Countdown Timer */}
        {remainingBoostMs > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 px-3 py-1 rounded-xl shadow-inner animate-pulse">
            <Zap className="w-4 h-4 text-[#FFC107] animate-bounce" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFC107]">
                <span>⚡ Boost Active</span>
                <span className="font-mono text-[10px] bg-black/50 px-1.5 py-0.2 rounded text-white">
                  {Math.floor(remainingBoostMs / 60000)}m {Math.floor((remainingBoostMs % 60000) / 1000)}s
                </span>
              </div>
              <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000"
                  style={{ width: `${Math.max(0, Math.min(100, (remainingBoostMs / (30 * 60 * 1000)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        )}

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







        {/* Grid size toggler */}
        <div className="hidden lg:flex items-center bg-[#252525] rounded-lg p-0.5 border border-neutral-700">
          {[3, 4, 5].map((cols) => (
            <button
              key={cols}
              onClick={() => setGridColumns(cols)}
              className={`px-2.5 py-1 text-xs rounded-md transition ${
                gridColumns === cols
                  ? 'bg-[#FFC107] text-[#121212] font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cols}x
            </button>
          ))}
        </div>

        {/* Filter button */}
        <button
          onClick={onOpenFilters}
          className="p-2 rounded-xl bg-[#252525] hover:bg-[#333333] border border-neutral-700 text-neutral-200 transition relative"
          title="Filter profiles"
        >
          <SlidersHorizontal className="w-5 h-5 text-[#FFC107]" />
        </button>

        {/* Device Mode Switcher */}
        <div className="hidden xl:flex items-center bg-[#252525] p-1 rounded-xl border border-neutral-700">
          <button
            onClick={() => onDeviceModeChange('responsive')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition flex items-center gap-1 ${
              deviceMode === 'responsive' ? 'bg-[#FFC107] text-[#121212]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Desktop / Web Responsive View"
          >
            <span>💻 Web</span>
          </button>
          <button
            onClick={() => onDeviceModeChange('ios')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition flex items-center gap-1 ${
              deviceMode === 'ios' ? 'bg-[#FFC107] text-[#121212]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Apple iOS 18 iPhone Simulator"
          >
            <span>🍎 iOS</span>
          </button>
          <button
            onClick={() => onDeviceModeChange('android')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition flex items-center gap-1 ${
              deviceMode === 'android' ? 'bg-[#FFC107] text-[#121212]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Android 15 Pixel Simulator"
          >
            <span>🤖 Android</span>
          </button>
        </div>

        {/* Download App button */}
        <button
          onClick={onOpenDownloadApp}
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow transition active:scale-95"
          title="Download Mobile App for Android & iOS"
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Get App</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-[#252525] hover:bg-[#333333] border border-neutral-700 text-neutral-200 transition relative"
          title="App Settings & Privacy"
        >
          <Settings className="w-5 h-5 text-[#FFC107]" />
        </button>

        {/* Admin Portal Button */}
        <button
          onClick={onOpenAdmin}
          className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 transition relative"
          title="Admin Portal & Moderation"
        >
          <ShieldCheck className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

