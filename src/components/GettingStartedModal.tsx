import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Sliders, Flame, ArrowRight, X, Check } from 'lucide-react';

interface GettingStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerification?: () => void;
}

export const GettingStartedModal: React.FC<GettingStartedModalProps> = ({
  isOpen,
  onClose,
  onOpenVerification,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Blaze Spark ✨',
      subtitle: 'Discover genuine connections, creators, and professionals nearby in real time.',
      icon: <Sparkles className="w-12 h-12 text-[#FFC107]" />,
      color: 'from-amber-500/20 to-yellow-500/10',
      description: 'Explore the live grid, view verified profiles with high compatibility scores, and start meaningful conversations instantly.',
    },
    {
      title: 'Verify Your Profile 🛡️',
      subtitle: 'Build instant trust and unlock priority visibility across the community.',
      icon: <ShieldCheck className="w-12 h-12 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/10',
      description: 'Use our guided Verification Center to complete a quick selfie & document scan to earn your official cyan Verified Badge.',
      actionText: 'Open Verification Center',
      onAction: () => {
        onClose();
        if (onOpenVerification) onOpenVerification();
      }
    },
    {
      title: 'Advanced Filters & Styles 🎛️',
      subtitle: 'Tailor your discovery feed to match your exact vibe and preferences.',
      icon: <Sliders className="w-12 h-12 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-500/10',
      description: 'Filter by distance, age range, community tribes, or apply stylistic photo filters (grayscale, sepia, vintage) to preview photos.',
    },
    {
      title: 'Spark & Connect 🔥',
      subtitle: 'Send Taps, share meeting spots, and ignite conversations.',
      icon: <Flame className="w-12 h-12 text-rose-400" />,
      color: 'from-rose-500/20 to-pink-500/10',
      description: 'Tap profiles to send instant reactions, coordinate meetups with pinned map locations, and celebrate matches with particle spark animations!',
    },
  ];

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC107] animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">Getting Started ({currentStep + 1}/4)</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Illustration / Icon Container */}
        <div className={`p-8 bg-gradient-to-b ${step.color} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0,transparent_70%)] pointer-events-none" />
          <div className="p-5 rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-white/10 shadow-xl mb-4 animate-bounce duration-1000">
            {step.icon}
          </div>
          <h2 className="text-xl font-black text-white mb-1">{step.title}</h2>
          <p className="text-xs font-medium text-amber-300">{step.subtitle}</p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-neutral-300 leading-relaxed text-center">
            {step.description}
          </p>

          {step.actionText && (
            <button
              onClick={step.onAction}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-extrabold text-xs rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{step.actionText}</span>
            </button>
          )}

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 py-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentStep === idx ? 'w-8 bg-[#FFC107]' : 'w-2 bg-neutral-700 hover:bg-neutral-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
            {currentStep > 0 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition"
              >
                Back
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-neutral-400 hover:text-white font-medium text-xs transition"
              >
                Skip Intro
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 bg-[#FFC107] hover:opacity-90 text-[#121212] font-extrabold text-xs rounded-xl transition shadow flex items-center gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#FFC107] hover:opacity-90 text-[#121212] font-extrabold text-xs rounded-xl transition shadow flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
