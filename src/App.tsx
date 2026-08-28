import React, { useState, useEffect } from 'react';
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
import { AIAssistModal } from './components/AIAssistModal';
import { CompanionMembershipModal } from './components/CompanionMembershipModal';
import { BuzzAlertBanner } from './components/BuzzAlertBanner';
import { NotificationsModal } from './components/NotificationsModal';
import { MapView } from './components/MapView';
import { ContactsModal } from './components/ContactsModal';
import { TribesView } from './components/TribesView';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [gridColumns, setGridColumns] = useState<number>(4);
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
        setIsAIOpen(false);
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
    lookingFor: undefined,
  });

  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [isContactsOpen, setIsContactsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState<boolean>(true);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [travelModeEnabled, setTravelModeEnabled] = useState<boolean>(false);
  const [travelCity, setTravelCity] = useState<string>('London, UK');
  const [accentColor, setAccentColor] = useState<string>('#FFC107');
  const [boostActiveUntil, setBoostActiveUntil] = useState<number | null>(null);

  // Background location observer for high-compatibility profile within 1-mile radius
  useEffect(() => {
    const timer = setTimeout(() => {
      showToast('📍 Someone new is nearby: Marcus (96% compatibility, 0.4 mi away)');
    }, 12000);
    return () => clearTimeout(timer);
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
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [aiTargetProfile, setAITargetProfile] = useState<UserProfile | null>(null);
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
      if (filters.lookingFor && (!p.lookingFor || !p.lookingFor.includes(filters.lookingFor))) return false;
      if (filters.selectedTribes.length > 0 && !filters.selectedTribes.some((t) => p.tribes.includes(t))) {
        return false;
      }
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBio = p.aboutMe.toLowerCase().includes(q);
        const matchHeadline = p.headline?.toLowerCase().includes(q) || false;
        if (!matchName && !matchBio && !matchHeadline) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.suggestedForYou) {
        const scoreA = (a.tribes?.length || 0) + (a.interestTags?.length || 0);
        const scoreB = (b.tribes?.length || 0) + (b.interestTags?.length || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
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

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans select-none">
      
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
              setSelectedProfile(matched);
            }
          }
        }}
      />

      {/* Navbar */}
      <Navbar
        onOpenFilters={() => setIsFilterOpen(true)}
        onOpenAI={() => {
          setAITargetProfile(null);
          setIsAIOpen(true);
        }}
        onShareLocation={handleShareLocation}
        onOpenContacts={() => setIsContactsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
        boostActiveUntil={boostActiveUntil}
        onActivateBoost={handleActivateBoost}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main
        ref={mainRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto relative ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-neutral-100 text-neutral-900'}`}
      >
        {activeTab === 'grid' && (
          <div className="max-w-7xl mx-auto p-3 sm:p-4 pb-24">
            
            {/* Search Input & Geolocation Status Bar */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
              <input
                type="text"
                placeholder="Search by name, bio, or interests..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition shadow-sm ${isDarkMode ? 'bg-[#1E1E1E] border-neutral-800 focus:border-[#FFC107] text-white' : 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'}`}
              />
            </div>

            {filteredProfiles.length === 0 ? (
              <div className="text-center py-20 text-neutral-400">
                <p className="text-lg font-bold mb-1">No profiles match your filters</p>
                <p className="text-sm">Try broadening your distance radius or resetting your filters.</p>
              </div>
            ) : (
              <div
                className={`grid gap-3`}
                style={{
                  gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                }}
              >
                {filteredProfiles.map((profile, idx) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    index={idx}
                    currentUserInterests={currentUser.interestTags}
                    onClick={() => setSelectedProfile(profile)}
                    onTap={handleSendTap}
                    onBadgeClick={(tag) => setFilters({ ...filters, searchQuery: tag })}
                    onPass={(profileId) => {
                      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isBlocked: true } : p));
                      showToast('🚫 Profile passed and hidden.');
                    }}
                  />
                ))}
              </div>
            )}
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
            <MapView profiles={filteredProfiles} onSelectProfile={(p) => setSelectedProfile(p)} />
          </div>
        )}

        {activeTab === 'tribes' && (
          <TribesView
            profiles={profiles}
            onSelectProfile={(p) => setSelectedProfile(p)}
            onStartChat={handleStartChat}
            onSendTap={handleSendTap}
          />
        )}

        {activeTab === 'taps' && (
          <TapsView
            tappedProfiles={tappedProfiles}
            onSelectProfile={(p) => setSelectedProfile(p)}
            onSendTap={handleSendTap}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favoriteProfiles={favoriteProfiles}
            onSelectProfile={(p) => setSelectedProfile(p)}
            onSendTap={handleSendTap}
          />
        )}

        {activeTab === 'chats' && (
          <ChatListView
            conversations={conversations}
            onSelectChat={(conv) => setActiveChat(conv)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onOpenAI={() => setIsAIOpen(true)}
            onOpenCompanionModal={() => setIsCompanionModalOpen(true)}
          />
        )}
      </main>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        buzzEvents={buzzEvents}
        onSelectProfile={(p) => setSelectedProfile(p)}
        profiles={profiles}
        onMarkAllAsRead={() => {
          setBuzzEvents(prev => prev.map(e => ({ ...e, read: true })));
        }}
      />

      {/* Companion Membership Modal */}
      <CompanionMembershipModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
        currentTier={currentUser.membershipTier}
        onSubscribe={(tier) => {
          setCurrentUser(prev => ({
            ...prev,
            membershipTier: tier,
            isCompanionPro: true,
            companionServices: prev.companionServices?.length ? prev.companionServices : ['Travel Companion', 'Shopping Companion', 'Event Partner'],
            companionRate: prev.companionRate || '$49/hr or $299/mo'
          }));
          showToast('👑 Upgraded to Elite Companion Membership successfully!');
        }}
      />

      {/* Active Chat Window Modal */}
      {activeChat && (
        <ChatWindow
          conversation={activeChat}
          onBack={() => setActiveChat(null)}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
          onOpenAI={(p) => {
            setAITargetProfile(p);
            setIsAIOpen(true);
          }}
          readReceiptsEnabled={readReceiptsEnabled}
          onClearConversation={(convId) => {
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: [] } : c));
            setActiveChat(prev => prev ? { ...prev, messages: [] } : null);
            showToast('🗑️ Conversation cleared successfully.');
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        readReceiptsEnabled={readReceiptsEnabled}
        onToggleReadReceipts={setReadReceiptsEnabled}
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
      />

      {/* Right-Side Profile Panel */}
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
        />
      )}

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
            lookingFor: undefined,
          })
        }
      />

      {/* AI Assistant Modal */}
      <AIAssistModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        currentUser={currentUser}
        targetProfile={aiTargetProfile}
        onSelectIcebreaker={(text) => {
          if (aiTargetProfile) {
            handleStartChat(aiTargetProfile);
            setActiveTab('chats');
          }
        }}
        onUpdateBio={(newBio) => {
          setCurrentUser(prev => ({ ...prev, aboutMe: newBio }));
          showToast('✨ Bio updated successfully using AI Refiner!');
        }}
      />

      {/* Google Contacts Modal */}
      <ContactsModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadChatCount={unreadChatCount}
        unreadTapsCount={tappedProfiles.length}
      />

    </div>
  );
}

