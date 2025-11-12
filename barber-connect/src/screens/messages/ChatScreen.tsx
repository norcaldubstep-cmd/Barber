import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { listenToMessages, sendMessage, markConversationAsRead } from '../../services/chatService';
import { Message as FirebaseMessage } from '../../types/message.types';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sentByMe: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export const ChatScreen = ({ route, navigation }: any) => {
  const { conversationId, participant } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load messages and listen for real-time updates
  useEffect(() => {
    if (!user?.id || !conversationId) {
      setLoading(false);
      Alert.alert('Error', 'Missing conversation or user information');
      navigation.goBack();
      return;
    }

    try {
      // Subscribe to real-time messages
      const unsubscribe = listenToMessages(conversationId, (firebaseMessages) => {
        // Map Firebase messages to screen format
        const mappedMessages: Message[] = firebaseMessages.map((msg) => ({
          id: msg.id,
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          sentByMe: msg.senderId === user.id,
          status: msg.isRead ? 'read' : 'sent',
        }));

        setMessages(mappedMessages);
        setLoading(false);

        // Auto-scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      // Mark conversation as read when opening
      markConversationAsRead(conversationId, user.id).catch((err) => {
        // console.error('Error marking conversation as read:', err);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      // console.error('Error loading messages:', err);
      setLoading(false);
      Alert.alert('Error', 'Failed to load messages');
    }
  }, [conversationId, user?.id]);

  // Auto-scroll when messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateHeader = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const shouldShowDateHeader = (index: number): boolean => {
    if (index === 0) return true;
    const currentDate = messages[index].timestamp;
    const previousDate = messages[index - 1].timestamp;
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0 || !user?.id || !conversationId) return;

    const messageContent = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    setSending(true);

    try {
      // Send message to Firebase
      const senderName = `${user.firstName} ${user.lastName}`.trim() || 'Unknown User';
      await sendMessage(
        conversationId,
        user.id,
        senderName,
        participant.id,
        messageContent,
        user.profileImageUrl
      );
      // Message will be added to the list automatically via the real-time listener
    } catch (error) {
      // console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Restore the input text if sending failed
      setInputText(messageContent);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <View>
      {shouldShowDateHeader(index) && (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>
            {formatDateHeader(item.timestamp)}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.messageContainer,
          item.sentByMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!item.sentByMe && (
          <Avatar name={participant.name} size="sm" style={styles.messageAvatar} />
        )}

        <View
          style={[
            styles.messageBubble,
            item.sentByMe ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.sentByMe ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                item.sentByMe ? styles.myMessageTime : styles.theirMessageTime,
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
            {item.sentByMe && item.status && (
              <View style={styles.statusIcon}>
                {item.status === 'sending' && (
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                )}
                {item.status === 'sent' && (
                  <Ionicons name="checkmark" size={14} color="rgba(255,255,255,0.7)" />
                )}
                {(item.status === 'delivered' || item.status === 'read') && (
                  <Ionicons
                    name="checkmark-done"
                    size={14}
                    color={item.status === 'read' ? colors.accent.gold : 'rgba(255,255,255,0.7)'}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => console.log('View profile')}
          activeOpacity={0.7}
        >
          <Avatar
            name={participant.name}
            size="sm"
            verified={participant.isVerified}
            showOnlineStatus
            isOnline={participant.isOnline}
          />
          <View style={styles.headerText}>
            <Text style={styles.participantName} numberOfLines={1}>
              {participant.name}
            </Text>
            <Text style={styles.onlineStatus}>
              {participant.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.text.secondary} />
              <Text style={styles.emptyMessagesText}>No messages yet</Text>
              <Text style={styles.emptyMessagesSubtext}>Start the conversation!</Text>
            </View>
          }
        />
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color={colors.accent.gold} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.secondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={inputText.trim().length === 0 || sending}
          >
            <LinearGradient
              colors={
                inputText.trim().length > 0 && !sending
                  ? ['#D4AF37', '#FFD700']
                  : [colors.border.medium, colors.border.medium]
              }
              style={styles.sendButtonGradient}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={inputText.trim().length > 0 ? '#000' : colors.text.secondary}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: colors.background.card,
    ...shadows.sm,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: { flex: 1 },
  participantName: { ...textStyles.body, fontWeight: '700', marginBottom: 2 },
  onlineStatus: { ...textStyles.caption, color: colors.text.secondary },
  moreButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  messagesList: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
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
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    marginTop: spacing['3xl'],
  },
  emptyMessagesText: {
    ...textStyles.h3,
    fontWeight: '700',
    marginTop: spacing.lg,
    color: colors.text.primary,
  },
  emptyMessagesSubtext: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dateHeaderText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: spacing.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  myMessageBubble: {
    backgroundColor: colors.accent.gold,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...textStyles.body,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000',
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  messageTime: {
    ...textStyles.caption,
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(0,0,0,0.6)',
  },
  theirMessageTime: {
    color: colors.text.secondary,
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.card,
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  emojiButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
