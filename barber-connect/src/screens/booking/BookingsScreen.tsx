import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import {
  getClientBookings,
  getBarberBookings,
  cancelBooking,
  approveBooking,
  denyBooking,
} from '../../services/bookingService';
import { Booking, BookingStatus } from '../../types/booking.types';

export const BookingsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isBarber = user?.role === UserRole.BARBER;

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allBookings = isBarber
        ? await getBarberBookings(user.id)
        : await getClientBookings(user.id);
      setBookings(allBookings);
    } catch (error) {
      // console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = (booking: Booking) => {
    const message = isBarber
      ? `Are you sure you want to cancel the appointment with ${booking.clientName}?`
      : `Are you sure you want to cancel your appointment with ${booking.barberName}?`;

    Alert.alert('Cancel Booking', message, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBooking(booking.id);
            Alert.alert('Success', 'Booking has been cancelled');
            fetchBookings();
          } catch (error) {
            // console.error('Error cancelling booking:', error);
            Alert.alert('Error', 'Failed to cancel booking. Please try again.');
          }
        },
      },
    ]);
  };

  const handleApproveBooking = async (booking: Booking) => {
    Alert.alert('Approve Booking', `Confirm appointment with ${booking.clientName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            await approveBooking(booking.id);
            Alert.alert('Success', 'Booking has been approved');
            fetchBookings();
          } catch (error) {
            // console.error('Error approving booking:', error);
            Alert.alert('Error', 'Failed to approve booking. Please try again.');
          }
        },
      },
    ]);
  };

  const handleDenyBooking = (booking: Booking) => {
    Alert.prompt(
      'Deny Booking',
      `Why are you denying the appointment with ${booking.clientName}? (optional)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny',
          style: 'destructive',
          onPress: async (reason?: string) => {
            try {
              await denyBooking(booking.id, reason);
              Alert.alert('Success', 'Booking has been denied');
              fetchBookings();
            } catch (error) {
              // console.error('Error denying booking:', error);
              Alert.alert('Error', 'Failed to deny booking. Please try again.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
  );
  const pastBookings = bookings.filter(
    (b) =>
      b.status === BookingStatus.COMPLETED ||
      b.status === BookingStatus.CANCELLED ||
      b.status === BookingStatus.DENIED
  );
  const displayBookings = selectedTab === 'upcoming' ? upcomingBookings : pastBookings;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
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

  const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString);
    const today = new Date();
    const diff = date.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const daysUntil = getDaysUntil(item.date);
    const isUpcoming = item.status === BookingStatus.PENDING || item.status === BookingStatus.CONFIRMED;
    const isPending = item.status === BookingStatus.PENDING;
    const primaryService = item.services[0];

    // Show different info based on user role
    const displayName = isBarber ? item.clientName : item.barberName;
    const displayAvatar = isBarber ? item.clientAvatar : item.barberAvatar;

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Avatar
            name={displayName}
            size="lg"
            verified={!isBarber}
            showGradientBorder={!isBarber}
            imageUrl={displayAvatar}
          />
          <View style={styles.bookingHeaderText}>
            <Text style={styles.barberName}>{displayName}</Text>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceName}>{primaryService.name}</Text>
              <Text style={styles.serviceMeta}>
                {item.totalDuration} min • ${item.totalPrice}
              </Text>
            </View>
          </View>
          {/* Status Badge */}
          {item.status === BookingStatus.PENDING && (
            <View style={[styles.statusBadge, styles.statusPending]}>
              <Ionicons name="time-outline" size={14} color={colors.accent.gold} />
              <Text style={styles.statusText}>Pending</Text>
            </View>
          )}
          {item.status === BookingStatus.DENIED && (
            <View style={[styles.statusBadge, styles.statusDenied]}>
              <Ionicons name="close-circle" size={14} color={colors.error} />
              <Text style={[styles.statusText, { color: colors.error }]}>Denied</Text>
            </View>
          )}
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
              <Text style={styles.detailValue}>{formatTime12Hour(item.startTime)}</Text>
            </View>
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="document-text-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          {item.denialReason && item.status === BookingStatus.DENIED && (
            <View style={[styles.notesContainer, { backgroundColor: colors.error + '10' }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.error} />
              <Text style={[styles.notesText, { color: colors.error }]}>
                Denial reason: {item.denialReason}
              </Text>
            </View>
          )}
        </View>

        {isUpcoming && isBarber && isPending && (
          <View style={styles.bookingActions}>
            <Button
              title="Approve"
              onPress={() => handleApproveBooking(item)}
              variant="gradient"
              size="small"
              style={styles.approveButton}
              icon="checkmark-circle-outline"
            />
            <Button
              title="Deny"
              onPress={() => handleDenyBooking(item)}
              variant="danger"
              size="small"
              style={styles.denyButton}
              icon="close-circle-outline"
            />
            <Button
              title="Message"
              onPress={() =>
                navigation.navigate('Chat', {
                  participantId: item.clientId,
                  participantName: item.clientName,
                })
              }
              variant="outline"
              size="small"
              style={styles.messageButtonSmall}
              icon="chatbubble-outline"
            />
          </View>
        )}

        {isUpcoming && isBarber && !isPending && (
          <View style={styles.bookingActions}>
            <Button
              title="Message"
              onPress={() =>
                navigation.navigate('Chat', {
                  participantId: item.clientId,
                  participantName: item.clientName,
                })
              }
              variant="outline"
              size="small"
              style={styles.actionButton}
              icon="chatbubble-outline"
            />
            <Button
              title="Cancel"
              onPress={() => handleCancelBooking(item)}
              variant="danger"
              size="small"
              style={styles.cancelButton}
              icon="close-circle-outline"
            />
          </View>
        )}

        {isUpcoming && !isBarber && (
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
              onPress={() =>
                navigation.navigate('Chat', {
                  participantId: item.barberId,
                  participantName: item.barberName,
                })
              }
              variant="outline"
              size="small"
              style={styles.actionButton}
              icon="chatbubble-outline"
            />
            <Button
              title="Cancel"
              onPress={() => handleCancelBooking(item)}
              variant="danger"
              size="small"
              style={styles.cancelButton}
              icon="close-circle-outline"
            />
          </View>
        )}

        {item.status === BookingStatus.COMPLETED && (
          <View style={styles.bookingActions}>
            <Button
              title="Book Again"
              onPress={() => navigation.navigate('Booking', { barberId: item.barberId })}
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : displayBookings.length > 0 ? (
        <FlatList
          data={displayBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
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
  approveButton: { flex: 1 },
  denyButton: { flex: 1 },
  messageButtonSmall: { flex: 0.8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  statusPending: {
    backgroundColor: colors.accent.gold + '20',
  },
  statusDenied: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
    color: colors.accent.gold,
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
