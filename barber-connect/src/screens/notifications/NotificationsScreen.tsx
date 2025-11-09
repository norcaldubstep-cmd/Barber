import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

type NotificationType =
  | 'booking'
  | 'message'
  | 'follow'
  | 'like'
  | 'comment'
  | 'job'
  | 'promotion';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  user?: {
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };
  actionData?: any;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking',
    message: 'John Doe booked a Premium Fade for tomorrow at 2:00 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false,
    user: { name: 'John Doe' },
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Mike the Barber: "See you tomorrow!"',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    user: { name: 'Mike the Barber', isVerified: true },
  },
  {
    id: '3',
    type: 'follow',
    title: 'New Follower',
    message: 'Carlos Rodriguez started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: true,
    user: { name: 'Carlos Rodriguez', isVerified: true },
  },
  {
    id: '4',
    type: 'like',
    title: 'New Like',
    message: 'Sarah Johnson liked your post',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: true,
    user: { name: 'Sarah Johnson' },
  },
  {
    id: '5',
    type: 'comment',
    title: 'New Comment',
    message: 'David Martinez: "Great work! How much for this cut?"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    user: { name: 'David Martinez' },
  },
  {
    id: '6',
    type: 'job',
    title: 'New Job Posted',
    message: 'Elite Cuts Studio is hiring - Senior Barber position',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isRead: true,
  },
  {
    id: '7',
    type: 'promotion',
    title: 'Upgrade Available',
    message: 'Get 20% off Premium plans this weekend only!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    isRead: true,
  },
];

export const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const getNotificationIcon = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'booking':
        return 'calendar';
      case 'message':
        return 'chatbubble';
      case 'follow':
        return 'person-add';
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble-ellipses';
      case 'job':
        return 'briefcase';
      case 'promotion':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'booking':
        return colors.accent.blue;
      case 'message':
        return colors.accent.gold;
      case 'follow':
        return colors.accent.gold;
      case 'like':
        return colors.accent.red;
      case 'comment':
        return colors.accent.blue;
      case 'job':
        return colors.success;
      case 'promotion':
        return colors.accent.gold;
      default:
        return colors.text.secondary;
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
        onPress={() => {
          markAsRead(item.id);
          // Handle navigation based on type
        }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {item.user ? (
            <Avatar
              name={item.user.name}
              size="md"
              verified={item.user.isVerified}
            />
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name={iconName} size={24} color={iconColor} />
            </View>
          )}

          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text
              style={[
                styles.notificationMessage,
                !item.isRead && styles.unreadMessage,
              ]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 40 }} />}
      </View>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="notifications" size={16} color={colors.accent.gold} />
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-outline" size={64} color={colors.text.secondary} />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            When you get notifications, they'll show up here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...textStyles.h2, fontWeight: '700', flex: 1 },
  markAllButton: { paddingHorizontal: spacing.sm },
  markAllText: { ...textStyles.bodySmall, color: colors.accent.gold, fontWeight: '600' },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.gold + '10',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  unreadBannerText: { ...textStyles.bodySmall, color: colors.accent.gold, fontWeight: '600' },
  notificationItem: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  unreadNotification: {
    backgroundColor: colors.background.card,
  },
  notificationContent: { flexDirection: 'row', gap: spacing.md },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: { flex: 1 },
  notificationTitle: { ...textStyles.body, fontWeight: '700', marginBottom: spacing.xs },
  notificationMessage: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  unreadMessage: { color: colors.text.primary },
  timestamp: { ...textStyles.caption, color: colors.text.secondary },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.gold,
    marginTop: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing.lg + 48 + spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
