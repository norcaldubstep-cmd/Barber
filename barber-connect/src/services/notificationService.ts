import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification, NotificationType, NotificationPreferences } from '../types/notification.types';

/**
 * Notification Service
 * Handles all notification operations
 */

// Create a notification
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: {
    imageUrl?: string;
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;
    bookingId?: string;
    postId?: string;
    conversationId?: string;
    reviewId?: string;
    actionUrl?: string;
  }
): Promise<Notification> => {
  try {
    const notificationRef = doc(collection(db, 'notifications'));

    const notificationData: Notification = {
      id: notificationRef.id,
      userId,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...data,
    };

    await setDoc(notificationRef, {
      ...notificationData,
      createdAt: serverTimestamp(),
    });

    return notificationData;
  } catch (error) {
    console.error('Create notification error:', error);
    throw new Error('Failed to create notification');
  }
};

// Get user notifications
export const getUserNotifications = async (
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

// Get unread notifications
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
  } catch (error) {
    console.error('Get unread notifications error:', error);
    return [];
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notifications = await getUnreadNotifications(userId);
    return notifications.length;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
};

// Listen to notifications in real-time
export const listenToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
    callback(notifications);
  });

  return unsubscribe;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const unreadNotifications = await getUnreadNotifications(userId);

    const updatePromises = unreadNotifications.map((notification) =>
      updateDoc(doc(db, 'notifications', notification.id), { isRead: true })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Mark all as read error:', error);
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Delete notification error:', error);
    throw new Error('Failed to delete notification');
  }
};

// Delete all notifications for user
export const deleteAllNotifications = async (userId: string): Promise<void> => {
  try {
    const notifications = await getUserNotifications(userId);

    const deletePromises = notifications.map((notification) =>
      deleteDoc(doc(db, 'notifications', notification.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Delete all notifications error:', error);
    throw new Error('Failed to delete notifications');
  }
};

// Get notification preferences
export const getNotificationPreferences = async (
  userId: string
): Promise<NotificationPreferences | null> => {
  try {
    const prefDoc = await getDoc(doc(db, 'notificationPreferences', userId));

    if (!prefDoc.exists()) {
      // Return default preferences
      return {
        userId,
        bookingReminders: true,
        newMessages: true,
        socialUpdates: true,
        promotions: true,
        systemNotifications: true,
        pushEnabled: true,
        emailEnabled: false,
      };
    }

    return { userId, ...prefDoc.data() } as NotificationPreferences;
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return null;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  try {
    const prefRef = doc(db, 'notificationPreferences', userId);
    const prefDoc = await getDoc(prefRef);

    if (!prefDoc.exists()) {
      await setDoc(prefRef, {
        userId,
        bookingReminders: true,
        newMessages: true,
        socialUpdates: true,
        promotions: true,
        systemNotifications: true,
        pushEnabled: true,
        emailEnabled: false,
        ...preferences,
      });
    } else {
      await updateDoc(prefRef, preferences);
    }
  } catch (error) {
    console.error('Update notification preferences error:', error);
    throw new Error('Failed to update preferences');
  }
};

// Helper functions to create specific notification types

export const notifyBookingConfirmed = async (
  userId: string,
  bookingId: string,
  barberName: string,
  date: string,
  time: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.BOOKING_CONFIRMED,
    'Booking Confirmed',
    `Your appointment with ${barberName} on ${date} at ${time} has been confirmed`,
    { bookingId, actionUrl: `/booking/${bookingId}` }
  );
};

export const notifyBookingCancelled = async (
  userId: string,
  bookingId: string,
  barberName: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.BOOKING_CANCELLED,
    'Booking Cancelled',
    `Your appointment with ${barberName} has been cancelled`,
    { bookingId }
  );
};

export const notifyBookingReminder = async (
  userId: string,
  bookingId: string,
  barberName: string,
  time: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.BOOKING_REMINDER,
    'Upcoming Appointment',
    `Reminder: You have an appointment with ${barberName} at ${time}`,
    { bookingId, actionUrl: `/booking/${bookingId}` }
  );
};

export const notifyNewMessage = async (
  userId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
  conversationId: string,
  messagePreview: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.NEW_MESSAGE,
    'New Message',
    `${senderName}: ${messagePreview}`,
    { senderId, senderName, senderAvatar, conversationId, actionUrl: `/chat/${conversationId}` }
  );
};

export const notifyNewFollower = async (
  userId: string,
  followerId: string,
  followerName: string,
  followerAvatar?: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.NEW_FOLLOWER,
    'New Follower',
    `${followerName} started following you`,
    { senderId: followerId, senderName: followerName, senderAvatar: followerAvatar }
  );
};

export const notifyPostLike = async (
  userId: string,
  likerId: string,
  likerName: string,
  postId: string,
  likerAvatar?: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.POST_LIKE,
    'New Like',
    `${likerName} liked your post`,
    { senderId: likerId, senderName: likerName, senderAvatar: likerAvatar, postId, actionUrl: `/post/${postId}` }
  );
};

export const notifyPostComment = async (
  userId: string,
  commenterId: string,
  commenterName: string,
  postId: string,
  comment: string,
  commenterAvatar?: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.POST_COMMENT,
    'New Comment',
    `${commenterName} commented: ${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}`,
    { senderId: commenterId, senderName: commenterName, senderAvatar: commenterAvatar, postId, actionUrl: `/post/${postId}` }
  );
};

export const notifyReviewReceived = async (
  userId: string,
  reviewerId: string,
  reviewerName: string,
  rating: number,
  reviewId: string
): Promise<void> => {
  await createNotification(
    userId,
    NotificationType.REVIEW_RECEIVED,
    'New Review',
    `${reviewerName} left you a ${rating}-star review`,
    { senderId: reviewerId, senderName: reviewerName, reviewId }
  );
};
