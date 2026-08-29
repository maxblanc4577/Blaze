import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, Heart, MessageCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

interface MatchCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedProfile: UserProfile | null;
  currentUserPhoto: string;
  onStartChat: (profile: UserProfile) => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  isOpen,
  onClose,
  matchedProfile,
  currentUserPhoto,
  onStartChat,
}) => {
  if (!isOpen || !matchedProfile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Particle & Spark Background Effects */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 2.5, 4], opacity: [0.8, 0.4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          className="w-72 h-72 rounded-full bg-gradient-to-r from-amber-500/30 to-rose-500/30 blur-3xl absolute"
        />
        {/* Floating Sparkles */}
        {[...Array(16)].map((_, i) => {
          const angle = (i / 16) * 360 * (Math.PI / 180);
          const distance = 120 + (i % 4) * 45;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x, y, scale: [0.5, 1.5, 0.8], opacity: [1, 0.8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: (i * 0.1), ease: 'easeOut' }}
              className="absolute text-amber-400 text-lg font-black"
            >
              {i % 2 === 0 ? '✨' : '💖'}
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
        
        <div className="space-y-2">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>It's a Match!</span>
          </motion.div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            You and {matchedProfile.name} Sparked!
          </h2>
          <p className="text-xs text-neutral-300">
            You both expressed mutual interest. Start a conversation now and plan your meetup!
          </p>
        </div>

        {/* Side-by-Side Avatars with Floating Heart */}
        <div className="flex items-center justify-center gap-4 py-4 relative">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-amber-500 shadow-2xl relative bg-neutral-900"
          >
            <img
              src={currentUserPhoto}
              alt="You"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute z-20 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-xl border-2 border-black text-white"
          >
            <Heart className="w-6 h-6 fill-white" />
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-rose-500 shadow-2xl relative bg-neutral-900"
          >
            <img
              src={matchedProfile.photos[0]}
              alt={matchedProfile.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onStartChat(matchedProfile);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm rounded-2xl transition shadow-xl flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>Send Message to {matchedProfile.name}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs rounded-2xl transition shadow"
          >
            Keep Exploring Grid
          </button>
        </div>

      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-neutral-800 text-neutral-300 hover:text-white p-2 rounded-full hover:bg-neutral-700 transition"
      >
        <X className="w-5 h-5" />
      </button>

    </div>
  );
};
