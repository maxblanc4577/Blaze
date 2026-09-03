import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlockConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  profilePhoto?: string;
  onConfirm: (reason: string, alsoReport: boolean) => void;
}

export const BlockConfirmationModal: React.FC<BlockConfirmationModalProps> = ({
  isOpen,
  onClose,
  profileName,
  profilePhoto,
  onConfirm
}) => {
  const [reason, setReason] = useState('Inappropriate Behavior');
  const [alsoReport, setAlsoReport] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5"
        >
          <div className="flex items-center space-x-3.5 text-red-400">
            {profilePhoto ? (
              <img src={profilePhoto} alt={profileName} className="w-14 h-14 rounded-2xl object-cover border-2 border-red-500/40" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center text-2xl font-bold">
                🚫
              </div>
            )}
            <div>
              <h3 className="text-lg font-black text-white">Block {profileName}?</h3>
              <p className="text-xs text-neutral-400">Please confirm your decision to prevent accidental blocking.</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 text-xs text-neutral-300 space-y-2">
            <p className="flex items-center gap-2">
              <span className="text-red-400 font-bold">•</span> {profileName} will be permanently hidden from discovery and matches.
            </p>
            <p className="flex items-center gap-2">
              <span className="text-red-400 font-bold">•</span> All chat messages and notifications from this user will be stopped.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoReport}
                onChange={(e) => setAlsoReport(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 text-red-500 focus:ring-0 bg-neutral-800"
              />
              <span className="text-xs text-neutral-200 font-medium">
                Also report this profile for community safety violation
              </span>
            </label>

            {alsoReport && (
              <div className="pl-6 space-y-1.5 pt-1">
                <label className="text-[11px] text-neutral-400 block font-semibold">Select Violation Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                >
                  <option value="Inappropriate Behavior">Inappropriate Behavior or Messages</option>
                  <option value="Fake Profile">Fake Profile / Impersonation</option>
                  <option value="Spam">Spam or Commercial Solicitation</option>
                  <option value="Harassment">Harassment or Bullying</option>
                  <option value="Inappropriate Photos">Inappropriate Photos or Content</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(reason, alsoReport);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" /> Confirm Block
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
