import React, { useState } from 'react';
import { ChatConversation } from '../types';
import { MessageSquare, ChevronRight, Archive, ArchiveRestore, Trash2, CheckSquare, Square } from 'lucide-react';

interface ChatListViewProps {
  conversations: ChatConversation[];
  onSelectChat: (conv: ChatConversation) => void;
  onToggleArchive: (conversationId: string) => void;
  onBulkArchive: (conversationIds: string[]) => void;
  onBulkDelete: (conversationIds: string[]) => void;
}

export const ChatListView: React.FC<ChatListViewProps> = ({
  conversations,
  onSelectChat,
  onToggleArchive,
  onBulkArchive,
  onBulkDelete,
}) => {
  const [subTab, setSubTab] = useState<'inbox' | 'archived'>('inbox');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const inboxConversations = conversations.filter(c => !c.isArchived);
  const archivedConversations = conversations.filter(c => c.isArchived);

  const displayList = subTab === 'inbox' ? inboxConversations : archivedConversations;

  const toggleSelectAll = () => {
    if (selectedIds.length === displayList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayList.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Conversations</h2>
        
        {/* Tabs for Inbox / Archived */}
        <div className="flex items-center space-x-1 bg-[#1A1A1A] border border-neutral-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setSubTab('inbox'); setSelectedIds([]); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'inbox'
                ? 'bg-[#FFC107] text-[#121212] shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Inbox ({inboxConversations.length})
          </button>
          <button
            type="button"
            onClick={() => { setSubTab('archived'); setSelectedIds([]); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              subTab === 'archived'
                ? 'bg-[#FFC107] text-[#121212] shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived ({archivedConversations.length})</span>
          </button>
        </div>
      </div>

      {/* Multi-Select Action Toolbar */}
      {displayList.length > 0 && (
        <div className="flex items-center justify-between bg-[#1A1A1A] border border-neutral-800 px-4 py-2.5 rounded-xl text-xs">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-neutral-300 hover:text-white font-medium"
          >
            {selectedIds.length === displayList.length && displayList.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-[#FFC107]" />
            ) : (
              <Square className="w-4 h-4 text-neutral-400" />
            )}
            <span>Select All ({displayList.length})</span>
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-amber-400 font-bold">{selectedIds.length} selected</span>
              <button
                type="button"
                onClick={() => {
                  onBulkArchive(selectedIds);
                  setSelectedIds([]);
                }}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold rounded-lg flex items-center gap-1 transition"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{subTab === 'inbox' ? 'Archive Selected' : 'Unarchive Selected'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedIds.length} conversation(s)?`)) {
                    onBulkDelete(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg flex items-center gap-1 transition border border-red-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          )}
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 text-neutral-400">
          <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mb-4 text-[#FFC107]">
            {subTab === 'inbox' ? <MessageSquare className="w-8 h-8" /> : <Archive className="w-8 h-8" />}
          </div>
          <h2 className="text-white font-bold text-lg mb-1">
            {subTab === 'inbox' ? 'No Conversations Yet' : 'No Archived Conversations'}
          </h2>
          <p className="text-sm max-w-xs text-neutral-400">
            {subTab === 'inbox'
              ? 'Tap on profiles in the grid or send an icebreaker to start a conversation!'
              : 'Chats you archive from your inbox will appear here without losing history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayList.map((conv) => {
            const profile = conv.profile;
            const timeString = new Date(conv.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const isSelected = selectedIds.includes(conv.id);

            return (
              <div
                key={conv.id}
                onClick={(e) => toggleSelectOne(conv.id, e)}
                className={`border rounded-xl p-3.5 flex items-center space-x-3.5 cursor-pointer transition relative group ${
                  isSelected
                    ? 'bg-amber-500/10 border-[#FFC107]'
                    : 'bg-[#1E1E1E] hover:bg-[#252525] border-neutral-800'
                }`}
              >
                {/* Checkbox for Multi-select */}
                <button
                  type="button"
                  onClick={(e) => toggleSelectOne(conv.id, e)}
                  className="text-neutral-400 hover:text-white flex-shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-[#FFC107]" />
                  ) : (
                    <Square className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400" />
                  )}
                </button>

                <div
                  onClick={() => onSelectChat(conv)}
                  className="flex items-center space-x-3.5 flex-1 min-w-0"
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
                </div>

                {/* Unread badge */}
                {conv.unreadCount > 0 && (
                  <div className="bg-[#FFC107] text-[#121212] font-black text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 shadow">
                    {conv.unreadCount}
                  </div>
                )}

                {/* Archive / Unarchive Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleArchive(conv.id);
                  }}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition shadow-sm"
                  title={conv.isArchived ? 'Unarchive chat' : 'Archive chat'}
                >
                  {conv.isArchived ? <ArchiveRestore className="w-4 h-4 text-amber-400" /> : <Archive className="w-4 h-4 text-neutral-400 hover:text-amber-400" />}
                </button>

                <ChevronRight onClick={() => onSelectChat(conv)} className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
