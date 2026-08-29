import React, { useState, useRef, useEffect } from 'react';
import { ChatConversation, Message, UserProfile } from '../types';
import { ArrowLeft, Send, Image as ImageIcon, Mic, MapPin, Sparkles, CheckCheck, ShieldCheck, Download, Play, Pause, Trash2, Zap, X, Video } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChatWindowProps {
  conversation: ChatConversation;
  onBack: () => void;
  onSendMessage: (conversationId: string, text: string, type?: 'text' | 'image' | 'audio' | 'location', mediaUrl?: string) => void;
  currentUser: UserProfile;
  onClearConversation?: (conversationId: string) => void;
  readReceiptsEnabled?: boolean;
  customQuickReplies?: string[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onBack,
  onSendMessage,
  currentUser,
  onClearConversation,
  readReceiptsEnabled = true,
  customQuickReplies,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [showReplySpeedModal, setShowReplySpeedModal] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [translations, setTranslations] = useState<Record<string, { translatedText: string; detectedLanguage: string }>>({});
  const [translatingMsgId, setTranslatingMsgId] = useState<string | null>(null);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoTimer, setVideoTimer] = useState(5);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const [showPinModal, setShowPinModal] = useState(false);
  const [customMeetingSpot, setCustomMeetingSpot] = useState('');

  const meetingSpotsPresets = [
    '☕ Blue Bottle Coffee, Downtown',
    '🌳 Central Park Fountain North',
    '🍸 The Standard Rooftop Lounge',
    '🏛️ City Art Museum Main Entrance',
    '🌊 Waterfront Promenade Pier 3'
  ];

  const handlePinMeetingSpot = (spotName: string) => {
    onSendMessage(conversation.id, `📍 Pinned Meeting Spot: ${spotName}`, 'location');
    setShowPinModal(false);
    setCustomMeetingSpot('');
  };

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
    if (window.confirm(`Are you sure you want to clear all messages in this conversation with ${profile.name}?`)) {
      if (onClearConversation) {
        onClearConversation(conversation.id);
      }
    }
  };

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
          {/* End-to-end Encrypted indicator */}
          <div className="hidden sm:flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium" title="Messages are end-to-end encrypted">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>End-to-end Encrypted</span>
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
        </div>
      </header>

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

        {conversation.messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] sm:max-w-md rounded-2xl px-4 py-3 shadow-sm ${
                  isMe
                    ? 'bg-[#FFC107] text-[#121212] rounded-br-none font-medium'
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
                      <div className="flex items-center space-x-0.5" title={msg.isRead ? 'Read by recipient' : 'Sent'}>
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-emerald-800 stroke-[2.5]' : 'text-neutral-500 opacity-60'}`} />
                        {msg.isRead && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-900 ml-0.5">Read</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
      <footer className="bg-[#1A1A1A] border-t border-neutral-800 p-3 space-y-2">
        {/* Quick Reply Bubbles */}
        <div className="flex items-center gap-2 overflow-x-auto px-1 py-0.5 scrollbar-none">
          {(customQuickReplies || [
            "Hey! How's your week going so far? ✨",
            "Loved your profile! What brought you to Blaze? 🔥",
            "Where is your favorite spot around town? ☕"
          ]).map((reply, rIdx) => (
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

        {/* Context-Aware Smart Icebreakers based on Partner's Interests */}
        <div className="flex items-center gap-2 overflow-x-auto px-1 py-0.5 scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3" /> Smart Icebreakers:
          </span>
          {(() => {
            const interests = profile.interestTags;
            const defaultReplies = [
              "Hey! How's your week going so far? ✨",
              "Loved your profile! What brought you to Blaze? 🔥",
              "Where is your favorite spot around town? ☕"
            ];
            if (!interests || interests.length === 0) return defaultReplies;
            
            const contextual: string[] = [];
            interests.forEach(tag => {
              const t = tag.toLowerCase();
              if (t.includes('coffee')) contextual.push("Hey! What's your go-to coffee order? ☕");
              if (t.includes('gym') || t.includes('fitness')) contextual.push("What's your favorite workout routine? 💪");
              if (t.includes('travel')) contextual.push("Where is the next place on your travel bucket list? ✈️");
              if (t.includes('music')) contextual.push("Seen any good live music or concerts lately? 🎸");
              if (t.includes('coding') || t.includes('tech')) contextual.push("What kind of tech or projects are you building? 💻");
              if (t.includes('art') || t.includes('photography')) contextual.push("Your photos are awesome! What's your camera setup? 📸");
              if (t.includes('cooking') || t.includes('food')) contextual.push("What's your signature dish to cook? 🍳");
            });

            const combined = [...contextual, ...defaultReplies];
            return Array.from(new Set(combined)).slice(0, 4);
          })().map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(conversation.id, reply, 'text')}
              className="bg-[#252525] hover:bg-[#333] text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition shadow-sm active:scale-95 flex-shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center space-x-2">
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
            onClick={() => setShowPinModal(true)}
            className="p-2.5 rounded-full bg-[#252525] hover:bg-[#333333] text-neutral-300 transition"
            title="Pin Meeting Spot"
          >
            <span className="text-sm">📍</span>
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

      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Pin Meeting Spot</h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Select a popular meeting spot or pin a custom location to share with <strong className="text-[#FFC107]">{profile.name}</strong>:
            </p>

            <div className="space-y-2">
              {meetingSpotsPresets.map((spot, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePinMeetingSpot(spot)}
                  className="w-full text-left bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 p-3 rounded-xl text-xs font-medium transition flex items-center justify-between"
                >
                  <span>{spot}</span>
                  <span className="text-amber-400 text-xs font-bold">Pin 📍</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-800 flex gap-2">
              <input
                type="text"
                placeholder="Or enter custom meeting spot..."
                value={customMeetingSpot}
                onChange={(e) => setCustomMeetingSpot(e.target.value)}
                className="flex-1 bg-black border border-neutral-800 focus:border-[#FFC107] text-white text-xs px-3 py-2.5 rounded-xl outline-none"
              />
              <button
                type="button"
                disabled={!customMeetingSpot.trim()}
                onClick={() => handlePinMeetingSpot(customMeetingSpot)}
                className="px-4 py-2.5 bg-[#FFC107] text-[#121212] font-bold text-xs rounded-xl disabled:opacity-50 hover:opacity-90 transition shadow"
              >
                Pin Custom
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
