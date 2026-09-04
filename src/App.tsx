import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Trash2, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { UserProfile, FilterState, ChatConversation, Message } from './types';
import { MOCK_PROFILES, CURRENT_USER } from './data/mockProfiles';
import { calculateDistance } from './utils/geo';
import { BuzzEvent, executeBuzz } from './utils/buzz';
import { playSound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FilterModal } from './components/FilterModal';
import { ProfileCard } from './components/ProfileCard';
import { RightProfilePanel } from './components/RightProfilePanel';
import { ChatListView } from './components/ChatListView';
import { ChatWindow } from './components/ChatWindow';
import { TapsView } from './components/TapsView';
import { FavoritesView } from './components/FavoritesView';
import { ProfileView } from './components/ProfileView';
import { NewActivityAreaModal } from './components/NewActivityAreaModal';

import { CompanionMembershipModal } from './components/CompanionMembershipModal';
import { BuzzAlertBanner } from './components/BuzzAlertBanner';
import { NotificationsModal } from './components/NotificationsModal';
import { MapView } from './components/MapView';
import { ContactsModal } from './components/ContactsModal';
import { TribesView } from './components/TribesView';
import { SettingsModal } from './components/SettingsModal';
import { SafetyGuidelinesModal } from './components/SafetyGuidelinesModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { BoostOfferModal } from './components/BoostOfferModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { RegistrationConsentModal } from './components/RegistrationConsentModal';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { FullRegistrationModal } from './components/FullRegistrationModal';
import { LogOffConfirmationModal } from './components/LogOffConfirmationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [gridColumns, setGridColumns] = useState<number>(3);
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'ios' | 'android'>('responsive');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('blaze_theme');
    return saved ? saved === 'dark' : true;
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    localStorage.setItem('blaze_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'c' || e.key === 'C') {
        setActiveTab('chats');
      } else if (e.key === 's' || e.key === 'S') {
        setIsFilterOpen(true);
      } else if (e.key === 'g' || e.key === 'G') {
        setActiveTab('grid');
      } else if (e.key === 'm' || e.key === 'M') {
        setActiveTab('map');
      } else if (e.key === 'Escape') {
        setIsFilterOpen(false);
        setSelectedProfile(null);
        setActiveChat(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (e.currentTarget.scrollTop > 350) {
      setShowBackToTop(true);
    } else {
      setShowBackToTop(false);
    }
  };

  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const countries = ['United States', 'United Kingdom', 'France', 'Canada', 'Australia', 'Japan', 'Germany', 'Brazil'];
    return MOCK_PROFILES.map((p, i) => ({ ...p, country: p.country || countries[i % countries.length] }));
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('blaze_current_user');
      return saved ? JSON.parse(saved) : CURRENT_USER;
    } catch {
      return CURRENT_USER;
    }
  });

  const handleSaveProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem('blaze_current_user', JSON.stringify(updated));
    showToast('💾 Profile changes saved successfully!');
  };
  
  const [filters, setFilters] = useState<FilterState>({
    onlineOnly: false,
    withPhotoOnly: false,
    maxDistance: 20,
    ageRange: [18, 70],
    selectedTribes: [],
    searchQuery: '',
    lookingFor: [],
  });

  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  const [viewedByArea, setViewedByArea] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('blaze_viewed_by_area');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [visitorVisitTimes, setVisitorVisitTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('blaze_visitor_visit_times');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [visitorSources, setVisitorSources] = useState<Record<string, 'Map' | 'Discovery Grid'>>(() => {
    try {
      const saved = localStorage.getItem('blaze_visitor_sources');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [visitorSortMostRecent, setVisitorSortMostRecent] = useState(false);
  const [visitorFilterTab, setVisitorFilterTab] = useState<'all' | 'from_map' | 'from_grid' | 'favorited'>('all');

  useEffect(() => {
    localStorage.setItem('blaze_visitor_visit_times', JSON.stringify(visitorVisitTimes));
  }, [visitorVisitTimes]);

  useEffect(() => {
    localStorage.setItem('blaze_visitor_sources', JSON.stringify(visitorSources));
  }, [visitorSources]);

  const [subscription, setSubscription] = useState<{ type: 'none' | '1-day' | '7-day' | 'monthly' | 'yearly'; expiresAt: number }>(() => {
    try {
      const saved = localStorage.getItem('blaze_subscription');
      return saved ? JSON.parse(saved) : { type: 'none', expiresAt: 0 };
    } catch {
      return { type: 'none', expiresAt: 0 };
    }
  });

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isBoostOfferModalOpen, setIsBoostOfferModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(() => {
    return false;
  });
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(() => {
    return localStorage.getItem('blaze_onboarding_completed') === 'true' && localStorage.getItem('blaze_privacy_consent') !== 'true';
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return localStorage.getItem('blaze_onboarding_completed') !== 'true';
  });

  const [isDailyCheckinOpen, setIsDailyCheckinOpen] = useState<boolean>(() => {
    const last = currentUser.lastLogin;
    if (!last) return true;
    const lastDate = new Date(last).toDateString();
    const today = new Date().toDateString();
    return lastDate !== today;
  });

  const [isFullRegistrationOpen, setIsFullRegistrationOpen] = useState(false);

  const handleClaimCheckin = (rewardSparks: number) => {
    setCurrentUser(prev => ({
      ...prev,
      sparkBalance: (prev.sparkBalance || 100) + rewardSparks,
      lastLogin: Date.now()
    }));
    setIsDailyCheckinOpen(false);
    showToast(`🎉 Daily Check-in claimed! +${rewardSparks} Spark coins & visibility boost added.`);
  };

  useEffect(() => {
    localStorage.setItem('blaze_viewed_by_area', JSON.stringify(viewedByArea));
  }, [viewedByArea]);

  useEffect(() => {
    localStorage.setItem('blaze_subscription', JSON.stringify(subscription));
  }, [subscription]);

  // Periodic reminder toast every 5 minutes for Pending Activation Pro/Elite users
  useEffect(() => {
    const isPending = (currentUser.isCompanionPro || currentUser.membershipTier === 'Elite Companion' || currentUser.membershipTier === 'Pro') && (!currentUser.isFeePaid || !currentUser.isVerified || !currentUser.isPublished);
    if (!isPending) return;

    const interval = setInterval(() => {
      showToast('⚠️ Reminder: Please complete your $19.99 subscription payment and ID verification to activate and publish your profile.');
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [currentUser]);

  const hasActiveSubscription = subscription.type !== 'none' && subscription.expiresAt > Date.now();

  const currentArea = currentUser.locationName || 'Downtown';
  const currentAreaViewedIds = viewedByArea[currentArea] || [];
  const allViewedIds = Array.from(new Set(Object.values(viewedByArea).flat()));

  const handleSelectProfile = (profile: UserProfile, explicitSource?: 'Map' | 'Discovery Grid') => {
    const area = profile.locationName || currentUser.locationName || 'Downtown';
    const areaViewed = viewedByArea[area] || [];
    const source = explicitSource || (activeTab === 'map' ? 'Map' : 'Discovery Grid');

    setVisitorSources(prev => ({ ...prev, [profile.id]: source }));

    if (hasActiveSubscription || areaViewed.includes(profile.id)) {
      if (!visitorVisitTimes[profile.id]) {
        setVisitorVisitTimes(prev => ({ ...prev, [profile.id]: Date.now() }));
      }
      setSelectedProfile(profile);
      return;
    }

    if (areaViewed.length < 20) {
      const updatedAreaViewed = [...areaViewed, profile.id];
      setViewedByArea(prev => ({
        ...prev,
        [area]: updatedAreaViewed
      }));
      setVisitorVisitTimes(prev => ({ ...prev, [profile.id]: Date.now() }));
      setSelectedProfile(profile);
      const remaining = 20 - updatedAreaViewed.length;
      if (remaining <= 5 && remaining > 0) {
        showToast(`⚠️ Free views remaining in ${area}: ${remaining} of 20. Subscribe for unlimited access!`);
      }
    } else {
      setIsBoostOfferModalOpen(true);
      showToast(`⚡ 20/20 free views reached for ${area}. Boost offer available.`);
    }
  };

  const handleSubscribe = (type: '1-day' | '7-day' | 'monthly' | 'yearly', price: string) => {
    let durationMs = 24 * 60 * 60 * 1000;
    if (type === '7-day') durationMs = 7 * 24 * 60 * 60 * 1000;
    if (type === 'monthly') durationMs = 30 * 24 * 60 * 60 * 1000;
    if (type === 'yearly') durationMs = 365 * 24 * 60 * 60 * 1000;

    const expiresAt = Date.now() + durationMs;
    setSubscription({ type, expiresAt });
    setIsSubscriptionModalOpen(false);
    showToast(`🎉 Success! ${type === '1-day' ? '1-Day Pass ($1.99)' : type === '7-day' ? '7-Day Pass ($4.99)' : type === 'monthly' ? 'Monthly Pass ($9.99)' : 'Yearly VIP Pass ($59.99)'} activated! Enjoy unlimited profile views.`);
  };
  const [gridSubTab, setGridSubTab] = useState<'all' | 'recently_viewed' | 'right_now'>('all');
  const [selectedVisitorIds, setSelectedVisitorIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const sessionToken = sessionStorage.getItem('blaze_session_token');
      const loginTime = sessionStorage.getItem('blaze_login_time');
      const now = Date.now();
      if (sessionToken && loginTime && (now - parseInt(loginTime, 10) < 24 * 60 * 60 * 1000)) {
        return true;
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem('blaze_session_token', 'token_' + Date.now());
      if (!sessionStorage.getItem('blaze_login_time')) {
        sessionStorage.setItem('blaze_login_time', Date.now().toString());
      }
    } else {
      sessionStorage.removeItem('blaze_session_token');
      sessionStorage.removeItem('blaze_login_time');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsLoggedIn(false);
        showToast('🔒 Session expired due to 15 minutes of inactivity. Please log in again.');
      }, 15 * 60 * 1000); // 15 minutes
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
    };
  }, [isLoggedIn]);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerPhase, setRegisterPhase] = useState<1 | 2>(1);
  const [registerFilterPreset, setRegisterFilterPreset] = useState<'Nearby Friends' | 'Night Owls' | 'Same Tribes'>('Nearby Friends');
  const [loginEmail, setLoginEmail] = useState('user@blaze.io');
  const [loginPassword, setLoginPassword] = useState('blaze2026');
  const [registerName, setRegisterName] = useState('Alex Morgan');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [blockedKeywords, setBlockedKeywords] = useState<string[]>(['spam', 'scam', 'crypto', 'telegram', 'whatsapp']);
  const [registerAsElite, setRegisterAsElite] = useState(false);
  const [registerProfileType, setRegisterProfileType] = useState<'regular' | 'professional' | 'elite'>('regular');
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [isContactsOpen, setIsContactsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isRightNowActive, setIsRightNowActive] = useState<boolean>(false);
  const [rightNowNote, setRightNowNote] = useState<string>('');
  const [rightNowExpiresAt, setRightNowExpiresAt] = useState<number | null>(null);
  const [showPresets, setShowPresets] = useState<boolean>(true);
  const [showRightNowModal, setShowRightNowModal] = useState<boolean>(false);
  const [mintboysMode, setMintboysMode] = useState<boolean>(false);
  const [bookingModalProfile, setBookingModalProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isRightNowActive || !rightNowExpiresAt) return;
    const interval = setInterval(() => {
      if (Date.now() >= rightNowExpiresAt) {
        setIsRightNowActive(false);
        setRightNowNote('');
        setRightNowExpiresAt(null);
        setCurrentUser(prev => ({ ...prev, isRightNowActive: false, rightNowNote: undefined, rightNowExpiresAt: undefined }));
        showToast('⚡ Your "Right Now" status has automatically expired after 2 hours.');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isRightNowActive, rightNowExpiresAt]);

  const getRemainingTimeStr = () => {
    if (!rightNowExpiresAt) return '';
    const diff = rightNowExpiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState<boolean>(true);
  const [ghostModeEnabled, setGhostModeEnabled] = useState<boolean>(false);
  const [autoAdvancePhotosEnabled, setAutoAdvancePhotosEnabled] = useState<boolean>(() => {
    return localStorage.getItem('blaze_auto_advance_photos') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('blaze_auto_advance_photos', String(autoAdvancePhotosEnabled));
  }, [autoAdvancePhotosEnabled]);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);
  const [isSafetyGuidelinesOpen, setIsSafetyGuidelinesOpen] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [travelModeEnabled, setTravelModeEnabled] = useState<boolean>(false);
  const [travelCity, setTravelCity] = useState<string>('London, UK');
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('blaze_accent_color') || '#FFC107';
  });

  useEffect(() => {
    localStorage.setItem('blaze_accent_color', accentColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  const [boostActiveUntil, setBoostActiveUntil] = useState<number | null>(null);

  // Background location observer for high-compatibility profile within 1-mile radius
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfiles(prev => prev.map(p => p.id === 'user-3' ? { ...p, distance: 0.4 } : p));
      showToast('📍 Someone new is nearby: Marcus (0.4 mi away)');
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Focus mode deletion of 14th element (profile card)
  useEffect(() => {
    const unblocked = profiles.filter(p => !p.isBlocked);
    if (unblocked.length >= 14) {
      const targetProfile = unblocked[13];
      if (targetProfile) {
        setProfiles(prev => prev.filter(p => p.id !== targetProfile.id));
        showToast('🗑️ Profile removed from the platform.');
      }
    }
  }, []);

  const handleActivateBoost = () => {
    const until = Date.now() + 30 * 60 * 1000;
    setBoostActiveUntil(until);
    showToast('⚡ Boost activated! You have increased visibility in the grid for 30 minutes.');
  };

  // Buzz system state
  const [buzzEvents, setBuzzEvents] = useState<BuzzEvent[]>([
    {
      id: 'buzz-init-1',
      senderId: 'user-1',
      senderName: 'Lucas',
      senderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      type: 'wink',
      text: 'Lucas sent you a wink! 😉',
      timestamp: Date.now() - 1000 * 60 * 3,
      read: false,
    }
  ]);
  const [activeBuzzAlert, setActiveBuzzAlert] = useState<BuzzEvent | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [autoSimulatorActive, setAutoSimulatorActive] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [isLogOffModalOpen, setIsLogOffModalOpen] = useState(false);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [reportHistory, setReportHistory] = useState<Array<{
    id: string;
    profileId: string;
    profileName: string;
    reason: string;
    details: string;
    timestamp: number;
    dateStr: string;
  }>>([
    { id: 'rep_1', profileId: 'p_1', profileName: 'Marcus Vance', reason: 'Harassment, bullying, or offensive language', details: 'Unsolicited inappropriate messages', timestamp: Date.now() - 3600000 * 24, dateStr: 'Aug 30, 2026' },
    { id: 'rep_2', profileId: 'p_2', profileName: 'Fake Account Test', reason: 'Fake profile / Catfishing', details: 'Using stolen celebrity photos', timestamp: Date.now() - 3600000 * 48, dateStr: 'Aug 29, 2026' },
  ]);

  const [toastData, setToastData] = useState<{ message: string; actionText?: string; onAction?: () => void } | null>(null);
  const [toastTimer, setToastTimer] = useState<any>(null);

  const showToast = (msg: string, actionText?: string, onAction?: () => void, duration = 3500) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastData({ message: msg, actionText, onAction });
    const timer = setTimeout(() => {
      setToastData(null);
    }, duration);
    setToastTimer(timer);
  };

  const handleReportSubmitted = (profile: UserProfile, reason: string, details: string) => {
    const reportId = 'rep_' + Date.now();
    const newReport = {
      id: reportId,
      profileId: profile.id,
      profileName: profile.name,
      reason,
      details,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setReportHistory(prev => [newReport, ...prev]);

    showToast(
      `🛡️ Report sent to moderation team for ${profile.name} (${reason}).`,
      'Undo Report',
      () => {
        setReportHistory(prev => prev.filter(r => r.id !== reportId));
        showToast(`↩️ Report retracted successfully for ${profile.name}.`);
      },
      5000
    );
  };

  const handleTriggerBuzzEvent = (event: BuzzEvent) => {
    playSound(event.type === 'wink' ? 'wink' : 'message');
    executeBuzz(event.type === 'wink' ? 'wink' : event.type === 'message' ? 'message' : 'interest', event.senderName);
    setBuzzEvents((prev) => [event, ...prev]);
    setActiveBuzzAlert(event);
  };

  // Auto-simulator for incoming winks, messages, and interest
  useEffect(() => {
    if (!autoSimulatorActive) return;
    const interval = setInterval(() => {
      if (profiles.length === 0) return;
      const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
      const types: ('wink' | 'message' | 'interest')[] = ['wink', 'message', 'interest'];
      const t = types[Math.floor(Math.random() * types.length)];
      const texts = {
        wink: `${randomProfile.name} winked at your profile! 😉`,
        message: `${randomProfile.name}: "Hey! Saw you nearby. Want to grab coffee?" ☕️`,
        interest: `${randomProfile.name} showed strong interest and added you to favorites! 🔥`,
      };
      handleTriggerBuzzEvent({
        id: `buzz-auto-${Date.now()}`,
        senderId: randomProfile.id,
        senderName: randomProfile.name,
        senderPhoto: randomProfile.photos[0],
        type: t,
        text: texts[t],
        timestamp: Date.now(),
        read: false,
      });
    }, 22000);
    return () => clearInterval(interval);
  }, [autoSimulatorActive, profiles]);

  const unreadBuzzCount = buzzEvents.filter(b => !b.read).length;

  // Geolocation handler
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    showToast('Requesting approximate location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        setCurrentUser((prev) => ({
          ...prev,
          latitude: userLat,
          longitude: userLng,
          locationName: 'Current Location',
        }));

        // Recalculate distances and sort by proximity (ascending)
        setProfiles((prevProfiles) => {
          const updated = prevProfiles.map((p) => {
            if (p.latitude && p.longitude) {
              const dist = calculateDistance(userLat, userLng, p.latitude, p.longitude);
              return { ...p, distance: dist };
            }
            return p;
          });
          return updated.sort((a, b) => a.distance - b.distance);
        });

        showToast('📍 Location shared! Profiles sorted by proximity.');
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback simulation for testing in restricted iframe environments
        const fallbackLat = 37.7749;
        const fallbackLng = -122.4194;
        setCurrentUser((prev) => ({
          ...prev,
          latitude: fallbackLat,
          longitude: fallbackLng,
          locationName: 'Downtown (Simulated)',
        }));
        setProfiles((prevProfiles) => {
          const updated = prevProfiles.map((p) => {
            if (p.latitude && p.longitude) {
              const dist = calculateDistance(fallbackLat, fallbackLng, p.latitude, p.longitude);
              return { ...p, distance: dist };
            }
            return p;
          });
          return updated.sort((a, b) => a.distance - b.distance);
        });
        showToast('📍 Location simulated successfully (Sorted by proximity).');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Filter profiles based on filters state & sort by distance (proximity)
  const filteredProfiles = profiles
    .filter((p) => {
      if (p.isBlocked) return false;
      const isEliteOrPro = p.isCompanionPro || p.membershipTier === 'Elite Companion' || p.membershipTier === 'Pro';
      if (mintboysMode) {
        if (!isEliteOrPro || !p.isFeePaid) return false;
      } else {
        if (isEliteOrPro && p.isFeePaid) return false;
      }
      if (filters.onlineOnly && p.status !== 'online') return false;
      if (filters.withPhotoOnly && (!p.photos || p.photos.length === 0)) return false;
      if (filters.onlyVisitedMe && !allViewedIds.includes(p.id)) return false;
      if (filters.activeToday && p.status !== 'online' && p.status !== 'away') return false;
      if (filters.recentlyActive && p.status !== 'online') return false;
      if (filters.newMembersOnly && !p.isNewUser) return false;
      if (filters.lastActiveFilter && filters.lastActiveFilter !== 'all') {
        const now = Date.now();
        const lastLogin = p.lastLogin || (now - 1000 * 60 * 30);
        const diffMins = (now - lastLogin) / (1000 * 60);
        if (filters.lastActiveFilter === '15m' && diffMins > 15 && p.status !== 'online') return false;
        if (filters.lastActiveFilter === '1h' && diffMins > 60 && p.status !== 'online') return false;
        if (filters.lastActiveFilter === '24h' && diffMins > 1440 && p.status !== 'online' && p.status !== 'away') return false;
      }
      if (filters.excludeAlreadyMessaged) {
        const messagedIds = conversations.map(c => c.profile.id);
        if (messagedIds.includes(p.id)) return false;
      }
      const isElite = p.isCompanionPro || p.membershipTier === 'Elite Companion';
      if (filters.verifiedEliteOnly && (!isElite || !p.isFeePaid)) return false;
      if (!mintboysMode && !isElite && p.distance > filters.maxDistance) return false;
      if (filters.countryFilter && filters.countryFilter !== 'all') {
        const loc = (p.locationName || '').toLowerCase();
        const target = filters.countryFilter.toLowerCase();
        if (!loc.includes(target)) return false;
      }
      if (p.age < filters.ageRange[0] || p.age > filters.ageRange[1]) return false;
      if (filters.lookingFor && filters.lookingFor.length > 0 && (!p.lookingFor || !filters.lookingFor.some(l => p.lookingFor?.includes(l)))) return false;
      if (filters.selectedTribes.length > 0 && !filters.selectedTribes.some((t) => p.tribes.includes(t))) {
        return false;
      }
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBio = p.aboutMe.toLowerCase().includes(q);
        const matchHeadline = p.headline?.toLowerCase().includes(q) || false;
        const matchInterest = p.interestTags?.some(t => t.toLowerCase().includes(q)) || false;
        const matchStyle = p.styleTags?.some(s => s.toLowerCase().includes(q)) || false;
        const matchTribe = p.tribes?.some(t => t.toLowerCase().includes(q)) || false;
        if (!matchName && !matchBio && !matchHeadline && !matchInterest && !matchStyle && !matchTribe) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.suggestedForYou) {
        const getMatchScore = (p: UserProfile) => {
          let score = 0;
          const sharedInterests = p.interestTags?.filter(tag => currentUser.interestTags?.includes(tag)).length || 0;
          score += sharedInterests * 3;
          const matchingTribes = p.tribes?.filter(t => currentUser.tribes?.includes(t) || currentUser.tribe === t).length || 0;
          score += matchingTribes * 4;
          const midAge = (filters.ageRange[0] + filters.ageRange[1]) / 2;
          const ageDiff = Math.abs(p.age - midAge);
          score += Math.max(0, 10 - ageDiff);
          if (p.isVerified || p.isFeePaid) score += 3;
          if (p.status === 'online') score += 2;
          return score;
        };
        const scoreA = getMatchScore(a);
        const scoreB = getMatchScore(b);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      if (filters.sortBy === 'smart_sort') {
        const getSmartScore = (p: UserProfile) => {
          let score = 0;
          const userInterests = currentUser.interestTags || [];
          const sharedInterests = p.interestTags?.filter(tag => userInterests.includes(tag)).length || 0;
          score += sharedInterests * 5;

          const userTribes = [...(currentUser.tribes || []), ...(currentUser.tribe ? [currentUser.tribe] : [])];
          const sharedTribes = p.tribes?.filter(t => userTribes.includes(t)).length || 0;
          score += sharedTribes * 6;

          if (p.status === 'online') score += 2;
          if (p.isVerified || p.isFeePaid) score += 3;
          return score;
        };
        const scoreA = getSmartScore(a);
        const scoreB = getSmartScore(b);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      if (filters.sortBy === 'newest') {
        const isANew = a.isNewUser ? 1 : 0;
        const isBNew = b.isNewUser ? 1 : 0;
        if (isBNew !== isANew) return isBNew - isANew;
        return (b.lastPhotoUpdated || 0) - (a.lastPhotoUpdated || 0);
      }
      if (filters.sortBy === 'compatibility') {
        const getCompatibilityScore = (p: UserProfile) => {
          let score = 0;
          const sharedInterests = p.interestTags?.filter(tag => currentUser.interestTags?.includes(tag)).length || 0;
          score += sharedInterests * 4;
          const matchingTribes = p.tribes?.filter(t => currentUser.tribes?.includes(t) || currentUser.tribe === t).length || 0;
          score += matchingTribes * 5;
          if (p.status === 'online') score += 3;
          return score;
        };
        const scoreA = getCompatibilityScore(a);
        const scoreB = getCompatibilityScore(b);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      if (filters.sortBy === 'active_now') {
        const rank = (s?: string) => s === 'online' ? 0 : s === 'away' ? 1 : 2;
        const rA = rank(a.status);
        const rB = rank(b.status);
        if (rA !== rB) return rA - rB;
      }
      // Default / Closest sorting
      return a.distance - b.distance;
    });

  const favoriteProfiles = profiles.filter((p) => p.isFavorite).sort((a, b) => a.distance - b.distance);
  const tappedProfiles = profiles.filter((p) => p.isTapped).sort((a, b) => a.distance - b.distance);
  const unreadChatCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleSendTap = (e: React.MouseEvent, profile: UserProfile) => {
    e.stopPropagation();
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
    setProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, isTapped: true } : p))
    );
    // Also trigger a playful reciprocal wink/interest buzz simulation
    setTimeout(() => {
      handleTriggerBuzzEvent({
        id: `buzz-wink-${Date.now()}`,
        senderId: profile.id,
        senderName: profile.name,
        senderPhoto: profile.photos[0],
        type: 'wink',
        text: `${profile.name} winked back at you! 😉`,
        timestamp: Date.now(),
        read: false,
      });
    }, 2000);
    showToast(`You sent a Tap to ${profile.name}! 🔥`);
  };

  const handleToggleFavorite = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (selectedProfile && selectedProfile.id === profileId) {
      setSelectedProfile((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleStartChat = (profile: UserProfile) => {
    let existing = conversations.find((c) => c.profile.id === profile.id);
    if (!existing) {
      const newConv: ChatConversation = {
        id: `conv-${profile.id}`,
        profile,
        lastMessage: 'Started a conversation',
        unreadCount: 0,
        updatedAt: Date.now(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: profile.id,
            receiverId: currentUser.id,
            text: `Hey! Saw you nearby (${profile.distance} mi away). How's it going?`,
            timestamp: Date.now(),
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      existing = newConv;
    }
    setActiveChat(existing);
  };

  const handleSendMessage = (conversationId: string, text: string, type: 'text' | 'image' | 'audio' | 'location' = 'text', mediaUrl?: string) => {
    const lowerText = text.toLowerCase();
    const isBlocked = blockedKeywords.some(kw => lowerText.includes(kw.toLowerCase()));
    if (isBlocked) {
      showToast('🛡️ Message blocked by admin blocked keywords filter.');
      return;
    }
    const msgId = `msg-${Date.now()}`;
    const newMsg: Message = {
      id: msgId,
      senderId: currentUser.id,
      receiverId: activeChat?.profile.id || 'user',
      text,
      timestamp: Date.now(),
      type,
      mediaUrl,
      isRead: false,
      status: 'pending',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: type === 'image' ? 'Sent a photo' : type === 'location' ? 'Shared location' : text,
            updatedAt: Date.now(),
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    if (activeChat && activeChat.id === conversationId) {
      setActiveChat((prev) => prev ? {
        ...prev,
        lastMessage: text,
        updatedAt: Date.now(),
        messages: [...prev.messages, newMsg],
      } : null);
    }

    // Transition pending to sent after 500ms
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: c.messages.map((m) => m.id === msgId ? { ...m, status: 'sent' } : m),
            };
          }
          return c;
        })
      );
      setActiveChat((prev) => prev && prev.id === conversationId ? {
        ...prev,
        messages: prev.messages.map((m) => m.id === msgId ? { ...m, status: 'sent' } : m),
      } : null);
    }, 500);

    // Simulate read receipt after 1.5 seconds
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: c.messages.map((m) => m.id === msgId ? { ...m, isRead: true, readAt: Date.now() } : m),
            };
          }
          return c;
        })
      );
      setActiveChat((prev) => {
        if (prev && prev.id === conversationId) {
          return {
            ...prev,
            messages: prev.messages.map((m) => m.id === msgId ? { ...m, isRead: true, readAt: Date.now() } : m),
          };
        }
        return prev;
      });
    }, 1500);
  };

  const handleAddReaction = (convId: string, messageId: string, emoji: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== convId) return conv;
      const updatedMessages = conv.messages.map(msg => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || [];
        const existingIndex = currentReactions.findIndex(r => r.userId === currentUser.id && r.emoji === emoji);
        let newReactions = [...currentReactions];
        if (existingIndex >= 0) {
          newReactions.splice(existingIndex, 1);
        } else {
          newReactions.push({ emoji, userId: currentUser.id, userName: currentUser.name });
        }
        return { ...msg, reactions: newReactions };
      });
      const updatedConv = { ...conv, messages: updatedMessages };
      if (activeChat && activeChat.id === convId) {
        setActiveChat(updatedConv);
      }
      return updatedConv;
    }));
  };

  const handleToggleArchive = (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isArchived: !c.isArchived } : c));
    showToast('📦 Conversation archive status updated.');
  };

  const handleBulkArchive = (conversationIds: string[]) => {
    setConversations(prev => prev.map(c => conversationIds.includes(c.id) ? { ...c, isArchived: !c.isArchived } : c));
    showToast(`📦 Updated archive status for ${conversationIds.length} conversation(s).`);
  };

  const handleBulkDelete = (conversationIds: string[]) => {
    setConversations(prev => prev.filter(c => !conversationIds.includes(c.id)));
    if (activeChat && conversationIds.includes(activeChat.id)) {
      setActiveChat(null);
    }
    showToast(`🗑️ Deleted ${conversationIds.length} conversation(s).`);
  };

  const handleBulkSendQuickReply = (conversationIds: string[], messageText: string) => {
    setConversations(prev => prev.map(c => {
      if (conversationIds.includes(c.id)) {
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          senderId: currentUser.id,
          text: messageText,
          timestamp: Date.now(),
        };
        return {
          ...c,
          messages: [...(c.messages || []), newMessage],
          lastMessage: messageText,
          updatedAt: Date.now(),
        };
      }
      return c;
    }));
    showToast(`⚡ Quick reply sent to ${conversationIds.length} conversation(s)!`);
  };

  const appContent = (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans select-none w-full h-full relative overflow-hidden">
      
      {/* Toast Notification */}
      {toastData && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#FFC107] text-[#121212] px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-200 border border-amber-300">
          <span>{toastData.message}</span>
          {toastData.actionText && toastData.onAction && (
            <button
              onClick={() => {
                if (toastData.onAction) toastData.onAction();
                setToastData(null);
              }}
              className="bg-[#121212] text-[#FFC107] hover:bg-neutral-900 px-3 py-1 rounded-xl text-xs font-black shadow transition uppercase tracking-wider flex items-center gap-1"
            >
              <span>↩️</span>
              <span>{toastData.actionText}</span>
            </button>
          )}
        </div>
      )}

      {/* Buzz Alert Banner Popup */}
      <BuzzAlertBanner
        event={activeBuzzAlert}
        onClose={() => setActiveBuzzAlert(null)}
        onAction={(evt) => {
          setActiveBuzzAlert(null);
          const matched = profiles.find(p => p.id === evt.senderId);
          if (matched) {
            if (evt.type === 'message') {
              handleStartChat(matched);
              setActiveTab('chats');
            } else {
              handleSelectProfile(matched);
            }
          }
        }}
      />

      {/* Navbar */}
      <Navbar
        onOpenFilters={() => setIsFilterOpen(true)}
        onShareLocation={handleShareLocation}
        onOpenContacts={() => setIsContactsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        activeTab={activeTab}
        unreadBuzzCount={unreadBuzzCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        profiles={profiles}
        onTriggerBuzzEvent={handleTriggerBuzzEvent}
        autoSimulatorActive={autoSimulatorActive}
        setAutoSimulatorActive={setAutoSimulatorActive}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => {
          setCurrentLanguage(lang);
          showToast(`Language switched to ${lang.toUpperCase()}`);
        }}
        currentUser={currentUser}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        viewedCount={currentAreaViewedIds.length}
        subscription={subscription}
        gridSubTab={gridSubTab}
        setGridSubTab={setGridSubTab}
        onOpenAdmin={() => setIsAdminOpen(true)}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
      />

      {/* Main Content Area */}
      <main
        ref={mainRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto relative ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-neutral-100 text-neutral-900'}`}
      >
        {activeTab === 'grid' && (
          <div className="max-w-7xl mx-auto p-3 sm:p-4 pb-24">

            {/* Elite Companion Subscription Expiration Alert (7 Days Warning) */}
            {currentUser.membershipTier === 'Elite Companion' && (
              <div className="mb-4 bg-gradient-to-r from-amber-500/20 via-neutral-900 to-neutral-900 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between text-white shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black flex-shrink-0">
                    👑
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">Elite Companion Subscription Status: Active</h4>
                    <p className="text-[11px] text-neutral-300">Your monthly subscription renews in 5 days (Oct 2, 2026). Ensure payment details are up-to-date to maintain priority discovery placement.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompanionModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex-shrink-0 whitespace-nowrap shadow"
                >
                  Manage Billing
                </button>
              </div>
            )}

            {/* Search Input, Geolocation Status Bar & Sorting Toggle */}
            <div className="mb-4 flex flex-col md:flex-row gap-2.5 items-center justify-between">
              <input
                type="text"
                placeholder="Search by name, bio, or interests..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className={`w-full sm:flex-1 border rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none transition shadow-sm ${isDarkMode ? 'bg-[#1E1E1E] border-neutral-800 focus:border-[#FFC107] text-white' : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'}`}
              />

              {/* Sorting & Visitors Toggle: All Profiles, Who Viewed Me, Closest, Newest, Compatibility */}
              <div className="flex items-center space-x-1 bg-[#1E1E1E] border border-neutral-800 p-1 rounded-xl flex-shrink-0 overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setGridSubTab('all')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    gridSubTab === 'all'
                      ? 'bg-[#FFC107] text-[#121212] shadow'
                      : 'text-neutral-400 hover:text-white bg-neutral-800/40'
                  }`}
                  title="Show all profiles"
                >
                  <span>🌟 All Profiles</span>
                </button>


                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, sortBy: 'closest' })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    (!filters.sortBy || filters.sortBy === 'closest')
                      ? 'bg-[#FFC107] text-[#121212] shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>📍 Closest</span>
                </button>





              </div>
            </div>

            {(() => {
              const profilesToDisplay = gridSubTab === 'recently_viewed'
                ? filteredProfiles.filter(p => allViewedIds.includes(p.id))
                : gridSubTab === 'right_now'
                ? filteredProfiles.filter(p => p.isRightNowActive || (p.id === currentUser.id && isRightNowActive))
                : filteredProfiles;

              if (profilesToDisplay.length === 0) {
                return (
                  <div className="text-center py-20 text-neutral-400">
                    <p className="text-lg font-bold mb-1">
                      {mintboysMode ? 'No MintBoys Elite companions currently match criteria' : gridSubTab === 'recently_viewed' ? 'No recently viewed profiles yet' : 'No profiles match your filters'}
                    </p>
                    <p className="text-sm">
                      {mintboysMode ? 'Try toggling off MintBoys Elite mode or broadening your filters.' : gridSubTab === 'recently_viewed' ? 'Browse the discovery grid and click on profiles to spend a free view.' : 'Try broadening your distance radius or resetting your filters.'}
                    </p>
                  </div>
                );
              }

              return (
                <>
                  {mintboysMode && (
                    <div className="mb-4 bg-gradient-to-r from-amber-500/20 via-neutral-900 to-neutral-900 border border-amber-500/40 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-lg shadow-md">
                          👔
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>MintBoys Elite Companions Directory</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">Global Verified</span>
                          </h4>
                          <p className="text-xs text-neutral-300">
                            Worldwide premier independent male escorts & companions. Incall/outcall rates, VIP screening & direct booking across all regions.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400 font-semibold">Active Mode</span>
                        <button
                          onClick={() => setMintboysMode(false)}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition"
                        >
                          Exit MintBoys
                        </button>
                      </div>
                    </div>
                  )}
                  {gridSubTab === 'right_now' && !mintboysMode && (
                    <div className="mb-4 bg-gradient-to-r from-amber-500/15 via-neutral-900 to-neutral-900 border border-amber-500/30 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-lg shadow-md animate-pulse">
                          ⚡
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Right Now Section</span>
                            {isRightNowActive && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Active ({getRemainingTimeStr()})</span>}
                          </h4>
                          <p className="text-xs text-neutral-300">
                            {isRightNowActive ? `Your status: "${rightNowNote || 'Ready to meet!'}"` : "You are not currently broadcasting in Right Now."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowRightNowModal(true)}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow-lg flex items-center gap-1.5 shrink-0"
                      >
                        <span>⚡ {isRightNowActive ? 'Edit Status' : 'Set Right Now Status'}</span>
                      </button>
                    </div>
                  )}



                  {/* Quick Sort Segment Control */}
                  <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-neutral-900 border border-neutral-800 p-3 rounded-2xl shadow-sm gap-3">
                    <span className="text-xs font-bold text-neutral-400 px-1 shrink-0">Sort & Filter:</span>
                    <div className="grid grid-cols-2 sm:flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 w-full">
                      <button
                        onClick={() => {
                          setGridSubTab('recently_viewed');
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center truncate ${
                          gridSubTab === 'recently_viewed' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Show only profiles that viewed me"
                      >
                        👀 Viewed Me ({currentAreaViewedIds.length})
                      </button>
                      <button
                        onClick={() => {
                          setGridSubTab('right_now');
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center truncate ${
                          gridSubTab === 'right_now' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Show only profiles in Right Now mode"
                      >
                        ⚡ Right Now {isRightNowActive && `(${getRemainingTimeStr()})`}
                      </button>
                      <button
                        onClick={() => {
                          setGridSubTab('all');
                          setFilters({ ...filters, sortBy: 'closest' });
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center truncate ${
                          gridSubTab === 'all' && (!filters.sortBy || filters.sortBy === 'closest') ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        📍 Distance
                      </button>

                      {/* Paid User Elite Tier Buttons */}
                      <button
                        onClick={() => {
                          setMintboysMode(true);
                          setGridSubTab('all');
                          showToast('👑 Mintboys Elite verified member directory activated.');
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition text-center truncate ${mintboysMode ? 'bg-amber-500 text-black shadow' : 'bg-neutral-800 text-amber-300 border border-amber-500/40 hover:bg-neutral-700'}`}
                        title="Mintboys Elite Paid Users Directory"
                      >
                        👔 Mintboys Elite
                      </button>

                      <button
                        onClick={() => {
                          setIsSubscriptionModalOpen(true);
                          showToast('⭐ Pro Elite membership status & perks.');
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition text-center truncate bg-neutral-800 text-cyan-300 border border-cyan-500/40 hover:bg-neutral-700"
                        title="Pro Elite Paid Users"
                      >
                        ⭐ Pro Elite
                      </button>
                      <button
                        onClick={() => {
                          setGridSubTab('all');
                          setFilters({ ...filters, sortBy: 'newest' });
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center truncate ${
                          gridSubTab === 'all' && filters.sortBy === 'newest' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        ✨ Newest
                      </button>
                      <button
                        onClick={() => {
                          setGridSubTab('all');
                          setFilters({ ...filters, sortBy: 'active_now' });
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center truncate ${
                          gridSubTab === 'all' && filters.sortBy === 'active_now' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        🟢 Active Now
                      </button>
                      <button
                        onClick={() => {
                          setGridSubTab('all');
                          setFilters({ ...filters, sortBy: 'compatibility' });
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center truncate ${
                          gridSubTab === 'all' && filters.sortBy === 'compatibility' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        🔥 Compatibility
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid gap-3`}
                    style={{
                      gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                    }}
                  >
                    {profilesToDisplay.map((profile, idx) => (
                      <ProfileCard
                        key={`${profile.id}-${filters.sortBy}-${idx}`}
                        profile={profile}
                        index={idx}
                        currentUserInterests={currentUser.interestTags}
                        onClick={() => handleSelectProfile(profile)}
                        onTap={handleSendTap}
                        onOpenChat={handleStartChat}
                        onBadgeClick={(tag) => {
                          setFilters({ ...filters, searchQuery: tag });
                          showToast(`✨ Filtered discovery grid by interest: ${tag}`);
                        }}
                        onPass={(profileId) => {
                          setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isBlocked: true } : p));
                          showToast('🚫 Profile passed and hidden.');
                        }}
                        onDelete={(profileId) => {
                          setProfiles(prev => prev.filter(p => p.id !== profileId));
                          showToast('🗑️ Profile permanently deleted and removed from platform.');
                        }}
                        viewedCount={currentAreaViewedIds.length}
                        hasActiveSubscription={hasActiveSubscription}
                        showToast={showToast}
                        onReportSubmitted={handleReportSubmitted}
                        hasActiveConversation={conversations.some(c => c.profile.id === profile.id && c.messages && c.messages.length > 0)}
                      />
                    ))}
                  </div>

                  {/* Who Viewed Me Footer Section with Select All, Staggered Entrance Animation, and Clear All */}
                  {(() => {
                    const visitorProfiles = profiles.filter(p => currentAreaViewedIds.includes(p.id) && !p.isBlocked);
                    if (visitorProfiles.length === 0) return null;

                    const allSelected = selectedVisitorIds.length === visitorProfiles.length && visitorProfiles.length > 0;

                    const handleSelectAllToggle = () => {
                      if (allSelected) {
                        setSelectedVisitorIds([]);
                      } else {
                        setSelectedVisitorIds(visitorProfiles.map(p => p.id));
                      }
                    };

                    const handleClearAllVisitors = () => {
                      setViewedByArea(prev => ({
                        ...prev,
                        [currentArea]: []
                      }));
                      setSelectedVisitorIds([]);
                      showToast('🗑️ Cleared all recent visitor history.');
                    };

                    const handleBulkTap = () => {
                      setProfiles(prev => prev.map(p => selectedVisitorIds.includes(p.id) ? { ...p, isTapped: true } : p));
                      showToast(`🔥 Sent Taps to ${selectedVisitorIds.length} visitors!`);
                      setSelectedVisitorIds([]);
                    };

                    const handleBulkFavorite = () => {
                      setProfiles(prev => prev.map(p => selectedVisitorIds.includes(p.id) ? { ...p, isFavorite: !p.isFavorite } : p));
                      showToast(`⭐ Updated favorites for ${selectedVisitorIds.length} visitors.`);
                      setSelectedVisitorIds([]);
                    };

                    const handleBulkMessage = () => {
                      if (selectedVisitorIds.length === 0) return;
                      const target = profiles.find(p => p.id === selectedVisitorIds[0]);
                      if (target) {
                        handleStartChat(target);
                        showToast(`💬 Opened chat with ${target.name}`);
                      }
                    };

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className={`mt-12 p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181818] border-neutral-800' : 'bg-white border-neutral-200 shadow-xl'} space-y-4`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                              👀
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>Who Viewed Me ({visitorProfiles.length})</span>
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                  {currentArea}
                                </span>
                              </h3>
                              <p className="text-[11px] text-neutral-400">Profiles that opened your discovery card recently</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 flex-wrap">
                            {/* Select All Checkbox */}
                            <label className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-700 select-none">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={handleSelectAllToggle}
                                className="w-4 h-4 accent-[#FFC107] rounded cursor-pointer"
                              />
                              <span>Select All ({selectedVisitorIds.length}/{visitorProfiles.length})</span>
                            </label>

                            {/* Clear All Button */}
                            <button
                              type="button"
                              onClick={handleClearAllVisitors}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                              title="Remove all current entries from visitor history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Clear All</span>
                            </button>
                          </div>
                        </div>

                        {/* Summary Dashboard Metrics */}
                        {(() => {
                          const todayCount = visitorProfiles.filter(v => {
                            const t = visitorVisitTimes[v.id] || Date.now();
                            return (Date.now() - t) <= 86400000;
                          }).length;

                          const mapCount = visitorProfiles.filter(v => visitorSources[v.id] === 'Map').length;
                          const gridCount = visitorProfiles.length - mapCount;
                          const topSource = mapCount >= gridCount ? 'Map (Radar)' : 'Discovery Grid';

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="text-[11px] text-neutral-400 font-medium">Total Visitors Today</p>
                                  <p className="text-base font-bold text-white">{todayCount} <span className="text-xs font-normal text-emerald-400">({visitorProfiles.length} total)</span></p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">📈</div>
                              </div>
                              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="text-[11px] text-neutral-400 font-medium">Most Active Hour</p>
                                  <p className="text-base font-bold text-white">14:00 - 15:00 <span className="text-xs font-normal text-amber-400">Peak</span></p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">⏰</div>
                              </div>
                              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="text-[11px] text-neutral-400 font-medium">Top Interaction Source</p>
                                  <p className="text-base font-bold text-white truncate max-w-[140px]">{topSource}</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">🧭</div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Filter Pills Row */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                          <span className="text-neutral-400 font-medium mr-1">Filter:</span>
                          {[
                            { id: 'all', label: 'All Visitors', count: visitorProfiles.length },
                            { id: 'from_map', label: 'From Map', count: visitorProfiles.filter(v => visitorSources[v.id] === 'Map').length },
                            { id: 'from_grid', label: 'From Grid', count: visitorProfiles.filter(v => !visitorSources[v.id] || visitorSources[v.id] === 'Discovery Grid').length },
                            { id: 'favorited', label: 'Favorited', count: visitorProfiles.filter(v => v.isFavorite).length },
                          ].map(tab => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setVisitorFilterTab(tab.id as any)}
                              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                                visitorFilterTab === tab.id
                                  ? 'bg-[#FFC107] text-[#121212] shadow'
                                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${visitorFilterTab === tab.id ? 'bg-[#121212]/20 text-[#121212]' : 'bg-neutral-800 text-neutral-400'}`}>
                                {tab.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Bulk Action Toolbar if items selected */}
                        {selectedVisitorIds.length > 0 && (
                          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
                            <span className="text-xs text-amber-300 font-bold ml-1">
                              {selectedVisitorIds.length} visitor{selectedVisitorIds.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleBulkTap}
                                className="bg-[#FFC107] text-[#121212] px-3 py-1.5 rounded-lg text-xs font-black hover:opacity-90 transition shadow"
                              >
                                ⚡ Tap Selected
                              </button>
                              <button
                                onClick={handleBulkFavorite}
                                className="bg-neutral-800 text-neutral-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-700 transition"
                              >
                                ⭐ Favorite
                              </button>
                              <button
                                onClick={handleBulkMessage}
                                className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-cyan-500/30 transition"
                              >
                                💬 Message
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Staggered Entrance Visitor Cards */}
                        {(() => {
                          const filteredVisitors = visitorProfiles.filter(visitor => {
                            const src = visitorSources[visitor.id] || 'Discovery Grid';
                            if (visitorFilterTab === 'from_map') return src === 'Map';
                            if (visitorFilterTab === 'from_grid') return src === 'Discovery Grid';
                            if (visitorFilterTab === 'favorited') return visitor.isFavorite;
                            return true;
                          });

                          if (filteredVisitors.length === 0) {
                            return (
                              <div className="text-center py-8 text-neutral-400 text-xs">
                                No visitors match the selected filter.
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {filteredVisitors.map((visitor, idx) => {
                            const isSelected = selectedVisitorIds.includes(visitor.id);
                            const visitTime = visitorVisitTimes[visitor.id] || Date.now() - (idx * 600000);
                            const timeAgoMins = Math.round((Date.now() - visitTime) / 60000);
                            const timeStr = timeAgoMins < 60 ? `${timeAgoMins}m ago` : `${Math.round(timeAgoMins / 60)}h ago`;

                            return (
                              <motion.div
                                key={visitor.id}
                                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: idx * 0.06 }}
                                onClick={() => handleSelectProfile(visitor)}
                                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between group relative overflow-hidden ${
                                  isSelected
                                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-[#222]'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2.5">
                                    <div className="relative">
                                      <img
                                        src={visitor.photos[0]}
                                        alt={visitor.name}
                                        className="w-12 h-12 rounded-xl object-cover border border-neutral-700 group-hover:scale-105 transition"
                                        referrerPolicy="no-referrer"
                                      />
                                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-neutral-900"></span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-sm text-white group-hover:text-[#FFC107] transition flex items-center gap-1">
                                        <span>{visitor.name}</span>
                                        <span className="text-xs text-neutral-400 font-normal">{visitor.age}</span>
                                      </h4>
                                      <p className="text-[10px] text-cyan-400 font-medium">Visited {timeStr}</p>
                                    </div>
                                  </div>

                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setSelectedVisitorIds(prev =>
                                        isSelected ? prev.filter(id => id !== visitor.id) : [...prev, visitor.id]
                                      );
                                    }}
                                    className="w-4 h-4 accent-[#FFC107] rounded cursor-pointer mt-1"
                                  />
                                </div>

                                <p className="text-[11px] text-neutral-300 line-clamp-1 mb-3">
                                  {visitor.headline || visitor.bio || 'Explore profile details...'}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendTap(e, visitor);
                                    }}
                                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                                      visitor.isTapped
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                                    }`}
                                  >
                                    {visitor.isTapped ? '🔥 Tapped' : '⚡ Tap'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleFavorite(visitor.id);
                                      showToast(visitor.isFavorite ? '⭐ Removed from favorites' : '⭐ Added to favorites!');
                                    }}
                                    className={`p-1.5 rounded-lg border transition ${
                                      visitor.isFavorite
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-neutral-800 text-neutral-400 hover:text-white border-neutral-700'
                                    }`}
                                    title="Toggle Favorite"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartChat(visitor);
                                    }}
                                    className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold text-[11px] transition"
                                  >
                                    💬 Message
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                            </div>
                          );
                        })()}
                      </motion.div>
                    );
                  })()}


                </>
              );
            })()}
          </div>
        )}

        {/* Combined Floating Quick Actions & Back to Top Toolbar */}
        {activeTab === 'grid' && (
          <div className="fixed bottom-20 right-6 z-40 flex items-center gap-2 bg-[#1A1A1A]/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl p-2 shadow-2xl">
            {/* Quick Actions Dropdown & Button */}
            <div className="relative">
              {isQuickActionsOpen && (
                <div className="absolute bottom-full right-0 mb-3 w-56 bg-[#1A1A1A] border border-neutral-700 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-3 space-y-2 text-left">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <h4 className="font-black text-xs text-amber-400 flex items-center gap-1.5">
                      <span>⚡</span> Quick Actions
                    </h4>
                    <button
                      onClick={() => setIsQuickActionsOpen(false)}
                      className="text-neutral-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        setProfiles(prev => [...prev].sort(() => Math.random() - 0.5));
                        showToast('🔄 Grid refreshed with latest profiles!');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 transition"
                    >
                      <span>🔄</span> Refresh Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        const next = !ghostModeEnabled;
                        setGhostModeEnabled(next);
                        showToast(next ? '👻 Ghost Mode enabled! Distance and status hidden.' : '👁️ Ghost Mode disabled.');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 transition"
                    >
                      <span>{ghostModeEnabled ? '👁️' : '👻'}</span> {ghostModeEnabled ? 'Disable Ghost Mode' : 'Enable Ghost Mode'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        const isNearby = filters.maxDistance <= 10;
                        setFilters(prev => ({ ...prev, maxDistance: isNearby ? 50 : 5 }));
                        showToast(isNearby ? '🌍 Distance filter reset to 50 miles.' : '📍 Toggled Nearby Only (≤ 5 miles).');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 transition"
                    >
                      <span>📍</span> {filters.maxDistance <= 10 ? 'Show All Distances' : 'Toggle Nearby Only'}
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className="bg-[#FFC107] hover:bg-amber-400 text-[#121212] px-3.5 py-2.5 rounded-xl font-black text-xs shadow-lg hover:scale-105 transition flex items-center gap-1.5 border border-amber-300"
                title="Quick Actions Menu"
              >
                <span className="text-sm">⚡</span>
                <span>Quick Actions</span>
              </button>
            </div>

            {/* Back to Top Button inside Combined Toolbar */}
            {showBackToTop && (
              <button
                onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-neutral-800 hover:bg-neutral-700 text-[#FFC107] w-10 h-10 rounded-xl font-bold shadow-lg hover:scale-105 transition flex items-center justify-center text-lg border border-neutral-700"
                title="Back to Top"
              >
                ↑
              </button>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="max-w-7xl mx-auto p-3 sm:p-4 pb-24">
            <MapView profiles={filteredProfiles} onSelectProfile={(p) => handleSelectProfile(p)} />
          </div>
        )}

        {activeTab === 'tribes' && (
          <TribesView
            profiles={profiles}
            onSelectProfile={(p) => handleSelectProfile(p)}
            onStartChat={handleStartChat}
            onSendTap={handleSendTap}
          />
        )}

        {activeTab === 'taps' && (
          <TapsView
            tappedProfiles={tappedProfiles}
            onSelectProfile={(p) => handleSelectProfile(p)}
            onSendTap={handleSendTap}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favoriteProfiles={favoriteProfiles}
            onSelectProfile={(p) => handleSelectProfile(p)}
            onSendTap={handleSendTap}
          />
        )}

        {activeTab === 'chats' && (
          <ChatListView
            conversations={conversations}
            onSelectChat={(conv) => setActiveChat(conv)}
            onToggleArchive={handleToggleArchive}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
            onBulkSendQuickReply={handleBulkSendQuickReply}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={handleSaveProfile}
            onOpenCompanionModal={() => setIsCompanionModalOpen(true)}
            onLogOff={() => {
              setIsLogOffModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Logged Off / Clean Front Page Intro with AI Design Male Model Display & Instant Entry (No Form) */}
      {!isLoggedIn && (
        <div className="fixed inset-0 z-50 bg-[#121212] flex items-center justify-center p-3 h-screen w-screen overflow-hidden select-none">
          <div className="max-w-4xl w-full bg-[#1A1A1A] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-in fade-in">
            
            {/* Left Column: Intro & Text */}
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Live Radar Active
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                The after-dark map<br />
                <span className="text-amber-400">Cruise who's near.</span>
              </h1>

              {/* AI Male Models Larger & Wider Showcase Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-3 shadow-lg">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
                      alt="Marcus"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover ring-2 ring-amber-500/60 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-neutral-900 shadow"></div>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-white">Marcus</h4>
                    <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">0.2 mi away</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-3 shadow-lg">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                      alt="Julian"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover ring-2 ring-amber-500/60 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-neutral-900 shadow"></div>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-white">Julian</h4>
                    <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">0.4 mi away</span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white font-bold leading-snug">
                Join free, add a photo, and see who's out tonight. No download, no app store, no trace.
              </p>
            </div>

            {/* Right Column: Instant Action Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFC107] flex items-center justify-center font-black text-[#121212] text-xl mx-auto shadow-lg shadow-[#FFC107]/20">
                B
              </div>

              <div>
                <h2 className="text-[15px] font-black text-white">Welcome to Blaze</h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Instant after-dark local radar with zero friction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('blaze_session_token', 'token_' + Date.now());
                  sessionStorage.setItem('blaze_login_time', Date.now().toString());
                  setIsLoggedIn(true);
                  showToast('⚡ Entered Blaze Live Radar successfully!');
                }}
                className="w-full py-3 bg-[#FFC107] hover:bg-[#ffca28] text-neutral-950 font-black rounded-xl shadow-md transition text-xs flex items-center justify-center gap-1.5"
              >
                Enter Live Radar Now
              </button>

              <button
                type="button"
                onClick={() => setIsFullRegistrationOpen(true)}
                className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                Register Account & Select Tier
              </button>

              <p className="text-[10px] leading-[15px] text-neutral-400">
                You must be 18 or older to enter. Blaze is strictly 18+. Be safe, be discreet, be you.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Full Registration Modal */}
      <FullRegistrationModal
        isOpen={isFullRegistrationOpen}
        onClose={() => setIsFullRegistrationOpen(false)}
        showToast={showToast}
        onCompleteRegistration={(profileData, tier, isPaid) => {
          setCurrentUser(prev => ({
            ...prev,
            ...profileData,
            membershipTier: tier === 'Elite Companion' ? 'Elite Companion' : tier === 'Pro' ? 'Pro' : 'Free',
            isCompanionPro: isPaid,
            isFeePaid: isPaid
          }));
          setIsLoggedIn(true);
          sessionStorage.setItem('blaze_session_token', 'token_' + Date.now());
          showToast('🎉 Registration complete! Welcome to Blaze.');
        }}
      />

      {/* Log Off Confirmation Modal */}
      <LogOffConfirmationModal
        isOpen={isLogOffModalOpen}
        onClose={() => setIsLogOffModalOpen(false)}
        onConfirmPermanent={() => {
          setIsLogOffModalOpen(false);
          setIsLoggedIn(false);
          sessionStorage.removeItem('blaze_session_token');
          sessionStorage.removeItem('blaze_login_time');
          showToast('🔒 Permanently logged off. Please enter username and password / credentials to sign back in.');
        }}
        onConfirmTemporary={() => {
          setIsLogOffModalOpen(false);
          setIsLoggedIn(false);
          showToast('⏸️ Temporarily logged off (Stealth Mode active). Click Enter Radar to return instantly.');
        }}
      />



      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        buzzEvents={buzzEvents}
        onSelectProfile={(p) => handleSelectProfile(p)}
        profiles={profiles}
        onMarkAllAsRead={() => {
          setBuzzEvents(prev => prev.map(e => ({ ...e, read: true })));
        }}
      />

      {/* Subscription Paywall Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
        currentSubscription={subscription}
        viewedCount={currentAreaViewedIds.length}
      />

      {/* Boost Offer Modal (displayed when 20 free views reached) */}
      <BoostOfferModal
        isOpen={isBoostOfferModalOpen}
        onClose={() => setIsBoostOfferModalOpen(false)}
        onAccept={() => {
          handleActivateBoost();
          setIsBoostOfferModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        areaName={currentArea}
      />

      {/* Companion Membership Modal */}
      <CompanionMembershipModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
        currentUser={currentUser}
        showToast={showToast}
        onUpdateAccountType={(tier, isCompanionPro, rate, isFeePaid) => {
          setCurrentUser(prev => ({
            ...prev,
            membershipTier: tier,
            isCompanionPro,
            isFeePaid: isFeePaid ?? (tier === 'Elite Companion' ? true : prev.isFeePaid),
            companionServices: isCompanionPro ? (prev.companionServices?.length ? prev.companionServices : ['Travel Companion', 'Shopping Companion', 'Event Partner']) : prev.companionServices,
            companionRate: rate || prev.companionRate
          }));
        }}
      />

      {/* Active Chat Window Modal */}
      {activeChat && (
        <ChatWindow
          conversation={activeChat}
          onBack={() => setActiveChat(null)}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
          readReceiptsEnabled={readReceiptsEnabled}
          onToggleReadReceipts={() => {
            const nextVal = !readReceiptsEnabled;
            setReadReceiptsEnabled(nextVal);
            showToast(nextVal ? '👁️ Read receipts enabled' : '🔒 Read receipts disabled');
          }}
          onUpdateMessageRead={(convId, msgId, isRead) => {
            setConversations(prev => prev.map(c => c.id === convId ? {
              ...c,
              messages: c.messages.map(m => m.id === msgId ? { ...m, isRead, readAt: isRead ? Date.now() : undefined } : m)
            } : c));
            setActiveChat(prev => prev && prev.id === convId ? {
              ...prev,
              messages: prev.messages.map(m => m.id === msgId ? { ...m, isRead, readAt: isRead ? Date.now() : undefined } : m)
            } : null);
            showToast(isRead ? '✓ Message marked as read' : '○ Message marked as unread');
          }}
          onAddReaction={handleAddReaction}
          onClearConversation={(convId) => {
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: [] } : c));
            setActiveChat(prev => prev ? { ...prev, messages: [] } : null);
            showToast('🗑️ Conversation cleared successfully.');
          }}
          onBlockUser={(profileId) => {
            setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isBlocked: true } : p));
            setConversations(prev => prev.filter(c => c.profile.id !== profileId));
            setActiveChat(null);
            showToast('🚫 User blocked successfully. Profile hidden and conversation removed.');
          }}
          onUpdateConversationReadReceipts={(convId, enabled) => {
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, readReceiptsEnabled: enabled } : c));
            setActiveChat(prev => prev && prev.id === convId ? { ...prev, readReceiptsEnabled: enabled } : null);
            showToast(enabled ? '👁️ Read receipts enabled for this chat' : '🔒 Read receipts disabled for this chat');
          }}
          onUnsend={(convId, msgId) => {
            setConversations(prev => prev.map(c => c.id === convId ? {
              ...c,
              messages: c.messages.filter(m => m.id !== msgId)
            } : c));
            setActiveChat(prev => prev && prev.id === convId ? {
              ...prev,
              messages: prev.messages.filter(m => m.id !== msgId)
            } : null);
            showToast('🗑️ Message unsent from both sides.');
          }}
          onUpdateConversationMute={(convId, isMuted) => {
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, isMuted } : c));
            setActiveChat(prev => prev && prev.id === convId ? { ...prev, isMuted } : null);
            showToast(isMuted ? '🔇 Conversation muted (notifications silenced)' : '🔔 Conversation unmuted (notifications resumed)');
          }}
          onUpdateConversationTheme={(convId, theme) => {
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, chatTheme: theme } : c));
            setActiveChat(prev => prev && prev.id === convId ? { ...prev, chatTheme: theme } : null);
            showToast(`🎨 Chat accent theme updated to ${theme}!`);
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        readReceiptsEnabled={readReceiptsEnabled}
        onToggleReadReceipts={setReadReceiptsEnabled}
        ghostModeEnabled={ghostModeEnabled}
        onToggleGhostMode={(val) => {
          setGhostModeEnabled(val);
          showToast(val ? '👻 Ghost Mode enabled! Distance and last active status are now hidden from others.' : '👁️ Ghost Mode disabled. Distance and status visible.');
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => {
          setCurrentLanguage(lang);
          showToast(`Language switched to ${lang.toUpperCase()}`);
        }}
        travelModeEnabled={travelModeEnabled}
        onToggleTravelMode={(enabled) => {
          setTravelModeEnabled(enabled);
          if (enabled) {
            setCurrentUser(prev => ({ ...prev, locationName: `✈️ ${travelCity} (Travel Mode)` }));
            showToast(`✈️ Travel Mode enabled for ${travelCity} for 48 hours!`);
          } else {
            setCurrentUser(prev => ({ ...prev, locationName: 'Downtown' }));
            showToast('🏠 Travel Mode disabled. Location reset.');
          }
        }}
        travelCity={travelCity}
        onTravelCityChange={(city) => {
          setTravelCity(city);
          if (travelModeEnabled) {
            setCurrentUser(prev => ({ ...prev, locationName: `✈️ ${city} (Travel Mode)` }));
            showToast(`✈️ Travel destination updated to ${city}`);
          }
        }}
        accentColor={accentColor}
        onAccentColorChange={(color) => {
          setAccentColor(color);
          showToast(`🎨 Interface accent color updated!`);
        }}
        subscription={subscription}
        viewedCount={currentAreaViewedIds.length}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        gridColumns={gridColumns}
        onGridColumnsChange={setGridColumns}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onOpenSafetyGuidelines={() => {
          setIsSettingsOpen(false);
          setIsSafetyGuidelinesOpen(true);
        }}
        autoAdvancePhotosEnabled={autoAdvancePhotosEnabled}
        onToggleAutoAdvancePhotos={(val) => {
          setAutoAdvancePhotosEnabled(val);
          showToast(val ? '⚡ Auto-advance photos enabled (every 3s).' : '⏸️ Auto-advance photos disabled.');
        }}
        reportHistory={reportHistory}
      />

      {/* Safety & Community Guidelines Modal */}
      <SafetyGuidelinesModal
        isOpen={isSafetyGuidelinesOpen}
        onClose={() => setIsSafetyGuidelinesOpen(false)}
      />

      {/* Right-Side Profile Panel */}
      <AnimatePresence>
        {selectedProfile && (
          <RightProfilePanel
            profile={selectedProfile}
            currentUser={currentUser}
            onClose={() => setSelectedProfile(null)}
            onStartChat={(p) => {
              setSelectedProfile(null);
              handleStartChat(p);
              setActiveTab('chats');
            }}
            onSendTap={(p) => handleSendTap({} as any, p)}
            onBlockUser={(profileId) => {
              setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isBlocked: true } : p));
              setConversations(prev => prev.filter(c => c.profile.id !== profileId));
              showToast('🚫 User blocked successfully. Profile hidden and notifications stopped.');
            }}
            onDelete={(profileId) => {
              setProfiles(prev => prev.filter(p => p.id !== profileId));
              setSelectedProfile(null);
              showToast('🗑️ Profile permanently deleted and removed from platform.');
            }}
            showToast={showToast}
            onReportSubmitted={handleReportSubmitted}
            hasWinked={!!selectedProfile.isTapped || !!selectedProfile.isWinked}
            hasMessaged={conversations.some(c => c.profile.id === selectedProfile.id && c.messages && c.messages.length > 0)}
            conversationMessages={conversations.find(c => c.profile.id === selectedProfile.id)?.messages || []}
          />
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={() =>
          setFilters({
            onlineOnly: false,
            withPhotoOnly: false,
            maxDistance: 20,
            ageRange: [18, 70],
            selectedTribes: [],
            searchQuery: '',
            lookingFor: [],
          })
        }
      />



      {/* Google Contacts Modal */}
      <ContactsModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
      />

      {/* Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        profiles={profiles}
        onUpdateProfiles={setProfiles}
        conversations={conversations}
        onUpdateConversations={setConversations}
        showToast={showToast}
        reportHistory={reportHistory}
        onUpdateReportHistory={setReportHistory}
        blockedKeywords={blockedKeywords}
        onUpdateBlockedKeywords={setBlockedKeywords}
      />

      {/* New Activity Area Modal */}
      <NewActivityAreaModal
        isOpen={isNewActivityModalOpen}
        onClose={() => setIsNewActivityModalOpen(false)}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        currentArea={currentArea}
      />

      {/* Download App Modal */}
      {isDownloadModalOpen && (
        <DownloadAppModal
          onClose={() => setIsDownloadModalOpen(false)}
          showToast={showToast}
        />
      )}

      {/* Registration Data Privacy & Community Consent Modal */}
      <RegistrationConsentModal
        isOpen={isConsentModalOpen}
        onAccept={() => {
          localStorage.setItem('blaze_privacy_consent', 'true');
          setIsConsentModalOpen(false);
          showToast('✅ Data Privacy Protocols & Community Standards accepted successfully!');
        }}
        onDeny={() => {
          showToast('❌ Registration denied. You must accept data privacy terms to use Blaze.');
        }}
      />

      {/* Daily Check-in Modal */}
      {isDailyCheckinOpen && (
        <DailyCheckinModal
          onClaim={handleClaimCheckin}
          onClose={() => setIsDailyCheckinOpen(false)}
        />
      )}

      {/* Onboarding Overlay */}
      {isOnboardingOpen && (
        <OnboardingOverlay
          currentUser={currentUser}
          onUpdateUser={setCurrentUser}
          onComplete={() => {
            localStorage.setItem('blaze_onboarding_completed', 'true');
            setIsOnboardingOpen(false);
            setIsConsentModalOpen(true);
            showToast('🎉 Profile created! Please review privacy terms.');
          }}
        />
      )}

      {/* Right Now Status Modal */}
      {showRightNowModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>⚡</span> Set Your "Right Now" Status
              </h3>
              <button
                onClick={() => setShowRightNowModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Let people nearby know what you're up to right now (e.g., "Grab coffee at Downtown", "Looking for hiking buddy").
            </p>
            <div className="space-y-1">
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={150}
                  value={rightNowNote}
                  onChange={(e) => setRightNowNote(e.target.value)}
                  placeholder="What are you up to right now? (e.g. Coffee at Blue Bottle...)"
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                />
                <div className="absolute bottom-2 right-3 text-[10px] text-neutral-500">
                  {rightNowNote.length} / 150
                </div>
              </div>

              {/* Collapsible Preset Choices */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-neutral-400 font-bold">Quick Presets</span>
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="text-[11px] text-amber-400 hover:underline font-bold"
                  >
                    {showPresets ? 'Hide ▴' : 'Show ▾'}
                  </button>
                </div>
                {showPresets && (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-[#121212] rounded-xl border border-neutral-800">
                    {[
                      'Coffee Time',
                      'Hiking',
                      'Looking to Party',
                      'Looking for fun',
                      'one on one fun',
                      "let's have a drink",
                      "let's go for a drive",
                      'Up for a 3sum?'
                    ].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setRightNowNote(preset)}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold rounded-lg transition"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isRightNowActive && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl text-xs text-amber-300">
                <span>⏱️ Active Status Countdown</span>
                <span className="font-bold">{getRemainingTimeStr()} (Auto-clears in 2h)</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setIsRightNowActive(false);
                  setRightNowNote('');
                  setRightNowExpiresAt(null);
                  setCurrentUser(prev => ({ ...prev, isRightNowActive: false, rightNowNote: undefined, rightNowExpiresAt: undefined }));
                  setShowRightNowModal(false);
                  showToast('⚡ Cleared your Right Now status.');
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition"
              >
                Turn Off
              </button>
              <button
                onClick={() => {
                  setIsRightNowActive(true);
                  const note = rightNowNote || 'Ready to meet!';
                  const expires = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
                  setRightNowExpiresAt(expires);
                  setCurrentUser(prev => ({ ...prev, isRightNowActive: true, rightNowNote: note, rightNowExpiresAt: expires }));
                  setShowRightNowModal(false);
                  showToast(`⚡ Published Right Now status: "${note}" (Expires in 2h)`);
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition shadow-lg"
              >
                Publish Right Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadChatCount={unreadChatCount}
        unreadTapsCount={tappedProfiles.length}
        currentLanguage={currentLanguage}
      />

    </div>
  );

  return (
    <motion.div
      key={isDarkMode ? 'dark' : 'light'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className={`min-h-screen ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-neutral-200'} flex flex-col items-center justify-center ${deviceMode !== 'responsive' ? 'py-6 px-4' : ''}`}
    >
      {deviceMode !== 'responsive' ? (
        <div className="flex flex-col items-center">
          <div className="mb-3 text-xs text-neutral-400 flex items-center gap-2">
            <span>Viewing in <strong className="text-amber-400">{deviceMode === 'ios' ? 'Apple iOS 18 (iPhone 16 Pro)' : 'Android 15 (Pixel 9 Pro)'}</strong> Simulator</span>
            <button
              onClick={() => setDeviceMode('responsive')}
              className="underline text-cyan-400 hover:text-cyan-300 font-bold"
            >
              Exit to Full Web View
            </button>
          </div>

          <div className={`relative w-full ${deviceMode === 'ios' ? 'max-w-[414px] rounded-[52px] border-[12px] border-neutral-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]' : 'max-w-[412px] rounded-[48px] border-[10px] border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'} bg-black overflow-hidden flex flex-col h-[850px]`}>
            
            <div className="bg-neutral-900 text-white px-6 pt-2.5 pb-1 flex items-center justify-between text-xs font-semibold select-none z-50 shrink-0">
              <span>9:41</span>
              {deviceMode === 'ios' ? (
                <div className="w-24 h-4 bg-black rounded-full mx-auto border border-neutral-800" />
              ) : (
                <div className="w-3 h-3 bg-black rounded-full mx-auto border border-neutral-700" />
              )}
              <div className="flex items-center space-x-1.5 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative bg-[#121212]">
              {appContent}
            </div>

            <div className="bg-black py-2.5 flex items-center justify-center z-50 shrink-0">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>

          </div>
        </div>
      ) : (
        appContent
      )}
    </motion.div>
  );
}

