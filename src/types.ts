export type OnlineStatus = 'online' | 'away' | 'offline';

export type BodyType = 'Average' | 'Athletic' | 'Muscular' | 'Stocky' | 'Slim' | 'Tone' | 'A Few Extra Pounds';

export type PositionRole = 'Top' | 'Vers Top' | 'Vers' | 'Vers Bottom' | 'Bottom' | 'Side' | 'Oral';

export type LookingFor = 'Chat' | 'Friends' | 'Dates' | 'Networking' | 'Relationship' | 'Right Now' | '1-1 Fun' | 'Casual Encounter' | '1-1 meet' | '1-2 Fun' | 'Party fun';

export type Tribe = 'Bear' | 'Clean' | 'Daddy' | 'Discreet' | 'Geek' | 'Jock' | 'Leather' | 'Otter' | 'Poz' | 'Trans' | 'Twink' | 'Positive';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  distance: number; // in miles
  status: OnlineStatus;
  photos: string[];
  videos?: string[];
  headline: string;
  aboutMe: string;
  height?: string;
  weight?: string;
  bodyType?: BodyType;
  position?: PositionRole;
  lookingFor?: LookingFor[];
  tribes: Tribe[];
  interestTags?: string[];
  styleTags?: string[]; // e.g., 'Minimalist', 'Vintage', 'Cyberpunk', 'Streetwear', 'Athleisure'
  pronouns?: string;
  zodiac?: string;
  smoking?: string;
  drinking?: string;
  relationshipStatus?: string;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    snapchat?: string;
    spotify?: string;
  };
  profileTheme?: string; // e.g. 'amber', 'emerald', 'cyan', 'violet', 'rose'
  verified?: boolean; // Added verified status property
  isVerified?: boolean;
  verificationPending?: boolean;
  verificationPhoto?: string;
  lockedAlbum?: {
    photos: string[]; // up to 10
    videos: string[]; // up to 10
  };
  isAlbumOpen?: boolean;
  albumRequests?: Array<{
    userId: string;
    userName: string;
    userPhoto: string;
    timestamp: number;
    status: 'pending' | 'granted' | 'denied';
  }>;
  grantedAccessUserIds?: string[];
  locationName: string;
  isFavorite?: boolean;
  isTapped?: boolean;
  isBlocked?: boolean;
  latitude?: number;
  longitude?: number;
  isCompanionPro?: boolean;
  companionServices?: string[];
  companionRate?: string;
  membershipTier?: 'Free' | 'Pro' | 'Elite Companion';
  photoApprovalStatus?: 'pending' | 'approved' | 'rejected';
  photoRejectionReason?: string;
  isWinked?: boolean;
  isLetsMet?: boolean;
  interestStatus?: 'interested' | 'not_interested' | 'none';
  isNewUser?: boolean;
  isMatchedUp?: boolean;
  lastPhotoUpdated?: number;
  photoFilter?: string;
  lastLogin?: number;
  sparkBalance?: number;
  currentMood?: string; // e.g. '🔥', '😎', '☕', '🚀', '😴', '🎉'
  stickers?: string[]; // e.g. ['🚀 VIP', '👑 Elite', '⚡ Fast Responder', '🔥 Hot']
  profileSong?: { title: string; artist: string; url: string };
  lastVisited?: number; // timestamp
  mutualContacts?: string[]; // e.g. ['Sarah K.', 'Alex M.']
  mutualFriends?: string[]; // e.g. ['Sarah K.', 'Alex M.', 'Jordan P.']
  mutualFriendsCount?: number;
  lastActive?: string; // e.g. 'Active 10m ago'
  friendStatus?: 'none' | 'pending' | 'friends';
  totalViews?: number;
  isGhostMode?: boolean;
  introVideoUrl?: string;
  voiceIntroUrl?: string;
  stories?: { id: string; url?: string; text?: string; timestamp: number }[]; // 24-hour ephemeral stories
}

export interface PhotoFilterOption {
  id: string;
  label: string;
  style: string;
}

export const PHOTO_FILTERS: PhotoFilterOption[] = [
  { id: 'none', label: 'Normal', style: '' },
  { id: 'grayscale', label: 'Grayscale', style: 'grayscale(100%)' },
  { id: 'sepia', label: 'Sepia', style: 'sepia(100%)' },
  { id: 'contrast', label: 'High Contrast', style: 'contrast(175%)' },
  { id: 'vintage', label: 'Vintage', style: 'sepia(50%) contrast(120%) brightness(90%)' },
  { id: 'warm', label: 'Warm Glow', style: 'sepia(30%) saturate(150%)' },
  { id: 'cool', label: 'Cool Tone', style: 'hue-rotate(180deg) saturate(120%)' },
  { id: 'dramatic', label: 'Dramatic', style: 'contrast(150%) brightness(85%) saturate(120%)' },
];

export function getFilterStyle(filterId?: string): string {
  const found = PHOTO_FILTERS.find(f => f.id === filterId);
  return found ? found.style : '';
}

export interface Moment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  mediaUrl?: string;
  caption: string;
  timestamp: number;
  likesCount: number;
  isLikedByMe?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  type?: 'text' | 'image' | 'audio' | 'location' | 'video';
  mediaUrl?: string;
  isRead?: boolean;
  readAt?: number;
  reactions?: { emoji: string; userId: string; userName?: string }[];
}

export interface ChatConversation {
  id: string;
  profile: UserProfile;
  lastMessage: string;
  unreadCount: number;
  updatedAt: number;
  messages: Message[];
  isArchived?: boolean;
  readReceiptsEnabled?: boolean;
  pinnedMessageIds?: string[];
  isMuted?: boolean;
  chatTheme?: string; // e.g. 'gold', 'cyan', 'emerald', 'violet', 'rose'
}

export interface FilterState {
  onlineOnly: boolean;
  withPhotoOnly: boolean;
  maxDistance: number; // miles
  ageRange: [number, number];
  selectedTribes: Tribe[];
  searchQuery: string;
  lookingFor?: LookingFor[];
  statusFilter?: 'all' | 'online' | 'offline' | 'away';
  positionFilter?: PositionRole | 'all';
  suggestedForYou?: boolean;
  sortBy?: 'closest' | 'newest' | 'compatibility';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  membersCount: number;
  image: string;
  createdBy: string;
  isJoined?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  organizerName: string;
  organizerPhoto: string;
  attendeesCount: number;
  isAttending?: boolean;
}

export interface ProfileVisitor {
  profile: UserProfile;
  timestamp: number;
}

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export const STYLE_TAGS = ['Minimalist', 'Vintage', 'Cyberpunk', 'Streetwear', 'Athleisure', 'Boho', 'Preppy'];

export function getStyleTagIcon(tag: string): { icon: string; color: string } {
  switch (tag) {
    case 'Cyberpunk': return { icon: '🕶️', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' };
    case 'Vintage': return { icon: '🧥', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    case 'Minimalist': return { icon: '✨', color: 'text-stone-300 bg-stone-500/15 border-stone-500/30' };
    case 'Streetwear': return { icon: '🛹', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
    case 'Athleisure': return { icon: '👟', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    case 'Boho': return { icon: '🌿', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' };
    case 'Preppy': return { icon: '👔', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' };
    default: return { icon: '💫', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' };
  }
}


