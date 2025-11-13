import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Message, Conversation, MessageType } from '../types/message.types';

/**
 * Chat/Messaging Service
 * Handles all real-time messaging operations
 */

// Create or get existing conversation between two users
export const getOrCreateConversation = async (
  userId: string,
  otherUserId: string,
  userDetails: { name: string; avatar?: string; role: 'CLIENT' | 'BARBER' },
  otherUserDetails: { name: string; avatar?: string; role: 'CLIENT' | 'BARBER' }
): Promise<string> => {
  try {
    // Check if conversation already exists
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );

    const snapshot = await getDocs(conversationsQuery);
    const existingConv = snapshot.docs.find((doc) => {
      const data = doc.data();
      return data.participants.includes(otherUserId);
    });

    if (existingConv) {
      return existingConv.id;
    }

    // Create new conversation
    const conversationRef = doc(collection(db, 'conversations'));
    const conversationData: Conversation = {
      id: conversationRef.id,
      participants: [userId, otherUserId],
      participantDetails: {
        [userId]: userDetails,
        [otherUserId]: otherUserDetails,
      },
      unreadCount: {
        [userId]: 0,
        [otherUserId]: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(conversationRef, {
      ...conversationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return conversationRef.id;
  } catch (error) {
    // console.error('Get or create conversation error:', error);
    throw new Error('Failed to create conversation');
  }
};

// Send a text message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  content: string,
  senderAvatar?: string
): Promise<Message> => {
  try {
    // Input validation
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (content.length > 1000) {
      throw new Error('Message content cannot exceed 1000 characters');
    }
    if (!conversationId || !senderId || !receiverId) {
      throw new Error('Invalid message parameters');
    }

    const messageRef = doc(collection(db, 'messages'));

    const messageData: Message = {
      id: messageRef.id,
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      receiverId,
      type: MessageType.TEXT,
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await setDoc(messageRef, {
      ...messageData,
      createdAt: serverTimestamp(),
    });

    // Update conversation
    await updateConversationLastMessage(conversationId, messageData, receiverId);

    return messageData;
  } catch (error) {
    // console.error('Send message error:', error);
    throw error;
  }
};

// Send an image message
export const sendImageMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  imageUri: string,
  caption?: string,
  senderAvatar?: string
): Promise<Message> => {
  try {
    // Upload image to storage
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filename = `messages/${conversationId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);

    // Create message
    const messageRef = doc(collection(db, 'messages'));

    const messageData: Message = {
      id: messageRef.id,
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      receiverId,
      type: MessageType.IMAGE,
      content: caption || 'Sent an image',
      imageUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await setDoc(messageRef, {
      ...messageData,
      createdAt: serverTimestamp(),
    });

    // Update conversation
    await updateConversationLastMessage(conversationId, messageData, receiverId);

    return messageData;
  } catch (error) {
    // console.error('Send image message error:', error);
    throw new Error('Failed to send image');
  }
};

// Send booking reference message
export const sendBookingMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  bookingId: string,
  senderAvatar?: string
): Promise<Message> => {
  try {
    const messageRef = doc(collection(db, 'messages'));

    const messageData: Message = {
      id: messageRef.id,
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      receiverId,
      type: MessageType.BOOKING,
      content: 'Shared a booking',
      bookingId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await setDoc(messageRef, {
      ...messageData,
      createdAt: serverTimestamp(),
    });

    await updateConversationLastMessage(conversationId, messageData, receiverId);

    return messageData;
  } catch (error) {
    // console.error('Send booking message error:', error);
    throw new Error('Failed to send booking');
  }
};

// Get messages for a conversation
export const getMessages = async (
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> => {
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(messagesQuery);
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));

    return messages.reverse(); // Reverse to show oldest first
  } catch (error) {
    // console.error('Get messages error:', error);
    return [];
  }
};

// Listen to messages in real-time
export const listenToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc'),
    limit(100)
  );

  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  });

  return unsubscribe;
};

// Get user's conversations
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(conversationsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conversation));
  } catch (error) {
    // console.error('Get conversations error:', error);
    return [];
  }
};

// Listen to user's conversations in real-time
export const listenToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
  const conversationsQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
    const conversations = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Conversation)
    );
    callback(conversations);
  });

  return unsubscribe;
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'messages', messageId), {
      isRead: true,
    });
  } catch (error) {
    // console.error('Mark message as read error:', error);
  }
};

// Mark all messages in conversation as read
export const markConversationAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    // Get unread messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(messagesQuery);

    // Mark each as read
    const updatePromises = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(updatePromises);

    // Reset unread count in conversation
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (error) {
    // console.error('Mark conversation as read error:', error);
  }
};

// Get total unread messages count for user
export const getUnreadMessagesCount = async (userId: string): Promise<number> => {
  try {
    const conversations = await getUserConversations(userId);
    return conversations.reduce((total, conv) => total + (conv.unreadCount[userId] || 0), 0);
  } catch (error) {
    // console.error('Get unread count error:', error);
    return 0;
  }
};

// Helper: Update conversation's last message
const updateConversationLastMessage = async (
  conversationId: string,
  message: Message,
  receiverId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: {
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        isRead: false,
      },
      [`unreadCount.${receiverId}`]: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // console.error('Update conversation last message error:', error);
  }
};
