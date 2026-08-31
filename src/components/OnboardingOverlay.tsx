import React, { useState } from 'react';
import { Sparkles, Hand, Filter, Heart, ArrowRight, Check } from 'lucide-react';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      title: 'Welcome to Blaze! 🔥',
      description: 'Discover amazing people nearby with our lightning-fast discovery feed and interactive profiles.',
      icon: Sparkles,
      color: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Swipe & Tap Gestures',
      description: 'Swipe right or tap the Spark button to connect, or swipe left to pass. Tap on photo pagination bars or edges to cycle through profile photos.',
      icon: Hand,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Filter & Search',
      description: 'Use the top filter bar to sort by distance, verified status, online presence, and interest tags instantly.',
      icon: Filter,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const current = steps[step];
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-white text-center relative">
        <div className="absolute top-4 right-4 text-xs font-semibold text-neutral-400">
          {step + 1} of {steps.length}
        </div>

        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.color} text-[#121212] flex items-center justify-center mx-auto shadow-xl mb-6 animate-pulse`}>
          <IconComponent className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black mb-2">{current.title}</h2>
        <p className="text-sm text-neutral-300 mb-8 leading-relaxed max-w-xs mx-auto">
          {current.description}
        </p>

        <div className="flex gap-2 justify-center mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-[#FFC107]' : 'w-2 bg-neutral-700'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="flex-1 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-bold transition"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(prev => prev + 1);
              } else {
                onComplete();
              }
            }}
            className="flex-1 py-3 rounded-2xl bg-[#FFC107] hover:bg-[#ffca28] text-[#121212] text-sm font-black shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <span>{step === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            {step === steps.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
