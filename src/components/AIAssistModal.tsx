import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  targetProfile?: UserProfile | null;
  onSelectIcebreaker?: (text: string) => void;
}

export const AIAssistModal: React.FC<AIAssistModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetProfile,
  onSelectIcebreaker,
}) => {
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
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
        `Hey ${targetProfile?.name || 'there'}! Saw you're nearby. How's your day going?`,
        `Hi! Love your profile. What kind of music are you into?`,
        `Hey! Up for grabbing coffee or drinks sometime this week?`
      ]);
    }
    setLoading(false);
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    if (onSelectIcebreaker) {
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
            <h2 className="font-bold text-lg">AI Icebreaker Assistant</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-neutral-300">
            {targetProfile
              ? `Generate smart, flirty icebreakers tailored for ${targetProfile.name} based on their bio and tribes.`
              : `Generate engaging conversation starters for your matches.`}
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
            <div className="space-y-2.5 mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Select an Icebreaker</h3>
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
        </div>

      </div>
    </div>
  );
};
