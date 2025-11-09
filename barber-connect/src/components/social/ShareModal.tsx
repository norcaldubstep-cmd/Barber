import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../common/Avatar';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface ShareOption {
  id: string;
  type: 'story' | 'message' | 'copy' | 'external';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

const SHARE_OPTIONS: ShareOption[] = [
  {
    id: '1',
    type: 'story',
    label: 'Share to Story',
    icon: 'add-circle',
    color: colors.accent.gold,
  },
  {
    id: '2',
    type: 'message',
    label: 'Send in Message',
    icon: 'paper-plane',
    color: colors.accent.blue,
  },
  {
    id: '3',
    type: 'copy',
    label: 'Copy Link',
    icon: 'copy',
    color: colors.text.secondary,
  },
  {
    id: '4',
    type: 'external',
    label: 'Share Externally',
    icon: 'share-outline',
    color: colors.text.secondary,
  },
];

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  postId?: string;
  postUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  postId,
  postUrl = 'https://barberconnect.app/post/123',
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  // TODO: Fetch suggested users for sharing
  React.useEffect(() => {
    if (visible) {
      const fetchSuggestedUsers = async () => {
        try {
          // const response = await fetch('/api/users/suggested-for-sharing');
          // const data = await response.json();
          // setSuggestedUsers(data);
        } catch (error) {
          console.error('Error fetching suggested users:', error);
        }
      };

      fetchSuggestedUsers();
    }
  }, [visible]);

  const handleShareOption = async (option: ShareOption) => {
    switch (option.type) {
      case 'story':
        Alert.alert('Share to Story', 'This post will be shared to your story.');
        onClose();
        break;

      case 'message':
        // Show user selection
        break;

      case 'copy':
        // Copy to clipboard
        Alert.alert('Link Copied', 'Post link copied to clipboard!');
        onClose();
        break;

      case 'external':
        try {
          await Share.share({
            message: `Check out this post on BarberConnect: ${postUrl}`,
            url: postUrl,
          });
          onClose();
        } catch (error) {
          console.error(error);
        }
        break;
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendMessage = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Select Users', 'Please select at least one person to send to.');
      return;
    }

    // TODO: Share post via message API
    try {
      // await fetch('/api/messages/share', {
      //   method: 'POST',
      //   body: JSON.stringify({ postId, userIds: selectedUsers }),
      // });

      Alert.alert(
        'Message Sent',
        `Post shared with ${selectedUsers.length} ${selectedUsers.length === 1 ? 'person' : 'people'}.`
      );
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share post. Please try again.');
    }
  };

  const renderShareOption = ({ item }: { item: ShareOption }) => (
    <TouchableOpacity
      style={styles.shareOption}
      onPress={() => handleShareOption(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.optionIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.optionLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderUser = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleUserSelection(item.id)}
        activeOpacity={0.7}
      >
        <Avatar imageUrl={item.avatar} name={item.name} size="md" />

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.userUsername} numberOfLines={1}>
            {item.username}
          </Text>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#000" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContent}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Share Options */}
          <FlatList
            data={SHARE_OPTIONS}
            renderItem={renderShareOption}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Send to Users */}
          <View style={styles.usersSection}>
            <Text style={styles.sectionTitle}>Send to</Text>
            <FlatList
              data={suggestedUsers}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.usersList}
            />
          </View>

          {/* Send Button */}
          {selectedUsers.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                activeOpacity={0.8}
              >
                <Text style={styles.sendButtonText}>
                  Send to {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    ...textStyles.h3,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  shareOption: {
    alignItems: 'center',
    gap: spacing.sm,
    width: 80,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    ...textStyles.caption,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  usersSection: {
    flex: 1,
  },
  sectionTitle: {
    ...textStyles.body,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  usersList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userUsername: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accent.gold,
    borderColor: colors.accent.gold,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  sendButton: {
    backgroundColor: colors.accent.gold,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  sendButtonText: {
    ...textStyles.body,
    fontWeight: '700',
    color: '#000',
  },
});
