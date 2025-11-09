import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { Post, PostType, Story } from '../../types/post.types';
import { MOCK_POSTS } from '../../utils/mockData';

const { width } = Dimensions.get('window');

export const FeedScreen = ({ navigation }: any) => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );
  };

  const handleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isSaved: !post.isSaved,
              savesCount: post.isSaved ? post.savesCount - 1 : post.savesCount + 1,
            }
          : post
      )
    );
  };

  const renderStory = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
      <LinearGradient
        colors={index === 0 ? ['#9CA3AF', '#9CA3AF'] : ['#D4AF37', '#FFD700', '#D4AF37']}
        style={styles.storyGradient}
      >
        <View style={styles.storyInner}>
          {index === 0 ? (
            <View style={styles.addStoryIcon}>
              <Ionicons name="add" size={24} color={colors.text.primary} />
            </View>
          ) : (
            <Avatar name={`Barber ${item}`} size="md" />
          )}
        </View>
      </LinearGradient>
      <Text style={styles.storyName} numberOfLines={1}>
        {index === 0 ? 'Your Story' : `Barber ${item}`}
      </Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.postAuthor}
          onPress={() => navigation.navigate('BarberProfile', { barberId: item.authorId })}
        >
          <Avatar
            name={item.authorName}
            size="md"
            verified={item.isVerified}
            showGradientBorder={item.promotionTier !== 'FREE'}
          />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{item.authorName}</Text>
              {item.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.accent.blue} />
              )}
              {item.promotionTier && item.promotionTier !== 'FREE' && (
                <View style={[styles.promotionMini, { backgroundColor: colors.accent.gold }]}>
                  <Ionicons name="star" size={10} color="#000" />
                </View>
              )}
            </View>
            <Text style={styles.postTime}>2 hours ago</Text>
            {item.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={colors.text.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.location.name}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Post Media */}
      <View style={styles.mediaContainer}>
        {item.type === PostType.VIDEO && (
          <View style={styles.videoOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="#FFF" />
            </View>
            <View style={styles.videoDuration}>
              <Ionicons name="time-outline" size={12} color="#FFF" />
              <Text style={styles.durationText}>
                {item.media[0].duration}s
              </Text>
            </View>
          </View>
        )}
        <Image
          source={{ uri: item.media[0].url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      </View>

      {/* Post Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={item.isLiked ? colors.social.like : colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          >
            <Ionicons name="chatbubble-outline" size={26} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={26} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => handleSave(item.id)}>
          <Ionicons
            name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color={item.isSaved ? colors.social.bookmark : colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Post Stats & Caption */}
      <View style={styles.postContent}>
        <TouchableOpacity>
          <Text style={styles.likesText}>{item.likesCount.toLocaleString()} likes</Text>
        </TouchableOpacity>

        <View style={styles.captionRow}>
          <Text style={styles.captionText}>
            <Text style={styles.authorNameBold}>{item.authorName} </Text>
            {item.caption}
          </Text>
        </View>

        {item.hashtags.length > 0 && (
          <View style={styles.hashtagsRow}>
            {item.hashtags.map((tag, index) => (
              <TouchableOpacity key={index}>
                <Text style={styles.hashtag}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {item.commentsCount > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
            <Text style={styles.viewComments}>
              View all {item.commentsCount} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#D4AF37', '#FFD700', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoGradient}
        >
          <Ionicons name="cut" size={24} color="#000" />
        </LinearGradient>
        <Text style={styles.headerTitle}>BarberConnect</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={28} color={colors.text.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('UserSearch')}
          >
            <Ionicons name="search-outline" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories */}
      <View style={styles.storiesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[0, 1, 2, 3, 4, 5]}
          renderItem={renderStory}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.storiesList}
        />
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.feedContent}
      />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.sm,
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.h4,
    fontWeight: '800',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.social.like,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  storiesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingVertical: spacing.md,
  },
  storiesList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  storyGradient: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.full,
    padding: 3,
    marginBottom: spacing.xs,
  },
  storyInner: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addStoryIcon: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },
  storyName: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  feedContent: {
    paddingBottom: spacing.xl,
  },
  postCard: {
    backgroundColor: colors.background.card,
    marginBottom: spacing.sm,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  authorName: {
    ...textStyles.body,
    fontWeight: '700',
  },
  promotionMini: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTime: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  moreButton: {
    padding: spacing.xs,
  },
  mediaContainer: {
    position: 'relative',
    width: width,
    height: width,
    backgroundColor: colors.background.secondary,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    padding: spacing.xs,
  },
  postContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  likesText: {
    ...textStyles.bodySmall,
    fontWeight: '700',
  },
  captionRow: {
    marginTop: spacing.xs,
  },
  captionText: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    lineHeight: 18,
  },
  authorNameBold: {
    fontWeight: '700',
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  hashtag: {
    ...textStyles.bodySmall,
    color: colors.accent.blue,
    fontWeight: '600',
  },
  viewComments: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
