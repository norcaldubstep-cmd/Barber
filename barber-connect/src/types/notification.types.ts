export enum NotificationType {
  BOOKING_REQUESTED = 'BOOKING_REQUESTED', // New booking request for barber
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED', // Booking approved/confirmed
  BOOKING_DENIED = 'BOOKING_DENIED', // Booking denied by barber
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  POST_LIKE = 'POST_LIKE',
  POST_COMMENT = 'POST_COMMENT',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  JOB_APPLICATION = 'JOB_APPLICATION',
  PROMOTION_UPDATE = 'PROMOTION_UPDATE',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string; // Recipient user ID
  type: NotificationType;
  title: string;
  message: string;
  imageUrl?: string;

  // Related entities
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;

  bookingId?: string;
  postId?: string;
  conversationId?: string;
  reviewId?: string;
  jobId?: string;

  // Metadata
  isRead: boolean;
  actionUrl?: string; // Deep link to relevant screen
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  bookingReminders: boolean;
  newMessages: boolean;
  socialUpdates: boolean; // likes, comments, follows
  promotions: boolean;
  systemNotifications: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}
