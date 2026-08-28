import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, CalendarHeart, FileText } from 'lucide-react';
import { UserProfile } from '../types';

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  targetProfile?: UserProfile | null;
  onSelectIcebreaker?: (text: string) => void;
  onUpdateBio?: (newBio: string) => void;
}

export const AIAssistModal: React.FC<AIAssistModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetProfile,
  onSelectIcebreaker,
  onUpdateBio,
}) => {
  const [activeTab, setActiveTab] = useState<'icebreaker' | 'datenight' | 'biorefiner'>('icebreaker');
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [dateIdeas, setDateIdeas] = useState<string[]>([]);
  const [refinedBios, setRefinedBios] = useState<string[]>([
    "Exploring city coffee shops by day and ambient music lounges by night. Always down for good conversations and spontaneous adventures! ☕✨",
    "Creative soul with a passion for art, tech, and outdoor hikes. Looking to connect with authentic people and share memorable experiences. 🌲🎨",
    "Passionate about good design, great food, and discovering hidden spots in the city. Let's exchange favorite playlists! 🎧🍜"
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const generateIcebreakers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myName: currentUser.name,
          targetName: targetProfile?.name || 'someone nearby',
          targetBio: targetProfile?.aboutMe || 'Friendly and exploring',
          targetTribes: targetProfile?.tribes || ['Clean', 'Geek'],
        }),
      });
      const data = await res.json();
      setIcebreakers(data.icebreakers || []);
    } catch (err) {
      setIcebreakers([
        `Hey ${targetProfile?.name || 'there'}! Saw you're into ${targetProfile?.interestTags?.[0] || 'exploring'}. How's your week going?`,
        `Hi! Love your profile vibe. What's your favorite spot in town?`,
        `Hey! Up for grabbing coffee or drinks sometime soon? ☕`
      ]);
    }
    setLoading(false);
  };

  const generateDateIdeas = () => {
    setLoading(true);
    setTimeout(() => {
      const interests = targetProfile?.interestTags || ['Coffee', 'Art', 'Music'];
      const ideas = [
        `☕ Cozy artisanal coffee tasting at a local rooftop cafe in downtown.`,
        `🎨 Interactive pottery painting workshop followed by sunset stroll in the park.`,
        `🌮 Gourmet food truck tour featuring shared favorites (${interests.join(', ')}) with ambient live music.`,
        `🌟 Stargazing picnic at the scenic overlook with gourmet cheese and sparkling cider.`
      ];
      setDateIdeas(ideas);
      setLoading(false);
    }, 600);
  };

  const refineBio = () => {
    setLoading(true);
    setTimeout(() => {
      setRefinedBios([
        `✨ ${currentUser.aboutMe || 'Exploring life one adventure at a time.'} Passionate about meaningful conversations and authentic connections.`,
        `🚀 Tech enthusiast, coffee lover, and weekend explorer. Always curious to learn new things and meet new people!`,
        `🎧 Curating playlists, visiting art galleries, and enjoying great food. Let's connect if you share similar vibes!`
      ]);
      setLoading(false);
    }, 500);
  };

  const copyText = (text: string, idx: number, isBio = false) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    if (isBio && onUpdateBio) {
      onUpdateBio(text);
      onClose();
    } else if (activeTab === 'icebreaker' && onSelectIcebreaker) {
      onSelectIcebreaker(text);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] w-full max-w-md rounded-2xl border border-neutral-800 text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#141414]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#FFC107] fill-current" />
            <h2 className="font-bold text-lg">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-[#181818]">
          <button
            onClick={() => setActiveTab('icebreaker')}
            className={`flex-1 py-3 text-[11px] font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'icebreaker'
                ? 'text-[#FFC107] border-b-2 border-[#FFC107] bg-neutral-900/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Icebreakers</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('biorefiner');
            }}
            className={`flex-1 py-3 text-[11px] font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'biorefiner'
                ? 'text-[#FFC107] border-b-2 border-[#FFC107] bg-neutral-900/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bio Refiner</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('datenight');
              if (dateIdeas.length === 0) generateDateIdeas();
            }}
            className={`flex-1 py-3 text-[11px] font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'datenight'
                ? 'text-[#FFC107] border-b-2 border-[#FFC107] bg-neutral-900/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CalendarHeart className="w-3.5 h-3.5" />
            <span>Date Night</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {activeTab === 'icebreaker' ? (
            <>
              <p className="text-sm text-neutral-300">
                {targetProfile
                  ? `Generate smart icebreakers tailored for ${targetProfile.name} based on their tribes (${targetProfile.tribes?.join(', ')}) and interests.`
                  : `Generate engaging conversation starters.`}
              </p>

              <button
                onClick={generateIcebreakers}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[#121212] font-bold text-sm hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{loading ? 'Generating...' : 'Generate AI Icebreakers'}</span>
              </button>

              {icebreakers.length > 0 && (
                <div className="space-y-2.5 mt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Select Icebreaker</h3>
                  {icebreakers.map((text, idx) => (
                    <div
                      key={idx}
                      onClick={() => copyText(text, idx)}
                      className="bg-[#252525] hover:bg-[#2d2d2d] border border-neutral-800 hover:border-[#FFC107]/50 rounded-xl p-3.5 cursor-pointer transition flex items-center justify-between group"
                    >
                      <p className="text-sm text-neutral-200 pr-3">{text}</p>
                      <button className="p-2 rounded-lg bg-neutral-800 text-neutral-300 group-hover:text-[#FFC107] transition flex-shrink-0">
                        {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'biorefiner' ? (
            <>
              <p className="text-sm text-neutral-300">
                Transform your current "About Me" bio into a polished, interest-focused version. Select one to apply instantly to your profile.
              </p>

              <button
                onClick={refineBio}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[#121212] font-bold text-sm hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{loading ? 'Refining...' : 'Refine My Bio'}</span>
              </button>

              <div className="space-y-2.5 mt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Polished Bio Options (Click to Apply)</h3>
                {refinedBios.map((bioText, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyText(bioText, idx, true)}
                    className="bg-[#252525] hover:bg-[#2d2d2d] border border-neutral-800 hover:border-[#FFC107]/50 rounded-xl p-3.5 cursor-pointer transition flex items-center justify-between group"
                  >
                    <p className="text-sm text-neutral-200 pr-3 leading-relaxed">{bioText}</p>
                    <button className="p-2 rounded-lg bg-neutral-800 text-neutral-300 group-hover:text-[#FFC107] transition flex-shrink-0" title="Apply Bio">
                      {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4 text-[#FFC107]" />}
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-300">
                AI tailored date night ideas for you and <span className="text-[#FFC107] font-semibold">{targetProfile?.name || 'your match'}</span> based on mutual interests ({targetProfile?.interestTags?.join(', ') || 'Coffee, Art'}).
              </p>

              <button
                onClick={generateDateIdeas}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[#121212] font-bold text-sm hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <CalendarHeart className="w-4 h-4 fill-current" />
                <span>{loading ? 'Curating Ideas...' : 'Refresh Date Ideas'}</span>
              </button>

              <div className="space-y-2.5 mt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Curated Date Itineraries</h3>
                {dateIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyText(idea, idx)}
                    className="bg-[#252525] hover:bg-[#2d2d2d] border border-neutral-800 hover:border-[#FFC107]/50 rounded-xl p-3.5 cursor-pointer transition flex items-center justify-between group"
                  >
                    <p className="text-sm text-neutral-200 pr-3 leading-relaxed">{idea}</p>
                    <button className="p-2 rounded-lg bg-neutral-800 text-neutral-300 group-hover:text-[#FFC107] transition flex-shrink-0" title="Copy to clipboard">
                      {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
