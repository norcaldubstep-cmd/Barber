import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { LikeButton } from '../../components/social/LikeButton';
import { CommentButton } from '../../components/social/CommentButton';
import { CommentsSection } from '../../components/social/CommentsSection';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { getPostById, getPostComments, addComment, toggleLike, toggleSave } from '../../services/postsService';
import type { Post, Comment } from '../../services/postsService';

const { width } = Dimensions.get('window');

export const PostDetailScreen = ({ navigation, route }: any) => {
  const { postId } = route.params || {};
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  React.useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const [postData, commentsData] = await Promise.all([
          getPostById(postId),
          getPostComments(postId),
        ]);
        setPost(postData);
        setComments(commentsData);
      } catch (error) {
        // console.error('Error fetching post:', error);
        Alert.alert('Error', 'Failed to load post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleLike = async (liked: boolean) => {
    if (!post) return;

    // Optimistic update
    setPost((prev) => prev ? ({
      ...prev,
      liked,
      likesCount: liked ? prev.likesCount + 1 : prev.likesCount - 1,
    }) : null);

    try {
      await toggleLike(postId, !liked);
    } catch (error) {
      // console.error('Error toggling like:', error);
      // Revert on error
      setPost((prev) => prev ? ({
        ...prev,
        liked: !liked,
        likesCount: liked ? prev.likesCount - 1 : prev.likesCount + 1,
      }) : null);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!post) return;

    // Optimistic update
    const newSavedState = !post.saved;
    setPost((prev) => prev ? ({ ...prev, saved: newSavedState }) : null);

    try {
      await toggleSave(postId, !newSavedState);
    } catch (error) {
      // console.error('Error toggling save:', error);
      // Revert on error
      setPost((prev) => prev ? ({ ...prev, saved: !newSavedState }) : null);
      Alert.alert('Error', 'Failed to save post. Please try again.');
    }
  };

  const handleAddComment = async (text: string) => {
    try {
      await addComment(postId, text);
      // Refresh comments
      const commentsData = await getPostComments(postId);
      setComments(commentsData);
      // Update comment count
      setPost((prev) => prev ? ({ ...prev, commentsCount: prev.commentsCount + 1 }) : null);
    } catch (error) {
      // console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.authorInfo}
            onPress={() => navigation.navigate('BarberProfile', { barberId: post.authorId })}
          >
            <Avatar
              imageUrl={post.authorAvatar}
              name={post.authorName}
              size="md"
              verified={post.isVerified}
              showGradientBorder
            />
            <View style={styles.authorDetails}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{post.authorName}</Text>
                {post.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.accent.blue} />
                )}
              </View>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
              {post.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color={colors.text.secondary} />
                  <Text style={styles.locationText}>{post.location}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Post Image */}
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <LikeButton
              initialLiked={post.liked}
              initialCount={post.likes}
              onLike={handleLike}
              size="large"
            />
            <CommentButton count={post.commentsCount} size="large" />
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="paper-plane-outline" size={26} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSave}>
            <Ionicons
              name={post.saved ? "bookmark" : "bookmark-outline"}
              size={26}
              color={post.saved ? colors.accent.gold : colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View style={styles.captionSection}>
          <Text style={styles.caption}>
            <Text style={styles.authorNameBold}>{post.authorName} </Text>
            {post.caption}
          </Text>
        </View>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <View style={styles.hashtagsRow}>
            {post.hashtags.map((tag, index) => (
              <TouchableOpacity key={index}>
                <Text style={styles.hashtag}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Comments Section */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <CommentsSection
            comments={comments}
            onAddComment={handleAddComment}
            onLikeComment={(commentId) => {
              // TODO: Like comment API call
              // console.log('Like comment:', commentId);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    fontWeight: '700',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  postHeader: {
    padding: spacing.lg,
  },
  authorInfo: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  authorName: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  timestamp: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  postImage: {
    width: width,
    height: width * 1.25,
    backgroundColor: colors.background.secondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  shareButton: {
    padding: spacing.xs,
  },
  captionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  caption: {
    ...textStyles.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  authorNameBold: {
    fontWeight: '700',
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  hashtag: {
    ...textStyles.body,
    color: colors.accent.blue,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.medium,
    marginVertical: spacing.lg,
  },
  commentsContainer: {
    flex: 1,
    minHeight: 400,
  },
  commentsTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    ...textStyles.h3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
