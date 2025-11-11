export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  BOOKING = 'BOOKING',
  LOCATION = 'LOCATION',
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  type: MessageType;
  content: string;
  imageUrl?: string;
  bookingId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  participantDetails: {
    [userId: string]: {
      name: string;
      avatar?: string;
      role: 'CLIENT' | 'BARBER';
    };
  };
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: string;
  updatedAt: string;
}
