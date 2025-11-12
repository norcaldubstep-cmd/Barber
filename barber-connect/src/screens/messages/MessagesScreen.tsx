import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { listenToConversations } from '../../services/chatService';
import { Conversation as FirebaseConversation } from '../../types/message.types';

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
    isOnline?: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: Date;
    isRead: boolean;
    sentByMe: boolean;
  };
  unreadCount: number;
}

export const MessagesScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    try {
      // Subscribe to real-time conversations updates
      const unsubscribe = listenToConversations(user.id, (firebaseConversations) => {
        // Map Firebase conversations to screen format
        const mappedConversations: Conversation[] = firebaseConversations.map((conv) => {
          // Get the other participant's details
          const otherUserId = conv.participants.find((id) => id !== user.id) || '';
          const otherParticipant = conv.participantDetails[otherUserId];

          return {
            id: conv.id,
            participant: {
              id: otherUserId,
              name: otherParticipant?.name || 'Unknown User',
              avatar: otherParticipant?.avatar,
              isVerified: otherParticipant?.role === 'BARBER',
              isOnline: false, // Can be enhanced with online status tracking
            },
            lastMessage: {
              text: conv.lastMessage?.content || 'No messages yet',
              timestamp: conv.lastMessage?.createdAt
                ? new Date(conv.lastMessage.createdAt)
                : new Date(conv.createdAt),
              isRead: conv.lastMessage?.isRead || true,
              sentByMe: conv.lastMessage?.senderId === user.id,
            },
            unreadCount: conv.unreadCount[user.id] || 0,
          };
        });

        setConversations(mappedConversations);
        setLoading(false);
        setError(null);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      // console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
      setLoading(false);
      Alert.alert('Error', 'Failed to load conversations. Please try again.');
    }
  }, [user?.id]);

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', { conversationId: conversation.id, participant: conversation.participant });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrapper}>
        <Avatar
          name={item.participant.name}
          size="lg"
          verified={item.participant.isVerified}
          showOnlineStatus
          isOnline={item.participant.isOnline}
        />
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.participantName} numberOfLines={1}>
            {item.participant.name}
          </Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.lastMessage.timestamp)}</Text>
        </View>

        <View style={styles.messagePreview}>
          <Text
            style={[
              styles.lastMessage,
              !item.lastMessage.isRead && !item.lastMessage.sentByMe && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.sentByMe && (
              <Text style={styles.sentIndicator}>You: </Text>
            )}
            {item.lastMessage.text}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {totalUnread > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnread}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={24} color={colors.accent.gold} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
          </View>
          <Text style={styles.emptyTitle}>Unable to load conversations</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.text.secondary} />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Try searching with a different name'
              : 'Start chatting with barbers or clients'}
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: { ...textStyles.h2, fontWeight: '700', flex: 1 },
  headerBadge: {
    backgroundColor: colors.accent.gold,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    marginRight: spacing.md,
  },
  headerBadgeText: { ...textStyles.caption, color: '#000', fontWeight: '700' },
  newMessageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: { padding: spacing.lg, paddingBottom: spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
  },
  listContent: { paddingBottom: spacing.xl },
  conversationItem: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  avatarWrapper: { marginRight: spacing.md },
  conversationContent: { flex: 1 },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  participantName: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  timestamp: { ...textStyles.caption, color: colors.text.secondary },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  unreadMessage: { color: colors.text.primary, fontWeight: '600' },
  sentIndicator: { color: colors.text.secondary },
  unreadBadge: {
    backgroundColor: colors.accent.gold,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  unreadCount: { ...textStyles.caption, color: '#000', fontWeight: '700', fontSize: 11 },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing.lg + 56 + spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  emptyIconContainer: {
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
