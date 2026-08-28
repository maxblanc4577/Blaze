export type OnlineStatus = 'online' | 'away' | 'offline';

export type BodyType = 'Average' | 'Athletic' | 'Muscular' | 'Stocky' | 'Slim' | 'Tone' | 'A Few Extra Pounds';

export type PositionRole = 'Top' | 'Vers Top' | 'Vers' | 'Vers Bottom' | 'Bottom' | 'Side' | 'Oral';

export type LookingFor = 'Chat' | 'Friends' | 'Dates' | 'Networking' | 'Relationship' | 'Right Now';

export type Tribe = 'Bear' | 'Clean' | 'Daddy' | 'Discreet' | 'Geek' | 'Jock' | 'Leather' | 'Otter' | 'Poz' | 'Trans' | 'Twink' | 'Positive';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  distance: number; // in miles
  status: OnlineStatus;
  photos: string[];
  headline: string;
  aboutMe: string;
  height?: string;
  weight?: string;
  bodyType?: BodyType;
  position?: PositionRole;
  lookingFor?: LookingFor[];
  tribes: Tribe[];
  interestTags?: string[];
  isVerified?: boolean;
  verificationPhoto?: string;
  lockedAlbum?: {
    photos: string[]; // up to 5
    videos: string[]; // up to 2
  };
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
  type?: 'text' | 'image' | 'audio' | 'location';
  mediaUrl?: string;
}

export interface ChatConversation {
  id: string;
  profile: UserProfile;
  lastMessage: string;
  unreadCount: number;
  updatedAt: number;
  messages: Message[];
}

export interface FilterState {
  onlineOnly: boolean;
  withPhotoOnly: boolean;
  maxDistance: number; // miles
  ageRange: [number, number];
  selectedTribes: Tribe[];
  searchQuery: string;
  lookingFor?: LookingFor;
  statusFilter?: 'all' | 'online' | 'offline' | 'away';
  positionFilter?: PositionRole | 'all';
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

