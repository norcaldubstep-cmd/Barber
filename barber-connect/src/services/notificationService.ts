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
import { getUserPushTokens, getMultipleUsersPushTokens } from './pushNotificationService';

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
    // console.error('Create notification error:', error);
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
    // console.error('Get notifications error:', error);
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
    // console.error('Get unread notifications error:', error);
    return [];
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notifications = await getUnreadNotifications(userId);
    return notifications.length;
  } catch (error) {
    // console.error('Get unread count error:', error);
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
    // console.error('Mark notification as read error:', error);
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
    // console.error('Mark all as read error:', error);
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    // console.error('Delete notification error:', error);
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
    // console.error('Delete all notifications error:', error);
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
    // console.error('Get notification preferences error:', error);
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
    // console.error('Update notification preferences error:', error);
    throw new Error('Failed to update preferences');
  }
};

/**
 * Send push notification to a user
 * Uses Expo Push Notification service
 */
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    // Check user's notification preferences
    const preferences = await getNotificationPreferences(userId);
    if (!preferences || !preferences.pushEnabled) {
      // console.log('Push notifications disabled for user:', userId);
      return;
    }

    // Get user's push tokens (supports multiple devices)
    const pushTokens = await getUserPushTokens(userId);

    if (pushTokens.length === 0) {
      // console.log('No push tokens found for user:', userId);
      return;
    }

    // Prepare push notifications for all devices
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high' as const,
      channelId: 'barber-connect-default',
      badge: 1,
    }));

    // Send push notifications via Expo Push Notification service
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    // console.log('Push notification sent:', result);

    // Check for errors
    if (result.data) {
      result.data.forEach((item: any, index: number) => {
        if (item.status === 'error') {
          // console.error('Push notification error for token:', pushTokens[index], item);
        }
      });
    }
  } catch (error) {
    // console.error('Error sending push notification:', error);
  }
};

/**
 * Send push notifications to multiple users
 */
export const sendPushNotificationToMultipleUsers = async (
  userIds: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    // Get all push tokens for these users
    const pushTokens = await getMultipleUsersPushTokens(userIds);

    if (pushTokens.length === 0) {
      // console.log('No push tokens found for users');
      return;
    }

    // Prepare push notifications for all devices
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high' as const,
      channelId: 'barber-connect-default',
      badge: 1,
    }));

    // Send push notifications via Expo Push Notification service
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    // console.log('Push notifications sent to multiple users:', result);
  } catch (error) {
    // console.error('Error sending push notifications to multiple users:', error);
  }
};

/**
 * Send push notification to all followers of a user
 */
export const sendNotificationToFollowers = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    // Get user's followers
    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId)
    );

    const followersSnapshot = await getDocs(followersQuery);
    const followerIds = followersSnapshot.docs.map((doc) => doc.data().followerId);

    if (followerIds.length === 0) {
      // console.log('No followers found for user:', userId);
      return;
    }

    // Send push notifications to all followers
    await sendPushNotificationToMultipleUsers(followerIds, title, body, data);

    // console.log(`Sent notification to ${followerIds.length} followers`);
  } catch (error) {
    // console.error('Error sending notification to followers:', error);
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
  const title = 'Booking Confirmed';
  const message = `Your appointment with ${barberName} on ${date} at ${time} has been confirmed`;

  await createNotification(
    userId,
    NotificationType.BOOKING_CONFIRMED,
    title,
    message,
    { bookingId, actionUrl: `/booking/${bookingId}` }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'BOOKING_CONFIRMED',
    bookingId,
  });
};

export const notifyBookingCancelled = async (
  userId: string,
  bookingId: string,
  barberName: string
): Promise<void> => {
  const title = 'Booking Cancelled';
  const message = `Your appointment with ${barberName} has been cancelled`;

  await createNotification(
    userId,
    NotificationType.BOOKING_CANCELLED,
    title,
    message,
    { bookingId }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'BOOKING_CANCELLED',
    bookingId,
  });
};

