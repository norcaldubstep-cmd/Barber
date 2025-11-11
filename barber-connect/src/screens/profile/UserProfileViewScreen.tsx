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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const POST_SIZE = (width - spacing.lg * 3) / 3;

interface TabType {
  id: 'grid' | 'list';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TABS: TabType[] = [
  { id: 'grid', icon: 'grid-outline', label: 'Grid' },
  { id: 'list', icon: 'list-outline', label: 'List' },
];

export const UserProfileViewScreen = ({ navigation, route }: any) => {
  const { userId, isOwnProfile = false } = route.params || {};
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock user data - will be replaced with Firebase
  const user = {
    id: userId || '1',
    name: 'John Barber',
    username: '@johnbarber',
    avatar: 'https://i.pravatar.cc/150?img=12',
    isVerified: true,
    bio: 'Professional Barber | 10+ Years Experience\n✂️ Master of Fades & Classic Cuts\n📍 Los Angeles, CA',
    postsCount: 156,
    followersCount: 2847,
    followingCount: 312,
    isBarber: true,
    shopName: "John's Barbershop",
    rating: 4.9,
    reviewsCount: 328,
  };

  // Mock posts - will be replaced with Firebase
  const posts = Array.from({ length: 18 }, (_, i) => ({
    id: String(i + 1),
    imageUrl: `https://picsum.photos/400/400?random=${i}`,
    likesCount: Math.floor(Math.random() * 500) + 50,
    commentsCount: Math.floor(Math.random() * 100) + 10,
  }));

  const renderGridPost = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.gridPost}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
      <View style={styles.gridOverlay}>
        <View style={styles.gridStat}>
          <Ionicons name="heart" size={16} color="#FFF" />
          <Text style={styles.gridStatText}>{item.likesCount}</Text>
        </View>
        <View style={styles.gridStat}>
          <Ionicons name="chatbubble" size={16} color="#FFF" />
          <Text style={styles.gridStatText}>{item.commentsCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListPost = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listPost}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      activeOpacity={0.95}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.listImage} />
      <View style={styles.listContent}>
        <View style={styles.listStats}>
          <View style={styles.listStat}>
            <Ionicons name="heart-outline" size={18} color={colors.text.primary} />
            <Text style={styles.listStatText}>{item.likesCount} likes</Text>
          </View>
          <View style={styles.listStat}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.text.primary} />
            <Text style={styles.listStatText}>{item.commentsCount} comments</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{user.username}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileTop}>
            <Avatar
              name={user.name}
              size="2xl"
              verified={user.isVerified}
              showGradientBorder={user.isBarber}
              imageUrl={user.avatar}
            />

            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statBox}>
                <Text style={styles.statNumber}>{user.postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statBox}
                onPress={() => navigation.navigate('Followers', { userId: user.id, mode: 'followers' })}
              >
                <Text style={styles.statNumber}>
                  {user.followersCount >= 1000
                    ? `${(user.followersCount / 1000).toFixed(1)}K`
                    : user.followersCount}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statBox}
                onPress={() => navigation.navigate('Followers', { userId: user.id, mode: 'following' })}
              >
                <Text style={styles.statNumber}>{user.followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name & Bio */}
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.name}</Text>
              {user.isVerified && (
                <Ionicons name="checkmark-circle" size={18} color={colors.accent.blue} />
              )}
            </View>

            {user.isBarber && (
              <View style={styles.barberBadge}>
                <Ionicons name="cut" size={14} color={colors.accent.gold} />
                <Text style={styles.badgeText}>Professional Barber</Text>
              </View>
            )}

            {user.shopName && (
              <View style={styles.shopRow}>
                <Ionicons name="business" size={14} color={colors.text.secondary} />
                <Text style={styles.shopName}>{user.shopName}</Text>
              </View>
            )}

            {user.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={colors.accent.gold} />
                <Text style={styles.ratingText}>
                  {user.rating} ({user.reviewsCount} reviews)
                </Text>
              </View>
            )}

            {user.bio && <Text style={styles.bioText}>{user.bio}</Text>}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isOwnProfile ? (
              <>
                <Button
                  title="Edit Profile"
                  onPress={() => navigation.navigate('EditProfile')}
                  variant="outline"
                  size="medium"
                  fullWidth
                  icon="create-outline"
                />
              </>
            ) : (
              <>
                <View style={styles.buttonRow}>
                  <Button
                    title={isFollowing ? 'Following' : 'Follow'}
                    onPress={() => setIsFollowing(!isFollowing)}
                    variant={isFollowing ? 'outline' : 'gradient'}
                    size="medium"
                    style={styles.followButton}
                    icon={isFollowing ? 'checkmark' : 'person-add'}
                  />
                  <Button
                    title="Message"
                    onPress={() =>
                      navigation.navigate('Chat', {
                        conversationId: user.id,
                        userName: user.name,
                      })
                    }
                    variant="outline"
                    size="medium"
                    style={styles.messageButton}
                    icon="chatbubble-outline"
                  />
                </View>
                {user.isBarber && (
                  <Button
                    title="Book Appointment"
                    onPress={() =>
                      navigation.navigate('Booking', { barberId: user.id })
                    }
                    variant="gradient"
                    size="medium"
                    fullWidth
                    icon="calendar-outline"
                  />
                )}
              </>
            )}
          </View>

          {/* Quick Stats for Barbers */}
          {user.isBarber && (
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Ionicons name="calendar" size={16} color={colors.accent.blue} />
                <Text style={styles.quickStatText}>Available Today</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Ionicons name="time" size={16} color={colors.accent.green} />
                <Text style={styles.quickStatText}>Quick Response</Text>
              </View>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={24}
                color={activeTab === tab.id ? colors.accent.gold : colors.text.secondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts */}
        {activeTab === 'grid' ? (
          <View style={styles.gridContainer}>
            {posts.map((post) => (
              <View key={post.id}>{renderGridPost({ item: post })}</View>
            ))}
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderListPost}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  profileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  infoSection: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  userName: {
    ...textStyles.h3,
    fontWeight: '700',
  },
  barberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  badgeText: {
    ...textStyles.caption,
    color: colors.accent.gold,
    fontWeight: '600',
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  shopName: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  ratingText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  bioText: {
    ...textStyles.body,
    color: colors.text.primary,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  actionButtons: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  followButton: {
    flex: 1,
  },
  messageButton: {
    flex: 1,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickStatText: {
    ...textStyles.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  quickStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.medium,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent.gold,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.xs,
  },
  gridPost: {
    width: POST_SIZE,
    height: POST_SIZE,
    padding: spacing.xs,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)',
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  gridStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridStatText: {
    ...textStyles.body,
    color: '#FFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  listContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  listPost: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  listImage: {
    width: '100%',
    height: width - spacing.lg * 2,
  },
  listContent: {
    padding: spacing.md,
  },
  listStats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  listStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  listStatText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
});
