import React from 'react';
import { X, Eye, Shield, Bell, Moon, Sun, Globe, Plane, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  readReceiptsEnabled: boolean;
  onToggleReadReceipts: (val: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  travelModeEnabled: boolean;
  onToggleTravelMode: (val: boolean) => void;
  travelCity: string;
  onTravelCityChange: (city: string) => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  readReceiptsEnabled,
  onToggleReadReceipts,
  isDarkMode,
  onToggleTheme,
  currentLanguage,
  onLanguageChange,
  travelModeEnabled,
  onToggleTravelMode,
  travelCity,
  onTravelCityChange,
  accentColor,
  onAccentColorChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#222222]">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-base font-bold text-white">App Settings & Privacy</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Travel Mode Toggle */}
          <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Travel Mode (48h)</h4>
                  <p className="text-xs text-neutral-400">Browse and connect in another city.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={travelModeEnabled}
                  onChange={(e) => onToggleTravelMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC107]"></div>
              </label>
            </div>
            {travelModeEnabled && (
              <div className="pt-2 border-t border-neutral-800">
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Select Destination City</label>
                <select
                  value={travelCity}
                  onChange={(e) => onTravelCityChange(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                >
                  <option value="London, UK">London, UK</option>
                  <option value="Tokyo, Japan">Tokyo, Japan</option>
                  <option value="New York, USA">New York, USA</option>
                  <option value="Berlin, Germany">Berlin, Germany</option>
                  <option value="Sydney, Australia">Sydney, Australia</option>
                  <option value="Paris, France">Paris, France</option>
                </select>
              </div>
            )}
          </div>

          {/* Read Receipts Toggle */}
          <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Read Receipts</h4>
                <p className="text-xs text-neutral-400">Let others know when you've read their messages.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={readReceiptsEnabled}
                onChange={(e) => onToggleReadReceipts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC107]"></div>
            </label>
          </div>

          {/* Theme Preference */}
          <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Dark Appearance</h4>
                <p className="text-xs text-neutral-400">Toggle dark / light mode interface.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={onToggleTheme}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC107]"></div>
            </label>
          </div>

          {/* Theme Accent Customization */}
          <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Interface Accent Color</h4>
                <p className="text-xs text-neutral-400">Customize your Spark branding accent.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              {[
                { name: 'Gold', value: '#FFC107' },
                { name: 'Emerald', value: '#10B981' },
                { name: 'Cyan', value: '#06B6D4' },
                { name: 'Violet', value: '#8B5CF6' },
                { name: 'Rose', value: '#F43F5E' },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => onAccentColorChange(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    accentColor === c.value ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Language Preference */}
          <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Language</h4>
                <p className="text-xs text-neutral-400">Choose your preferred app language.</p>
              </div>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-xs px-3 py-2 rounded-xl outline-none"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-[#222222] border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-xs hover:opacity-90 transition shadow"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

