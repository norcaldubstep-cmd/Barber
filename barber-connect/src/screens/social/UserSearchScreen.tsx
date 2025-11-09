import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface SearchResult {
  id: string;
  type: 'user' | 'hashtag';
  name: string;
  username?: string;
  avatar?: string;
  isVerified?: boolean;
  followersCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
}

const MOCK_RECENT_SEARCHES: SearchResult[] = [
  {
    id: '1',
    type: 'user',
    name: 'Mike Johnson',
    username: '@mikethebarber',
    avatar: 'https://i.pravatar.cc/150?img=12',
    isVerified: true,
    followersCount: 2453,
    isFollowing: true,
  },
  {
    id: '2',
    type: 'hashtag',
    name: 'fade',
    postsCount: 12543,
  },
  {
    id: '3',
    type: 'user',
    name: 'James Smith',
    username: '@jamescuts',
    avatar: 'https://i.pravatar.cc/150?img=13',
    isVerified: false,
    followersCount: 1823,
    isFollowing: false,
  },
];

const MOCK_SUGGESTED_USERS: SearchResult[] = [
  {
    id: '4',
    type: 'user',
    name: 'Sarah Chen',
    username: '@sarahstyles',
    avatar: 'https://i.pravatar.cc/150?img=45',
    isVerified: true,
    followersCount: 3421,
    isFollowing: false,
  },
  {
    id: '5',
    type: 'user',
    name: 'Marcus Wright',
    username: '@marcuscuts',
    avatar: 'https://i.pravatar.cc/150?img=15',
    isVerified: true,
    followersCount: 5632,
    isFollowing: false,
  },
];

const TRENDING_HASHTAGS = [
  { name: 'fade', count: 12543 },
  { name: 'barberlife', count: 8932 },
  { name: 'menshair', count: 7821 },
  { name: 'barbershop', count: 6543 },
  { name: 'hairstyle', count: 5234 },
];

export const UserSearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>(MOCK_RECENT_SEARCHES);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Mock search results
    const results = [
      ...MOCK_SUGGESTED_USERS,
      ...MOCK_RECENT_SEARCHES,
    ].filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.username && item.username.toLowerCase().includes(query.toLowerCase()))
    );

    setSearchResults(results);
  };

  const handleFollow = (userId: string) => {
    const updateList = (list: SearchResult[]) =>
      list.map((item) =>
        item.id === userId && item.type === 'user'
          ? { ...item, isFollowing: !item.isFollowing }
          : item
      );

    setSearchResults(updateList);
    setRecentSearches(updateList);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const renderUserResult = (item: SearchResult) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigation.navigate('BarberProfile', { barberId: item.id })}
      activeOpacity={0.7}
    >
      <Avatar
        imageUrl={item.avatar}
        name={item.name}
        size="md"
        verified={item.isVerified}
        showGradientBorder={item.isVerified}
      />

      <View style={styles.resultInfo}>
        <View style={styles.resultNameRow}>
          <Text style={styles.resultName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color={colors.accent.blue} />
          )}
        </View>
        {item.username && (
          <Text style={styles.resultUsername} numberOfLines={1}>
            {item.username}
          </Text>
        )}
        {item.followersCount && (
          <Text style={styles.resultFollowers}>
            {item.followersCount.toLocaleString()} followers
          </Text>
        )}
      </View>

      {item.isFollowing !== undefined && (
        <TouchableOpacity
          onPress={() => handleFollow(item.id)}
          activeOpacity={0.8}
        >
          {item.isFollowing ? (
            <View style={styles.followingButton}>
              <Text style={styles.followingText}>Following</Text>
            </View>
          ) : (
            <LinearGradient
              colors={['#D4AF37', '#FFD700']}
              style={styles.followButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.followText}>Follow</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderHashtagResult = (item: SearchResult) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => console.log('Navigate to hashtag:', item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.hashtagIcon}>
        <Ionicons name="pricetag" size={24} color={colors.accent.gold} />
      </View>

      <View style={styles.resultInfo}>
        <Text style={styles.hashtagName}>#{item.name}</Text>
        {item.postsCount && (
          <Text style={styles.resultFollowers}>
            {item.postsCount.toLocaleString()} posts
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: SearchResult }) =>
    item.type === 'user' ? renderUserResult(item) : renderHashtagResult(item);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, hashtags..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={searchQuery ? searchResults : recentSearches}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {!searchQuery && recentSearches.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            )}

            {!searchQuery && recentSearches.length === 0 && (
              <>
                {/* Trending Hashtags */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Trending Hashtags</Text>
                  <View style={styles.hashtagsGrid}>
                    {TRENDING_HASHTAGS.map((tag, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.trendingHashtag}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.trendingHashtagText}>#{tag.name}</Text>
                        <Text style={styles.trendingHashtagCount}>
                          {tag.count.toLocaleString()} posts
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Suggested Users */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Suggested for You</Text>
                </View>
              </>
            )}
          </>
        }
        ListEmptyComponent={
          searchQuery ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>
                Try searching for something else
              </Text>
            </View>
          ) : null
        }
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
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  searchInput: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  clearText: {
    ...textStyles.body,
    color: colors.accent.gold,
    fontWeight: '600',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultInfo: {
    flex: 1,
  },
  resultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  resultName: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  resultUsername: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  resultFollowers: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  hashtagIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hashtagName: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  followButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    minWidth: 80,
    alignItems: 'center',
  },
  followText: {
    ...textStyles.bodySmall,
    fontWeight: '700',
    color: '#000',
  },
  followingButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  followingText: {
    ...textStyles.bodySmall,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  hashtagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trendingHashtag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  trendingHashtagText: {
    ...textStyles.body,
    color: colors.accent.gold,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  trendingHashtagCount: {
    ...textStyles.caption,
    color: colors.text.tertiary,
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
});
