import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, FilterState, ChatConversation, Message } from './types';
import { MOCK_PROFILES, CURRENT_USER } from './data/mockProfiles';
import { calculateDistance } from './utils/geo';
import { BuzzEvent, executeBuzz } from './utils/buzz';
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

import { CompanionMembershipModal } from './components/CompanionMembershipModal';
import { BuzzAlertBanner } from './components/BuzzAlertBanner';
import { NotificationsModal } from './components/NotificationsModal';
import { MapView } from './components/MapView';
import { ContactsModal } from './components/ContactsModal';
import { TribesView } from './components/TribesView';
import { SettingsModal } from './components/SettingsModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { BoostOfferModal } from './components/BoostOfferModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { RegistrationConsentModal } from './components/RegistrationConsentModal';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { OnboardingOverlay } from './components/OnboardingOverlay';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [gridColumns, setGridColumns] = useState<number>(4);
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

  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  
  const [filters, setFilters] = useState<FilterState>({
    onlineOnly: false,
    withPhotoOnly: false,
    maxDistance: 25,
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
    return localStorage.getItem('blaze_privacy_consent') !== 'true';
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

  const hasActiveSubscription = subscription.type !== 'none' && subscription.expiresAt > Date.now();

  const currentArea = currentUser.locationName || 'Downtown';
  const currentAreaViewedIds = viewedByArea[currentArea] || [];
  const allViewedIds = Array.from(new Set(Object.values(viewedByArea).flat()));

  const handleSelectProfile = (profile: UserProfile) => {
    const area = profile.locationName || currentUser.locationName || 'Downtown';
    const areaViewed = viewedByArea[area] || [];

    if (hasActiveSubscription || areaViewed.includes(profile.id)) {
      setSelectedProfile(profile);
      return;
    }

    if (areaViewed.length < 20) {
      const updatedAreaViewed = [...areaViewed, profile.id];
      setViewedByArea(prev => ({
        ...prev,
        [area]: updatedAreaViewed
      }));
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
  const [gridSubTab, setGridSubTab] = useState<'all' | 'recently_viewed'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [isContactsOpen, setIsContactsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState<boolean>(true);
  const [ghostModeEnabled, setGhostModeEnabled] = useState<boolean>(false);
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerBuzzEvent = (event: BuzzEvent) => {
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
      if (filters.onlineOnly && p.status !== 'online') return false;
      if (filters.withPhotoOnly && (!p.photos || p.photos.length === 0)) return false;
      if (p.distance > filters.maxDistance) return false;
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
        const scoreA = (a.tribes?.length || 0) + (a.interestTags?.length || 0);
        const scoreB = (b.tribes?.length || 0) + (b.interestTags?.length || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      if (filters.sortBy === 'newest') {
        const isANew = a.isNewUser ? 1 : 0;
        const isBNew = b.isNewUser ? 1 : 0;
        if (isBNew !== isANew) return isBNew - isANew;
        return (b.lastPhotoUpdated || 0) - (a.lastPhotoUpdated || 0);
      }
      // Default / Closest sorting
      return a.distance - b.distance;
    });

  const favoriteProfiles = profiles.filter((p) => p.isFavorite).sort((a, b) => a.distance - b.distance);
  const tappedProfiles = profiles.filter((p) => p.isTapped).sort((a, b) => a.distance - b.distance);
  const unreadChatCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleSendTap = (e: React.MouseEvent, profile: UserProfile) => {
    e.stopPropagation();
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

  const appContent = (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans select-none w-full h-full relative overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#FFC107] text-[#121212] px-4 py-2.5 rounded-full font-bold text-sm shadow-xl animate-in fade-in slide-in-from-top duration-200">
          {toastMessage}
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

            {/* Search Input, Geolocation Status Bar & Sorting Toggle */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
              <input
                type="text"
                placeholder="Search by name, bio, or interests..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className={`w-full sm:flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition shadow-sm ${isDarkMode ? 'bg-[#1E1E1E] border-neutral-800 focus:border-[#FFC107] text-white' : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'}`}
              />

              {/* Sorting Toggle: Closest vs Newest */}
              <div className="flex items-center space-x-1 bg-[#1E1E1E] border border-neutral-800 p-1 rounded-xl flex-shrink-0">
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
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, sortBy: 'newest' })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    filters.sortBy === 'newest'
                      ? 'bg-[#FFC107] text-[#121212] shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>✨ Newest</span>
                </button>
              </div>
            </div>

            {(() => {
              const profilesToDisplay = gridSubTab === 'recently_viewed'
                ? filteredProfiles.filter(p => allViewedIds.includes(p.id))
                : filteredProfiles;

              if (profilesToDisplay.length === 0) {
                return (
                  <div className="text-center py-20 text-neutral-400">
                    <p className="text-lg font-bold mb-1">
                      {gridSubTab === 'recently_viewed' ? 'No recently viewed profiles yet' : 'No profiles match your filters'}
                    </p>
                    <p className="text-sm">
                      {gridSubTab === 'recently_viewed' ? 'Browse the discovery grid and click on profiles to spend a free view.' : 'Try broadening your distance radius or resetting your filters.'}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  className={`grid gap-3`}
                  style={{
                    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                  }}
                >
                  {profilesToDisplay.map((profile, idx) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      index={idx}
                      currentUserInterests={currentUser.interestTags}
                      onClick={() => handleSelectProfile(profile)}
                      onTap={handleSendTap}
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
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Back to Top Floating Button */}
        {showBackToTop && activeTab === 'grid' && (
          <button
            onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-6 z-40 bg-[#FFC107] text-[#121212] w-12 h-12 rounded-full font-bold shadow-2xl hover:scale-110 transition flex items-center justify-center text-xl"
            title="Back to Top"
          >
            ↑
          </button>
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
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onOpenCompanionModal={() => setIsCompanionModalOpen(true)}
            onLogOff={() => {
              setIsLoggedIn(false);
              showToast('🔒 Logged off from profile successfully.');
            }}
          />
        )}
      </main>

      {/* Logged Off Screen Overlay */}
      {!isLoggedIn && (
        <div className="fixed inset-0 z-50 bg-[#121212] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#FFC107] flex items-center justify-center font-black text-[#121212] text-2xl mx-auto shadow-lg shadow-[#FFC107]/20">
              B
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Logged Off</h2>
              <p className="text-xs text-neutral-400 mt-2">
                You are currently logged off from your Blaze profile. Log back in to connect, chat, and browse discovery.
              </p>
            </div>
            <button
              onClick={() => {
                setIsLoggedIn(true);
                showToast('👋 Welcome back! Logged in successfully.');
              }}
              className="w-full py-3.5 bg-[#FFC107] text-[#121212] font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg shadow-[#FFC107]/20"
            >
              Log In to Blaze
            </button>
          </div>
        </div>
      )}

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
        onUpdateAccountType={(tier, isCompanionPro, rate) => {
          setCurrentUser(prev => ({
            ...prev,
            membershipTier: tier,
            isCompanionPro,
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
            maxDistance: 25,
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
          onComplete={() => {
            localStorage.setItem('blaze_onboarding_completed', 'true');
            setIsOnboardingOpen(false);
            showToast('🎉 Onboarding completed! Welcome to Blaze.');
          }}
        />
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

