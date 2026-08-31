import React, { useState, useEffect } from 'react';
import { X, Eye, Shield, Bell, Moon, Sun, Globe, Plane, Sparkles, Crown, Users, Flag, MessageSquare, CreditCard, Download, Receipt, PlusCircle, CheckCircle2 } from 'lucide-react';

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
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'merchant' | 'safety' | 'activity' | 'customization'>('general');
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
      <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <h3 className="text-lg font-black text-white tracking-wide">Settings & Preferences</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-neutral-800 bg-[#161616] px-4 gap-2 overflow-x-auto">
          {[
            { id: 'general', label: 'General', icon: Bell },
            { id: 'merchant', label: 'Merchant Dashboard', icon: CreditCard },
            { id: 'safety', label: 'Safety & Privacy', icon: Shield },
            { id: 'activity', label: 'Who Viewed Me', icon: Users },
            { id: 'customization', label: 'Customization', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-[#FFC107] text-[#FFC107]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
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

              {/* Ghost Mode */}
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
                  <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Billing Cycle</p>
                    <p className="text-xs font-bold text-white mt-0.5">Auto-Renewal Active</p>
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
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-4">
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

              {/* Reported Profiles Section */}
              <div className="bg-[#252525] border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span>Report History ({reportedList.length})</span>
                  </h4>
                </div>
                <div className="space-y-2">
                  {reportedList.map((rep) => (
                    <div key={rep.id} className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{rep.name}</p>
                        <p className="text-[10px] text-neutral-400">Reason: {rep.reason} • {rep.date}</p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        Under Review
                      </span>
                    </div>
                  ))}
                </div>
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
  );
};

