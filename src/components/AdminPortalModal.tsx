import React, { useState } from 'react';
import { UserProfile, ChatConversation } from '../types';
import { X, ShieldCheck, Lock, Key, Users, CheckCircle2, ShieldAlert, Megaphone, Trash2, Activity, LogOut, UserCheck, Search, BarChart3, TrendingUp, MessageSquare, Download, Wifi, WifiOff, DollarSign, Image as ImageIcon, AlertTriangle, Send, Crown, BellRing } from 'lucide-react';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  onUpdateProfiles: (updated: UserProfile[]) => void;
  conversations: ChatConversation[];
  onUpdateConversations: (updated: ChatConversation[]) => void;
  showToast: (msg: string) => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onUpdateProfiles,
  conversations,
  onUpdateConversations,
  showToast,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'users' | 'reports' | 'refunds' | 'moderation' | 'messages' | 'logs' | 'broadcast'>('analytics');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  const [disputes, setDisputes] = useState([
    { id: 'disp_101', user: 'Marcus Vance', amount: '$9.99', reason: 'Unauthorized subscription renewal charge after cancellation request', date: '2026-08-29', status: 'pending' },
    { id: 'disp_102', user: 'Alex Rivers', amount: '$4.99', reason: 'Fraudulent complaint / scam subscription dispute', date: '2026-08-28', status: 'pending' },
  ]);

  const [pendingPhotos, setPendingPhotos] = useState([
    { id: 'photo_1', userId: 'user_1', userName: 'Tyler Brooks', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', type: 'profile_picture', status: 'pending' },
    { id: 'photo_2', userId: 'user_2', userName: 'Devon Cole', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', type: 'profile_picture', status: 'pending' },
  ]);

  const handleIssueRefund = (dispId: string, amount: string) => {
    setDisputes(prev => prev.map(d => d.id === dispId ? { ...d, status: 'refunded' } : d));
    setSuccessToast(`Successfully issued full refund (${amount}) and resolved billing dispute.`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleCancelSubFraud = (dispId: string, userName: string) => {
    setDisputes(prev => prev.map(d => d.id === dispId ? { ...d, status: 'cancelled_fraud' } : d));
    setSuccessToast(`Subscription cancelled and user flagged for fraudulent complaint (${userName}).`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleApprovePhoto = (photoId: string) => {
    setPendingPhotos(prev => prev.map(p => p.id === photoId ? { ...p, status: 'approved' } : p));
    setSuccessToast('Profile picture approved successfully for public display.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleRejectPhotoToPrivate = (photoId: string) => {
    setPendingPhotos(prev => prev.map(p => p.id === photoId ? { ...p, status: 'moved_private' } : p));
    setSuccessToast('Photo rejected for public profile and securely moved to Private Locked Album (anti-nude policy).');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const [selectedChatUserId, setSelectedChatUserId] = useState<string>(profiles[0]?.id || '');
  const [adminMsgText, setAdminMsgText] = useState('');
  const [userDisputeReason, setUserDisputeReason] = useState('');
  const [userDisputeAmount, setUserDisputeAmount] = useState('$9.99');
  const [mySubmittedDisputes, setMySubmittedDisputes] = useState<Array<{ id: string; amount: string; reason: string; status: string; date: string }>>([
    { id: 'disp_my_1', amount: '$9.99', reason: 'Unrecognized double charge on monthly VIP renewal', status: 'pending', date: '2026-08-30' }
  ]);

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsgText.trim() || !selectedChatUserId) return;
    const targetProfile = profiles.find(p => p.id === selectedChatUserId);
    if (!targetProfile) return;

    const existingConv = conversations.find(c => c.profile.id === selectedChatUserId);
    const newMsg = {
      id: 'msg_admin_' + Date.now(),
      senderId: 'admin_official',
      receiverId: targetProfile.id,
      text: `🛡️ [OFFICIAL ADMIN NOTICE]: ${adminMsgText}`,
      timestamp: Date.now(),
      isRead: false
    };

    if (existingConv) {
      const updated = conversations.map(c => {
        if (c.profile.id === selectedChatUserId) {
          return {
            ...c,
            lastMessage: newMsg.text,
            updatedAt: Date.now(),
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      });
      onUpdateConversations(updated);
    } else {
      const newConv: ChatConversation = {
        id: 'conv_' + Date.now(),
        profile: targetProfile,
        lastMessage: newMsg.text,
        updatedAt: Date.now(),
        unreadCount: 1,
        messages: [newMsg]
      };
      onUpdateConversations([newConv, ...conversations]);
    }

    setAdminMsgText('');
    setSuccessToast(`Successfully sent official admin direct message to ${targetProfile.name}!`);
    showToast(`✉️ Admin message sent to ${targetProfile.name}`);
  };

  const handleIssueWarningReport = (reportId: string, userName: string, needEvidence: boolean) => {
    if (needEvidence) {
      setSuccessToast(`📩 Requested additional evidence from reporter for ${userName}. Notification sent.`);
      showToast(`🔍 Evidence request notification sent to reporter regarding ${userName}.`);
    } else {
      setSuccessToast(`⚠️ Official warning issued to ${userName} based on abuse report. Resolution notification sent.`);
      showToast(`🚨 Warning notification sent to ${userName} regarding abuse report.`);
    }
  };

  const handleUserSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDisputeReason.trim()) return;
    const newDisp = {
      id: 'disp_user_' + Date.now(),
      amount: userDisputeAmount,
      reason: userDisputeReason,
      status: 'pending',
      date: new Date().toISOString().slice(0, 10)
    };
    setMySubmittedDisputes([newDisp, ...mySubmittedDisputes]);
    setUserDisputeReason('');
    showToast('💳 Billing dispute submitted to admin team successfully!');
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'master' && password === 'masterblaze2026') {
      setIsAuthenticated(true);
      setIsMasterAdmin(true);
      setErrorMsg('');
      showToast('👑 Authenticated successfully as Master Admin (Full Platform Override Enabled).');
    } else if (username.trim() === 'admin' && password === 'blaze2026') {
      setIsAuthenticated(true);
      setIsMasterAdmin(false);
      setErrorMsg('');
      showToast('🛡️ Authenticated as Standard Administrator.');
    } else {
      setErrorMsg('Invalid credentials. Hint: master / masterblaze2026 or admin / blaze2026');
    }
  };

  const toggleVerify = (id: string) => {
    const updated = profiles.map(p => {
      if (p.id === id) {
        return { ...p, isVerified: !p.isVerified };
      }
      return p;
    });
    onUpdateProfiles(updated);
    setSuccessToast(`Updated verification status for profile.`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const toggleUserStatus = (id: string) => {
    const updated = profiles.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'online' ? 'offline' : 'online';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    onUpdateProfiles(updated);
    setSuccessToast('Switched user online/offline status for debugging.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm('Are you sure you want to delete this profile from the system?')) {
      const updated = profiles.filter(p => p.id !== id);
      onUpdateProfiles(updated);
      setSelectedUserIds(selectedUserIds.filter(selectedId => selectedId !== id));
      setSuccessToast('Profile successfully removed.');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredProfiles.map(p => p.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleApplyBulkAction = () => {
    if (!bulkAction || selectedUserIds.length === 0) return;

    if (bulkAction === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedUserIds.length} selected profiles?`)) {
        const updated = profiles.filter(p => !selectedUserIds.includes(p.id));
        onUpdateProfiles(updated);
        setSelectedUserIds([]);
        setSuccessToast(`Successfully deleted ${selectedUserIds.length} profiles.`);
        setTimeout(() => setSuccessToast(''), 3000);
      }
    } else if (bulkAction === 'verify') {
      const updated = profiles.map(p => {
        if (selectedUserIds.includes(p.id)) {
          return { ...p, isVerified: true };
        }
        return p;
      });
      onUpdateProfiles(updated);
      setSelectedUserIds([]);
      setSuccessToast(`Successfully verified ${selectedUserIds.length} profiles.`);
      setTimeout(() => setSuccessToast(''), 3000);
    } else if (bulkAction === 'unverify') {
      const updated = profiles.map(p => {
        if (selectedUserIds.includes(p.id)) {
          return { ...p, isVerified: false };
        }
        return p;
      });
      onUpdateProfiles(updated);
      setSelectedUserIds([]);
      setSuccessToast(`Successfully unverified ${selectedUserIds.length} profiles.`);
      setTimeout(() => setSuccessToast(''), 3000);
    }
    setBulkAction('');
  };

  const handleExportUserData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `blaze_profiles_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessToast('User data backup exported successfully as JSON.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setSuccessToast(`📢 System Broadcast sent successfully to all online users: "${broadcastMessage}"`);
    setBroadcastMessage('');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.bio && p.bio.toLowerCase().includes(q)) ||
      (p.locationName && p.locationName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-[#161616]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">System Admin Portal</h3>
              <p className="text-[10px] text-neutral-400">Secure Management & Moderation Console</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportUserData}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold transition flex items-center gap-1.5 border border-amber-500/30"
              title="Export JSON Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Login Screen */
          <div className="p-8 space-y-6 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-white">Restricted Admin Access</h4>
              <p className="text-xs text-neutral-400">Please enter your administrator credentials to proceed.</p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-center font-medium">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FFC107] text-[#121212] font-black text-xs rounded-xl hover:opacity-90 transition shadow-lg mt-2 flex items-center justify-center space-x-1.5"
              >
                <Key className="w-4 h-4" />
                <span>Authenticate Admin</span>
              </button>

              <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center">
                <p className="text-[10px] text-neutral-400">
                  Demo credentials: <code className="text-amber-400 font-bold">admin</code> / <code className="text-amber-400 font-bold">blaze2026</code>
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="flex flex-col flex-1 overflow-hidden">
            {successToast && (
              <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-5 py-2.5 text-xs text-emerald-300 font-semibold flex items-center justify-between">
                <span>{successToast}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}

            {/* Admin Tabs */}
            <div className="flex border-b border-neutral-800 bg-[#151515] px-4 gap-2 overflow-x-auto">
              {[
                { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
                { id: 'users', label: `Manage Users (${profiles.length})`, icon: Users },
                { id: 'reports', label: 'Moderation Reports (2)', icon: ShieldAlert },
                { id: 'refunds', label: `Refunds & Disputes (${disputes.filter(d => d.status === 'pending').length})`, icon: DollarSign },
                { id: 'moderation', label: `Photo Approval (${pendingPhotos.filter(p => p.status === 'pending').length})`, icon: ImageIcon },
                { id: 'logs', label: 'System Activity Log', icon: Activity },
                { id: 'broadcast', label: 'System Broadcast', icon: Megaphone },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id as any)}
                    className={`flex items-center gap-1.5 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                      isActive ? 'border-[#FFC107] text-[#FFC107]' : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="ml-auto flex items-center">
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 text-xs font-bold transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Content Panel */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {activeAdminTab === 'analytics' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">System Performance & Platform Metrics</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                    </span>
                  </div>

                  {/* Analytics Metric Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="text-xs font-bold">Total Active Users</span>
                        <Users className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-2xl font-black text-white font-mono">{profiles.length + 1420}</p>
                      <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12.4% this week
                      </p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="text-xs font-bold">New Registrations Today</span>
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-2xl font-black text-white font-mono">38</p>
                      <p className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Peak signups at 8pm
                      </p>
                    </div>
                  </div>

                  {/* Secondary Activity Breakdown */}
                  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Server & Database Status</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-neutral-800">
                        <span className="text-neutral-400">Primary Database Latency</span>
                        <span className="font-mono text-emerald-400 font-bold">14ms (Optimal)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-800">
                        <span className="text-neutral-400">AI Matching Engine</span>
                        <span className="font-mono text-cyan-400 font-bold">Running (v3.2)</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-neutral-400">Active WebSocket Connections</span>
                        <span className="font-mono text-amber-400 font-bold">412 clients</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeAdminTab === 'users' && (
                <div className="space-y-4">
                  {/* Search and Bulk Actions Toolbar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, bio, city..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Bulk Action Dropdown & Selection Count */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {selectedUserIds.length} selected
                      </span>
                      <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        disabled={selectedUserIds.length === 0}
                        className="bg-neutral-800 border border-neutral-700 text-white text-xs px-3 py-2 rounded-xl outline-none disabled:opacity-50"
                      >
                        <option value="">Bulk Actions...</option>
                        <option value="verify">Verify Selected</option>
                        <option value="unverify">Unverify Selected</option>
                        <option value="delete">Delete Selected</option>
                      </select>
                      <button
                        onClick={handleApplyBulkAction}
                        disabled={!bulkAction || selectedUserIds.length === 0}
                        className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={filteredProfiles.length > 0 && selectedUserIds.length === filteredProfiles.length}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-neutral-300">Select All ({filteredProfiles.length})</span>
                    </div>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">Showing {filteredProfiles.length} of {profiles.length}</span>
                  </div>

                  <div className="space-y-2">
                    {filteredProfiles.map(p => {
                      const isSelected = selectedUserIds.includes(p.id);
                      const isOnline = p.status === 'online';
                      return (
                        <div key={p.id} className={`bg-neutral-900 border p-3.5 rounded-xl flex items-center justify-between transition ${isSelected ? 'border-amber-500/70 bg-amber-500/5' : 'border-neutral-800'}`}>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectUser(p.id)}
                              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                            <img src={p.photos[0]} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-neutral-700" referrerPolicy="no-referrer" />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <p className="text-xs font-bold text-white">{p.name}, {p.age}</p>
                                {p.isVerified && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">Verified</span>}
                              </div>
                              <p className="text-[10px] text-neutral-400">{p.locationName} • Tier: {p.membershipTier || 'Free'}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Toggle User Status Column / Button */}
                            <button
                              onClick={() => toggleUserStatus(p.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition ${
                                isOnline 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-neutral-200'
                              }`}
                              title="Toggle Online/Offline Status for Debugging"
                            >
                              {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3" />}
                              <span className="capitalize">{p.status || 'offline'}</span>
                            </button>

                            <button
                              onClick={() => toggleVerify(p.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                p.isVerified ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                              }`}
                            >
                              {p.isVerified ? 'Unverify' : 'Verify'}
                            </button>
                            <button
                              onClick={() => handleDeleteProfile(p.id)}
                              className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/20 transition"
                              title="Delete Profile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeAdminTab === 'reports' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">User Moderation & Safety Reports</h4>
                  <div className="space-y-3">
                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Report #892: Harassment
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Pending Review</span>
                      </div>
                      <p className="text-xs text-neutral-300">Target: <strong className="text-white">Marcus Vance</strong> • Reported by: Anonymous User</p>
                      <p className="text-[11px] text-neutral-400 italic bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">"User sent unsolicited inappropriate messages in chat."</p>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSuccessToast('Report resolved: User warned and message flagged.');
                            setTimeout(() => setSuccessToast(''), 3000);
                          }}
                          className="px-3 py-1.5 bg-neutral-800 text-neutral-200 text-xs font-bold rounded-lg hover:bg-neutral-700 transition"
                        >
                          Issue Warning
                        </button>
                        <button
                          onClick={() => {
                            setSuccessToast('Report resolved: User account suspended.');
                            setTimeout(() => setSuccessToast(''), 3000);
                          }}
                          className="px-3 py-1.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg hover:bg-red-500/30 transition border border-red-500/40"
                        >
                          Suspend Account
                        </button>
                      </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Report #891: Fake Profile
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Resolved</span>
                      </div>
                      <p className="text-xs text-neutral-300">Target: <strong className="text-white">Fake Account Test</strong> • Reported by: Sarah L.</p>
                      <p className="text-[11px] text-neutral-400 italic bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">"Using stolen celebrity photographs."</p>
                    </div>
                  </div>
                </div>
              )}

              {activeAdminTab === 'refunds' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Billing Disputes & Refund Requests</h4>
                      <p className="text-[11px] text-neutral-400">Issue refunds and cancel subscriptions for fraudulent complaints or billing claims.</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                      {disputes.filter(d => d.status === 'pending').length} Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {disputes.map(disp => {
                      const isPending = disp.status === 'pending';
                      return (
                        <div key={disp.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4" /> Dispute ID: {disp.id} • Amount: <strong className="text-white">{disp.amount}</strong>
                            </span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                              disp.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                              disp.status === 'refunded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                            }`}>
                              {disp.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-300 space-y-1">
                            <p>User: <strong className="text-white">{disp.user}</strong> • Date: {disp.date}</p>
                            <p className="text-neutral-400 italic bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">"{disp.reason}"</p>
                          </div>
                          {isPending && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                onClick={() => handleIssueRefund(disp.id, disp.amount)}
                                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition shadow flex items-center gap-1"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Issue Full Refund</span>
                              </button>
                              <button
                                onClick={() => handleCancelSubFraud(disp.id, disp.user)}
                                className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs rounded-xl transition flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                <span>Cancel Sub & Flag Fraud</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeAdminTab === 'moderation' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">Profile Picture Moderation (Anti-Nude Policy)</h4>
                      <p className="text-[11px] text-neutral-400">Approve profile photos. Nudes/NSFW content must be rejected and moved to Private Locked Album.</p>
                    </div>
                    <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded-full font-bold">
                      {pendingPhotos.filter(p => p.status === 'pending').length} Pending Review
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pendingPhotos.map(photo => {
                      const isPending = photo.status === 'pending';
                      return (
                        <div key={photo.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{photo.userName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              photo.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                              photo.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {photo.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                            <img src={photo.url} alt={photo.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          {isPending ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprovePhoto(photo.id)}
                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve Public</span>
                              </button>
                              <button
                                onClick={() => handleRejectPhotoToPrivate(photo.id)}
                                className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Move to Private Album</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-400 text-center italic">Action completed successfully.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeAdminTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">System Activity & Moderation Audit Trail</h4>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full font-mono">Read-Only Secure Log</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">ACTION</span>
                          <span className="text-white font-bold text-xs">Global Broadcast Sent</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Admin broadcasted system update notice to 1,460 connected clients.</p>
                      </div>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">2026-08-30 00:01:22</span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">REPORT</span>
                          <span className="text-white font-bold text-xs">New User Report #892</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Anonymous user reported Marcus Vance for chat harassment.</p>
                      </div>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">2026-08-29 23:42:10</span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">VERIFY</span>
                          <span className="text-white font-bold text-xs">Verification Badge Granted</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Admin verified user profile #p_alex_99 after ID review.</p>
                      </div>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">2026-08-29 21:15:04</span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold">MODERATION</span>
                          <span className="text-white font-bold text-xs">Account Suspension Executed</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Admin suspended spam account 'BotTest99'.</p>
                      </div>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">2026-08-29 18:30:19</span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">AUTH</span>
                          <span className="text-white font-bold text-xs">Admin Session Initialized</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Successful administrator authentication from IP 192.168.1.42.</p>
                      </div>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">2026-08-29 14:00:00</span>
                    </div>
                  </div>
                </div>
              )}

              {activeAdminTab === 'broadcast' && (
                <div className="space-y-4">
                  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4" />
                      <span>Global System Announcement / Broadcast</span>
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Broadcast real-time announcements to all active users on the platform. This will appear as an urgent floating alert banner on everyone's screen.
                    </p>

                    <form onSubmit={handleSendBroadcast} className="space-y-3">
                      <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type system announcement here (e.g. Server maintenance scheduled for 2:00 AM UTC...)"
                        rows={4}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#FFC107] text-[#121212] font-black text-xs rounded-xl hover:opacity-90 transition shadow flex items-center gap-1.5"
                      >
                        <Megaphone className="w-4 h-4" />
                        <span>Broadcast to All Users</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
