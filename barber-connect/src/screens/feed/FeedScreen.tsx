import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/common/Avatar';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { Post, PostType } from '../../types/post.types';
import { getFeedPosts, toggleLike, toggleSave } from '../../services/postsService';
import type { Post as FirebasePost } from '../../services/postsService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;

const CATEGORIES = [
  { id: 'all', label: 'All Posts', icon: 'apps' },
  { id: 'trending', label: 'Trending', icon: 'flame' },
  { id: 'nearby', label: 'Nearby', icon: 'location' },
  { id: 'following', label: 'Following', icon: 'people' },
];

export const FeedScreen = ({ navigation }: any) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const { posts: fetchedPosts } = await getFeedPosts();

      // Transform Firebase posts to match UI Post type
      const transformedPosts = fetchedPosts.map((firebasePost: FirebasePost) => ({
        id: firebasePost.id,
        authorId: firebasePost.authorId,
        authorName: firebasePost.authorName,
        authorAvatar: firebasePost.authorAvatar,
        isVerified: firebasePost.isVerified,
        promotionTier: 'FREE',
        type: PostType.IMAGE,
        caption: firebasePost.caption,
        hashtags: firebasePost.hashtags,
        mentions: [],
        media: firebasePost.imageUrls.map((url: string, index: number) => ({
          id: `${firebasePost.id}_${index}`,
          type: 'image',
          url,
        })),
        likesCount: firebasePost.likesCount,
        commentsCount: firebasePost.commentsCount,
        sharesCount: firebasePost.sharesCount || 0,
        savesCount: firebasePost.savesCount,
        viewsCount: 0,
        isLiked: firebasePost.liked || false,
        isSaved: firebasePost.saved || false,
        location: firebasePost.location,
        createdAt: firebasePost.createdAt.toISOString(),
        updatedAt: firebasePost.updatedAt.toISOString(),
      }));

      setPosts(transformedPosts);
    } catch (error) {
      // console.error('Error loading feed:', error);
      Alert.alert('Error', 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFeed();
    } catch (error) {
      // console.error('Error refreshing feed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      )
    );

    try {
      await toggleLike(postId, post.isLiked);
    } catch (error) {
      // console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: post.isLiked,
                likesCount: post.likesCount,
              }
            : p
        )
      );
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleSave = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isSaved: !p.isSaved,
              savesCount: p.isSaved ? p.savesCount - 1 : p.savesCount + 1,
            }
          : p
      )
    );

    try {
      await toggleSave(postId, post.isSaved);
    } catch (error) {
      // console.error('Error toggling save:', error);
      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isSaved: post.isSaved,
                savesCount: post.savesCount,
              }
            : p
        )
      );
      Alert.alert('Error', 'Failed to update save. Please try again.');
    }
  };

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.7}
    >
      {selectedCategory === item.id ? (
        <LinearGradient
          colors={['#D4AF37', '#E8C869']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          <Ionicons name={item.icon as any} size={16} color="#000" />
          <Text style={styles.categoryTextActive}>{item.label}</Text>
        </LinearGradient>
      ) : (
        <>
          <Ionicons name={item.icon as any} size={16} color={colors.text.secondary} />
          <Text style={styles.categoryText}>{item.label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <Card style={styles.postCard}>
      {/* Card Header - Author Info */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => navigation.navigate('BarberProfile', { barberId: item.authorId })}
        activeOpacity={0.9}
      >
        <Avatar
          name={item.authorName}
          size="md"
          verified={item.isVerified}
          showGradientBorder={item.promotionTier !== 'FREE'}
        />
        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <Text style={styles.authorName} numberOfLines={1}>
              {item.authorName}
            </Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.accent.blue} />
            )}
            {item.promotionTier && item.promotionTier !== 'FREE' && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={10} color="#000" />
              </View>
            )}
          </View>
          <Text style={styles.postMeta} numberOfLines={1}>
            2h ago {item.location && `• ${item.location.name}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Post Image */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        activeOpacity={0.95}
      >
        {item.type === PostType.VIDEO && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
          </View>
        )}
        <Image
          source={{ uri: item.media[0].url }}
          style={styles.postImage}
          resizeMode="cover"
        />
        {item.media.length > 1 && (
          <View style={styles.multiImageIndicator}>
            <Ionicons name="images" size={16} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>

      {/* Post Content */}
      <View style={styles.cardContent}>
        {/* Caption */}
        {item.caption && (
          <TouchableOpacity
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          >
            <Text style={styles.captionText} numberOfLines={2}>
              {item.caption}
            </Text>
          </TouchableOpacity>
        )}

        {/* Hashtags */}
        {item.hashtags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.hashtagsScroll}
            contentContainerStyle={styles.hashtagsContent}
          >
            {item.hashtags.map((tag, index) => (
              <View key={index} style={styles.hashtagChip}>
                <Text style={styles.hashtagText}>#{tag}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Stats & Actions */}
        <View style={styles.statsActionsRow}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color={colors.social.like} />
              <Text style={styles.statText}>{item.likesCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={16} color={colors.accent.blue} />
              <Text style={styles.statText}>{item.commentsCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color={colors.text.secondary} />
              <Text style={styles.statText}>{item.viewsCount}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, item.isLiked && styles.actionBtnActive]}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={item.isLiked ? colors.social.like : colors.text.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="paper-plane-outline" size={20} color={colors.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, item.isSaved && styles.actionBtnActive]}
              onPress={() => handleSave(item.id)}
            >
              <Ionicons
                name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={item.isSaved ? colors.accent.gold : colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#D4AF37', '#E8C869']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Ionicons name="cut" size={20} color="#000" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Community</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Stories')}
          >
            <LinearGradient
              colors={['#D4AF37', '#E8C869']}
              style={styles.storiesIconGradient}
            >
              <Ionicons name="images-outline" size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('UserSearch')}
          >
            <Ionicons name="search-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.gold}
            />
          }
          contentContainerStyle={styles.feedContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color={colors.text.secondary} />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Follow some barbers to see their posts</Text>
            </View>
          }
        />
      )}

      {/* FAB - Create Post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('MainTabs', { screen: 'CreateTab' })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#D4AF37', '#E8C869']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#000" />
        </LinearGradient>
      </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerButton: {
    position: 'relative',
  },
  storiesIconGradient: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.social.like,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingVertical: spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  categoryGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    ...textStyles.bodySmall,
    color: '#000',
    fontWeight: '700',
  },
  feedContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  postCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
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
  premiumBadge: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postMeta: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  moreButton: {
    padding: spacing.xs,
  },
  imageContainer: {
    position: 'relative',
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.75,
    backgroundColor: colors.background.secondary,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  multiImageIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  captionText: {
    ...textStyles.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  hashtagsScroll: {
    marginHorizontal: -spacing.md,
  },
  hashtagsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  hashtagChip: {
    backgroundColor: colors.accent.blue + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  hashtagText: {
    ...textStyles.caption,
    color: colors.accent.blue,
    fontWeight: '600',
  },
  statsActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    backgroundColor: colors.accent.gold + '20',
  },
  fab: {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing.lg,
    borderRadius: borderRadius.full,
    ...shadows.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    marginTop: spacing['4xl'],
  },
  emptyText: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
