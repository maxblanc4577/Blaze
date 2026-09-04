import React from 'react';
import { X, LogOut, Lock, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

interface LogOffConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPermanent: () => void;
  onConfirmTemporary: () => void;
}

export const LogOffConfirmationModal: React.FC<LogOffConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmPermanent,
  onConfirmTemporary,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-md w-full p-6 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Log Off Options</h3>
            <p className="text-xs text-neutral-400">Choose how you would like to log off</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Permanent Log Off */}
          <div
            onClick={onConfirmPermanent}
            className="p-4 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-red-500/50 rounded-2xl cursor-pointer transition flex items-start space-x-3 group"
          >
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400 mt-0.5 group-hover:scale-105 transition">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white flex items-center justify-between">
                <span>Permanently Log Off</span>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-red-400 transition" />
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Clear all session data and require entering username and password/credentials again to access your account.
              </p>
            </div>
          </div>

          {/* Temporary Log Off */}
          <div
            onClick={onConfirmTemporary}
            className="p-4 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition flex items-start space-x-3 group"
          >
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 mt-0.5 group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white flex items-center justify-between">
                <span>Temporarily Log Off (Stealth Mode)</span>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition" />
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Pause your radar presence and hide status temporarily without clearing credentials. Return instantly anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
