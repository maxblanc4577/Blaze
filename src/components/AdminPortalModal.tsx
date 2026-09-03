import React, { useState } from 'react';
import { UserProfile, ChatConversation } from '../types';
import { X, ShieldCheck, Lock, Key, Users, CheckCircle2, ShieldAlert, Megaphone, Trash2, Activity, LogOut, UserCheck, Search, BarChart3, TrendingUp, MessageSquare, Download, Wifi, WifiOff, DollarSign, Image as ImageIcon, AlertTriangle, Send, Crown, FileText, Settings, Shield, CreditCard } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  onUpdateProfiles: (updated: UserProfile[]) => void;
  conversations: ChatConversation[];
  onUpdateConversations: (updated: ChatConversation[]) => void;
  showToast: (msg: string) => void;
  reportHistory: Array<{
    id: string;
    profileId: string;
    profileName: string;
    reason: string;
    details: string;
    timestamp: number;
    dateStr: string;
    category?: string;
    justification?: string;
  }>;
  onUpdateReportHistory: (updated: any[]) => void;
  blockedKeywords?: string[];
  onUpdateBlockedKeywords?: (keywords: string[]) => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onUpdateProfiles,
  conversations,
  onUpdateConversations,
  showToast,
  reportHistory,
  onUpdateReportHistory,
  blockedKeywords = [],
  onUpdateBlockedKeywords,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'reports' | 'users' | 'refunds' | 'subscriptions' | 'elite_payments' | 'approvals' | 'pending_verification' | 'moderation' | 'logs' | 'broadcast' | 'master_override' | 'blocked_keywords'>('dashboard');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportFilterCategory, setReportFilterCategory] = useState('All');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [reportResponseTexts, setReportResponseTexts] = useState<Record<string, string>>({});
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');

  // Mandatory Confirmation Dialog State for Report Action
  const [confirmingReport, setConfirmingReport] = useState<{
    reportId: string;
    profileName: string;
    actionType: 'Warning' | 'Suspension' | 'Permanent Ban';
  } | null>(null);
  const [actionCategory, setActionCategory] = useState<'Warning' | 'Suspension' | 'Permanent Ban'>('Warning');
  const [actionJustification, setActionJustification] = useState('');

  const cannedResponses = [
    {
      category: "Fake profiles / catfishing",
      text: "Thanks for reporting this — we've reviewed the account, confirmed it violated our policies, and it has been permanently removed. We appreciate you helping keep the community safe."
    },
    {
      category: "Romance scams / money & crypto requests",
      text: "We've investigated your report and removed the account involved in fraudulent activity. Please remember to never send money or crypto to matches. If you lost funds, we recommend also filing a report at reportfraud.ftc.gov."
    },
    {
      category: "Verifying identity before meeting",
      text: "Your report helped us confirm this profile was misrepresenting its identity, and it's been removed. For future matches, our photo verification badge and a quick video call are good ways to confirm authenticity before meeting."
    },
    {
      category: "Harassment / unsolicited explicit content",
      text: "We've reviewed your report and taken action against the account for violating our community guidelines. Thank you for flagging it — you're also welcome to block any user at any time."
    },
    {
      category: "Physical safety when meeting in person",
      text: "Thanks for letting us know what happened. We've reviewed the report and taken appropriate action on the account. Your safety is our priority — please continue to meet in public places and use our in-app check-in feature going forward."
    }
  ];

  const [disputes, setDisputes] = useState([
    { id: 'disp_101', user: 'Marcus Vance', amount: '$9.99', reason: 'Unauthorized subscription renewal charge after cancellation request', date: '2026-08-29', status: 'pending' },
    { id: 'disp_102', user: 'Alex Rivers', amount: '$4.99', reason: 'Fraudulent complaint / scam subscription dispute', date: '2026-08-28', status: 'pending' },
  ]);

  const [pendingPhotos, setPendingPhotos] = useState([
    { id: 'photo_1', userId: 'user_1', userName: 'Tyler Brooks', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', type: 'profile_picture', status: 'pending' },
    { id: 'photo_2', userId: 'user_2', userName: 'Devon Cole', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', type: 'profile_picture', status: 'pending' },
  ]);

  const [publicationAuditLogs, setPublicationAuditLogs] = useState<Array<{
    id: string;
    profileName: string;
    adminEmail: string;
    action: string;
    timestamp: string;
  }>>([
    { id: 'log_1', profileName: 'Aria Sterling', adminEmail: 'admin@blaze.io', action: 'Published & Made Active', timestamp: '2026-09-02 14:32' },
    { id: 'log_2', profileName: 'Chloe Bennett', adminEmail: 'admin@blaze.io', action: 'Unpublished (Hidden)', timestamp: '2026-09-01 19:15' }
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
    setSuccessToast('Photo rejected for public profile and securely moved to Private Locked Album.');
    setTimeout(() => setSuccessToast(''), 4000);
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

  const handleSuspendUser = (id: string, daysOrPerm: number | 'permanent') => {
    const updated = profiles.map(p => {
      if (p.id === id) {
        if (daysOrPerm === 'permanent') {
          return { ...p, isPermanentlySuspended: true, suspensionUntil: undefined };
        } else {
          const expiresAt = Date.now() + (daysOrPerm as number) * 24 * 60 * 60 * 1000;
          return { ...p, isPermanentlySuspended: false, suspensionUntil: expiresAt };
        }
      }
      return p;
    });
    onUpdateProfiles(updated);
    setSuccessToast(daysOrPerm === 'permanent' ? 'User account permanently suspended.' : `User account suspended for ${daysOrPerm} day(s).`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleUnsuspendUser = (id: string) => {
    const updated = profiles.map(p => {
      if (p.id === id) {
        return { ...p, isPermanentlySuspended: false, suspensionUntil: undefined };
      }
      return p;
    });
    onUpdateProfiles(updated);
    setSuccessToast('User account suspension lifted.');
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

  const handleExportReportsCSV = () => {
    const headers = "ID,ProfileName,Reason,Details,Date,Category,Justification\n";
    const rows = reportHistory.map(r => `"${r.id}","${r.profileName}","${r.reason}","${r.details || ''}","${r.dateStr}","${r.category || 'General'}","${r.justification || ''}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `report_history_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessToast('Report history exported successfully as CSV.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleConfirmReportActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingReport) return;

    if (!actionJustification.trim()) {
      showToast('⚠️ Please provide a brief justification note.');
      return;
    }

    // Update report history with category and justification
    const updatedHistory = reportHistory.map(r => {
      if (r.id === confirmingReport.reportId) {
        return {
          ...r,
          category: actionCategory,
          justification: actionJustification,
        };
      }
      return r;
    });
    onUpdateReportHistory(updatedHistory);

    setSuccessToast(`Action '${actionCategory}' executed for report #${confirmingReport.reportId}. Note logged.`);
    showToast(`🛡️ Report action recorded with category: ${actionCategory}`);
    setConfirmingReport(null);
    setActionJustification('');
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

  const filteredReports = reportHistory.filter(r => {
    const matchesSearch = r.profileName.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                          r.reason.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(reportSearchQuery.toLowerCase());
    const matchesCategory = reportFilterCategory === 'All' || (r.category === reportFilterCategory) || (r.reason.toLowerCase().includes(reportFilterCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  // Prepare 30-day trend chart data for reports
  const reportTrendData = (() => {
    const daysMap: Record<string, { date: string; Warning: number; Suspension: number; PermanentBan: number; Total: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      daysMap[dateStr] = { date: dateStr.slice(5), Warning: 0, Suspension: 0, PermanentBan: 0, Total: 0 };
    }

    reportHistory.forEach(r => {
      const dStr = new Date(r.timestamp).toISOString().slice(0, 10);
      if (daysMap[dStr]) {
        daysMap[dStr].Total += 1;
        if (r.category === 'Warning' || r.reason.toLowerCase().includes('warning')) daysMap[dStr].Warning += 1;
        else if (r.category === 'Suspension' || r.reason.toLowerCase().includes('suspend')) daysMap[dStr].Suspension += 1;
        else daysMap[dStr].PermanentBan += 1;
      } else {
        // Fallback for demo distribution if dates vary
        const keys = Object.keys(daysMap);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1];
          daysMap[lastKey].Total += 1;
          daysMap[lastKey].Warning += 1;
        }
      }
    });

    return Object.values(daysMap);
  })();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] border border-neutral-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
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
          <div className="p-8 space-y-6 flex flex-col items-center justify-center flex-1">
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

              <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center space-y-1">
                <p className="text-[10px] text-neutral-400">
                  Standard Admin: <code className="text-amber-400 font-bold">admin</code> / <code className="text-amber-400 font-bold">blaze2026</code>
                </p>
                <p className="text-[10px] text-neutral-400">
                  Master Admin: <code className="text-amber-400 font-bold">master</code> / <code className="text-amber-400 font-bold">masterblaze2026</code>
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* Admin Dashboard with Vertical Sidebar Layout */
          <div className="flex flex-1 overflow-hidden">
            
            {/* Vertical Sidebar Navigation */}
            <div className="w-64 bg-[#141414] border-r border-neutral-800 flex flex-col justify-between p-4 flex-shrink-0">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 mb-2">Admin Navigation</p>
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'reports', label: `Report History (${reportHistory.length})`, icon: ShieldAlert },
                  { id: 'users', label: `User Management (${profiles.length})`, icon: Users },
                  { id: 'refunds', label: `Billing & Refunds (${disputes.filter(d => d.status === 'pending').length})`, icon: DollarSign },
                  { id: 'subscriptions', label: 'Subscriptions & Funds', icon: Crown },
                  { id: 'elite_payments', label: `Elite Payments (${profiles.filter(p => p.isCompanionPro || p.membershipTier === 'Elite Companion').length})`, icon: CreditCard },
                  { id: 'approvals', label: `Pro & Elite Approvals (${profiles.filter(p => p.isCompanionPro || p.membershipTier === 'Elite Companion' || p.membershipTier === 'Pro').length})`, icon: UserCheck },
                  { id: 'pending_verification', label: `Pending Verification (${profiles.filter(p => (p.isCompanionPro || p.membershipTier === 'Elite Companion' || p.membershipTier === 'Pro') && p.isFeePaid && !p.isVerified).length})`, icon: ShieldCheck },
                  { id: 'blocked_keywords', label: `Blocked Keywords (${blockedKeywords.length})`, icon: ShieldAlert },
                  { id: 'moderation', label: `Photo Approval (${pendingPhotos.filter(p => p.status === 'pending').length})`, icon: ImageIcon },
                  { id: 'logs', label: 'Activity Logs', icon: Activity },
                  { id: 'broadcast', label: 'System Broadcast', icon: Megaphone },
                  ...(isMasterAdmin ? [{ id: 'master_override', label: '⚡ Master Override', icon: Crown }] : []),
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeAdminTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAdminTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                        isActive
                          ? 'bg-amber-500/15 text-[#FFC107] border border-amber-500/30'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-neutral-800 space-y-3">
                {isMasterAdmin && (
                  <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 font-bold flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Master Admin Role Active</span>
                  </div>
                )}
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 text-xs font-bold transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Admin</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#1A1A1A]">
              {successToast && (
                <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-5 py-2.5 text-xs text-emerald-300 font-semibold flex items-center justify-between">
                  <span>{successToast}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {activeAdminTab === 'subscriptions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-white">Subscriptions & Financial Ledger</h4>
                        <p className="text-xs text-neutral-400">View all active user subscriptions, incoming subscription revenue, and merchant-paid funds.</p>
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold">
                        💳 Secure Payment Gateway
                      </span>
                    </div>

                    {/* Financial KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] text-neutral-400 font-bold">Active Subscriptions</span>
                        <p className="text-2xl font-black text-white font-mono">342</p>
                        <span className="text-[10px] text-emerald-400 font-semibold">+18% this month</span>
                      </div>
                      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] text-neutral-400 font-bold">Incoming Sub Funds (MRR)</span>
                        <p className="text-2xl font-black text-amber-400 font-mono">$4,850.00</p>
                        <span className="text-[10px] text-neutral-400 font-semibold">Recurring monthly</span>
                      </div>
                      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] text-neutral-400 font-bold">Paid via Merchant Gateway</span>
                        <p className="text-2xl font-black text-emerald-400 font-mono">$3,420.00</p>
                        <span className="text-[10px] text-emerald-400 font-semibold">Stripe / Apple / Google Pay</span>
                      </div>
                      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] text-neutral-400 font-bold">Pending Payouts</span>
                        <p className="text-2xl font-black text-orange-400 font-mono">$1,430.00</p>
                        <span className="text-[10px] text-orange-400 font-semibold">Next settlement 1st</span>
                      </div>
                    </div>

                    {/* Transactions Ledger Table */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                      <h5 className="text-sm font-bold text-white">Recent Transactions & Subscriptions Ledger</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                              <th className="pb-3 px-3">Transaction ID</th>
                              <th className="pb-3 px-3">User</th>
                              <th className="pb-3 px-3">Plan / Tier</th>
                              <th className="pb-3 px-3">Amount</th>
                              <th className="pb-3 px-3">Gateway / Merchant</th>
                              <th className="pb-3 px-3">Status</th>
                              <th className="pb-3 px-3">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800 text-neutral-300">
                            {[
                              { id: 'txn_9821', user: 'Marcus Vance', plan: 'Elite Companion (Monthly)', amount: '$29.99', merchant: 'Stripe Merchant', status: 'Paid', date: '2026-09-02 11:20' },
                              { id: 'txn_9820', user: 'Elena Rostova', plan: 'Gold Booster Pass', amount: '$9.99', merchant: 'Apple In-App', status: 'Paid', date: '2026-09-02 10:15' },
                              { id: 'txn_9819', user: 'Liam Gallagher', plan: 'VIP Unlimited', amount: '$49.99', merchant: 'Google Play Billing', status: 'Paid', date: '2026-09-01 22:40' },
                              { id: 'txn_9818', user: 'Sofia Chen', plan: 'Elite Companion (Annual)', amount: '$199.99', merchant: 'Stripe Merchant', status: 'Paid', date: '2026-09-01 18:30' },
                              { id: 'txn_9817', user: 'David Kim', plan: 'Gold Booster Pass', amount: '$9.99', merchant: 'Stripe Merchant', status: 'Refunded', date: '2026-08-30 14:10' },
                            ].map(txn => (
                              <tr key={txn.id} className="hover:bg-neutral-800/40 transition">
                                <td className="py-3 px-3 font-mono text-amber-400 font-semibold">{txn.id}</td>
                                <td className="py-3 px-3 font-bold text-white">{txn.user}</td>
                                <td className="py-3 px-3">{txn.plan}</td>
                                <td className="py-3 px-3 font-bold font-mono text-emerald-400">{txn.amount}</td>
                                <td className="py-3 px-3 text-neutral-400">{txn.merchant}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    txn.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  }`}>
                                    {txn.status}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-neutral-400">{txn.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeAdminTab === 'elite_payments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-white">Elite Companions Payment Status & Manual Verification</h4>
                        <p className="text-xs text-neutral-400">View payment status of all Elite Companions and manually toggle 'Fee Paid' for troubleshooting or manual verification.</p>
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold">
                        👑 Elite Fee Ledger
                      </span>
                    </div>

                    {/* Monthly Revenue Trends Chart */}
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-white">Elite Companion Monthly Revenue Trends</h5>
                          <p className="text-[11px] text-neutral-400">Subscription fees collected ($19.99/mo per active verified companion)</p>
                        </div>
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-lg">
                          +24.8% MoM Growth
                        </span>
                      </div>

                      <div className="h-64 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { month: 'Apr', revenue: 4200 },
                            { month: 'May', revenue: 6800 },
                            { month: 'Jun', revenue: 9400 },
                            { month: 'Jul', revenue: 13500 },
                            { month: 'Aug', revenue: 18900 },
                            { month: 'Sep', revenue: 24500 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="month" stroke="#888" fontSize={11} />
                            <YAxis stroke="#888" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                            <Bar dataKey="revenue" fill="#FFC107" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {profiles.filter(p => p.isCompanionPro || p.membershipTier === 'Elite Companion').length === 0 ? (
                        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
                          No Elite Companions registered yet.
                        </div>
                      ) : (
                        profiles.filter(p => p.isCompanionPro || p.membershipTier === 'Elite Companion').map(p => {
                          const feePaid = p.isFeePaid || false;
                          return (
                            <div key={p.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center space-x-3.5">
                                <img src={p.photos[0]} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-neutral-700" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-bold text-white">{p.name}, {p.age}</p>
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Elite Companion</span>
                                  </div>
                                  <p className="text-xs text-neutral-400">{p.locationName} • Rate: {p.companionRate || '$29.99/mo'}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  feePaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                }`}>
                                  {feePaid ? '✓ Fee Paid (Verified)' : '✕ Fee Unpaid (Hidden)'}
                                </span>

                                <button
                                  onClick={() => {
                                    const updated = profiles.map(item => item.id === p.id ? { ...item, isFeePaid: !feePaid } : item);
                                    onUpdateProfiles(updated);
                                    setSuccessToast(`Toggled payment status for ${p.name} to ${!feePaid ? 'Paid' : 'Unpaid'}.`);
                                    setTimeout(() => setSuccessToast(''), 3000);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                                    feePaid ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                                  }`}
                                >
                                  {feePaid ? 'Revoke / Set Unpaid' : 'Mark Fee Paid'}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {activeAdminTab === 'approvals' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-white">Pro & Elite Companion Approvals & Publications</h4>
                        <p className="text-xs text-neutral-400">Review subscription payments, identity documents, and toggle the `isPublished` status to make companion accounts discoverable on the platform.</p>
                      </div>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full font-bold">
                        🛡️ Account Publication Dashboard
                      </span>
                    </div>

                    <div className="space-y-3">
                      {profiles.filter(p => p.isCompanionPro || p.membershipTier === 'Elite Companion' || p.membershipTier === 'Pro').length === 0 ? (
                        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
                          No Professional or Elite companion accounts registered yet.
                        </div>
                      ) : (
                        profiles.filter(p => p.isCompanionPro || p.membershipTier === 'Elite Companion' || p.membershipTier === 'Pro').map(p => {
                          const feePaid = p.isFeePaid || false;
                          const isVerified = p.isVerified || false;
                          const isPublished = p.isPublished !== false;
                          return (
                            <div key={p.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                              <div className="flex items-center space-x-3.5">
                                <img src={p.photos[0]} alt={p.name} className="w-14 h-14 rounded-2xl object-cover border border-neutral-700 shadow" referrerPolicy="no-referrer" />
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-bold text-white">{p.name}, {p.age}</p>
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                                      {p.membershipTier || 'Professional'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-400">{p.locationName} • {p.email || 'user@blaze.io'}</p>
                                  <div className="flex items-center gap-2 pt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      feePaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                                    }`}>
                                      {feePaid ? '✓ Fee Paid ($19.99/mo)' : '✕ Fee Unpaid'}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      isVerified ? 'bg-cyan-500/20 text-cyan-300' : 'bg-neutral-800 text-neutral-400'
                                    }`}>
                                      {isVerified ? '🛡️ ID Verified' : '⏳ ID Pending Review'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = profiles.map(item => item.id === p.id ? { ...item, isFeePaid: !feePaid } : item);
                                    onUpdateProfiles(updated);
                                    setSuccessToast(`Toggled payment status for ${p.name}.`);
                                    setTimeout(() => setSuccessToast(''), 3000);
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                    feePaid ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-emerald-500 text-black hover:bg-emerald-400'
                                  }`}
                                >
                                  {feePaid ? 'Revoke Fee' : 'Mark Fee Paid'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = profiles.map(item => item.id === p.id ? { ...item, isVerified: !isVerified } : item);
                                    onUpdateProfiles(updated);
                                    setSuccessToast(`Toggled verification status for ${p.name}.`);
                                    setTimeout(() => setSuccessToast(''), 3000);
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                    isVerified ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-cyan-500 text-black hover:bg-cyan-400'
                                  }`}
                                >
                                  {isVerified ? 'Revoke ID Check' : 'Approve ID Check'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const newStatus = !isPublished;
                                    const updated = profiles.map(item => item.id === p.id ? { ...item, isPublished: newStatus } : item);
                                    onUpdateProfiles(updated);
                                    setPublicationAuditLogs(prev => [
                                      {
                                        id: `log_${Date.now()}`,
                                        profileName: p.name,
                                        adminEmail: username || 'admin@blaze.io',
                                        action: newStatus ? 'Published & Made Active' : 'Unpublished (Hidden)',
                                        timestamp: new Date().toLocaleString()
                                      },
                                      ...prev
                                    ]);
                                    setSuccessToast(`Toggled publication status for ${p.name} to ${newStatus ? 'Published & Active' : 'Unpublished (Hidden)'}.`);
                                    setTimeout(() => setSuccessToast(''), 3000);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-black transition shadow ${
                                    isPublished ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-emerald-500 text-black hover:bg-emerald-400'
                                  }`}
                                >
                                  {isPublished ? 'Published (Click to Unpublish)' : 'Publish & Make Active'}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Publication Audit Log Section */}
                    <div className="mt-8 space-y-3 pt-6 border-t border-neutral-800">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Publication Audit Trail & Accountability Log</h5>
                        <span className="text-[10px] text-neutral-400">{publicationAuditLogs.length} Recorded Actions</span>
                      </div>
                      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                            <tr>
                              <th className="px-4 py-3">Profile Name</th>
                              <th className="px-4 py-3">Action</th>
                              <th className="px-4 py-3">Admin Account</th>
                              <th className="px-4 py-3">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800 text-neutral-300">
                            {publicationAuditLogs.map(log => (
                              <tr key={log.id} className="hover:bg-neutral-800/50">
                                <td className="px-4 py-3 font-bold text-white">{log.profileName}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    log.action.includes('Published') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-neutral-400">{log.adminEmail}</td>
                                <td className="px-4 py-3 text-neutral-400">{log.timestamp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeAdminTab === 'pending_verification' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-white">Pending Verification Profiles</h4>
                        <p className="text-xs text-neutral-400">Professional & Elite profiles that have paid their subscription fee ($19.99/mo) and are awaiting manual document approval.</p>
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold">
                        ⏳ {profiles.filter(p => (p.isCompanionPro || p.membershipTier === 'Elite Companion' || p.membershipTier === 'Pro') && p.isFeePaid && !p.isVerified).length} Pending Review
                      </span>
                    </div>

                    <div className="space-y-3">
                      {profiles.filter(p => (p.isCompanionPro || p.membershipTier === 'Elite Companion' || p.membershipTier === 'Pro') && p.isFeePaid && !p.isVerified).length === 0 ? (
                        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
                          No profiles currently awaiting verification approval.
                        </div>
                      ) : (
                        profiles.filter(p => (p.isCompanionPro || p.membershipTier === 'Elite Companion' || p.membershipTier === 'Pro') && p.isFeePaid && !p.isVerified).map(p => (
                          <div key={p.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center space-x-3.5">
                              <img src={p.photos[0]} alt={p.name} className="w-14 h-14 rounded-2xl object-cover border border-neutral-700 shadow" referrerPolicy="no-referrer" />
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-bold text-white">{p.name}, {p.age}</p>
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                                    {p.membershipTier || 'Professional'}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-400">{p.locationName} • {p.email || 'user@blaze.io'}</p>
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                    ✓ Fee Paid ($19.99/mo)
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                                    🛡️ ID Scan Submitted
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 self-end md:self-center">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = profiles.map(item => item.id === p.id ? { ...item, isVerified: true, isPublished: true } : item);
                                    onUpdateProfiles(updated);
                                    setPublicationAuditLogs(prev => [
                                      {
                                        id: `log_${Date.now()}`,
                                        profileName: p.name,
                                        adminEmail: username || 'admin@blaze.io',
                                        action: 'Approved ID & Published & Active',
                                        timestamp: new Date().toLocaleString()
                                      },
                                      ...prev
                                    ]);
                                    setSuccessToast(`Approved and published ${p.name}!`);
                                    setTimeout(() => setSuccessToast(''), 3000);
                                  }}
                                  className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
                                >
                                  ✓ Approve & Publish
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingUserId(rejectingUserId === p.id ? null : p.id);
                                    setRejectReasonInput('');
                                  }}
                                  className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-black text-xs hover:bg-red-500/30 transition"
                                >
                                  ✕ Reject
                                </button>
                              </div>

                              {rejectingUserId === p.id && (
                                <div className="bg-neutral-950 p-3 rounded-xl border border-red-500/40 space-y-2 mt-2 w-full max-w-xs animate-in fade-in duration-200">
                                  <p className="text-[10px] font-bold text-red-300 uppercase">Mandatory Rejection Reason</p>
                                  <input
                                    type="text"
                                    placeholder="e.g. Blurry photo, expired ID..."
                                    value={rejectReasonInput}
                                    onChange={(e) => setRejectReasonInput(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!rejectReasonInput.trim()) {
                                          setSuccessToast('⚠️ Rejection reason is mandatory.');
                                          return;
                                        }
                                        const updated = profiles.map(item => item.id === p.id ? { 
                                          ...item, 
                                          verificationPending: false, 
                                          isVerified: false, 
                                          isPublished: false, 
                                          verificationRejectionReason: rejectReasonInput 
                                        } : item);
                                        onUpdateProfiles(updated);
                                        setPublicationAuditLogs(prev => [
                                          {
                                            id: `log_${Date.now()}`,
                                            profileName: p.name,
                                            adminEmail: username || 'admin@blaze.io',
                                            action: `Rejected ID Verification: "${rejectReasonInput}"`,
                                            timestamp: new Date().toLocaleString()
                                          },
                                          ...prev
                                        ]);
                                        setRejectingUserId(null);
                                        setRejectReasonInput('');
                                        setSuccessToast(`Rejected verification for ${p.name}. Notification sent.`);
                                        setTimeout(() => setSuccessToast(''), 4000);
                                      }}
                                      className="flex-1 py-1.5 rounded-lg bg-red-500 text-black font-black text-xs hover:bg-red-400 transition"
                                    >
                                      Confirm Rejection
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRejectingUserId(null)}
                                      className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-700 transition"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeAdminTab === 'blocked_keywords' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-white">Blocked Keywords & Auto-Moderation</h4>
                        <p className="text-xs text-neutral-400">Define forbidden terms that automatically hide and block incoming messages containing those words.</p>
                      </div>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-3 py-1 rounded-full font-bold">
                        🛡️ Safety Filter
                      </span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newKeywordInput}
                          onChange={e => setNewKeywordInput(e.target.value)}
                          placeholder="Enter blocked keyword (e.g., spam, scam)..."
                          className="flex-1 bg-black/40 border border-neutral-700 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#FFC107]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newKeywordInput.trim()) return;
                            if (blockedKeywords.map(k => k.toLowerCase()).includes(newKeywordInput.trim().toLowerCase())) {
                              showToast('⚠️ Keyword already in blocked list.');
                              return;
                            }
                            const updated = [...blockedKeywords, newKeywordInput.trim()];
                            if (onUpdateBlockedKeywords) onUpdateBlockedKeywords(updated);
                            setNewKeywordInput('');
                            showToast(`🛡️ Blocked keyword "${newKeywordInput}" added successfully.`);
                          }}
                          className="px-5 py-2.5 bg-[#FFC107] text-black font-black text-xs rounded-xl hover:opacity-90 transition shadow"
                        >
                          Add Keyword
                        </button>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs font-bold text-neutral-300 mb-2">Active Blocked Keywords ({blockedKeywords.length})</p>
                        {blockedKeywords.length === 0 ? (
                          <p className="text-xs text-neutral-500 italic py-4 text-center">No blocked keywords configured yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {blockedKeywords.map(kw => (
                              <span key={kw} className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 font-semibold">
                                <span>{kw}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = blockedKeywords.filter(k => k !== kw);
                                    if (onUpdateBlockedKeywords) onUpdateBlockedKeywords(updated);
                                    showToast(`🗑️ Removed blocked keyword "${kw}".`);
                                  }}
                                  className="hover:text-white transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeAdminTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-white">System Analytics & Overview</h4>
                        <p className="text-xs text-neutral-400">Real-time telemetry and platform performance indicators.</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span className="text-xs font-bold">Total Active Users</span>
                          <Users className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-3xl font-black text-white font-mono">{profiles.length + 1420}</p>
                        <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> +12.4% this week
                        </p>
                      </div>

                      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span className="text-xs font-bold">Safety Reports Queue</span>
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-3xl font-black text-white font-mono">{reportHistory.length}</p>
                        <p className="text-[11px] text-neutral-400 font-bold">Active moderation review</p>
                      </div>

                      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span className="text-xs font-bold">Pending Photo Approvals</span>
                          <ImageIcon className="w-4 h-4 text-pink-400" />
                        </div>
                        <p className="text-3xl font-black text-white font-mono">{pendingPhotos.filter(p => p.status === 'pending').length}</p>
                        <p className="text-[11px] text-pink-400 font-bold">Anti-nude policy check</p>
                      </div>
                    </div>

                    {/* Report Trend Recharts Visualization */}
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-white">Report Trend Over Last 30 Days</h5>
                          <p className="text-xs text-neutral-400">Visualizing reported profiles grouped by categories (Warning, Suspension, Permanent Ban).</p>
                        </div>
                        <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg font-mono">Recharts Analytics</span>
                      </div>

                      <div className="h-64 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#888" fontSize={11} />
                            <YAxis stroke="#888" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="Warning" fill="#FFC107" name="Warning" stackId="a" />
                            <Bar dataKey="Suspension" fill="#FF7043" name="Suspension" stackId="a" />
                            <Bar dataKey="PermanentBan" fill="#E53935" name="Permanent Ban" stackId="a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {activeAdminTab === 'reports' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-black text-white">User Moderation & Report History</h4>
                        <p className="text-xs text-neutral-400">Review reported profiles, filter reasons, export CSV, and send canned responses.</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleExportReportsCSV}
                          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-amber-500/30"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Search and Filter Toolbar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={reportSearchQuery}
                          onChange={(e) => setReportSearchQuery(e.target.value)}
                          placeholder="Search reports by profile name, reason, ID..."
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={reportFilterCategory}
                          onChange={(e) => setReportFilterCategory(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs px-3 py-2.5 rounded-xl outline-none"
                        >
                          <option value="All">All Categories / Reasons</option>
                          <option value="Fake profiles">Fake profiles / catfishing</option>
                          <option value="Romance scams">Romance scams / money</option>
                          <option value="Harassment">Harassment / explicit</option>
                          <option value="Physical safety">Physical safety</option>
                          <option value="Warning">Action: Warning</option>
                          <option value="Suspension">Action: Suspension</option>
                          <option value="Permanent Ban">Action: Permanent Ban</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredReports.length === 0 ? (
                        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
                          No matching reports found in the moderation queue.
                        </div>
                      ) : (
                        filteredReports.map((rep) => {
                          const currentResponse = reportResponseTexts[rep.id] !== undefined 
                            ? reportResponseTexts[rep.id] 
                            : (cannedResponses.find(c => rep.reason.toLowerCase().includes(c.category.toLowerCase().split('/')[0].trim()))?.text || cannedResponses[0].text);

                          return (
                            <div key={rep.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4 shadow">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                                  <ShieldAlert className="w-4 h-4" /> Report ID: {rep.id} • Reason: {rep.reason}
                                </span>
                                <div className="flex items-center gap-2">
                                  {rep.category && (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">
                                      Action: {rep.category}
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full font-bold">Pending Review</span>
                                </div>
                              </div>

                              <div className="text-xs text-neutral-300 space-y-1">
                                <p>Target Profile: <strong className="text-white">{rep.profileName}</strong> (ID: {rep.profileId}) • Date: {rep.dateStr} at {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                {rep.details && (
                                  <p className="text-neutral-400 italic bg-neutral-950 p-3 rounded-xl border border-neutral-800">"{rep.details}"</p>
                                )}
                                {rep.justification && (
                                  <p className="text-amber-300 text-[11px] bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                                    <strong>Admin Justification Note:</strong> {rep.justification}
                                  </p>
                                )}
                              </div>

                              {/* Canned Response Selector */}
                              <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4" /> Canned Response Library & Messaging:
                                  </span>
                                  <select
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (!val) return;
                                      setReportResponseTexts(prev => ({ ...prev, [rep.id]: val }));
                                    }}
                                    defaultValue=""
                                    className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                                  >
                                    <option value="" disabled>Select Canned Template...</option>
                                    {cannedResponses.map((c, i) => (
                                      <option key={i} value={c.text}>[{c.category}]</option>
                                    ))}
                                  </select>
                                </div>
                                <textarea
                                  value={currentResponse}
                                  onChange={(e) => setReportResponseTexts(prev => ({ ...prev, [rep.id]: e.target.value }))}
                                  rows={2}
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 resize-none"
                                />
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => {
                                      setSuccessToast(`Official response sent to user regarding Report #${rep.id}!`);
                                      setTimeout(() => setSuccessToast(''), 3000);
                                    }}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Response</span>
                                  </button>
                                </div>
                              </div>

                              {/* Action Buttons triggering Mandatory Confirmation Dialog */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => setConfirmingReport({ reportId: rep.id, profileName: rep.profileName, actionType: 'Warning' })}
                                    className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition border border-neutral-700"
                                  >
                                    Issue Warning
                                  </button>
                                  <button
                                    onClick={() => setConfirmingReport({ reportId: rep.id, profileName: rep.profileName, actionType: 'Suspension' })}
                                    className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition border border-amber-500/40"
                                  >
                                    Apply Suspension
                                  </button>
                                  <button
                                    onClick={() => setConfirmingReport({ reportId: rep.id, profileName: rep.profileName, actionType: 'Permanent Ban' })}
                                    className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold rounded-xl transition border border-red-500/40"
                                  >
                                    Permanent Ban
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    const updated = reportHistory.filter(r => r.id !== rep.id);
                                    onUpdateReportHistory(updated);
                                    setSuccessToast(`Report log #${rep.id} deleted from history.`);
                                    setTimeout(() => setSuccessToast(''), 3000);
                                  }}
                                  className="p-2 bg-neutral-800 text-neutral-400 hover:text-red-400 rounded-xl transition"
                                  title="Delete Report"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {activeAdminTab === 'users' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search users by name, bio, city..."
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xs text-neutral-400 font-mono">
                          {selectedUserIds.length} selected
                        </span>
                        <select
                          value={bulkAction}
                          onChange={(e) => setBulkAction(e.target.value)}
                          disabled={selectedUserIds.length === 0}
                          className="bg-neutral-800 border border-neutral-700 text-white text-xs px-3 py-2.5 rounded-xl outline-none disabled:opacity-50"
                        >
                          <option value="">Bulk Actions...</option>
                          <option value="verify">Verify Selected</option>
                          <option value="unverify">Unverify Selected</option>
                          <option value="delete">Delete Selected</option>
                        </select>
                        <button
                          onClick={handleApplyBulkAction}
                          disabled={!bulkAction || selectedUserIds.length === 0}
                          className="px-4 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={filteredProfiles.length > 0 && selectedUserIds.length === filteredProfiles.length}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-neutral-300">Select All ({filteredProfiles.length})</span>
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">Showing {filteredProfiles.length} of {profiles.length} profiles</span>
                    </div>

                    <div className="space-y-3">
                      {filteredProfiles.map(p => {
                        const isSelected = selectedUserIds.includes(p.id);
                        const isOnline = p.status === 'online';
                        const isSuspended = p.isPermanentlySuspended || (p.suspensionUntil && p.suspensionUntil > Date.now());
                        const daysLeft = p.suspensionUntil ? Math.ceil((p.suspensionUntil - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

                        return (
                          <div key={p.id} className={`bg-neutral-900 border p-4 rounded-2xl flex items-center justify-between transition ${isSelected ? 'border-amber-500/70 bg-amber-500/5' : 'border-neutral-800'}`}>
                            <div className="flex items-center space-x-3.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectUser(p.id)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                              />
                              <img src={p.photos[0]} alt={p.name} className="w-11 h-11 rounded-full object-cover border border-neutral-700" referrerPolicy="no-referrer" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-bold text-white">{p.name}, {p.age}</p>
                                  {p.isVerified && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">Verified</span>}
                                  {isSuspended && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold">Suspended</span>}
                                </div>
                                <p className="text-xs text-neutral-400">{p.locationName} • Tier: {p.membershipTier || 'Free'}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2.5">
                              <button
                                onClick={() => toggleUserStatus(p.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                                  isOnline 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                }`}
                              >
                                {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5" />}
                                <span className="capitalize">{p.status || 'offline'}</span>
                              </button>

                              {isSuspended ? (
                                <div className="flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-xl text-xs font-bold">
                                  <span>{p.isPermanentlySuspended ? '🚫 Perm' : `⏳ ${daysLeft}d`}</span>
                                  <button onClick={() => handleUnsuspendUser(p.id)} className="underline text-white hover:text-amber-300 ml-1">Lift</button>
                                </div>
                              ) : (
                                <select
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) return;
                                    if (val === 'perm') handleSuspendUser(p.id, 'permanent');
                                    else handleSuspendUser(p.id, parseInt(val, 10));
                                    e.target.value = '';
                                  }}
                                  defaultValue=""
                                  className="bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs px-3 py-1.5 rounded-xl outline-none cursor-pointer"
                                >
                                  <option value="" disabled>Suspend...</option>
                                  <option value="1">1 Day</option>
                                  <option value="7">7 Days</option>
                                  <option value="30">30 Days</option>
                                  <option value="perm">Permanently</option>
                                </select>
                              )}

                              <button
                                onClick={() => toggleVerify(p.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                  p.isVerified ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-neutral-800 text-neutral-300'
                                }`}
                              >
                                {p.isVerified ? 'Unverify' : 'Verify'}
                              </button>

                              <button
                                onClick={() => handleDeleteProfile(p.id)}
                                className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/20 transition"
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

                {activeAdminTab === 'refunds' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-white">Billing Disputes & Refund Requests</h4>
                        <p className="text-xs text-neutral-400">Issue refunds and cancel subscriptions for disputed charges.</p>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold">
                        {disputes.filter(d => d.status === 'pending').length} Pending
                      </span>
                    </div>

                    <div className="space-y-3">
                      {disputes.map(disp => (
                        <div key={disp.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4" /> Dispute ID: {disp.id} • Amount: <strong className="text-white">{disp.amount}</strong>
                            </span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                              disp.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {disp.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-300 space-y-1">
                            <p>User: <strong className="text-white">{disp.user}</strong> • Date: {disp.date}</p>
                            <p className="text-neutral-400 italic bg-neutral-950 p-3 rounded-xl border border-neutral-800">"{disp.reason}"</p>
                          </div>
                          {disp.status === 'pending' && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleIssueRefund(disp.id, disp.amount)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition shadow"
                              >
                                Issue Full Refund ({disp.amount})
                              </button>
                              <button
                                onClick={() => handleCancelSubFraud(disp.id, disp.user)}
                                className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-xs rounded-xl transition"
                              >
                                Cancel Sub & Flag Fraud
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeAdminTab === 'moderation' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-white">Profile Picture Moderation (Anti-Nude Policy)</h4>
                        <p className="text-xs text-neutral-400">Review and approve or reject profile photos.</p>
                      </div>
                      <span className="text-xs bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full font-bold">
                        {pendingPhotos.filter(p => p.status === 'pending').length} Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pendingPhotos.map(photo => (
                        <div key={photo.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{photo.userName}</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">{photo.status}</span>
                          </div>
                          <div className="aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                            <img src={photo.url} alt={photo.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          {photo.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprovePhoto(photo.id)}
                                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition"
                              >
                                Approve Public
                              </button>
                              <button
                                onClick={() => handleRejectPhotoToPrivate(photo.id)}
                                className="flex-1 py-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-xs rounded-xl transition"
                              >
                                Move to Private Album
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeAdminTab === 'logs' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-black text-white">System Activity & Moderation Audit Trail</h4>
                    <div className="space-y-2 font-mono text-xs">
                      {[
                        { title: 'Global Broadcast Sent', desc: 'Admin broadcasted announcement to active users.', time: '2026-08-30 00:01', type: 'ACTION' },
                        { title: 'New User Report Logged', desc: 'Safety report registered for review.', time: '2026-08-29 23:42', type: 'REPORT' },
                        { title: 'Verification Badge Granted', desc: 'Admin verified user identity.', time: '2026-08-29 21:15', type: 'VERIFY' },
                        { title: 'Account Suspension Executed', desc: 'Admin suspended violating account.', time: '2026-08-29 18:30', type: 'MOD' },
                      ].map((log, idx) => (
                        <div key={idx} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold mr-2">{log.type}</span>
                            <span className="font-bold text-white">{log.title}</span>
                            <p className="text-[11px] text-neutral-400 mt-0.5">{log.desc}</p>
                          </div>
                          <span className="text-[10px] text-neutral-500">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeAdminTab === 'broadcast' && (
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-amber-400" />
                      <span>Global System Announcement / Broadcast</span>
                    </h4>
                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                      <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type urgent system announcement here..."
                        rows={4}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3.5 text-xs text-white outline-none focus:border-amber-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#FFC107] text-[#121212] font-black text-xs rounded-xl hover:opacity-90 transition shadow"
                      >
                        Broadcast to All Active Users
                      </button>
                    </form>
                  </div>
                )}

                {activeAdminTab === 'master_override' && isMasterAdmin && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/30 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">Master Admin System Overrides</h4>
                        <p className="text-xs text-neutral-400">Master-level platform commands and bypasses.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-2">
                        <h5 className="text-xs font-bold text-white">🔓 Lift All Suspensions</h5>
                        <button
                          onClick={() => {
                            const updated = profiles.map(p => ({ ...p, isPermanentlySuspended: false, suspensionUntil: undefined }));
                            onUpdateProfiles(updated);
                            setSuccessToast('⚡ Master Override: Lifted all suspensions.');
                            setTimeout(() => setSuccessToast(''), 3000);
                          }}
                          className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:opacity-90 transition"
                        >
                          Execute
                        </button>
                      </div>

                      <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-2">
                        <h5 className="text-xs font-bold text-white">✅ Force Verify All</h5>
                        <button
                          onClick={() => {
                            const updated = profiles.map(p => ({ ...p, isVerified: true }));
                            onUpdateProfiles(updated);
                            setSuccessToast('⚡ Master Override: Verified all profiles.');
                            setTimeout(() => setSuccessToast(''), 3000);
                          }}
                          className="px-4 py-2 bg-cyan-500 text-black font-bold text-xs rounded-xl transition"
                        >
                          Execute
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* Mandatory Confirmation Dialog for Report Action */}
        {confirmingReport && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl max-w-md w-full p-6 text-white space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-bold text-base">Confirm Report Action</h3>
                </div>
                <button
                  onClick={() => setConfirmingReport(null)}
                  className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-300">
                You are about to execute action for report on <strong className="text-white">{confirmingReport.profileName}</strong> (Report ID: {confirmingReport.reportId}).
              </p>

              <form onSubmit={handleConfirmReportActionSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Action Category</label>
                  <select
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="Warning">Warning</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Permanent Ban">Permanent Ban</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Mandatory Justification Note</label>
                  <textarea
                    value={actionJustification}
                    onChange={(e) => setActionJustification(e.target.value)}
                    rows={3}
                    placeholder="Provide brief justification note for audit trail..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingReport(null)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400 transition shadow"
                  >
                    Confirm & Update DB
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
