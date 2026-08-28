export interface BuzzEvent {
  id: string;
  type: 'visit' | 'tap' | 'message' | 'wink' | 'interest';
  profileId?: string;
  timestamp: number;
  read: boolean;
  senderName?: string;
  senderId?: string;
  senderPhoto?: string;
  text?: string;
}

export function executeBuzz(type: string, senderName?: string): BuzzEvent[] {
  return [];
}
