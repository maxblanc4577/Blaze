import React from 'react';
import { ChatConversation } from '../types';
import { MessageSquare, ChevronRight, Sparkles } from 'lucide-react';

interface ChatListViewProps {
  conversations: ChatConversation[];
  onSelectChat: (conv: ChatConversation) => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({ conversations, onSelectChat }) => {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 text-neutral-400">
        <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mb-4 text-[#FFC107]">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-white font-bold text-lg mb-1">No Messages Yet</h2>
        <p className="text-sm max-w-xs text-neutral-400">
          Tap on profiles in the grid or send an icebreaker to start a conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-2 pb-24">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-bold text-lg">Conversations</h2>
        <span className="text-xs bg-[#252525] text-neutral-400 px-2.5 py-1 rounded-full border border-neutral-800">
          {conversations.length} active
        </span>
      </div>

      <div className="space-y-2">
        {conversations.map((conv) => {
          const profile = conv.profile;
          const timeString = new Date(conv.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={conv.id}
              onClick={() => onSelectChat(conv)}
              className="bg-[#1E1E1E] hover:bg-[#252525] border border-neutral-800 rounded-xl p-3.5 flex items-center space-x-3.5 cursor-pointer transition relative group"
            >
              {/* Avatar with online status */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800">
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1E1E1E] ${
                    profile.status === 'online' ? 'bg-emerald-500' : 'bg-neutral-500'
                  }`}
                />
              </div>

              {/* Chat details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold text-base truncate flex items-center gap-1.5">
                    <span>{profile.name}</span>
                    <span className="text-xs font-normal text-neutral-400">{profile.age}</span>
                  </h3>
                  <span className="text-[11px] text-neutral-400 flex-shrink-0">{timeString}</span>
                </div>
                <p className="text-sm text-neutral-300 truncate pr-4">
                  {conv.lastMessage || 'Say hello...'}
                </p>
              </div>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
                <div className="bg-[#FFC107] text-[#121212] font-black text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 shadow">
                  {conv.unreadCount}
                </div>
              )}

              <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