export const notifyBookingReminder = async (
  userId: string,
  bookingId: string,
  barberName: string,
  time: string
): Promise<void> => {
  const title = 'Upcoming Appointment';
  const message = `Reminder: You have an appointment with ${barberName} at ${time}`;

  await createNotification(
    userId,
    NotificationType.BOOKING_REMINDER,
    title,
    message,
    { bookingId, actionUrl: `/booking/${bookingId}` }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'BOOKING_REMINDER',
    bookingId,
  });
};

export const notifyNewMessage = async (
  userId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
  conversationId: string,
  messagePreview: string
): Promise<void> => {
  const title = 'New Message';
  const message = `${senderName}: ${messagePreview}`;

  await createNotification(
    userId,
    NotificationType.NEW_MESSAGE,
    title,
    message,
    { senderId, senderName, senderAvatar, conversationId, actionUrl: `/chat/${conversationId}` }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'NEW_MESSAGE',
    senderId,
    senderName,
    conversationId,
  });
};

export const notifyNewFollower = async (
  userId: string,
  followerId: string,
  followerName: string,
  followerAvatar?: string
): Promise<void> => {
  const title = 'New Follower';
  const message = `${followerName} started following you`;

  await createNotification(
    userId,
    NotificationType.NEW_FOLLOWER,
    title,
    message,
    { senderId: followerId, senderName: followerName, senderAvatar: followerAvatar }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'NEW_FOLLOWER',
    senderId: followerId,
    senderName: followerName,
  });
};

export const notifyPostLike = async (
  userId: string,
  likerId: string,
  likerName: string,
  postId: string,
  likerAvatar?: string
): Promise<void> => {
  const title = 'New Like';
  const message = `${likerName} liked your post`;

  await createNotification(
    userId,
    NotificationType.POST_LIKE,
    title,
    message,
    { senderId: likerId, senderName: likerName, senderAvatar: likerAvatar, postId, actionUrl: `/post/${postId}` }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'POST_LIKE',
    senderId: likerId,
    senderName: likerName,
    postId,
  });
};

export const notifyPostComment = async (
  userId: string,
  commenterId: string,
  commenterName: string,
  postId: string,
  comment: string,
  commenterAvatar?: string
): Promise<void> => {
  const title = 'New Comment';
  const message = `${commenterName} commented: ${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}`;

  await createNotification(
    userId,
    NotificationType.POST_COMMENT,
    title,
    message,
    { senderId: commenterId, senderName: commenterName, senderAvatar: commenterAvatar, postId, actionUrl: `/post/${postId}` }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'POST_COMMENT',
    senderId: commenterId,
    senderName: commenterName,
    postId,
  });
};

export const notifyReviewReceived = async (
  userId: string,
  reviewerId: string,
  reviewerName: string,
  rating: number,
  reviewId: string
): Promise<void> => {
  const title = 'New Review';
  const message = `${reviewerName} left you a ${rating}-star review`;

  await createNotification(
    userId,
    NotificationType.REVIEW_RECEIVED,
    title,
    message,
    { senderId: reviewerId, senderName: reviewerName, reviewId }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'REVIEW_RECEIVED',
    senderId: reviewerId,
    senderName: reviewerName,
    reviewId,
  });
};

export const notifyJobApplication = async (
  userId: string,
  applicantId: string,
  applicantName: string,
  jobId: string,
  jobTitle: string
): Promise<void> => {
  const title = 'New Job Application';
  const message = `${applicantName} applied for ${jobTitle}`;

  await createNotification(
    userId,
    NotificationType.JOB_APPLICATION,
    title,
    message,
    { senderId: applicantId, senderName: applicantName, jobId, actionUrl: `/job/${jobId}` }
  );

  // Send push notification
  await sendPushNotification(userId, title, message, {
    type: 'JOB_APPLICATION',
    senderId: applicantId,
    senderName: applicantName,
    jobId,
  });
};
