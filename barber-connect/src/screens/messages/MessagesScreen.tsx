import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

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

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participant: {
      id: 'b1',
      name: 'Mike the Barber',
      isVerified: true,
      isOnline: true,
    },
    lastMessage: {
      text: 'See you tomorrow at 2pm!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: true,
      sentByMe: false,
    },
    unreadCount: 0,
  },
  {
    id: '2',
    participant: {
      id: 'b2',
      name: 'Elite Cuts Studio',
      isVerified: true,
      isOnline: false,
    },
    lastMessage: {
      text: 'Thanks for booking! Looking forward to seeing you.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
      sentByMe: false,
    },
    unreadCount: 2,
  },
  {
    id: '3',
    participant: {
      id: 'c1',
      name: 'John Client',
      isOnline: true,
    },
    lastMessage: {
      text: 'Do you have availability this weekend?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      isRead: true,
      sentByMe: false,
    },
    unreadCount: 1,
  },
  {
    id: '4',
    participant: {
      id: 'b3',
      name: 'Fresh Fade Barbershop',
      isVerified: true,
      isOnline: false,
    },
    lastMessage: {
      text: 'Perfect! Booking confirmed.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: true,
      sentByMe: true,
    },
    unreadCount: 0,
  },
  {
    id: '5',
    participant: {
      id: 'c2',
      name: 'David Martinez',
      isOnline: false,
    },
    lastMessage: {
      text: 'What are your rates for a fade?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      isRead: true,
      sentByMe: false,
    },
    unreadCount: 0,
  },
];

export const MessagesScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

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
      {filteredConversations.length > 0 ? (
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
