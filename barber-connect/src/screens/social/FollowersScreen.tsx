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
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isFollowing: boolean;
  bio?: string;
  followersCount: number;
}

export const FollowersScreen = ({ navigation, route }: any) => {
  const { mode = 'followers', userId } = route.params || {};
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(mode);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Fetch followers/following from API
  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // const endpoint = activeTab === 'followers'
        //   ? `/api/users/${userId}/followers`
        //   : `/api/users/${userId}/following`;
        // const response = await fetch(endpoint);
        // const data = await response.json();
        // setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, userId]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollow = async (userId: string) => {
    // TODO: Call follow/unfollow API
    // const response = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });

    // Optimistic update
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigation.navigate('BarberProfile', { barberId: item.id })}
      activeOpacity={0.7}
    >
      <Avatar
        imageUrl={item.avatar}
        name={item.name}
        size="lg"
        verified={item.isVerified}
        showGradientBorder={item.isVerified}
      />

      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color={colors.accent.blue} />
          )}
        </View>
        <Text style={styles.username} numberOfLines={1}>
          {item.username}
        </Text>
        {item.bio && (
          <Text style={styles.bio} numberOfLines={1}>
            {item.bio}
          </Text>
        )}
        <Text style={styles.followersCount}>
          {item.followersCount.toLocaleString()} followers
        </Text>
      </View>

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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'followers' ? 'Followers' : 'Following'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
            Followers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.accent.gold,
  },
  tabText: {
    ...textStyles.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.accent.gold,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  searchInput: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  userName: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  username: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  bio: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  followersCount: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  followButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    minWidth: 90,
    alignItems: 'center',
  },
  followText: {
    ...textStyles.bodySmall,
    fontWeight: '700',
    color: '#000',
  },
  followingButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    minWidth: 90,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
});
