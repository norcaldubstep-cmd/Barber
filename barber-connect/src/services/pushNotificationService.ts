import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Push Notification Service
 * Handles all push notification operations using Expo Notifications and FCM
 */

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Android notification channel configuration
const NOTIFICATION_CHANNEL_ID = 'barber-connect-default';
const NOTIFICATION_CHANNEL_NAME = 'Barber Connect Notifications';

/**
 * Initialize Android notification channel
 * Required for Android 8.0+ (API level 26+)
 */
export const initializeAndroidChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: NOTIFICATION_CHANNEL_NAME,
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
  }
};

/**
 * Request notification permissions from the user
 * iOS: Shows permission dialog
 * Android: Auto-granted, but can be revoked in settings
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permission not granted, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      finalStatus = status;
    }

    // Check if we got permission
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions not granted');
      return false;
    }

    // iOS: Check if provisional authorization
    if (Platform.OS === 'ios' && finalStatus === 'granted') {
      const settings = await Notifications.getPermissionsAsync();
      console.log('iOS notification settings:', settings);
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get the Expo push token for this device
 * This token is used to send push notifications to this specific device
 */
export const getPushToken = async (): Promise<string | null> => {
  try {
    // Check if running on physical device
    if (Constants.isDevice) {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      console.log('Expo Push Token:', token.data);
      return token.data;
    } else {
      console.log('Push notifications only work on physical devices');
      return null;
    }
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Register device for push notifications
 * - Requests permissions
 * - Gets push token
 * - Initializes Android channel
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Initialize Android notification channel
    await initializeAndroidChannel();

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Push notification permissions denied');
      return null;
    }

    // Get push token
    const token = await getPushToken();
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Save push token to user's Firestore document
 * Uses subcollection for multi-device support
 */
export const savePushTokenToUser = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    const tokenRef = doc(db, 'users', userId, 'pushTokens', token);
    await setDoc(tokenRef, {
      token,
      platform: Platform.OS,
      deviceName: Constants.deviceName || 'Unknown Device',
      createdAt: serverTimestamp(),
      lastUsed: serverTimestamp(),
    });
    console.log('Push token saved successfully');
  } catch (error) {
    console.error('Error saving push token:', error);
    throw new Error('Failed to save push token');
  }
};

/**
 * Remove push token from user's Firestore document
 * Call this when user logs out
 */
export const removePushTokenFromUser = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    const tokenRef = doc(db, 'users', userId, 'pushTokens', token);
    await deleteDoc(tokenRef);
    console.log('Push token removed successfully');
  } catch (error) {
    console.error('Error removing push token:', error);
  }
};

/**
 * Get all push tokens for a user (for multi-device support)
 */
export const getUserPushTokens = async (userId: string): Promise<string[]> => {
  try {
    const tokensQuery = query(collection(db, 'users', userId, 'pushTokens'));
    const snapshot = await getDocs(tokensQuery);
    return snapshot.docs.map((doc) => doc.data().token);
  } catch (error) {
    console.error('Error getting user push tokens:', error);
    return [];
  }
};

/**
 * Get all push tokens for multiple users (e.g., followers)
 */
export const getMultipleUsersPushTokens = async (
  userIds: string[]
): Promise<string[]> => {
  try {
    const allTokens: string[] = [];

    // Get tokens for each user
    for (const userId of userIds) {
      const tokens = await getUserPushTokens(userId);
      allTokens.push(...tokens);
    }

    // Remove duplicates
    return Array.from(new Set(allTokens));
  } catch (error) {
    console.error('Error getting multiple users push tokens:', error);
    return [];
  }
};

/**
 * Schedule a local notification
 * Useful for reminders and scheduled notifications
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  triggerSeconds: number = 0
): Promise<string> => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
        categoryIdentifier: data?.category || 'default',
      },
      trigger: triggerSeconds > 0 ? { seconds: triggerSeconds } : null,
    });

    console.log('Local notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    throw new Error('Failed to schedule notification');
  }
};

/**
 * Schedule a booking reminder notification
 * Schedules notification 1 hour before booking time
 */
