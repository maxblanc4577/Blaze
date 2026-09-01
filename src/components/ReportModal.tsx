import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Flag, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  profile: UserProfile;
  onClose: () => void;
  onReportSubmitted: (reason: string, details: string) => void;
  onReasonSelect?: (reason: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ profile, onClose, onReportSubmitted, onReasonSelect }) => {
  const [selectedReason, setSelectedReason] = useState<string>('Inappropriate content or photos');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reasons = [
    { id: 'inappropriate', label: 'Inappropriate content or photos', icon: '🔞', desc: 'Explicit media, nudity, or offensive imagery' },
    { id: 'spam', label: 'Spam or commercial solicitation', icon: '🤖', desc: 'Promoting external links, bots, or paid services' },
    { id: 'harassment', label: 'Harassment, bullying, or offensive language', icon: '⚠️', desc: 'Threats, abusive messages, or targeted attacks' },
    { id: 'fake', label: 'Fake profile / Catfishing', icon: '🎭', desc: 'Impersonation or using stolen photos' },
    { id: 'underage', label: 'Suspected underage user', icon: '👶', desc: 'Profiles belonging to minors' },
    { id: 'other', label: 'Other community guideline violation', icon: '🚩', desc: 'General misconduct or policy breach' },
  ];

  const handleReasonChange = (label: string) => {
    setSelectedReason(label);
    if (onReasonSelect) {
      onReasonSelect(label);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onReportSubmitted(selectedReason, details);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Report {profile.name}</h3>
              <p className="text-xs text-neutral-400">Help us keep our community safe and respectful.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-white font-bold text-lg">Report Submitted</h4>
            <p className="text-sm text-neutral-400 max-w-xs mx-auto">
              Thank you for speaking up. Our trust & safety team will review this report promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
                Select Report Reason
              </label>
              <div className="space-y-2">
                {reasons.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedReason === r.label
                        ? 'bg-red-500/15 border-red-500 text-white shadow-md ring-1 ring-red-500/30'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.label}
                      checked={selectedReason === r.label}
                      onChange={() => handleReasonChange(r.label)}
                      className="accent-red-500 mt-1"
                    />
                    <span className="text-lg">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white">{r.label}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any extra context or details..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:border-red-500 outline-none resize-none transition"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg flex items-center space-x-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
