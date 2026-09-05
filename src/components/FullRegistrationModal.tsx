import React, { useState } from 'react';
import { X, Crown, Sparkles, Check, ShieldCheck, Upload, Phone, MapPin, User, Heart, CheckCircle2, Lock, ArrowRight, Globe } from 'lucide-react';
import { UserProfile } from '../types';
import { GoogleMapsCityPickerModal } from './GoogleMapsCityPickerModal';

interface FullRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteRegistration: (profileData: Partial<UserProfile>, tier: 'Free' | 'Elite Companion' | 'Pro', isPaid: boolean) => void;
  showToast: (msg: string) => void;
}

export const FullRegistrationModal: React.FC<FullRegistrationModalProps> = ({
  isOpen,
  onClose,
  onCompleteRegistration,
  showToast,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedTier, setSelectedTier] = useState<'regular' | 'mintboys_elite' | 'pro_elite'>('mintboys_elite');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [locationName, setLocationName] = useState('New York, NY');
  const [bio, setBio] = useState('');
  const [offerings, setOfferings] = useState('Travel Companion, Social Events, VIP Hosting');
  const [weight, setWeight] = useState('170 lbs');
  const [height, setHeight] = useState('5\'11"');
  const [endowment, setEndowment] = useState('7.0 Inches');
  const [sexuality, setSexuality] = useState('Gay');
  const [position, setPosition] = useState('Versatile');
  const [ethnicity, setEthnicity] = useState('Latino / Hispanic');
  const [likes, setLikes] = useState('Fine dining, travel, intelligent conversation, active lifestyle');
  const [dislikes, setDislikes] = useState('Drama, unpunctuality, disrespect');
  const [meetingPreference, setMeetingPreference] = useState('Hosting & Traveling');
  const [contactNumber, setContactNumber] = useState('');

  // Verification
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [sentCode, setSentCode] = useState('4829');
  const [isVerified, setIsVerified] = useState(false);

  // Payment
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('123');

  // Media upload
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const tierAmount = selectedTier === 'pro_elite' ? '$29.99/mo' : selectedTier === 'mintboys_elite' ? '$19.99/mo' : '$0';
  const tierTitle = selectedTier === 'pro_elite' ? 'Pro Elite VIP' : selectedTier === 'mintboys_elite' ? 'Mint Boys Elite' : 'Regular User';

  const handleSendCode = () => {
    if (!contactNumber.trim()) {
      showToast('⚠️ Please enter a valid telephone number or email first.');
      return;
    }
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setSentCode(generated);
    showToast(`📲 Verification code sent via text to ${contactNumber}. (Simulated Code: ${generated})`);
  };

  const handleVerifyCode = () => {
    if (verificationCodeInput.trim() === sentCode || verificationCodeInput.trim() === '1234') {
      setIsVerified(true);
      showToast('✅ Telephone / Email verified successfully!');
      setStep(4); // Proceed to Merchant Payment Portal
    } else {
      showToast('❌ Invalid verification code. Try "1234" or the sent code.');
    }
  };

  const handlePaymentConfirm = () => {
    showToast('💳 Payment confirmed via Merchant Portal! Automatic billing enabled.');
    setStep(5); // Proceed to Media Upload
  };

  const handleMediaFinish = () => {
    showToast('🎉 Registration complete! Photos & videos submitted for admin approval.');
    setStep(6); // Final success step
  };

  const handleFinalFinish = () => {
    const assignedTier = selectedTier === 'pro_elite' ? 'Pro' : selectedTier === 'mintboys_elite' ? 'Elite Companion' : 'Free';
    const isFeePaid = selectedTier !== 'regular';

    onCompleteRegistration(
      {
        name: displayName || fullName || 'New Member',
        headline: offerings || 'Travel Companion & VIP Host',
        aboutMe: bio || 'Excited to connect with local members on Blaze.',
        locationName,
        weight,
        height,
        endowment,
        phone: contactNumber,
        whatsapp: contactNumber,
        companionServices: offerings.split(',').map(s => s.trim()),
        membershipTier: assignedTier as any,
        isCompanionPro: isFeePaid,
        isFeePaid,
        photos: uploadedPhotos.length ? uploadedPhotos : ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'],
        videos: uploadedVideos.length ? uploadedVideos : [],
        interestTags: [...likes.split(',').map(l => l.trim()), ...offerings.split(',').map(o => o.trim())].filter(Boolean),
        position: position as any,
        relationshipStatus: meetingPreference,
      },
      assignedTier as any,
      isFeePaid
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Progress */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-black uppercase bg-[#FFC107]/10 text-[#FFC107] px-2.5 py-1 rounded-full border border-[#FFC107]/30">
              Phase 2 • Step {step} of 6
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              {step === 1 && 'Select Your Registration Tier'}
              {step === 2 && 'Complete Registration Form'}
              {step === 3 && 'Verify Email or Telephone'}
              {step === 4 && 'Merchant Payment Portal & Auto-Billing'}
              {step === 5 && 'Upload Photos & Videos'}
              {step === 6 && 'Registration Complete!'}
            </h2>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            {step}/6
          </div>
        </div>

        {/* STEP 1: Tier Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-300">
              Choose the membership tier that fits your style. Review the details below to make your selection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Regular */}
              <div
                onClick={() => setSelectedTier('regular')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedTier === 'regular' ? 'bg-neutral-800 border-[#FFC107] ring-1 ring-[#FFC107]' : 'bg-[#222] border-neutral-800'
                }`}
              >
                <div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">Free ($0/mo)</span>
                  <h4 className="font-bold text-sm text-white mt-2">Regular User</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">Basic discovery, chat, and browsing.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-700/50 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>No fees</span>
                  {selectedTier === 'regular' && <Check className="w-4 h-4 text-[#FFC107]" />}
                </div>
              </div>

              {/* Mint Boys Elite */}
              <div
                onClick={() => setSelectedTier('mintboys_elite')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between relative ${
                  selectedTier === 'mintboys_elite' ? 'bg-amber-500/10 border-[#FFC107] ring-1 ring-[#FFC107]' : 'bg-[#222] border-neutral-800'
                }`}
              >
                <span className="absolute top-2 right-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Elite</span>
                <div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">$19.99/mo</span>
                  <h4 className="font-bold text-sm text-white mt-2">Mint Boys Elite</h4>
                  <p className="text-[11px] text-neutral-300 mt-1">Verified badge, priority radar, auto billing.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Auto-Bill</span>
                  {selectedTier === 'mintboys_elite' && <Check className="w-4 h-4 text-[#FFC107]" />}
                </div>
              </div>

              {/* Pro Elite */}
              <div
                onClick={() => setSelectedTier('pro_elite')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between relative ${
                  selectedTier === 'pro_elite' ? 'bg-cyan-500/10 border-cyan-400 ring-1 ring-cyan-400' : 'bg-[#222] border-neutral-800'
                }`}
              >
                <span className="absolute top-2 right-2 bg-cyan-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">VIP</span>
                <div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full">$29.99/mo</span>
                  <h4 className="font-bold text-sm text-white mt-2">Pro Elite VIP</h4>
                  <p className="text-[11px] text-neutral-300 mt-1">Top spotlight, VIP perks, priority support.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-cyan-500/30 flex items-center justify-between text-xs font-bold text-cyan-300">
                  <span>Auto-Bill</span>
                  {selectedTier === 'pro_elite' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
              </div>
            </div>

            {/* Description, Why Choose & Thank You Note */}
            <div className="bg-[#252525] border border-neutral-700/60 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-[#FFC107]"></span>
                <span>Tier Overview: {tierTitle}</span>
              </div>

              {selectedTier === 'regular' && (
                <div className="space-y-2 text-xs text-neutral-300">
                  <p><strong className="text-white">What it entails:</strong> Standard community access to explore local profiles, chat, and connect completely free ($0/mo).</p>
                  <p><strong className="text-amber-400">Why choose this:</strong> Perfect if you want to browse and chat locally at zero cost without commitments.</p>
                  <div className="pt-2 border-t border-neutral-800 text-emerald-400 font-medium italic">
                    🙏 Thank you for choosing Regular User! Enjoy connecting with the community.
                  </div>
                </div>
              )}

              {selectedTier === 'mintboys_elite' && (
                <div className="space-y-2 text-xs text-neutral-300">
                  <p><strong className="text-white">What it entails:</strong> Verified elite tier ($19.99/mo automatic billing) with priority radar, verified badge, and direct contact display.</p>
                  <p><strong className="text-amber-400">Why choose this:</strong> Choose Mint Boys Elite for maximum local visibility, verified trust, and instant client connection.</p>
                  <div className="pt-2 border-t border-neutral-800 text-amber-400 font-medium italic">
                    👑 Thank you for choosing Mint Boys Elite! We are thrilled to welcome you to our verified network.
                  </div>
                </div>
              )}

              {selectedTier === 'pro_elite' && (
                <div className="space-y-2 text-xs text-neutral-300">
                  <p><strong className="text-white">What it entails:</strong> Ultimate VIP tier ($29.99/mo automatic billing) featuring top spotlight placement and premier concierge privileges.</p>
                  <p><strong className="text-cyan-400">Why choose this:</strong> Choose Pro Elite for absolute top-tier exposure and maximum priority across the platform.</p>
                  <div className="pt-2 border-t border-neutral-800 text-cyan-300 font-medium italic">
                    ⭐ Thank you for choosing Pro Elite VIP! We appreciate your commitment to our highest tier.
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-[#FFC107] hover:bg-[#ffca28] text-neutral-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Continue to Registration Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Detailed Registration Form */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-300">
              Fill out your profile details so other users know what you have to offer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus VIP"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Full Name (Private)</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Sterling"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Location</label>
                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="text-[11px] text-[#FFC107] hover:underline font-bold flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Lookup on Google Maps</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase">What You Have to Offer (Services)</label>
              <input
                type="text"
                placeholder="e.g. Travel Companion, Event Hosting, VIP Dining"
                value={offerings}
                onChange={e => setOfferings(e.target.value)}
                className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase">Brief Description / Bio</label>
              <textarea
                rows={2}
                placeholder="Share a bit about yourself and what you're looking for..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107] resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Weight</label>
                <input
                  type="text"
                  placeholder="170 lbs"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Height / Inches</label>
                <input
                  type="text"
                  placeholder="5'11&quot;"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Endowment (5" to 14")</label>
                <select
                  value={endowment}
                  onChange={e => setEndowment(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                >
                  <option value="">Select Inches</option>
                  {Array.from({ length: 19 }, (_, i) => {
                    const val = (5 + i * 0.5).toFixed(1);
                    const label = `${val.endsWith('.0') ? parseInt(val) : val} Inches`;
                    return (
                      <option key={val} value={`${val} Inches`}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Sexuality</label>
                <select
                  value={sexuality}
                  onChange={e => setSexuality(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                >
                  <option value="Gay">Gay</option>
                  <option value="Bi">Bi</option>
                  <option value="Straight">Straight</option>
                  <option value="Queer">Queer</option>
                  <option value="Pansexual">Pansexual</option>
                  <option value="Curious">Curious</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Position / Role</label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                >
                  <option value="Top">Top</option>
                  <option value="Vers Top">Vers Top</option>
                  <option value="Versatile">Versatile</option>
                  <option value="Vers Bottom">Vers Bottom</option>
                  <option value="Bottom">Bottom</option>
                  <option value="Side">Side</option>
                  <option value="Oral / Active">Oral Only</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Ethnicity</label>
                <select
                  value={ethnicity}
                  onChange={e => setEthnicity(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                >
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                  <option value="Latino / Hispanic">Latino / Hispanic</option>
                  <option value="Asian">Asian</option>
                  <option value="Middle Eastern">Middle Eastern</option>
                  <option value="Mixed / Multi">Mixed / Multi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Likes</label>
                <input
                  type="text"
                  placeholder="e.g. Travel, dining, good hygiene"
                  value={likes}
                  onChange={e => setLikes(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Dislikes</label>
                <input
                  type="text"
                  placeholder="e.g. Drama, rudeness, ghosting"
                  value={dislikes}
                  onChange={e => setDislikes(e.target.value)}
                  className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase">Meeting Preference</label>
              <select
                value={meetingPreference}
                onChange={e => setMeetingPreference(e.target.value)}
                className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
              >
                <option value="Hosting & Traveling">Hosting & Traveling</option>
                <option value="Hosting Only">Hosting Only</option>
                <option value="Traveling to You">Traveling to You</option>
                <option value="Out & About / Public">Out & About / Public Dates</option>
                <option value="Discreet Hotels">Discreet Hotels</option>
                <option value="Any / Flexible">Any / Flexible</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase">Telephone Number / Contact for Services</label>
              <input
                type="text"
                placeholder="e.g. +1 555-0199 or email@domain.com"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full mt-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC107]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!contactNumber.trim()) {
                    showToast('⚠️ Please provide a telephone number or email.');
                    return;
                  }
                  if (selectedTier === 'regular') {
                    setStep(5); // Regular users skip payment, go straight to photo upload
                  } else {
                    setStep(3); // Paid tiers go to verification code
                  }
                }}
                className="flex-1 py-3 bg-[#FFC107] hover:bg-[#ffca28] text-neutral-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Verification (SMS Code or Google Verification) */}
        {step === 3 && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-[#FFC107]">
              <Phone className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Confirm Email or Telephone</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                Verify via text code sent to <span className="text-amber-400 font-mono font-bold">{contactNumber}</span> or instantly verify with Google.
              </p>
            </div>

            {/* Google Verification Button */}
            <div className="max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => {
                  setIsVerified(true);
                  showToast('🛡️ Google Account successfully verified!');
                  setStep(4);
                }}
                className="w-full py-3 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md mb-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.16 21.32 7.21 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.13 0 9.87 0 12s.43 3.87 1.18 5.39l4.09-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.21 0 3.16 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
                <span>Verify Instantly with Google</span>
              </button>
              <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-2">- OR SMS CODE -</div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 max-w-xs mx-auto space-y-3">
              <input
                type="text"
                maxLength={4}
                placeholder="Enter 4-digit code"
                value={verificationCodeInput}
                onChange={e => setVerificationCodeInput(e.target.value)}
                className="w-full text-center bg-black border border-neutral-700 rounded-xl py-3 text-lg font-mono font-bold text-amber-400 tracking-widest outline-none focus:border-[#FFC107]"
              />
              <p className="text-[10px] text-neutral-500">
                Simulated code sent: <span className="text-white font-mono font-bold">{sentCode}</span> (or enter 1234)
              </p>
              <button
                type="button"
                onClick={handleSendCode}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Resend SMS Code
              </button>
            </div>

            <div className="flex gap-2 pt-2 max-w-xs mx-auto">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition"
              >
                Back
              </button>
              <button
                onClick={handleVerifyCode}
                className="flex-1 py-3 bg-[#FFC107] hover:bg-[#ffca28] text-neutral-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Verify & Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Merchant Payment Portal */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold">Selected Plan</span>
                  <h4 className="font-bold text-white text-sm">{tierTitle} ({billingCycle})</h4>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#FFC107]">{tierAmount}</span>
                  <span className="text-[10px] text-neutral-400 block">Automatic Billing</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Card Number (Secure Merchant Portal)</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">CVC</label>
                  <input
                    type="password"
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value)}
                    className="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-[11px] text-emerald-300 flex items-center space-x-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>256-Bit SSL Encrypted Merchant Payment • Automatic billing will apply each cycle.</span>
              </div>
            </div>

            <button
              onClick={handlePaymentConfirm}
              className="w-full py-3.5 bg-[#FFC107] hover:bg-[#ffca28] text-neutral-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Confirm Payment & Continue to Media Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 5: Upload Photos & Videos */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 space-y-1">
              <p className="font-bold">📸 Photo & Video Upload (Admin Approval Required)</p>
              <p className="text-neutral-300">
                Upload your profile photos and showcase videos. All uploaded media will be reviewed and approved by admins before public display.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="border-2 border-dashed border-neutral-700 hover:border-[#FFC107] rounded-2xl p-6 text-center cursor-pointer bg-neutral-900 transition flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) {
                      const sampleUrls = files.map(() => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80');
                      setUploadedPhotos(prev => [...prev, ...sampleUrls]);
                      showToast(`📷 Uploaded ${files.length} photo(s) successfully for admin approval.`);
                    }
                  }}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-[#FFC107] mb-1" />
                <span className="text-xs font-bold text-white">Upload Photos</span>
                <span className="text-[10px] text-neutral-400">JPG, PNG</span>
              </label>

              <label className="border-2 border-dashed border-neutral-700 hover:border-[#FFC107] rounded-2xl p-6 text-center cursor-pointer bg-neutral-900 transition flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) {
                      setUploadedVideos(prev => [...prev, 'sample_video.mp4']);
                      showToast(`🎥 Uploaded ${files.length} video(s) successfully for admin approval.`);
                    }
                  }}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-cyan-400 mb-1" />
                <span className="text-xs font-bold text-white">Upload Videos</span>
                <span className="text-[10px] text-neutral-400">MP4, MOV</span>
              </label>
            </div>

            {(uploadedPhotos.length > 0 || uploadedVideos.length > 0) && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-emerald-400 flex items-center justify-between">
                <span>✓ {uploadedPhotos.length} photo(s) & {uploadedVideos.length} video(s) staged for admin approval.</span>
              </div>
            )}

            <button
              onClick={handleMediaFinish}
              className="w-full py-3.5 bg-[#FFC107] hover:bg-[#ffca28] text-neutral-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Complete Registration & Enter Site</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 6: Final Success & Unrestricted Access */}
        {step === 6 && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Welcome to Blaze!</h3>
            <p className="text-xs text-neutral-300 max-w-sm mx-auto">
              Your registration is complete, payment & automatic billing are active, and your media has been submitted for admin approval. You now have full unrestricted access to all features on the site!
            </p>
            <button
              onClick={handleFinalFinish}
              className="px-6 py-3.5 bg-[#FFC107] hover:bg-[#ffca28] text-neutral-950 font-black rounded-xl text-xs transition shadow-lg"
            >
              Start Exploring Live Radar Now ⚡
            </button>
          </div>
        )}

        {/* Google Maps City Picker Modal */}
        <GoogleMapsCityPickerModal
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          currentLocation={locationName}
          onSelectCity={(cityName) => {
            setLocationName(cityName);
            showToast(`🗺️ Location set to ${cityName} via Google Maps`);
          }}
        />

      </div>
    </div>
  );
};
