import React, { useState, useEffect } from 'react';
import { X, Eye, Shield, ShieldCheck, Bell, Moon, Sun, Globe, Plane, Sparkles, Crown, Users, Flag, MessageSquare, CreditCard, Download, Receipt, PlusCircle, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  readReceiptsEnabled: boolean;
  onToggleReadReceipts: (val: boolean) => void;
  ghostModeEnabled: boolean;
  onToggleGhostMode: (val: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  travelModeEnabled: boolean;
  onToggleTravelMode: (val: boolean) => void;
  travelCity: string;
  onTravelCityChange: (city: string) => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  subscription: { type: string; expiresAt: number };
  viewedCount: number;
  onOpenSubscription: () => void;
  gridColumns: number;
  onGridColumnsChange: (cols: number) => void;
  currentUser?: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onOpenSafetyGuidelines?: () => void;
  autoAdvancePhotosEnabled: boolean;
  onToggleAutoAdvancePhotos: (val: boolean) => void;
  reportHistory?: Array<{
    id: string;
    profileId: string;
    profileName: string;
    reason: string;
    details: string;
    timestamp: number;
    dateStr: string;
    status?: string;
  }>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  readReceiptsEnabled,
  onToggleReadReceipts,
  ghostModeEnabled,
  onToggleGhostMode,
  isDarkMode,
  onToggleTheme,
  currentLanguage,
  onLanguageChange,
  travelModeEnabled,
  onToggleTravelMode,
  travelCity,
  onTravelCityChange,
  accentColor,
  onAccentColorChange,
  subscription,
  viewedCount,
  onOpenSubscription,
  gridColumns,
  onGridColumnsChange,
  currentUser,
  onUpdateUser,
  onOpenSafetyGuidelines,
  autoAdvancePhotosEnabled,
  onToggleAutoAdvancePhotos,
  reportHistory = [],
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'merchant' | 'verification' | 'safety' | 'account_safety' | 'private_albums' | 'activity' | 'customization' | 'card_display'>('general');
  const [verificationMethod, setVerificationMethod] = useState<'selfie' | 'id_doc'>('selfie');
  const [uploadedDocUrl, setUploadedDocUrl] = useState<string>(currentUser?.verificationPhoto || currentUser?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>('');

  const [cardShowAge, setCardShowAge] = useState<boolean>(() => localStorage.getItem('blaze_card_show_age') !== 'false');
  const [cardShowDistance, setCardShowDistance] = useState<boolean>(() => localStorage.getItem('blaze_card_show_distance') !== 'false');
  const [cardShowStatus, setCardShowStatus] = useState<boolean>(() => localStorage.getItem('blaze_card_show_status') !== 'false');
  const [cardShowContacts, setCardShowContacts] = useState<boolean>(() => localStorage.getItem('blaze_card_show_contacts') !== 'false');
  const [cardShowDots, setCardShowDots] = useState<boolean>(() => localStorage.getItem('blaze_card_show_dots') !== 'false');
  const [cardShowTap, setCardShowTap] = useState<boolean>(() => localStorage.getItem('blaze_card_show_tap') !== 'false');

  const toggleCardPref = (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    localStorage.setItem(key, String(val));
  };

  const handleStartVerification = () => {
    setVerificationLoading(true);
    setVerificationStep('Analyzing facial geometry & liveness metrics...');
    setTimeout(() => {
      setVerificationStep('Comparing selfie against primary profile photo...');
      setTimeout(() => {
        setVerificationStep('Validating anti-spoofing security check...');
        setTimeout(() => {
          setVerificationLoading(false);
          setVerificationStep('');
          if (currentUser && onUpdateUser) {
            const updated = {
              ...currentUser,
              verified: true,
              isVerified: true,
              verificationPending: false,
              verificationPhoto: uploadedDocUrl,
            };
            onUpdateUser(updated);
          }
          alert('🎉 Verification Successful! Your Verified Badge is now active on your profile.');
        }, 1000);
      }, 1000);
    }, 1200);
  };
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('blaze_sounds_enabled') !== 'false';
  });
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState<boolean>(() => {
    return localStorage.getItem('blaze_auto_archive') === 'true';
  });

  const toggleSounds = (val: boolean) => {
    setSoundsEnabled(val);
    localStorage.setItem('blaze_sounds_enabled', String(val));
  };

  const toggleAutoArchive = (val: boolean) => {
    setAutoArchiveEnabled(val);
    localStorage.setItem('blaze_auto_archive', String(val));
  };
  const [blockedUsersList, setBlockedUsersList] = useState([
    { id: 'user_blk_1', name: 'Blocked User X', age: 28, distance: 4.2, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', reason: 'Harassment', date: 'Aug 15, 2026' },
    { id: 'user_blk_2', name: 'Spam Bot 99', age: 34, distance: 12.1, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', reason: 'Spam', date: 'Aug 20, 2026' },
  ]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(['user_blocked_99', 'user_spam_42']);
  const [reportedList, setReportedList] = useState<{ id: string; name: string; reason: string; date: string }[]>([
    { id: 'rep_1', name: 'Fake Account Test', reason: 'Spam', date: '2 days ago' },
  ]);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    'Sure!',
    'Sounds good!',
    "That's interesting",
    'Let’s meet up! 👋',
    'Coffee sometime? ☕',
  ]);
  const [newQuickReply, setNewQuickReply] = useState('');
  const [visitors, setVisitors] = useState<{ id: string; name: string; time: string; photo: string }[]>([
    { id: 'v_1', name: 'Sophia Sterling', time: '12m ago', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { id: 'v_2', name: 'Marcus Vance', time: '1h ago', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { id: 'v_3', name: 'Elena Rostova', time: '3h ago', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  ]);

  const [privateAlbumViewers, setPrivateAlbumViewers] = useState([
    { id: 'usr_101', name: 'Sophia Sterling', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=200&q=80', status: 'allowed', hasOpenAlbum: true },
    { id: 'usr_102', name: 'Marcus Vance', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=200&q=80', status: 'disallowed', hasOpenAlbum: true },
    { id: 'usr_103', name: 'Elena Rostova', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=200&q=80', status: 'allowed', hasOpenAlbum: false },
  ]);

  const [myAlbumPhotos, setMyAlbumPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  ]);
  const [newAlbumPhotoUrl, setNewAlbumPhotoUrl] = useState('');

  // Payment history and linked methods state
  const [paymentHistory, setPaymentHistory] = useState([
    { id: 'inv_1042', plan: 'Elite Companion Pass (Monthly)', amount: '$9.99', date: 'Aug 28, 2026', status: 'Paid', card: '•••• 4242' },
    { id: 'inv_1021', plan: 'Pro Boost Bundle (7-Day)', amount: '$4.99', date: 'Aug 21, 2026', status: 'Paid', card: '•••• 4242' },
    { id: 'inv_0984', plan: 'Single Day Pass', amount: '$1.99', date: 'Aug 14, 2026', status: 'Paid', card: 'Apple Pay' },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pm_1', type: 'Visa', last4: '4242', expiry: '08/28', isDefault: true },
    { id: 'pm_2', type: 'Apple Pay', last4: 'Device', expiry: 'Active', isDefault: false },
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!subscription || subscription.type === 'none' || subscription.expiresAt <= Date.now()) return;

    const updateTimer = () => {
      const diff = subscription.expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  if (!isOpen) return null;

  const addQuickReply = () => {
    if (newQuickReply.trim() && !quickReplies.includes(newQuickReply.trim())) {
      setQuickReplies([...quickReplies, newQuickReply.trim()]);
      setNewQuickReply('');
    }
  };

  const removeQuickReply = (idx: number) => {
    setQuickReplies(quickReplies.filter((_, i) => i !== idx));
  };

  const unblockUser = (userId: string) => {
    setBlockedUsers(blockedUsers.filter(id => id !== userId));
  };

  const downloadReceipt = (invoiceId: string, planName: string, amount: string, date: string) => {
    const receiptContent = `========================================
             BLAZE DATING APP
         OFFICIAL PAYMENT RECEIPT
========================================
Invoice ID: ${invoiceId}
Date: ${date}
Plan: ${planName}
Amount Paid: ${amount}
Status: SUCCESSFUL (PAID)
Payment Method: Visa •••• 4242

Thank you for being a valued Blaze member!
For support, contact support@blazeapp.io
========================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Blaze_Receipt_${invoiceId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardNumber.trim()) {
      const last4 = newCardNumber.slice(-4) || '1234';
      setPaymentMethods([
        ...paymentMethods,
        { id: `pm_${Date.now()}`, type: 'Mastercard', last4, expiry: newCardExpiry || '12/28', isDefault: false },
      ]);
      setNewCardNumber('');
      setNewCardExpiry('');
      setShowAddCard(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Vertical Sidebar Navigation */}
        <div className="w-full md:w-64 bg-[#161616] border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col shrink-0">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-base font-black text-white tracking-wide">Settings & Preferences</h3>
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
            {[
              { id: 'general', label: 'General', icon: Bell },
              { id: 'merchant', label: 'Merchant Dashboard', icon: CreditCard },
              { id: 'verification', label: 'Verified Badge Request', icon: ShieldCheck },
              { id: 'safety', label: 'Safety & Privacy', icon: Shield },
              { id: 'account_safety', label: `Account Safety (${blockedUsersList.length})`, icon: Shield },
              { id: 'private_albums', label: 'Private Albums & Access', icon: Eye },
              { id: 'activity', label: 'Who Viewed Me', icon: Users },
              { id: 'customization', label: 'Customization', icon: Sparkles },
              { id: 'card_display', label: 'Profile Card Display', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#1C1C1C]">
          <div className="hidden md:flex items-center justify-end p-4 border-b border-neutral-800">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'card_display' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🎴</span> Profile Card Display Customization
                </h4>
                <p className="text-xs text-neutral-400">
                  You have full control over what information is displayed on your profile card. As mandated by platform rules, your subscription membership badge and verification button remain mandatory and cannot be hidden.
                </p>
              </div>

              <div className="space-y-3">
                {/* Age */}
                <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">Show Age</h5>
                    <p className="text-[11px] text-neutral-400">Display your age next to your name.</p>
                  </div>
                  <button
                    onClick={() => toggleCardPref('blaze_card_show_age', !cardShowAge, setCardShowAge)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${cardShowAge ? 'bg-amber-500' : 'bg-neutral-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${cardShowAge ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Distance & Location */}
                <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">Show Distance & Location</h5>
                    <p className="text-[11px] text-neutral-400">Display how many miles away you are.</p>
                  </div>
                  <button
                    onClick={() => toggleCardPref('blaze_card_show_distance', !cardShowDistance, setCardShowDistance)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${cardShowDistance ? 'bg-amber-500' : 'bg-neutral-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${cardShowDistance ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Online Status */}
                <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">Show Online / Activity Status</h5>
                    <p className="text-[11px] text-neutral-400">Display online indicator and last active time.</p>
                  </div>
                  <button
                    onClick={() => toggleCardPref('blaze_card_show_status', !cardShowStatus, setCardShowStatus)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${cardShowStatus ? 'bg-amber-500' : 'bg-neutral-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${cardShowStatus ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Contacts / Call / WhatsApp */}
                <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">Show Direct Call & WhatsApp Buttons</h5>
                    <p className="text-[11px] text-neutral-400">Display direct phone and WhatsApp contact pills.</p>
                  </div>
                  <button
                    onClick={() => toggleCardPref('blaze_card_show_contacts', !cardShowContacts, setCardShowContacts)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${cardShowContacts ? 'bg-amber-500' : 'bg-neutral-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${cardShowContacts ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Photo Dots */}
                <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">Show Photo Pagination Indicators</h5>
                    <p className="text-[11px] text-neutral-400">Display photo carousel dots on card.</p>
                  </div>
                  <button
                    onClick={() => toggleCardPref('blaze_card_show_dots', !cardShowDots, setCardShowDots)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${cardShowDots ? 'bg-amber-500' : 'bg-neutral-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${cardShowDots ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Quick Tap Button */}
                <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">Show Quick Like/Tap Flame Button</h5>
                    <p className="text-[11px] text-neutral-400">Display the interactive flame tap button.</p>
                  </div>
                  <button
                    onClick={() => toggleCardPref('blaze_card_show_tap', !cardShowTap, setCardShowTap)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${cardShowTap ? 'bg-amber-500' : 'bg-neutral-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${cardShowTap ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Mandatory / Locked items */}
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2 opacity-75">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-amber-400">Subscription Membership Badge</h5>
                      <p className="text-[10px] text-neutral-400">Mandatory system requirement (Locked)</p>
                    </div>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-bold">Always On</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                    <div>
                      <h5 className="text-xs font-bold text-blue-400">Verification Button & Badge</h5>
                      <p className="text-[10px] text-neutral-400">Mandatory system requirement (Locked)</p>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg font-bold">Always On</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Membership Status Box */}
              <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {subscription.type === 'none' ? 'Free Companion Tier' : `${subscription.type} Membership`}
                    </h4>
                    <p className="text-xs text-amber-300/80">
                      {subscription.type === 'none'
                        ? 'Upgrade to Pro or Elite for unlimited likes & view histories.'
                        : `Active • Expires in ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenSubscription}
                  className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:opacity-90 transition shadow"
                >
                  {subscription.type === 'none' ? 'Upgrade' : 'Manage'}
                </button>
              </div>

              {/* Read Receipts */}
              <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Read Receipts</h4>
                    <p className="text-xs text-neutral-400">Let matches see when you've read their messages.</p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleReadReceipts(!readReceiptsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    readReceiptsEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      readReceiptsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Incoming Message & Wink Sounds</h4>
                    <p className="text-xs text-neutral-400">Play audio feedback for incoming chat messages and winks.</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSounds(!soundsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    soundsEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      soundsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-archive chats toggle */}
              <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Auto-archive chats after 7 days</h4>
                    <p className="text-xs text-neutral-400">Automatically archive chats with no activity for 7 days to keep inbox clean.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAutoArchive(!autoArchiveEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    autoArchiveEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      autoArchiveEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-advance photos */}
              <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Auto-advance photos</h4>
                    <p className="text-xs text-neutral-400">Automatically cycle through profile photos every 3 seconds while viewing.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleAutoAdvancePhotos(!autoAdvancePhotosEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    autoAdvancePhotosEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      autoAdvancePhotosEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ghost Mode</h4>
                    <p className="text-xs text-neutral-400">Hide your distance and last active status from others in discovery.</p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleGhostMode(!ghostModeEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    ghostModeEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      ghostModeEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Travel Mode */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Travel Mode</h4>
                      <p className="text-xs text-neutral-400">Teleport your location to meet singles in another city.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleTravelMode(!travelModeEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                      travelModeEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        travelModeEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {travelModeEnabled && (
                  <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-medium">Target City:</span>
                    <input
                      type="text"
                      value={travelCity}
                      onChange={(e) => onTravelCityChange(e.target.value)}
                      placeholder="e.g. Tokyo, Paris, New York"
                      className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'merchant' && (
            <div className="space-y-5">
              {/* Subscription Status Card */}
              <div className="bg-gradient-to-br from-neutral-900 via-[#222222] to-neutral-900 border border-amber-500/40 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                      <Crown className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Active Plan
                      </span>
                      <h4 className="text-base font-black text-white mt-1">
                        {subscription.type === 'none' ? 'Free Companion Tier' : `${subscription.type} Membership`}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={onOpenSubscription}
                    className="px-4 py-2.5 bg-[#FFC107] text-[#121212] font-black text-xs rounded-xl hover:opacity-90 transition shadow-lg"
                  >
                    Manage Billing
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                  <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Renewal Date</p>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {subscription.type === 'none' ? 'N/A' : new Date(subscription.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-neutral-400">Auto-Renew</p>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">Enabled (Pro/Elite)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = (window as any).__blazeAutoRenew !== false;
                        (window as any).__blazeAutoRenew = !current;
                      }}
                      className="w-10 h-5 rounded-full bg-amber-500 transition-colors relative p-0.5"
                    >
                      <div className="w-4 h-4 rounded-full bg-black translate-x-5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Linked Payment Methods */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Linked Payment Methods ({paymentMethods.length})</span>
                  </h4>
                  <button
                    onClick={() => setShowAddCard(!showAddCard)}
                    className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Card</span>
                  </button>
                </div>

                {showAddCard && (
                  <form onSubmit={handleAddPaymentMethod} className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-2.5 animate-in fade-in duration-200">
                    <p className="text-xs font-bold text-white">Add New Card / Payment Method</p>
                    <input
                      type="text"
                      placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                      value={newCardNumber}
                      onChange={(e) => setNewCardNumber(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={newCardExpiry}
                        onChange={(e) => setNewCardExpiry(e.target.value)}
                        className="w-1/2 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                        required
                      />
                      <button
                        type="submit"
                        className="w-1/2 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:opacity-90 transition"
                      >
                        Save Card
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 font-bold text-xs">
                          💳
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{pm.type} •••• {pm.last4}</span>
                            {pm.isDefault && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-neutral-400">Expires {pm.expiry}</p>
                        </div>
                      </div>
                      {!pm.isDefault && (
                        <button
                          onClick={() => setPaymentMethods(paymentMethods.filter(m => m.id !== pm.id))}
                          className="text-xs text-neutral-500 hover:text-red-400 font-bold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment History List */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Payment History & Invoices</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-medium">3 Past Invoices</span>
                </div>

                <div className="space-y-2.5">
                  {paymentHistory.map((item) => (
                    <div key={item.id} className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-white">{item.plan}</p>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400">
                          {item.date} • Paid with {item.card} • <span className="font-mono text-neutral-300">{item.id}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-extrabold text-amber-400 font-mono">{item.amount}</span>
                        <button
                          onClick={() => downloadReceipt(item.id, item.plan, item.amount, item.date)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-[#FFC107] text-neutral-300 hover:text-black transition flex items-center gap-1 text-xs font-bold shadow"
                          title="Download PDF/Text Receipt"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction History Section for Pro/Elite $19.99 subscription payments */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-cyan-400" />
                    <span>Transaction History ({currentUser?.transactionHistory?.length || 0})</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-medium">Pro & Elite Subscriptions ($19.99/mo)</span>
                </div>

                <div className="space-y-2.5">
                  {(!currentUser?.transactionHistory || currentUser.transactionHistory.length === 0) ? (
                    <div className="text-center py-6 bg-neutral-900 rounded-xl text-neutral-400 text-xs">
                      No subscription payment transactions recorded yet. Complete the $19.99/mo payment to view records.
                    </div>
                  ) : (
                    currentUser.transactionHistory.map(tx => (
                      <div key={tx.id} className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-bold text-white">$19.99/mo Subscription Payment</p>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                              {tx.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            Date: <span className="text-white">{tx.date}</span> • Transaction ID: <span className="font-mono text-cyan-400">{tx.id}</span>
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-amber-400 font-mono">{tx.amount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Billing Pause Option for Pro/Elite users */}
              {(currentUser?.isCompanionPro || currentUser?.membershipTier === 'Elite Companion' || currentUser?.membershipTier === 'Pro') && (
                <div className="bg-[#252525] border border-amber-500/30 p-4 rounded-2xl space-y-3 bg-gradient-to-r from-amber-500/10 to-[#252525]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Plane className="w-4 h-4 text-amber-400" />
                      <span>Subscription Billing Pause</span>
                    </h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                      Up to 30 Days
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">
                    Temporarily suspend your automatic subscription billing for up to 30 days without losing your verified badge or elite companion status.
                  </p>

                  {currentUser.billingPausedUntil && currentUser.billingPausedUntil > Date.now() ? (
                    <div className="space-y-2">
                      <div className="bg-neutral-900 p-3 rounded-xl border border-amber-500/40 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-amber-300">Billing Currently Paused</p>
                          <p className="text-[10px] text-neutral-400">
                            Resumes on: <span className="text-white">{new Date(currentUser.billingPausedUntil).toLocaleDateString()}</span> (Verification Preserved)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateUser) {
                              onUpdateUser({ ...currentUser, billingPausedUntil: undefined });
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-500 text-black font-black text-xs rounded-xl hover:bg-amber-400 transition"
                        >
                          Resume Billing
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateUser) {
                          const pauseUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
                          onUpdateUser({ ...currentUser, billingPausedUntil: pauseUntil });
                        }
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
                    >
                      ⏸️ Pause Billing for 30 Days
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-4">
              {/* Real Life Meeting Safety & Community Guidelines Link Card */}
              <div className="bg-[#252525] border border-emerald-500/30 p-4 rounded-2xl space-y-3 bg-gradient-to-r from-emerald-500/10 to-[#252525]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Safety & Community Guidelines</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    Essential Tips
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  Read our community standards, anti-nude policy, and expert safety tips for meeting people in real life (public venues, personal boundaries, and scam prevention).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSafetyGuidelines) {
                      onOpenSafetyGuidelines();
                    }
                  }}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <span>🛡️ Open Safety & Community Guidelines Center</span>
                </button>
              </div>

              {/* Blocked Users Section */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span>Blocked Users ({blockedUsers.length})</span>
                  </h4>
                </div>
                {blockedUsers.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No blocked users.</p>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map((userId) => (
                      <div key={userId} className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                        <span className="text-xs text-neutral-300 font-mono">{userId}</span>
                        <button
                          onClick={() => unblockUser(userId)}
                          className="px-3 py-1 rounded-lg bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Administrative History & Report Queue Section */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span>Administrative History & Report Queue ({reportHistory.length})</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400">Chronological Logs</span>
                </div>
                {reportHistory.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-2">No safety reports submitted yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {reportHistory.map((rep) => {
                      const status = rep.status || 'Pending';
                      const statusColor = 
                        status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        status === 'Dismissed' ? 'bg-neutral-800 text-neutral-400 border-neutral-700' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      return (
                        <div key={rep.id} className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white">{rep.profileName}</p>
                              <span className="text-[10px] text-neutral-500 font-mono">ID: {rep.profileId}</span>
                            </div>
                            <p className="text-[11px] text-neutral-300 font-medium">Reason: {rep.reason}</p>
                            {rep.details && <p className="text-[10px] text-neutral-400 italic">Details: "{rep.details}"</p>}
                            <p className="text-[10px] text-neutral-500">Submitted on {rep.dateStr} (Report ID: {rep.id})</p>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border whitespace-nowrap ${statusColor}`}>
                            {status === 'Pending' ? '⏳ Pending' : status === 'Resolved' ? '✓ Resolved' : '✕ Dismissed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {/* Who Viewed Me */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Recent Profile Visitors ({viewedCount})</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Tracking
                  </span>
                </div>
                <div className="space-y-2.5">
                  {visitors.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                      <div className="flex items-center space-x-3">
                        <img src={v.photo} alt={v.name} className="w-9 h-9 rounded-full object-cover border border-neutral-700" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-xs font-bold text-white">{v.name}</p>
                          <p className="text-[10px] text-neutral-400">Visited your profile {v.time}</p>
                        </div>
                      </div>
                      <span className="text-xs text-amber-400 font-bold hover:underline cursor-pointer">
                        View ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customization' && (
            <div className="space-y-4">
              {/* Quick Replies Management */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Custom Quick Replies ({quickReplies.length}/6)</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((reply, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 text-xs px-3 py-1.5 rounded-full text-white font-medium">
                      <span>{reply}</span>
                      <button
                        onClick={() => removeQuickReply(idx)}
                        className="text-neutral-500 hover:text-red-400 ml-1 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newQuickReply}
                    onChange={(e) => setNewQuickReply(e.target.value)}
                    placeholder="Add custom quick reply..."
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={addQuickReply}
                    className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:opacity-90 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Interface Accent Color</h4>
                    <p className="text-xs text-neutral-400">Customize your platform branding accent.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-1">
                  {[
                    { name: 'Gold', value: '#FFC107' },
                    { name: 'Emerald', value: '#10B981' },
                    { name: 'Cyan', value: '#06B6D4' },
                    { name: 'Violet', value: '#8B5CF6' },
                    { name: 'Rose', value: '#F43F5E' },
                  ].map((c) => (
                    <button
                      key={c.value}
                      onClick={() => onAccentColorChange(c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        accentColor === c.value ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Grid Density Layout Slider */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Profile Grid Density</h4>
                    <p className="text-xs text-neutral-400">Adjust grid columns ({gridColumns} columns: {gridColumns <= 2 ? 'Wide / Large' : gridColumns === 3 ? 'Standard' : 'Compact'})</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-xs text-neutral-400 font-semibold">2 (Wide)</span>
                  <input
                    type="range"
                    min="2"
                    max="5"
                    step="1"
                    value={gridColumns}
                    onChange={(e) => onGridColumnsChange(Number(e.target.value))}
                    className="flex-1 accent-[#FFC107] bg-neutral-800 h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs text-neutral-400 font-semibold">5 (Compact)</span>
                </div>
              </div>

              {/* Language Preference */}
              <div className="flex items-center justify-between bg-[#252525] border border-neutral-800 p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Language</h4>
                    <p className="text-xs text-neutral-400">Choose your preferred app language.</p>
                  </div>
                </div>
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white text-xs px-3 py-2 rounded-xl outline-none"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'account_safety' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Blocked Users & Account Safety</h4>
                  <p className="text-xs text-neutral-400">Review profiles you have blocked and unblock them if needed.</p>
                </div>
                <span className="text-xs bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full font-bold">
                  {blockedUsersList.length} Blocked
                </span>
              </div>

              {blockedUsersList.length === 0 ? (
                <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400">
                  <p className="text-sm font-medium">No blocked users</p>
                  <p className="text-xs text-neutral-500 mt-1">Users you block will appear here for review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedUsersList.map((user) => (
                    <div key={user.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-700 filter grayscale"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{user.name}, {user.age}</span>
                            <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-bold">Blocked</span>
                          </h5>
                          <p className="text-[11px] text-neutral-400 mt-0.5">Reason: <span className="text-amber-400 font-semibold">{user.reason}</span> • {user.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBlockedUsersList(prev => prev.filter(u => u.id !== user.id));
                        }}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl transition border border-neutral-700 shadow"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'private_albums' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Private Albums & Access Control</h4>
                  <p className="text-xs text-neutral-400">Manage who can view your private album and explore users with open private albums.</p>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold">
                  🔒 Secure Access
                </span>
              </div>

              {/* Edit My Private Album */}
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Edit My Private Album Photos</h5>
                  <span className="text-[11px] text-neutral-400">{myAlbumPhotos.length} Photos</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {myAlbumPhotos.map((url, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-neutral-700">
                      <img src={url} alt={`Album ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        onClick={() => setMyAlbumPhotos(myAlbumPhotos.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-xs font-bold transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Paste Photo URL for private album..."
                    value={newAlbumPhotoUrl}
                    onChange={(e) => setNewAlbumPhotoUrl(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (newAlbumPhotoUrl.trim()) {
                        setMyAlbumPhotos([...myAlbumPhotos, newAlbumPhotoUrl.trim()]);
                        setNewAlbumPhotoUrl('');
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:opacity-90 transition"
                  >
                    Add Photo
                  </button>
                </div>
              </div>

              {/* Manage Viewers & Open Albums */}
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Viewers & Open Private Albums</h5>
                <div className="space-y-2.5">
                  {privateAlbumViewers.map((viewer) => (
                    <div key={viewer.id} className="bg-[#222222] border border-neutral-800 p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={viewer.photo} alt={viewer.name} className="w-10 h-10 rounded-xl object-cover border border-neutral-700" referrerPolicy="no-referrer" />
                        <div>
                          <h6 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{viewer.name}</span>
                            {viewer.hasOpenAlbum && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">Open Private Album</span>
                            )}
                          </h6>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Access status: <span className={viewer.status === 'allowed' ? 'text-emerald-400 font-bold' : 'text-neutral-400 font-bold'}>{viewer.status}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {viewer.status === 'allowed' ? (
                          <button
                            onClick={() => {
                              setPrivateAlbumViewers(privateAlbumViewers.map(v => v.id === viewer.id ? { ...v, status: 'disallowed' } : v));
                            }}
                            className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-bold text-xs rounded-xl transition"
                          >
                            Disallow
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setPrivateAlbumViewers(privateAlbumViewers.map(v => v.id === viewer.id ? { ...v, status: 'allowed' } : v));
                            }}
                            className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold text-xs rounded-xl transition"
                          >
                            Allow View
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-neutral-900 via-[#222222] to-neutral-900 border border-cyan-500/40 p-6 rounded-2xl space-y-5 shadow-xl relative overflow-hidden">
                {verificationLoading && (
                  <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-white">Verifying Your Identity</h4>
                      <p className="text-xs text-cyan-400 font-bold">{verificationStep}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                        Official Badge
                      </span>
                      <h4 className="text-lg font-black text-white mt-1">Request Verified Badge</h4>
                    </div>
                  </div>
                  {currentUser?.verified || currentUser?.isVerified ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow">
                      ✓ Verified Active
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">
                      Unverified Account
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  Get the official blue checkmark badge on your profile by verifying your identity with a quick selfie capture or government ID document upload. Verified accounts receive 3x more interactions and trust.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setVerificationMethod('selfie')}
                    className={`p-4 rounded-xl border text-left transition space-y-1 ${
                      verificationMethod === 'selfie'
                        ? 'bg-cyan-500/10 border-cyan-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">📸 Selfie Liveness Scan</span>
                      {verificationMethod === 'selfie' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-neutral-400">Instant AI facial biometric check</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationMethod('id_doc')}
                    className={`p-4 rounded-xl border text-left transition space-y-1 ${
                      verificationMethod === 'id_doc'
                        ? 'bg-cyan-500/10 border-cyan-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">🪪 Government ID Scan</span>
                      {verificationMethod === 'id_doc' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-neutral-400">Upload passport or driver license</p>
                  </button>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    {verificationMethod === 'selfie' ? 'Selfie Verification Capture' : 'Document Upload Scan'}
                  </h5>
                  <div className="flex items-center gap-4">
                    <img
                      src={uploadedDocUrl}
                      alt="Verification Source"
                      className="w-20 h-20 rounded-xl object-cover border border-cyan-500/40 shadow-md shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-2 flex-1">
                      <p className="text-[11px] text-neutral-400">
                        {verificationMethod === 'selfie'
                          ? 'Position your face clearly within good lighting and click Start Verification.'
                          : 'Ensure all 4 corners of your ID document are clearly visible.'}
                      </p>
                      <input
                        type="text"
                        placeholder="Paste image URL or use camera snapshot..."
                        value={uploadedDocUrl}
                        onChange={(e) => setUploadedDocUrl(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleStartVerification}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs rounded-xl hover:opacity-90 transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Start Automated Verification
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>

          <div className="p-4 bg-[#222222] border-t border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#FFC107] text-[#121212] font-bold text-xs hover:opacity-90 transition shadow"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

