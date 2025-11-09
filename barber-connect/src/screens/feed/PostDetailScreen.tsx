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

// Mock post data
const MOCK_POST = {
  id: '1',
  authorId: '123',
  authorName: 'Mike Johnson',
  authorAvatar: 'https://i.pravatar.cc/150?img=12',
  isVerified: true,
  caption: 'Just finished this clean mid fade with a textured top. Client wanted something professional but stylish. What do you think? 💈✨',
  imageUrl: 'https://picsum.photos/800/1000?random=1',
  likes: 342,
  liked: false,
  commentsCount: 28,
  timestamp: '2 hours ago',
  location: 'The Barber Lounge, SF',
  hashtags: ['fade', 'barberlife', 'menshair', 'barbershop'],
};

const MOCK_COMMENTS = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'John Davis',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    text: 'This is fire bro! Love the blend 🔥',
    timestamp: '1 hour ago',
    likes: 12,
    liked: false,
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?img=45',
    },
    text: 'What guard did you use for the fade?',
    timestamp: '45 min ago',
    likes: 5,
    liked: true,
  },
  {
    id: '3',
    user: {
      id: '3',
      name: 'Marcus Wright',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    text: 'Always clean work! Keep it up 👏',
    timestamp: '30 min ago',
    likes: 8,
    liked: false,
  },
];

export const PostDetailScreen = ({ navigation, route }: any) => {
  const { postId } = route.params || {};
  const [post, setPost] = useState(MOCK_POST);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = (liked: boolean) => {
    setPost((prev) => ({
      ...prev,
      liked,
      likes: liked ? prev.likes + 1 : prev.likes - 1,
    }));
  };

  const handleAddComment = (text: string) => {
    console.log('New comment:', text);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

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
            comments={MOCK_COMMENTS}
            onAddComment={handleAddComment}
            onLikeComment={(commentId) => console.log('Like comment:', commentId)}
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
});
