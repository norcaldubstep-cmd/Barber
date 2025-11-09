import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - spacing.lg * 3) / 2;

interface SavedPost {
  id: string;
  imageUrl: string;
  authorName: string;
  likesCount: number;
  savedAt: Date;
}

const MOCK_SAVED_POSTS: SavedPost[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    authorName: 'Mike Johnson',
    likesCount: 342,
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/400/600?random=2',
    authorName: 'James Smith',
    likesCount: 287,
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/400/600?random=3',
    authorName: 'Sarah Chen',
    likesCount: 423,
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: '4',
    imageUrl: 'https://picsum.photos/400/600?random=4',
    authorName: 'Marcus Wright',
    likesCount: 512,
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '5',
    imageUrl: 'https://picsum.photos/400/600?random=5',
    authorName: 'Chris Brown',
    likesCount: 198,
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: '6',
    imageUrl: 'https://picsum.photos/400/600?random=6',
    authorName: 'David Lee',
    likesCount: 265,
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

export const SavedPostsScreen = ({ navigation }: any) => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>(MOCK_SAVED_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recent' | 'popular'>('all');

  const handleUnsave = (postId: string) => {
    setSavedPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const filteredPosts = savedPosts.filter((post) => {
    if (selectedCategory === 'recent') {
      const dayAgo = Date.now() - 1000 * 60 * 60 * 24;
      return post.savedAt.getTime() > dayAgo;
    }
    if (selectedCategory === 'popular') {
      return post.likesCount > 300;
    }
    return true;
  });

  const renderPost = ({ item }: { item: SavedPost }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      activeOpacity={0.9}
      onLongPress={() => handleUnsave(item.id)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={16} color="#FFF" />
            <Text style={styles.statText}>{item.likesCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Posts</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[styles.categoryPill, selectedCategory === 'all' && styles.activePill]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[styles.categoryText, selectedCategory === 'all' && styles.activeCategoryText]}
          >
            All Posts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryPill, selectedCategory === 'recent' && styles.activePill]}
          onPress={() => setSelectedCategory('recent')}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'recent' && styles.activeCategoryText,
            ]}
          >
            Recent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryPill, selectedCategory === 'popular' && styles.activePill]}
          onPress={() => setSelectedCategory('popular')}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'popular' && styles.activeCategoryText,
            ]}
          >
            Popular
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts Grid */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No saved posts</Text>
            <Text style={styles.emptySubtext}>
              Posts you save will appear here
            </Text>
          </View>
        }
      />

      {/* Info Footer */}
      {savedPosts.length > 0 && (
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.footerText}>
            Long press on a post to remove it from saved
          </Text>
        </View>
      )}
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
  categoriesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  activePill: {
    backgroundColor: colors.accent.gold,
    borderColor: colors.accent.gold,
  },
  categoryText: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeCategoryText: {
    color: '#000',
    fontWeight: '700',
  },
  gridContent: {
    padding: spacing.lg,
  },
  columnWrapper: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  postItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.3,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  postStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...textStyles.caption,
    color: '#FFF',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  emptyText: {
    ...textStyles.h3,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  emptySubtext: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
});
