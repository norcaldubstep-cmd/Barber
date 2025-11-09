import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  barber: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
    businessName?: string;
  };
  client?: {
    id: string;
    name: string;
    avatar?: string;
  };
  service: {
    name: string;
    duration: number;
    price: number;
  };
  date: Date;
  time: string;
  status: BookingStatus;
  notes?: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    barber: {
      id: 'b1',
      name: 'Mike the Barber',
      isVerified: true,
      businessName: 'Elite Cuts Studio',
    },
    service: {
      name: 'Premium Fade',
      duration: 45,
      price: 65,
    },
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    time: '2:00 PM',
    status: 'upcoming',
    notes: 'Please do a skin fade on the sides',
  },
  {
    id: '2',
    barber: {
      id: 'b2',
      name: 'Carlos Rodriguez',
      isVerified: true,
      businessName: 'Fresh Fade Barbershop',
    },
    service: {
      name: 'Haircut & Beard Trim',
      duration: 60,
      price: 85,
    },
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    time: '10:30 AM',
    status: 'upcoming',
  },
  {
    id: '3',
    barber: {
      id: 'b3',
      name: 'James Smith',
      isVerified: false,
    },
    service: {
      name: 'Classic Cut',
      duration: 30,
      price: 45,
    },
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    time: '4:00 PM',
    status: 'completed',
  },
  {
    id: '4',
    barber: {
      id: 'b1',
      name: 'Mike the Barber',
      isVerified: true,
    },
    service: {
      name: 'Buzz Cut',
      duration: 20,
      price: 35,
    },
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    time: '3:30 PM',
    status: 'completed',
  },
];

export const BookingsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const isBarber = user?.role === UserRole.BARBER;

  const upcomingBookings = bookings.filter((b) => b.status === 'upcoming');
  const pastBookings = bookings.filter((b) => b.status !== 'upcoming');
  const displayBookings = selectedTab === 'upcoming' ? upcomingBookings : pastBookings;

  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (date: Date): number => {
    const today = new Date();
    const diff = date.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const daysUntil = getDaysUntil(item.date);
    const isUpcoming = item.status === 'upcoming';

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Avatar
            name={item.barber.name}
            size="lg"
            verified={item.barber.isVerified}
            showGradientBorder={item.barber.isVerified}
          />
          <View style={styles.bookingHeaderText}>
            <Text style={styles.barberName}>{item.barber.name}</Text>
            {item.barber.businessName && (
              <View style={styles.businessRow}>
                <Ionicons name="business" size={14} color={colors.text.secondary} />
                <Text style={styles.businessText}>{item.barber.businessName}</Text>
              </View>
            )}
            <View style={styles.serviceRow}>
              <Text style={styles.serviceName}>{item.service.name}</Text>
              <Text style={styles.serviceMeta}>
                {item.service.duration} min • ${item.service.price}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.accent.gold} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(item.date)}
                {isUpcoming && daysUntil > 0 && daysUntil <= 7 && (
                  <Text style={styles.daysUntil}> ({daysUntil}d)</Text>
                )}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color={colors.accent.blue} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{item.time}</Text>
            </View>
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="document-text-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>

        {isUpcoming && (
          <View style={styles.bookingActions}>
            <Button
              title="Reschedule"
              onPress={() => navigation.navigate('RescheduleBooking', { booking: item })}
              variant="outline"
              size="small"
              style={styles.actionButton}
              icon="calendar-outline"
            />
            <Button
              title="Message"
              onPress={() => navigation.navigate('Chat', { participant: item.barber })}
              variant="outline"
              size="small"
              style={styles.actionButton}
              icon="chatbubble-outline"
            />
            <Button
              title="Cancel"
              onPress={() => console.log('Cancel')}
              variant="danger"
              size="small"
              style={styles.cancelButton}
              icon="close-circle-outline"
            />
          </View>
        )}

        {item.status === 'completed' && (
          <View style={styles.bookingActions}>
            <Button
              title="Book Again"
              onPress={() => navigation.navigate('Booking', { barberId: item.barber.id })}
              variant="gradient"
              size="small"
              style={styles.bookAgainButton}
              icon="refresh-outline"
            />
            <Button
              title="Leave Review"
              onPress={() => console.log('Review')}
              variant="outline"
              size="small"
              style={styles.actionButton}
              icon="star-outline"
            />
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setSelectedTab('upcoming')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              selectedTab === 'upcoming'
                ? ['#D4AF37', '#FFD700']
                : [colors.background.secondary, colors.background.secondary]
            }
            style={styles.tabGradient}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'upcoming' && styles.tabTextActive,
              ]}
            >
              Upcoming ({upcomingBookings.length})
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setSelectedTab('past')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              selectedTab === 'past'
                ? ['#D4AF37', '#FFD700']
                : [colors.background.secondary, colors.background.secondary]
            }
            style={styles.tabGradient}
          >
            <Text
              style={[styles.tabText, selectedTab === 'past' && styles.tabTextActive]}
            >
              Past ({pastBookings.length})
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {displayBookings.length > 0 ? (
        <FlatList
          data={displayBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name={selectedTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
              size={64}
              color={colors.text.secondary}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {selectedTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedTab === 'upcoming'
              ? 'Find a barber and book your next appointment'
              : 'Your booking history will appear here'}
          </Text>
          {selectedTab === 'upcoming' && (
            <Button
              title="Discover Barbers"
              onPress={() => navigation.navigate('MainTabs', { screen: 'DiscoverTab' })}
              variant="gradient"
              size="medium"
              icon="search"
              style={styles.discoverButton}
            />
          )}
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
  tabsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  tab: { flex: 1 },
  tabGradient: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  tabText: { ...textStyles.body, fontWeight: '600', color: colors.text.primary },
  tabTextActive: { color: '#000', fontWeight: '700' },
  listContent: { padding: spacing.lg, paddingTop: 0 },
  bookingCard: { padding: spacing.lg, marginBottom: spacing.md },
  bookingHeader: { flexDirection: 'row', gap: spacing.md },
  bookingHeaderText: { flex: 1, gap: spacing.xs },
  barberName: { ...textStyles.body, fontWeight: '700' },
  businessRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  businessText: { ...textStyles.caption, color: colors.text.secondary },
  serviceRow: { marginTop: spacing.xs },
  serviceName: { ...textStyles.bodySmall, fontWeight: '600', color: colors.accent.gold },
  serviceMeta: { ...textStyles.caption, color: colors.text.secondary },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  bookingDetails: { gap: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1 },
  detailLabel: { ...textStyles.caption, color: colors.text.secondary, marginBottom: 2 },
  detailValue: { ...textStyles.body, fontWeight: '600' },
  daysUntil: { color: colors.accent.gold },
  notesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  notesText: { ...textStyles.bodySmall, color: colors.text.secondary, flex: 1 },
  bookingActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: { flex: 1 },
  cancelButton: { flex: 1 },
  bookAgainButton: { flex: 1 },
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
