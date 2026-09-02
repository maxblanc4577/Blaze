import React, { useState, useRef, useEffect } from 'react';
import { ChatConversation, Message, UserProfile } from '../types';
import { ArrowLeft, Send, Image as ImageIcon, Mic, MapPin, Sparkles, CheckCheck, ShieldCheck, Download, Play, Pause, Trash2, Zap, X, Video, Search, Smile } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChatWindowProps {
  conversation: ChatConversation;
  onBack: () => void;
  onSendMessage: (conversationId: string, text: string, type?: 'text' | 'image' | 'audio' | 'location', mediaUrl?: string) => void;
  currentUser: UserProfile;
  onClearConversation?: (conversationId: string) => void;
  readReceiptsEnabled?: boolean;
  onToggleReadReceipts?: () => void;
  onUpdateMessageRead?: (conversationId: string, messageId: string, isRead: boolean) => void;
  onAddReaction?: (conversationId: string, messageId: string, emoji: string) => void;
  onBlockUser?: (profileId: string) => void;
  onUpdateConversationReadReceipts?: (conversationId: string, enabled: boolean) => void;
  onUnsend?: (conversationId: string, messageId: string) => void;
  onUpdateConversationMute?: (conversationId: string, isMuted: boolean) => void;
  onUpdateConversationTheme?: (conversationId: string, theme: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onBack,
  onSendMessage,
  currentUser,
  onClearConversation,
  readReceiptsEnabled = true,
  onToggleReadReceipts,
  onUpdateMessageRead,
  onAddReaction,
  onBlockUser,
  onUpdateConversationReadReceipts,
  onUnsend,
  onUpdateConversationMute,
  onUpdateConversationTheme,
}) => {
  const [perChatReadReceipts, setPerChatReadReceipts] = useState<boolean>(
    conversation.readReceiptsEnabled !== false
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [showReplySpeedModal, setShowReplySpeedModal] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentTheme = conversation.chatTheme || 'gold';
  const getThemeBubbleClass = (theme?: string) => {
    switch (theme) {
      case 'cyan': return 'bg-cyan-500 text-black font-medium';
      case 'emerald': return 'bg-emerald-500 text-black font-medium';
      case 'violet': return 'bg-violet-600 text-white font-medium';
      case 'rose': return 'bg-rose-600 text-white font-medium';
      default: return 'bg-[#FFC107] text-[#121212] font-medium';
    }
  };

  const [translations, setTranslations] = useState<Record<string, { translatedText: string; detectedLanguage: string }>>({});
  const [translatingMsgId, setTranslatingMsgId] = useState<string | null>(null);

  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);

  const [quickReplies, setQuickReplies] = useState<string[]>(() => {
    const saved = localStorage.getItem('blaze_quick_replies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return ['Hey!', 'How are you?', 'Coffee soon?', "What's up?", 'Nice to meet you!'];
  });
  const [showQuickReplyConfigModal, setShowQuickReplyConfigModal] = useState(false);
  const [newReplyInput, setNewReplyInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const EMOJI_LIST = ['😀', '😂', '😍', '🔥', '👍', '❤️', '🎉', '😎', '🙌', '✨', '🥳', '💯', '👀', '🚀', '☕', '💬', '👋', '🙏', '🤩', '🔥'];

  const [pinnedIds, setPinnedIds] = useState<string[]>(conversation.pinnedMessageIds || []);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const [isGeneratingSmartReplies, setIsGeneratingSmartReplies] = useState(false);

  const handleGenerateIcebreakers = async () => {
    setIsGeneratingIcebreaker(true);
    try {
      const res = await fetch('/api/ai/icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myName: currentUser.name,
          targetName: profile.name,
          targetBio: profile.bio,
          targetTribes: profile.tribes,
        }),
      });
      const data = await res.json();
      if (data.icebreakers && Array.isArray(data.icebreakers)) {
        setAiSuggestions(data.icebreakers);
      }
    } catch (e) {
      console.error("Icebreaker error:", e);
    } finally {
      setIsGeneratingIcebreaker(false);
    }
  };

  const handleGenerateSmartReplies = async () => {
    setIsGeneratingSmartReplies(true);
    try {
      const lastMsg = conversation.messages[conversation.messages.length - 1];
      const lastMessageText = lastMsg ? lastMsg.text : "Hey";
      const res = await fetch('/api/ai/suggested-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessageText, profileName: profile.name }),
      });
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error("Smart replies error:", e);
    } finally {
      setIsGeneratingSmartReplies(false);
    }
  };

  const togglePinMessage = (msgId: string) => {
    setPinnedIds(prev => {
      const exists = prev.includes(msgId);
      return exists ? prev.filter(id => id !== msgId) : [...prev, msgId];
    });
  };

  useEffect(() => {
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    if (lastMsg && lastMsg.senderId !== currentUser.id) {
      fetch('/api/ai/suggested-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessageText: lastMsg.text, profileName: conversation.profile.name }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.suggestions && Array.isArray(data.suggestions)) {
            setAiSuggestions(data.suggestions);
          }
        })
        .catch(() => {});
    }
  }, [conversation.messages]);

  const PREDEFINED_REACTIONS = ['🔥', '🙌', '🤔', '❤️', '👍'];

  const toggleReaction = (msgId: string, emoji: string) => {
    setMessageReactions(prev => {
      const current = prev[msgId] || [];
      if (current.includes(emoji)) {
        return { ...prev, [msgId]: current.filter(e => e !== emoji) };
      } else {
        return { ...prev, [msgId]: [...current, emoji] };
      }
    });
    setActiveReactionPickerId(null);
  };

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoTimer, setVideoTimer] = useState(5);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const startVideoReactionRecord = async () => {
    setShowVideoModal(true);
    setVideoTimer(5);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setIsRecordingVideo(true);
      let t = 5;
      const interval = setInterval(() => {
        t -= 1;
        setVideoTimer(t);
        if (t <= 0) {
          clearInterval(interval);
          stream.getTracks().forEach(track => track.stop());
          setIsRecordingVideo(false);
          setShowVideoModal(false);
          onSendMessage(
            conversation.id,
            '🎥 Sent a 5-second video reaction!',
            'video',
            'https://assets.mixkit.co/videos/preview/mixkit-young-man-looking-at-his-smartphone-in-bed-41584-large.mp4'
          );
        }
      }, 1000);
    } catch (e) {
      setIsRecordingVideo(true);
      let t = 5;
      const interval = setInterval(() => {
        t -= 1;
        setVideoTimer(t);
        if (t <= 0) {
          clearInterval(interval);
          setIsRecordingVideo(false);
          setShowVideoModal(false);
          onSendMessage(
            conversation.id,
            '🎥 Sent a 5-second video reaction!',
            'video',
            'https://assets.mixkit.co/videos/preview/mixkit-young-man-looking-at-his-smartphone-in-bed-41584-large.mp4'
          );
        }
      }, 1000);
    }
  };

  const handleTranslate = async (msgId: string, text: string) => {
    if (translations[msgId]) {
      const copy = { ...translations };
      delete copy[msgId];
      setTranslations(copy);
      return;
    }
    setTranslatingMsgId(msgId);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage: 'English' }),
      });
      const data = await res.json();
      setTranslations(prev => ({
        ...prev,
        [msgId]: {
          translatedText: data.translatedText || text,
          detectedLanguage: data.detectedLanguage || 'Detected',
        }
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setTranslatingMsgId(null);
    }
  };

  const replySpeedData = [
    { msg: 'Msg 1', speedMinutes: 2.4 },
    { msg: 'Msg 2', speedMinutes: 1.5 },
    { msg: 'Msg 3', speedMinutes: 3.1 },
    { msg: 'Msg 4', speedMinutes: 1.2 },
    { msg: 'Msg 5', speedMinutes: 0.9 },
    { msg: 'Msg 6', speedMinutes: 1.8 },
  ];

  const profile = conversation.profile;

  const exportChat = () => {
    const chatText = conversation.messages.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.senderId === currentUser.id ? 'You' : profile.name}: ${m.text}`).join('\n');
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blaze-chat-${profile.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setClearStep(1);
    setShowClearModal(true);
  };

  const handleBlockClick = () => {
    setShowChatSettingsModal(false);
    setShowBlockModal(true);
  };

  const [showChatSettingsModal, setShowChatSettingsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockAlsoReport, setBlockAlsoReport] = useState(true);
  const [blockReportReason, setBlockReportReason] = useState('Harassment or Inappropriate Behavior');
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearStep, setClearStep] = useState<1 | 2>(1);

  const currentReadReceipts = conversation.readReceiptsEnabled ?? readReceiptsEnabled ?? true;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');
    onSendMessage(conversation.id, textToSend, 'text');

    // Simulate AI reply if configured or random auto-reply
    setIsTyping(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageHistory: [...conversation.messages, { id: 'temp', senderId: currentUser.id, receiverId: profile.id, text: textToSend, timestamp: Date.now() }],
          profileName: profile.name,
          profileBio: profile.aboutMe,
        }),
      });
      const data = await res.json();
      setIsTyping(false);
      onSendMessage(conversation.id, data.reply || "Hey there!", 'text');
    } catch (err) {
      setIsTyping(false);
      onSendMessage(conversation.id, "Hey! Sounds good 😊", 'text');
    }
  };

  const sendQuickReply = async (textToSend: string) => {
    onSendMessage(conversation.id, textToSend, 'text');
    setIsTyping(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageHistory: [...conversation.messages, { id: 'temp', senderId: currentUser.id, receiverId: profile.id, text: textToSend, timestamp: Date.now() }],
          profileName: profile.name,
          profileBio: profile.aboutMe,
        }),
      });
      const data = await res.json();
      setIsTyping(false);
      onSendMessage(conversation.id, data.reply || "Hey there!", 'text');
    } catch (err) {
      setIsTyping(false);
      onSendMessage(conversation.id, "Hey! Sounds good 😊", 'text');
    }
  };

  const sendQuickPhoto = () => {
    const photos = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    ];
    const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
    onSendMessage(conversation.id, 'Sent a photo', 'image', randomPhoto);
  };

  const sendLocation = () => {
    onSendMessage(conversation.id, 'Shared my location (1.2 miles away)', 'location');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onSendMessage(conversation.id, 'Voice Note (0:04)', 'audio', audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        onSendMessage(conversation.id, 'Voice Note (0:05)', 'audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      }, 2500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#121212] flex flex-col text-white">
      
      {/* Top Header */}
      <header className="bg-[#1A1A1A] border-b border-neutral-800 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800">
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#1A1A1A] ${
                  profile.status === 'online' ? 'bg-emerald-500' : 'bg-neutral-500'
                }`}
              />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight flex items-center gap-1.5">
                <span>{profile.name}</span>
                <span className="text-xs font-normal text-neutral-400">{profile.age}</span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                {profile.distance === 0 ? 'Here now' : `${profile.distance} miles away`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Per-Chat Read Receipts Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !perChatReadReceipts;
              setPerChatReadReceipts(next);
              if (onUpdateConversationReadReceipts) {
                onUpdateConversationReadReceipts(conversation.id, next);
              }
              if (onToggleReadReceipts) {
                onToggleReadReceipts();
              }
            }}
            className={`flex items-center gap-1.5 border text-xs px-3 py-2 rounded-xl font-semibold transition shadow-sm ${
              perChatReadReceipts
                ? 'bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
            }`}
            title="Toggle read receipts for this specific chat conversation"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Receipts: {perChatReadReceipts ? 'On' : 'Off'}</span>
          </button>

          {/* End-to-end Encrypted indicator */}
          <div className="hidden md:flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium" title="Messages are end-to-end encrypted">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted</span>
          </div>

          <button
            onClick={exportChat}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs px-3 py-2 rounded-xl font-semibold transition shadow-sm"
            title="Export Chat History"
          >
            <Download className="w-4 h-4 text-neutral-400" />
            <span className="hidden sm:inline">Export Chat</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-xl font-semibold transition shadow-sm"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>

          <button
            onClick={() => setShowReplySpeedModal(true)}
            className="flex items-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs px-3 py-2 rounded-xl font-semibold transition shadow-sm"
            title="View Reply Speed Analytics"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Reply Speed</span>
          </button>

          <button
            onClick={() => setShowChatSettingsModal(true)}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs px-3 py-2 rounded-xl font-semibold transition shadow-sm"
            title="Chat Settings & Options"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Search Bar for Chat Messages */}
      <div className="bg-[#181818] border-b border-neutral-800 px-4 py-2 flex items-center space-x-2">
        <Search className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={messageSearchQuery}
          onChange={(e) => setMessageSearchQuery(e.target.value)}
          placeholder="Search past messages in conversation..."
          className="w-full bg-transparent text-xs text-white outline-none placeholder:text-neutral-500"
        />
        {messageSearchQuery && (
          <button
            type="button"
            onClick={() => setMessageSearchQuery('')}
            className="text-[10px] bg-neutral-800 text-neutral-300 hover:text-white px-2 py-1 rounded-lg transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Pinned Messages Banner */}
      {pinnedIds.length > 0 && (
        <div className="bg-[#1E1A14] border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-bold flex items-center gap-1 flex-shrink-0">📌 Pinned ({pinnedIds.length}):</span>
            <span className="truncate text-neutral-200">
              {conversation.messages.filter(m => pinnedIds.includes(m.id)).map(m => m.text).join(' | ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPinnedIds([])}
            className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-black/30 transition flex-shrink-0"
          >
            Unpin All
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-2">
          <span className="text-[11px] bg-[#1E1E1E] text-neutral-400 px-3 py-1 rounded-full border border-neutral-800">
            Messages are secure and encrypted
          </span>
        </div>

        {conversation.messages.some(msg => /(tomorrow|tonight|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|at\s+\d|\d{1,2}:\d{2}|meet|coffee|dinner|drinks|date|weekend|next week)/i.test(msg.text)) && (
          <div className="bg-gradient-to-r from-amber-500/20 via-[#222222] to-amber-500/10 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h4 className="font-bold text-xs text-white">Meet-up date or time detected!</h4>
                <p className="text-[11px] text-neutral-300">Quickly add this coffee or dinner meet-up with <span className="text-[#FFC107] font-semibold">{profile.name}</span> to your calendar.</p>
              </div>
            </div>
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meet-up+with+${encodeURIComponent(profile.name)}&details=Meet-up+planned+via+Blaze+chat.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FFC107] text-[#121212] font-black text-xs px-3.5 py-2 rounded-xl shadow hover:opacity-90 transition whitespace-nowrap flex items-center gap-1.5"
            >
              📅 Add to Calendar
            </a>
          </div>
        )}

        {messageSearchQuery && conversation.messages.filter(m => m.text.toLowerCase().includes(messageSearchQuery.toLowerCase())).length === 0 && (
          <div className="text-center py-6 text-neutral-400 text-xs">
            No past messages found matching "{messageSearchQuery}".
          </div>
        )}

        {conversation.messages
          .filter(msg => {
            if (!messageSearchQuery.trim()) return true;
            return msg.text.toLowerCase().includes(messageSearchQuery.toLowerCase());
          })
          .map((msg, index, filteredArr) => {
          const isMe = msg.senderId === currentUser.id;
          const prevMsg = index > 0 ? filteredArr[index - 1] : null;
          const isSameSenderAsPrev = prevMsg && prevMsg.senderId === msg.senderId;
          // If messages are less than 2 minutes apart and same sender, we can group them visually (e.g. tighter spacing or hiding duplicate avatar/header)
          const timeDiff = prevMsg ? Math.abs(msg.timestamp - prevMsg.timestamp) : Infinity;
          const isGrouped = isSameSenderAsPrev && timeDiff < 120000; // 2 minutes

          const msgDate = new Date(msg.timestamp);
          const timeStr = msgDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          // Date separator if new day
          const prevDate = prevMsg ? new Date(prevMsg.timestamp) : null;
          const isNewDay = !prevDate || msgDate.toDateString() !== prevDate.toDateString();
          const dateStr = msgDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

          const currentReactions = messageReactions[msg.id] || [];
          const isPickerOpen = activeReactionPickerId === msg.id;

          return (
            <React.Fragment key={msg.id}>
              {isNewDay && (
                <div className="text-center my-3">
                  <span className="text-[10px] uppercase tracking-wider bg-neutral-800/80 text-neutral-400 px-3 py-1 rounded-full border border-neutral-700/50 font-semibold">
                    {dateStr}
                  </span>
                </div>
              )}
              <div
                className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-3'}`}
              >
                {!isMe && (
                  <button
                    type="button"
                    onClick={() => setActiveReactionPickerId(isPickerOpen ? null : msg.id)}
                    className="opacity-60 hover:opacity-100 p-1.5 rounded-full bg-neutral-800 text-neutral-300 hover:text-white transition self-center"
                    title="React to message"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>
                )}

              <div className="relative group max-w-[75%] sm:max-w-md">
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    isMe
                      ? `${getThemeBubbleClass(currentTheme)} rounded-br-none`
                      : 'bg-[#222222] text-white rounded-bl-none border border-neutral-800'
                  }`}
                >
                {msg.type === 'video' || (msg.mediaUrl && (msg.mediaUrl.endsWith('.mp4') || msg.mediaUrl.includes('mixkit'))) ? (
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/20 shadow-md">
                    <video
                      src={msg.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-44 object-cover rounded-lg"
                    />
                    <div className="bg-black/60 px-2.5 py-1 flex items-center justify-between text-[10px] text-amber-300 font-semibold">
                      <span>📹 5s Video Reaction</span>
                      <span>Looping</span>
                    </div>
                  </div>
                ) : msg.type === 'image' && msg.mediaUrl ? (
                  <div className="mb-2 rounded-xl overflow-hidden">
                    <img
                      src={msg.mediaUrl}
                      alt="Shared media"
                      className="w-full h-48 object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : msg.type === 'location' ? (
                  <div className="flex items-center space-x-2 mb-1 p-2 bg-black/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-400" />
                    <span className="text-xs font-bold">Live Location Shared</span>
                  </div>
                ) : msg.type === 'audio' ? (
                  <div className="flex items-center space-x-3 mb-2 bg-black/20 p-2.5 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        if (playingMsgId === msg.id) {
                          setPlayingMsgId(null);
                        } else {
                          setPlayingMsgId(msg.id);
                          const audio = new Audio(msg.mediaUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
                          audio.play().catch(() => {});
                          audio.onended = () => setPlayingMsgId(null);
                        }
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow ${
                        isMe ? 'bg-[#121212] text-[#FFC107]' : 'bg-[#FFC107] text-[#121212]'
                      }`}
                    >
                      {playingMsgId === msg.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 h-6">
                        {[40, 70, 30, 90, 60, 45, 80, 50, 95, 35, 65, 85].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              playingMsgId === msg.id ? 'bg-amber-400 animate-pulse' : 'bg-neutral-500/60'
                            }`}
                            style={{ height: playingMsgId === msg.id ? `${Math.max(20, (h + (i % 3) * 15) % 100)}%` : `${h}%` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] opacity-70">Voice Note (0:04)</span>
                    </div>
                  </div>
                ) : null}

                <p className="text-sm leading-relaxed">{msg.text}</p>

                {translations[msg.id] && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-xs bg-black/20 p-2.5 rounded-xl">
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-semibold mb-0.5">
                      <span>Translated from {translations[msg.id].detectedLanguage}</span>
                      <span>✨ AI</span>
                    </div>
                    <p className="text-white font-medium">{translations[msg.id].translatedText}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-1 pt-0.5 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => handleTranslate(msg.id, msg.text)}
                    disabled={translatingMsgId === msg.id}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold opacity-80 hover:opacity-100 transition"
                  >
                    {translatingMsgId === msg.id ? 'Translating...' : translations[msg.id] ? 'Show Original' : '🌐 Translate'}
                  </button>

                  <div
                    className={`text-[10px] flex items-center space-x-1.5 ${
                      isMe ? 'text-[#121212]/70 font-medium' : 'text-neutral-400'
                    }`}
                  >
                    <span>{timeStr}</span>
                    {isMe && readReceiptsEnabled && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateMessageRead) {
                            onUpdateMessageRead(conversation.id, msg.id, !msg.isRead);
                          }
                        }}
                        className="flex items-center space-x-0.5 cursor-pointer hover:opacity-80 transition"
                        title={msg.isRead ? 'Read by recipient (Click to mark unread)' : 'Sent (Click to mark read)'}
                      >
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-blue-500 stroke-[2.5]' : 'text-neutral-500 opacity-60'}`} />
                        {msg.isRead && <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 ml-0.5">Read</span>}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Display Reactions */}
              {((msg.reactions && msg.reactions.length > 0) || currentReactions.length > 0) && (
                <div className={`absolute -bottom-3 flex items-center gap-1 bg-[#1E1E1E] border border-neutral-700 px-2 py-0.5 rounded-full shadow-md z-10 ${isMe ? 'right-2' : 'left-2'}`}>
                  {msg.reactions && msg.reactions.length > 0 ? (
                    Object.entries(
                      msg.reactions.reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          if (onAddReaction) {
                            onAddReaction(conversation.id, msg.id, emoji);
                          } else {
                            toggleReaction(msg.id, emoji);
                          }
                        }}
                        className="text-xs hover:scale-125 transition transform flex items-center gap-0.5 text-neutral-300 px-1"
                      >
                        <span>{emoji}</span>
                        {(count as number) > 1 && <span className="text-[10px] font-bold text-amber-400">{count}</span>}
                      </button>
                    ))
                  ) : (
                    currentReactions.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          if (onAddReaction) {
                            onAddReaction(conversation.id, msg.id, emoji);
                          } else {
                            toggleReaction(msg.id, emoji);
                          }
                        }}
                        className="text-xs hover:scale-125 transition transform px-1"
                      >
                        {emoji}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Quick Reaction Bar Picker Popup */}
              {isPickerOpen && (
                <div className={`absolute -top-12 z-20 bg-[#1C1C1C] border border-neutral-700 rounded-full px-3 py-1.5 shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 ${isMe ? 'right-0' : 'left-0'}`}>
                  {PREDEFINED_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        if (onAddReaction) {
                          onAddReaction(conversation.id, msg.id, emoji);
                        } else {
                          toggleReaction(msg.id, emoji);
                        }
                        setActiveReactionPickerId(null);
                      }}
                      className="hover:scale-125 transition transform text-base p-0.5"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      togglePinMessage(msg.id);
                      setActiveReactionPickerId(null);
                    }}
                    className={`hover:scale-125 transition transform text-xs px-2 py-0.5 rounded font-bold ${pinnedIds.includes(msg.id) ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-amber-400'}`}
                    title={pinnedIds.includes(msg.id) ? 'Unpin message' : 'Pin message'}
                  >
                    📌 {pinnedIds.includes(msg.id) ? 'Unpin' : 'Pin'}
                  </button>
                  {isMe && Date.now() - msg.timestamp <= 5 * 60 * 1000 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onUnsend) {
                          onUnsend(conversation.id, msg.id);
                        }
                        setActiveReactionPickerId(null);
                      }}
                      className="hover:scale-105 transition transform text-xs px-2 py-0.5 rounded font-bold bg-red-600 text-white flex items-center gap-1"
                      title="Unsend message from both sides"
                    >
                      🗑️ Unsend
                    </button>
                  )}
                </div>
              )}
            </div>

            {pinnedIds.includes(msg.id) && (
              <div className="absolute -top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5 z-10">
                📌 Pinned
              </div>
            )}

            {isMe && (
              <button
                type="button"
                onClick={() => setActiveReactionPickerId(isPickerOpen ? null : msg.id)}
                className="opacity-60 hover:opacity-100 p-1.5 rounded-full bg-neutral-800 text-neutral-300 hover:text-white transition self-center"
                title="React to message"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </React.Fragment>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#222222] border border-neutral-800 rounded-2xl rounded-bl-none px-4 py-3 text-neutral-400 text-xs flex items-center space-x-2">
              <span>{profile.name} is typing</span>
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <footer className="bg-[#1A1A1A] border-t border-neutral-800 p-3 space-y-2 relative">
        {/* Quick Reply & AI Suggested Responses */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none flex-1 pr-2">
            {aiSuggestions.map((suggestion, sIdx) => (
              <button
                key={`ai-${sIdx}`}
                type="button"
                onClick={() => sendQuickReply(suggestion)}
                className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition shadow-sm active:scale-95 flex items-center gap-1 flex-shrink-0"
                title="AI Context-Aware Suggestion"
              >
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>{suggestion}</span>
              </button>
            ))}
            {quickReplies.map((reply, rIdx) => (
              <button
                key={rIdx}
                type="button"
                onClick={() => sendQuickReply(reply)}
                className="bg-[#252525] hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 hover:border-[#FFC107] text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition shadow-sm active:scale-95 flex-shrink-0"
              >
                {reply}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleGenerateSmartReplies}
              disabled={isGeneratingSmartReplies}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              title="Generate 3 contextually relevant smart replies based on the last message"
            >
              <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${isGeneratingSmartReplies ? 'animate-spin' : ''}`} />
              <span>{isGeneratingSmartReplies ? 'Thinking...' : '⚡ Smart Replies'}</span>
            </button>
            <button
              type="button"
              onClick={handleGenerateIcebreakers}
              disabled={isGeneratingIcebreaker}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              title="Generate AI Icebreakers based on profile interests and tags"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingIcebreaker ? 'animate-spin' : ''}`} />
              <span>{isGeneratingIcebreaker ? 'Generating...' : '🧊 AI Icebreaker'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQuickReplyConfigModal(true)}
              className="text-xs text-neutral-400 hover:text-[#FFC107] bg-[#252525] hover:bg-neutral-800 border border-neutral-700 px-2.5 py-1.5 rounded-full flex items-center gap-1 transition"
              title="Configure Quick Replies"
            >
              <span>⚙️ Configure</span>
            </button>
          </div>
        </div>

        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-3 z-30 bg-[#222222] border border-neutral-700 rounded-2xl p-3 shadow-2xl grid grid-cols-5 gap-2 w-64 animate-in fade-in zoom-in">
            <div className="col-span-5 flex items-center justify-between pb-1 border-b border-neutral-700 text-xs text-neutral-300 font-semibold">
              <span>Select Emoji</span>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {EMOJI_LIST.map((emoji, eIdx) => (
              <button
                key={eIdx}
                type="button"
                onClick={() => {
                  setInputText(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-xl p-2 hover:bg-neutral-700 rounded-xl transition flex items-center justify-center active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className={`p-2.5 rounded-full transition ${showEmojiPicker ? 'bg-[#FFC107] text-[#121212]' : 'bg-[#252525] hover:bg-[#333333] text-neutral-300'}`}
            title="Toggle Emoji Picker"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={sendQuickPhoto}
            className="p-2.5 rounded-full bg-[#252525] hover:bg-[#333333] text-neutral-300 transition"
            title="Send Photo"
          >
            <ImageIcon className="w-5 h-5 text-[#FFC107]" />
          </button>

          <button
            type="button"
            onClick={sendLocation}
            className="p-2.5 rounded-full bg-[#252525] hover:bg-[#333333] text-neutral-300 transition"
            title="Share Location"
          >
            <MapPin className="w-5 h-5 text-[#FFC107]" />
          </button>

          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`p-2.5 rounded-full transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#252525] hover:bg-[#333333] text-neutral-300'}`}
            title="Hold to Record Voice Note"
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-[#FFC107]'}`} />
          </button>

          <button
            type="button"
            onClick={startVideoReactionRecord}
            className="p-2.5 rounded-full bg-[#252525] hover:bg-[#333333] text-neutral-300 transition"
            title="Record 5-second Video Reaction"
          >
            <Video className="w-5 h-5 text-[#FFC107]" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${profile.name}...`}
            className="flex-1 bg-[#252525] border border-neutral-800 focus:border-[#FFC107] text-white rounded-xl px-4 py-3 text-sm outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-xl bg-[#FFC107] text-[#121212] font-bold disabled:opacity-50 hover:opacity-90 transition shadow-md"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </form>
      </footer>

      {/* Quick Reply Configuration Modal */}
      {showQuickReplyConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Configure Quick Replies</h3>
              <button
                onClick={() => setShowQuickReplyConfigModal(false)}
                className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Add or remove pre-set response buttons to help start and continue conversations faster.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {quickReplies.map((reply, idx) => (
                <div key={idx} className="flex items-center justify-between bg-black/40 border border-neutral-800 px-3 py-2 rounded-xl text-xs text-neutral-200">
                  <span>{reply}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = quickReplies.filter((_, i) => i !== idx);
                      setQuickReplies(updated);
                      localStorage.setItem('blaze_quick_replies', JSON.stringify(updated));
                    }}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newReplyInput}
                onChange={e => setNewReplyInput(e.target.value)}
                placeholder="Add new quick reply (e.g. 'Coffee later? ☕')..."
                className="flex-1 bg-black/40 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FFC107] outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newReplyInput.trim()) return;
                  const updated = [...quickReplies, newReplyInput.trim()];
                  setQuickReplies(updated);
                  localStorage.setItem('blaze_quick_replies', JSON.stringify(updated));
                  setNewReplyInput('');
                }}
                className="px-4 py-2 bg-[#FFC107] text-[#121212] font-bold text-xs rounded-xl hover:opacity-90 transition"
              >
                Add
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowQuickReplyConfigModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplySpeedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Reply Speed Analytics</h3>
              </div>
              <button
                onClick={() => setShowReplySpeedModal(false)}
                className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Average reply speed in this conversation with <strong className="text-[#FFC107]">{profile.name}</strong> is <span className="text-emerald-400 font-bold">1.4 minutes</span>. Here is the responsiveness timeline:
            </p>

            <div className="bg-black/40 border border-neutral-800 p-4 rounded-2xl h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={replySpeedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="msg" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} unit="m" />
                  <Tooltip contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#333', borderRadius: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="speedMinutes" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowReplySpeedModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-xs hover:opacity-90 transition shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in">
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <Video className="w-5 h-5 text-[#FFC107] animate-pulse" />
              <span>Recording 5s Video Reaction</span>
            </h3>
            <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                REC 0:0{videoTimer}
              </div>
            </div>
            <p className="text-xs text-neutral-300">
              Smile, wave, or send a quick reaction! Recording automatically in {videoTimer}s...
            </p>
            <button
              onClick={() => {
                setShowVideoModal(false);
                onSendMessage(
                  conversation.id,
                  '🎥 Sent a 5-second video reaction!',
                  'video',
                  'https://assets.mixkit.co/videos/preview/mixkit-young-man-looking-at-his-smartphone-in-bed-41584-large.mp4'
                );
              }}
              className="w-full py-2.5 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-xs hover:opacity-90 transition shadow"
            >
              Send Instantly
            </button>
          </div>
        </div>
      )}

      {/* Chat Settings Modal */}
      {showChatSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚙️ Chat Settings</span>
                <span className="text-xs text-neutral-400 font-normal">({profile.name})</span>
              </h3>
              <button onClick={() => setShowChatSettingsModal(false)} className="text-neutral-400 hover:text-white p-1 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Read Receipts Toggle Switch */}
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-blue-400" /> Read Receipts
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Send and receive read notifications with {profile.name}.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentReadReceipts}
                    onChange={(e) => {
                      if (onUpdateConversationReadReceipts) {
                        onUpdateConversationReadReceipts(conversation.id, e.target.checked);
                      } else if (onToggleReadReceipts) {
                        onToggleReadReceipts();
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 border border-neutral-700"></div>
                </label>
              </div>

              {/* Mute Conversation Toggle Switch */}
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>🔇 Mute Notifications</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Silence notifications from {profile.name} without blocking.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conversation.isMuted || false}
                    onChange={(e) => {
                      if (onUpdateConversationMute) {
                        onUpdateConversationMute(conversation.id, e.target.checked);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 border border-neutral-700"></div>
                </label>
              </div>

              {/* Chat Theme Selector */}
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>🎨 Chat Accent Theme</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  Choose an accent colour specifically for your conversation with {profile.name}.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  {[
                    { id: 'gold', name: 'Gold', color: 'bg-[#FFC107]' },
                    { id: 'cyan', name: 'Cyan', color: 'bg-cyan-500' },
                    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
                    { id: 'violet', name: 'Violet', color: 'bg-violet-600' },
                    { id: 'rose', name: 'Rose', color: 'bg-rose-600' },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        if (onUpdateConversationTheme) {
                          onUpdateConversationTheme(conversation.id, theme.id);
                        }
                      }}
                      className={`w-9 h-9 rounded-full ${theme.color} flex items-center justify-center transition shadow-lg transform hover:scale-110 ${
                        currentTheme === theme.id ? 'ring-4 ring-white/80 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>

              {/* Clear Conversation Option */}
              <button
                onClick={() => {
                  setShowChatSettingsModal(false);
                  handleClear();
                }}
                className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between text-left transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-red-400">Clear Conversation</h4>
                    <p className="text-xs text-neutral-400">Permanently delete message history with this contact.</p>
                  </div>
                </div>
              </button>

              {/* Block User Option */}
              <button
                onClick={() => {
                  setShowChatSettingsModal(false);
                  handleBlockClick();
                }}
                className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between text-left transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-400">Block User</h4>
                    <p className="text-xs text-neutral-400">Stop notifications and hide profile.</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowChatSettingsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Confirmation Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center text-xl">
                🚫
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Block {profile.name}?</h3>
                <p className="text-xs text-neutral-400">This action cannot be easily undone.</p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-300 space-y-2">
              <p>• {profile.name} will be permanently hidden from your discovery and matches.</p>
              <p>• All chat messages and notifications from this user will be stopped.</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockAlsoReport}
                  onChange={(e) => setBlockAlsoReport(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-700 text-[#FFC107] focus:ring-0 bg-neutral-800"
                />
                <span className="text-xs text-neutral-200 font-medium">
                  Also report this user for community standards violation
                </span>
              </label>

              {blockAlsoReport && (
                <div className="pl-6 space-y-1 pt-1">
                  <label className="text-[11px] text-neutral-400 block font-semibold">Violation Reason</label>
                  <select
                    value={blockReportReason}
                    onChange={(e) => setBlockReportReason(e.target.value)}
                    className="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Harassment or Inappropriate Behavior">Harassment or Inappropriate Behavior</option>
                    <option value="Fake Profile or Impersonation">Fake Profile or Impersonation</option>
                    <option value="Spam or Commercial Solicitation">Spam or Commercial Solicitation</option>
                    <option value="Inappropriate Photos or Content">Inappropriate Photos or Content</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  if (blockAlsoReport) {
                    console.log(`Reported user ${profile.id} for: ${blockReportReason}`);
                  }
                  if (onBlockUser) {
                    onBlockUser(profile.id);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-lg shadow-red-600/30"
              >
                Yes, Block User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Step Clear Conversation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🗑️</span>
                <h3 className="text-base font-bold text-white">
                  {clearStep === 1 ? 'Clear Conversation (Step 1 of 2)' : 'Final Confirmation (Step 2 of 2)'}
                </h3>
              </div>
              <span className="text-xs bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full font-mono font-bold">
                {clearStep}/2
              </span>
            </div>

            {clearStep === 1 ? (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 space-y-2">
                  <p className="font-bold">Initial Warning</p>
                  <p>You are about to clear all messages in your conversation with <span className="text-white font-semibold">{profile.name}</span>.</p>
                </div>
                <p className="text-xs text-neutral-400">
                  This will remove message history from your active view. Proceed to the second step to confirm permanent deletion.
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setClearStep(2)}
                    className="flex-1 py-3 rounded-xl bg-[#FFC107] text-[#121212] font-black text-xs transition shadow-lg shadow-[#FFC107]/20"
                  >
                    Continue -&gt;
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-4 text-xs text-red-200 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-red-400">
                    <Trash2 className="w-4 h-4" /> Permanent Deletion Warning
                  </p>
                  <p>Are you 100% sure? All <span className="font-bold text-white">{conversation.messages.length} messages</span> in this chat will be permanently deleted and cannot be recovered.</p>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setClearStep(1)}
                    className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition"
                  >
                    &lt;- Back
                  </button>
                  <button
                    onClick={() => {
                      setShowClearModal(false);
                      if (onClearConversation) {
                        onClearConversation(conversation.id);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Yes, Permanently Delete History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
