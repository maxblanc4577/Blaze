import React from 'react';
import { Grid, Flame, Star, MessageSquare, User, MapPin, Compass } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadChatCount: number;
  unreadTapsCount: number;
  currentLanguage: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadChatCount,
  unreadTapsCount,
  currentLanguage,
}) => {
  const tabs = [
    { id: 'grid', label: getTranslation(currentLanguage, 'grid'), icon: Grid },
    { id: 'map', label: getTranslation(currentLanguage, 'map'), icon: MapPin },
    { id: 'tribes', label: getTranslation(currentLanguage, 'tribes'), icon: Compass },
    { id: 'taps', label: getTranslation(currentLanguage, 'taps'), icon: Flame, badge: unreadTapsCount },
    { id: 'favorites', label: getTranslation(currentLanguage, 'favorites'), icon: Star },
    { id: 'chats', label: getTranslation(currentLanguage, 'chats'), icon: MessageSquare, badge: unreadChatCount },
    { id: 'profile', label: getTranslation(currentLanguage, 'profile'), icon: User },
  ];

  return (
    <nav aria-label="Main Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] border-t border-neutral-800 pb-safe">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition relative ${
                isActive ? 'text-[#FFC107]' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#FFC107] text-[#121212] font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-[#1A1A1A]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium ${isActive ? 'text-[#FFC107]' : 'text-neutral-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-[#FFC107] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
