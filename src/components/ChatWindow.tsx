import React, { useState, useRef, useEffect } from 'react';
import { ChatConversation, Message, UserProfile } from '../types';
import { ArrowLeft, Send, Image as ImageIcon, Mic, MapPin, Sparkles, CheckCheck } from 'lucide-react';

interface ChatWindowProps {
  conversation: ChatConversation;
  onBack: () => void;
  onSendMessage: (conversationId: string, text: string, type?: 'text' | 'image' | 'audio' | 'location', mediaUrl?: string) => void;
  currentUser: UserProfile;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onBack,
  onSendMessage,
  currentUser,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const profile = conversation.profile;

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
      </header>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-2">
          <span className="text-[11px] bg-[#1E1E1E] text-neutral-400 px-3 py-1 rounded-full border border-neutral-800">
            Messages are secure and encrypted
          </span>
        </div>

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
                {msg.type === 'image' && msg.mediaUrl ? (
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
                ) : null}

                <p className="text-sm leading-relaxed">{msg.text}</p>

                <div
                  className={`text-[10px] mt-1 flex items-center justify-end space-x-1 ${
                    isMe ? 'text-[#121212]/70' : 'text-neutral-400'
                  }`}
                >
                  <span>{timeStr}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5" />}
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
      <footer className="bg-[#1A1A1A] border-t border-neutral-800 p-3">
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

    </div>
  );
};
