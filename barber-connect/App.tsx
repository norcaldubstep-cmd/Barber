import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Alert, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { RootNavigator } from './src/navigation/RootNavigator';
import {
  registerForPushNotifications,
  savePushTokenToUser,
  removePushTokenFromUser,
  setupNotificationHandlers,
  getLastNotificationResponse,
  setBadgeCount,
} from './src/services/pushNotificationService';
import { onAuthStateChanged } from './src/services/authService';
import { getUnreadNotificationCount } from './src/services/notificationService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pushTokenRef = useRef<string | null>(null);
  const navigationRef = useRef<any>(null);

  // Initialize push notifications
  useEffect(() => {
    async function initializePushNotifications() {
      try {
        // Register for push notifications
        const token = await registerForPushNotifications();

        if (token) {
          pushTokenRef.current = token;
          console.log('Push notifications initialized successfully');

          // Save token to current user if logged in
          if (currentUserId) {
            await savePushTokenToUser(currentUserId, token);
          }
        } else {
          console.log('Push notification registration failed or not available');
        }

        // Check if app was opened from a notification
        const lastResponse = await getLastNotificationResponse();
        if (lastResponse) {
          handleNotificationResponse(lastResponse);
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    }

    initializePushNotifications();
  }, [currentUserId]);

  // Setup notification listeners
  useEffect(() => {
    const cleanup = setupNotificationHandlers(
      handleNotificationReceived,
      handleNotificationResponse
    );

    return cleanup;
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUserId(user.uid);

        // Save push token to new user
        if (pushTokenRef.current) {
          try {
            await savePushTokenToUser(user.uid, pushTokenRef.current);
            console.log('Push token saved for user:', user.uid);
          } catch (error) {
            console.error('Error saving push token:', error);
          }
        }

        // Update badge count with unread notifications
        try {
          const unreadCount = await getUnreadNotificationCount(user.uid);
          await setBadgeCount(unreadCount);
        } catch (error) {
          console.error('Error updating badge count:', error);
        }
      } else {
        // User logged out - remove push token
        if (currentUserId && pushTokenRef.current) {
          try {
            await removePushTokenFromUser(currentUserId, pushTokenRef.current);
            console.log('Push token removed for user:', currentUserId);
          } catch (error) {
            console.error('Error removing push token:', error);
          }
        }

        setCurrentUserId(null);
        await setBadgeCount(0);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Prepare app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls here
        // For now, we'll just use system fonts
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  /**
   * Handle notification received while app is in foreground
   */
  const handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('Foreground notification:', notification.request.content);

    // Update badge count
    if (currentUserId) {
      getUnreadNotificationCount(currentUserId).then(async (count) => {
        await setBadgeCount(count);
      });
    }

    // Optionally show an in-app alert or toast
    // You can customize this based on notification type
    if (Platform.OS === 'ios') {
      // iOS already shows the notification in foreground with our handler config
      // No additional action needed
    }
  };

  /**
   * Handle notification tap (user interaction)
   * Navigate to appropriate screen based on notification data
   */
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    console.log('Notification tapped with data:', data);

    // Clear badge for this notification
    if (currentUserId) {
      getUnreadNotificationCount(currentUserId).then(async (count) => {
        await setBadgeCount(Math.max(0, count - 1));
      });
    }

    // Navigate based on notification type
    try {
      if (data.type === 'NEW_MESSAGE' && data.conversationId) {
        // Navigate to ChatScreen
        navigationRef.current?.navigate('ChatScreen', {
          conversationId: data.conversationId,
          otherUserId: data.senderId,
        });
      } else if (data.type === 'BOOKING_CONFIRMED' || data.type === 'BOOKING_REMINDER') {
        // Navigate to BookingDetailScreen
        if (data.bookingId) {
          navigationRef.current?.navigate('BookingDetailScreen', {
            bookingId: data.bookingId,
          });
        } else {
          navigationRef.current?.navigate('BookingsScreen');
        }
      } else if (data.type === 'BOOKING_CANCELLED' && data.bookingId) {
        // Navigate to BookingDetailScreen
        navigationRef.current?.navigate('BookingDetailScreen', {
          bookingId: data.bookingId,
        });
      } else if (data.type === 'NEW_FOLLOWER') {
        // Navigate to FollowersScreen or Profile
        navigationRef.current?.navigate('ProfileScreen', {
          userId: data.senderId,
        });
      } else if (data.type === 'POST_LIKE' || data.type === 'POST_COMMENT') {
        // Navigate to PostDetailScreen
        if (data.postId) {
          navigationRef.current?.navigate('PostDetailScreen', {
            postId: data.postId,
          });
        }
      } else if (data.type === 'JOB_APPLICATION' && data.jobId) {
        // Navigate to JobBoard
        navigationRef.current?.navigate('JobBoardScreen', {
          jobId: data.jobId,
        });
      } else if (data.type === 'REVIEW_RECEIVED') {
        // Navigate to Reviews screen
        navigationRef.current?.navigate('ReviewsScreen');
      } else {
        // Default: Navigate to notifications screen
        navigationRef.current?.navigate('NotificationsScreen');
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
      // Fallback to notifications screen
      navigationRef.current?.navigate('NotificationsScreen');
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <RootNavigator ref={navigationRef} />
      <StatusBar style="light" />
    </View>
  );
}
