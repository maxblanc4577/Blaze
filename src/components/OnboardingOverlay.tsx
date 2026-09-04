import React, { useState } from 'react';
import { Sparkles, Hand, Filter, User, Camera, ArrowRight, Check } from 'lucide-react';
import { UserProfile, BodyType, LookingFor } from '../types';

interface OnboardingOverlayProps {
  currentUser?: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onComplete: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ currentUser, onUpdateUser, onComplete }) => {
  const [step, setStep] = useState<number>(0);

  // Form state initialized from currentUser if available
  const [displayName, setDisplayName] = useState<string>(currentUser?.name || 'Alex Morgan');
  const [age, setAge] = useState<number>(currentUser?.age || 26);
  const [gender, setGender] = useState<string>('Man');
  const [interestedIn, setInterestedIn] = useState<string[]>(['Men', 'Women']);
  const [lookingFor, setLookingFor] = useState<string[]>(['Chat', 'Dates', 'Friends']);
  const [aboutMe, setAboutMe] = useState<string>(currentUser?.aboutMe || 'Explorer, foodie, and outdoor enthusiast looking to connect with amazing people nearby!');
  const [height, setHeight] = useState<string>(currentUser?.height || '180');
  const [weight, setWeight] = useState<string>(currentUser?.weight || '75');
  const [bodyType, setBodyType] = useState<BodyType>(currentUser?.bodyType || 'Athletic');
  const [relationshipStatus, setRelationshipStatus] = useState<string>(currentUser?.relationshipStatus || 'Single');
  const [photoUrl, setPhotoUrl] = useState<string>(currentUser?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600');

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
    {
      title: 'Create your profile',
      description: 'This is what other people will see nearby.',
      icon: User,
      color: 'from-emerald-400 to-teal-600',
    },
  ];

  const current = steps[step];
  const IconComponent = current.icon;

  const toggleInterestedIn = (opt: string) => {
    setInterestedIn(prev => 
      prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]
    );
  };

  const toggleLookingFor = (opt: string) => {
    setLookingFor(prev => 
      prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]
    );
  };

  const handleSaveProfile = () => {
    if (currentUser && onUpdateUser) {
      const updated: UserProfile = {
        ...currentUser,
        name: displayName,
        age: Number(age) || 25,
        aboutMe: aboutMe,
        height: `${height} cm`,
        weight: `${weight} kg`,
        bodyType: bodyType as BodyType,
        relationshipStatus: relationshipStatus,
        photos: [photoUrl, ...(currentUser.photos?.slice(1) || [])],
        lookingFor: lookingFor as LookingFor[],
      };
      onUpdateUser(updated);
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto py-10">
      <div className="bg-[#1E1E1E] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-white relative my-auto">
        <div className="absolute top-4 right-4 text-xs font-semibold text-neutral-400">
          {step + 1} of {steps.length}
        </div>

        {step < 3 ? (
          <>
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.color} text-[#121212] flex items-center justify-center mx-auto shadow-xl mb-6 animate-pulse`}>
              <IconComponent className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black mb-2 text-center">{current.title}</h2>
            <p className="text-sm text-neutral-300 mb-8 leading-relaxed max-w-xs mx-auto text-center">
              {current.description}
            </p>
          </>
        ) : (
          <div className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-2">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-[#121212] flex items-center justify-center mx-auto shadow-lg mb-3">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black">Create your profile</h2>
              <p className="text-xs text-neutral-400 mt-1">This is what other people will see nearby.</p>
            </div>

            {/* Add photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" /> Add photo
              </label>
              <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
                <img
                  src={photoUrl}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-emerald-500/40 shadow"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Paste image URL..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-neutral-500">Supports Unsplash, Imgur, or direct image URLs.</p>
                </div>
              </div>
            </div>

            {/* Display Name & Age */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Display name:</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  placeholder="Your display name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Age:</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  placeholder="25"
                />
              </div>
            </div>

            {/* I am / Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">I am (Select your gender):</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="Man">Man</option>
                <option value="Woman">Woman</option>
                <option value="Trans man">Trans man</option>
                <option value="Trans woman">Trans woman</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>

            {/* Interested in */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Interested in:</label>
              <div className="flex flex-wrap gap-2">
                {['Men', 'Women', 'Trans men', 'Trans women', 'Non-binary'].map(opt => {
                  const selected = interestedIn.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInterestedIn(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        selected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {opt} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Looking for */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Looking for:</label>
              <div className="flex flex-wrap gap-2">
                {['Chat', 'Dates', 'Friends', 'Networking', 'Relationship', 'Right now'].map(opt => {
                  const selected = lookingFor.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleLookingFor(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        selected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {opt} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* About me */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">About me:</label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={3}
                placeholder="Tell people a bit about yourself..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Height (cm):</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  placeholder="178"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Weight (kg):</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  placeholder="75"
                />
              </div>
            </div>

            {/* Body Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Select body type:</label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value as BodyType)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                {(['Average', 'Athletic', 'Muscular', 'Stocky', 'Slim', 'Tone', 'A Few Extra Pounds'] as BodyType[]).map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            {/* Relationship status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Select relationship status:</label>
              <select
                value={relationshipStatus}
                onChange={(e) => setRelationshipStatus(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="Single">Single</option>
                <option value="Taken">Taken</option>
                <option value="Open Relationship">Open Relationship</option>
                <option value="Married">Married</option>
                <option value="Committed">Committed</option>
                <option value="It's Complicated">It's Complicated</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-center my-6">
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
                handleSaveProfile();
              }
            }}
            className="flex-1 py-3 rounded-2xl bg-[#FFC107] hover:bg-[#ffca28] text-[#121212] text-sm font-black shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <span>{step === steps.length - 1 ? 'Save profile' : 'Next'}</span>
            {step === steps.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
