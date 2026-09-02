import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Sparkles, Image as ImageIcon, Users, MapPin, CheckCircle2, MessageSquare, Flame } from 'lucide-react';

interface NewActivityAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  currentArea: string;
}

export const NewActivityAreaModal: React.FC<NewActivityAreaModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onSelectProfile,
  currentArea,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'new_photos' | 'new_users'>('new_photos');
  const [radiusMiles, setRadiusMiles] = useState<number>(25);

  if (!isOpen) return null;

  // Filter profiles by selected radius in miles and not blocked
  const areaProfiles = profiles.filter(p => !p.isBlocked && (p.distance || 5) <= radiusMiles);

  // New photo updates (profiles with recent lastPhotoUpdated or multiple photos)
  const newPhotoProfiles = areaProfiles.filter(p => p.lastPhotoUpdated || p.photos.length >= 2).slice(0, 12);

  // New users in area (profiles with isNewUser === true or recent id)
  const newUserProfiles = areaProfiles.filter(p => p.isNewUser || p.id.includes('user-3') || p.id.includes('user-4')).slice(0, 12);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-[#161616]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Area Activity & New Profiles</h3>
              <p className="text-[11px] text-neutral-400">Recent photo updates & new members in {currentArea}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radius Toggle Bar (Miles) */}
        <div className="bg-[#181818] border-b border-neutral-800 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Adjust Area Radius:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[5, 10, 25, 50, 100].map((miles) => (
              <button
                key={miles}
                onClick={() => setRadiusMiles(miles)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  radiusMiles === miles
                    ? 'bg-[#FFC107] text-[#121212] shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {miles} mi
              </button>
            ))}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-neutral-800 bg-[#141414] px-4 gap-2">
          <button
            onClick={() => setActiveSubTab('new_photos')}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition ${
              activeSubTab === 'new_photos'
                ? 'border-[#FFC107] text-[#FFC107]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>📸 New Photo Updates ({newPhotoProfiles.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('new_users')}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition ${
              activeSubTab === 'new_users'
                ? 'border-[#FFC107] text-[#FFC107]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>🌟 New Users in Area ({newUserProfiles.length})</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeSubTab === 'new_photos' ? (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Profiles nearby that have recently added or updated their photos. Check out their latest looks!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newPhotoProfiles.map(p => (
                  <div
                    key={`photo-${p.id}`}
                    onClick={() => {
                      onSelectProfile(p);
                      onClose();
                    }}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition group"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={p.photos[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> New Photo
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{p.name}, {p.age}</h4>
                        <span className="text-[10px] text-emerald-400 font-medium">{p.distance} mi</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{p.headline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                New members who just joined Blaze in your area. Say hello and be one of their first connections!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newUserProfiles.map(p => (
                  <div
                    key={`new-${p.id}`}
                    onClick={() => {
                      onSelectProfile(p);
                      onClose();
                    }}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition group"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={p.photos[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow">
                        🌟 New User
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{p.name}, {p.age}</h4>
                        <span className="text-[10px] text-emerald-400 font-medium">{p.distance} mi</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{p.headline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
