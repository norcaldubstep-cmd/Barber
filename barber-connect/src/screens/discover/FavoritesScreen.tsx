import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { MOCK_BARBERS } from '../../utils/mockData';
import { BarberProfile } from '../../types/barber.types';

export const FavoritesScreen = ({ navigation }: any) => {
  // In real app, this would come from state/API
  const [favorites, setFavorites] = useState<BarberProfile[]>(MOCK_BARBERS.slice(0, 4));

  const removeFavorite = (barberId: string) => {
    setFavorites(favorites.filter((b) => b.id !== barberId));
  };

  const renderBarber = ({ item }: { item: BarberProfile }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('BarberProfile', { barberId: item.id })}
    >
      <Card style={styles.barberCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Avatar
            name={item.displayName}
            size="xl"
            verified={item.isVerified}
            showGradientBorder={item.promotionTier !== 'FREE'}
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => removeFavorite(item.id)}
          >
            <Ionicons name="heart" size={24} color={colors.accent.red} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.barberInfo}>
          <Text style={styles.barberName}>{item.displayName}</Text>
          {item.worksAt && (
            <View style={styles.worksAtRow}>
              <Ionicons name="business" size={14} color={colors.text.secondary} />
              <Text style={styles.worksAtText}>{item.worksAt}</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color={colors.accent.gold} />
              <Text style={styles.statText}>
                {item.rating} ({item.totalReviews})
              </Text>
            </View>
            {item.distance !== undefined && (
              <View style={styles.stat}>
                <Ionicons name="location" size={16} color={colors.accent.blue} />
                <Text style={styles.statText}>{item.distance.toFixed(1)} mi</Text>
              </View>
            )}
          </View>

          {/* Specialties */}
          {item.specialties && item.specialties.length > 0 && (
            <View style={styles.specialtiesRow}>
              {item.specialties.slice(0, 3).map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
              {item.specialties.length > 3 && (
                <Text style={styles.moreText}>+{item.specialties.length - 3}</Text>
              )}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Book Now"
            onPress={() => navigation.navigate('Booking', { barberId: item.id })}
            variant="gradient"
            size="medium"
            style={styles.bookButton}
            icon="calendar"
          />
          <Button
            title="Message"
            onPress={() =>
              navigation.navigate('Chat', {
                participant: {
                  id: item.id,
                  name: item.displayName,
                  isVerified: item.isVerified,
                },
              })
            }
            variant="outline"
            size="medium"
            style={styles.messageButton}
            icon="chatbubble-outline"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Banner */}
      {favorites.length > 0 && (
        <LinearGradient
          colors={['#D4AF37', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsBanner}
        >
          <View style={styles.statsContent}>
            <Ionicons name="heart" size={32} color="#000" />
            <View style={styles.statsText}>
              <Text style={styles.statsCount}>{favorites.length}</Text>
              <Text style={styles.statsLabel}>
                Favorite {favorites.length === 1 ? 'Barber' : 'Barbers'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* Favorites List */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderBarber}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={64} color={colors.text.secondary} />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite barbers to quickly book with them again
          </Text>
          <Button
            title="Discover Barbers"
            onPress={() => navigation.navigate('MainTabs', { screen: 'DiscoverTab' })}
            variant="gradient"
            size="medium"
            icon="search"
            style={styles.discoverButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...textStyles.h2, fontWeight: '700' },
  statsBanner: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  statsContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statsText: { flex: 1 },
  statsCount: { fontSize: 32, fontWeight: '900', color: '#000', marginBottom: 2 },
  statsLabel: { ...textStyles.body, color: 'rgba(0,0,0,0.7)', fontWeight: '600' },
  listContent: { padding: spacing.lg, paddingTop: 0 },
  barberCard: { padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  barberInfo: { alignItems: 'center', marginBottom: spacing.md },
  barberName: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.xs },
  worksAtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  worksAtText: { ...textStyles.bodySmall, color: colors.text.secondary },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statText: { ...textStyles.bodySmall, fontWeight: '600' },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  specialtyTag: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  specialtyText: { ...textStyles.caption, color: colors.text.primary, fontWeight: '600' },
  moreText: { ...textStyles.caption, color: colors.text.secondary, marginLeft: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  bookButton: { flex: 2 },
  messageButton: { flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  discoverButton: { minWidth: 200 },
});
