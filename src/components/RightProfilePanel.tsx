import React from 'react';
import { UserProfile } from '../types';

interface RightProfilePanelProps {
  profile: UserProfile | null;
  onClose: () => void;
  onStartChat: (profile: UserProfile) => void;
  onSendTap: (profile: UserProfile) => void;
}

export const RightProfilePanel: React.FC<RightProfilePanelProps> = ({ profile, onClose, onStartChat, onSendTap }) => {
  if (!profile) return null;
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-900 text-white shadow-2xl p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{profile.name}</h3>
        <button onClick={onClose} className="text-stone-400 hover:text-white">✕</button>
      </div>
      <img src={profile.photos[0]} alt={profile.name} className="w-full h-72 object-cover rounded-xl mb-4" referrerPolicy="no-referrer" />
      <p className="text-stone-300 mb-4">{profile.aboutMe || profile.headline}</p>
      <div className="flex gap-3">
        <button onClick={() => onStartChat(profile)} className="flex-1 bg-orange-600 py-2.5 rounded-xl font-medium">Chat</button>
        <button onClick={() => onSendTap(profile)} className="flex-1 bg-stone-800 py-2.5 rounded-xl font-medium">Tap 🔥</button>
      </div>
    </div>
  );
};