export const scheduleBookingReminder = async (
  bookingId: string,
  barberName: string,
  bookingTime: Date
): Promise<string | null> => {
  try {
    // Calculate trigger time (1 hour before booking)
    const triggerTime = new Date(bookingTime.getTime() - 60 * 60 * 1000);
    const now = new Date();

    // Don't schedule if trigger time is in the past
    if (triggerTime <= now) {
      console.log('Booking time is too soon, not scheduling reminder');
      return null;
    }

    const secondsUntilTrigger = Math.floor((triggerTime.getTime() - now.getTime()) / 1000);

    return await scheduleLocalNotification(
      'Upcoming Appointment',
      `Reminder: You have an appointment with ${barberName} in 1 hour`,
      {
        type: 'BOOKING_REMINDER',
        bookingId,
        category: 'booking',
      },
      secondsUntilTrigger
    );
  } catch (error) {
    console.error('Error scheduling booking reminder:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelScheduledNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

/**
 * Clear all delivered notifications from notification center
 */
export const clearAllDeliveredNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('All delivered notifications cleared');
  } catch (error) {
    console.error('Error clearing delivered notifications:', error);
  }
};

/**
 * Set app badge count (iOS)
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

/**
 * Get app badge count (iOS)
 */
export const getBadgeCount = async (): Promise<number> => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
};

/**
 * Setup notification listeners
 * Returns cleanup function to remove listeners
 */
export const setupNotificationHandlers = (
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): (() => void) => {
  // Listen for notifications received while app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received (foreground):', notification);
      onNotificationReceived?.(notification);
    }
  );

  // Listen for notification interactions (user tapped notification)
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification response:', response);
      onNotificationResponse?.(response);
    }
  );

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};

/**
 * Get the notification that launched the app (if any)
 */
export const getLastNotificationResponse = async (): Promise<Notifications.NotificationResponse | null> => {
  try {
    return await Notifications.getLastNotificationResponseAsync();
  } catch (error) {
    console.error('Error getting last notification response:', error);
    return null;
  }
};

/**
 * Check notification permission status
 */
export const getNotificationPermissionStatus = async (): Promise<{
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
  ios?: {
    allowsAlert?: boolean;
    allowsBadge?: boolean;
    allowsSound?: boolean;
    allowsAnnouncements?: boolean;
  };
}> => {
  try {
    const { status, canAskAgain, ios } = await Notifications.getPermissionsAsync();

    return {
      status: status as 'granted' | 'denied' | 'undetermined',
      canAskAgain: canAskAgain ?? true,
      ios: ios ? {
        allowsAlert: ios.allowsAlert,
        allowsBadge: ios.allowsBadge,
        allowsSound: ios.allowsSound,
        allowsAnnouncements: ios.allowsAnnouncements,
      } : undefined,
    };
  } catch (error) {
    console.error('Error getting permission status:', error);
    return {
      status: 'undetermined',
      canAskAgain: true,
    };
  }
};

/**
 * Navigate to app settings (to enable notifications manually)
 */
export const openAppSettings = async (): Promise<void> => {
  try {
    await Notifications.openSettingsAsync();
  } catch (error) {
    console.error('Error opening app settings:', error);
  }
};

// Export notification categories for type safety
export const NotificationCategories = {
  NEW_MESSAGE: 'NEW_MESSAGE',
  NEW_BOOKING: 'NEW_BOOKING',
  NEW_FOLLOWER: 'NEW_FOLLOWER',
  POST_INTERACTION: 'POST_INTERACTION',
  BOOKING_REMINDER: 'BOOKING_REMINDER',
  JOB_APPLICATION: 'JOB_APPLICATION',
} as const;

export type NotificationCategory = typeof NotificationCategories[keyof typeof NotificationCategories];
