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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { LikeButton } from '../../components/social/LikeButton';
import { CommentButton } from '../../components/social/CommentButton';
import { CommentsSection } from '../../components/social/CommentsSection';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

const { width } = Dimensions.get('window');

export const PostDetailScreen = ({ navigation, route }: any) => {
  const { postId } = route.params || {};
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  // TODO: Fetch post data from API
  React.useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // const response = await fetch(`/api/posts/${postId}`);
        // const data = await response.json();
        // setPost(data.post);
        // setComments(data.comments);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleLike = (liked: boolean) => {
    setPost((prev) => ({
      ...prev,
      liked,
      likes: liked ? prev.likes + 1 : prev.likes - 1,
    }));
  };

  const handleAddComment = async (text: string) => {
    // TODO: Post comment to API
    // const response = await fetch(`/api/posts/${postId}/comments`, {
    //   method: 'POST',
    //   body: JSON.stringify({ text }),
    // });
    console.log('New comment:', text);
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
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={26} color={colors.text.secondary} />
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
              console.log('Like comment:', commentId);
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
