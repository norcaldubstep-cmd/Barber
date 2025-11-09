import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  liked?: boolean;
}

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment?: (text: string) => void;
  onLikeComment?: (commentId: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments: initialComments,
  onAddComment,
  onLikeComment,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user: {
        id: 'current-user',
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?img=68',
      },
      text: commentText,
      timestamp: 'Just now',
      likes: 0,
      liked: false,
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    onAddComment?.(commentText);
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
    onLikeComment?.(commentId);
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentUser}>{item.user.name}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
        <View style={styles.commentActions}>
          <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
          <TouchableOpacity
            onPress={() => handleLikeComment(item.id)}
            style={styles.commentLike}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.liked ? 'heart' : 'heart-outline'}
              size={14}
              color={item.liked ? colors.error : colors.text.tertiary}
            />
            {item.likes > 0 && (
              <Text style={[styles.commentLikeCount, item.liked && styles.commentLikeCountActive]}>
                {item.likes}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.commentsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        }
      />

      {/* Add Comment Input */}
      <View style={styles.inputContainer}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
          style={styles.inputAvatar}
        />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={colors.text.tertiary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          onPress={handleAddComment}
          activeOpacity={0.8}
          disabled={!commentText.trim()}
        >
          <LinearGradient
            colors={
              commentText.trim() ? ['#D4AF37', '#FFD700'] : [colors.border.medium, colors.border.medium]
            }
            style={styles.sendButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="send" size={18} color={commentText.trim() ? '#000' : colors.text.tertiary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  commentsList: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  commentItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
  },
  commentContent: {
    flex: 1,
    gap: spacing.xs,
  },
  commentBubble: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  commentUser: {
    ...textStyles.bodySmall,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  commentText: {
    ...textStyles.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  commentTimestamp: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  commentLike: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  commentLikeCount: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  commentLikeCountActive: {
    color: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  emptySubtext: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
    maxHeight: 100,
  },
  input: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
