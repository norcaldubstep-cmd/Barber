import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { getAvailableTimeSlots, cancelBooking, createBooking } from '../../services/bookingService';
import { Booking, TimeSlot } from '../../types/booking.types';
import { useAuthStore } from '../../store/authStore';

export const RescheduleBookingScreen = ({ navigation, route }: any) => {
  const { booking }: { booking: Booking } = route.params || {};
  const { user } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Generate next 14 days for selection (will check availability when date is clicked)
  useEffect(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setAvailableDates(dates);

    // Set tomorrow as default selected date
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, []);

  // Fetch time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!booking || !selectedDate) return;

      try {
        setLoadingTimeSlots(true);
        const dateString = selectedDate.toISOString().split('T')[0];
        const slots = await getAvailableTimeSlots(booking.barberId, dateString);

        // Convert to display format (12-hour time)
        const formattedSlots = slots.map(slot => ({
          time: formatTime12Hour(slot.time),
          isAvailable: slot.isAvailable,
          barberId: slot.barberId,
        }));

        setTimeSlots(formattedSlots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        Alert.alert('Error', 'Failed to load available time slots');
        setTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, booking]);

  const formatDate = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const convert12to24Hour = (time12: string): string => {
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleReschedule = async () => {
    if (!selectedTime) {
      Alert.alert('Select Time', 'Please select a time slot for your appointment.');
      return;
    }

    if (!user || !booking) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    try {
      setLoading(true);

      const dateString = selectedDate.toISOString().split('T')[0];
      const startTime24 = convert12to24Hour(selectedTime);

      // Cancel old booking and create new one
      await cancelBooking(booking.id);

      await createBooking(
        user.id,
        user.displayName || 'Guest',
        booking.barberId,
        booking.barberName,
        booking.services,
        dateString,
        startTime24,
        booking.notes,
        user.profileImage,
        booking.barberAvatar
      );

      Alert.alert(
        'Booking Rescheduled',
        `Your appointment has been rescheduled to ${formatDate(selectedDate)} at ${selectedTime}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Reschedule error:', error);
      Alert.alert(
        'Reschedule Failed',
        'Failed to reschedule booking. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reschedule Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Booking Info */}
        <View style={styles.currentBookingCard}>
          <View style={styles.currentBookingHeader}>
            <Ionicons name="information-circle" size={24} color={colors.accent.gold} />
            <Text style={styles.currentBookingTitle}>Current Appointment</Text>
          </View>
          <View style={styles.currentBookingInfo}>
            <Text style={styles.currentBookingText}>
              <Text style={styles.label}>Barber: </Text>
              {booking?.barberName}
            </Text>
            <Text style={styles.currentBookingText}>
              <Text style={styles.label}>Service: </Text>
              {booking?.services[0]?.name}
            </Text>
            <Text style={styles.currentBookingText}>
              <Text style={styles.label}>Date: </Text>
              {booking?.date && new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={styles.currentBookingText}>
              <Text style={styles.label}>Time: </Text>
              {booking?.startTime && formatTime12Hour(booking.startTime)}
            </Text>
          </View>
        </View>

        {/* Select New Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select New Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
            {availableDates.map((date, index) => {
              const isSelected =
                selectedDate.toDateString() === date.toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#D4AF37', '#E8C869']}
                      style={styles.dateCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={[styles.dateDay, { color: '#000' }]}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={[styles.dateNumber, { color: '#000' }]}>
                        {date.getDate()}
                      </Text>
                      <Text style={[styles.dateMonth, { color: '#000' }]}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.dateCard, styles.dateCardInactive]}>
                      <Text style={styles.dateDay}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={styles.dateNumber}>{date.getDate()}</Text>
                      <Text style={styles.dateMonth}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Select Time Slot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          {loadingTimeSlots ? (
            <View style={styles.timeSlotsLoading}>
              <ActivityIndicator size="large" color={colors.accent.gold} />
              <Text style={styles.loadingText}>Loading available times...</Text>
            </View>
          ) : timeSlots.length === 0 ? (
            <View style={styles.noSlotsContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.noSlotsText}>No available time slots for this date</Text>
              <Text style={styles.noSlotsSubtext}>Please select a different date</Text>
            </View>
          ) : (
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((slot, index) => {
                const isSelected = selectedTime === slot.time;

                if (!slot.isAvailable) {
                  return (
                    <View key={index} style={[styles.timeSlot, styles.timeSlotUnavailable]}>
                      <Text style={styles.timeSlotTextUnavailable}>{slot.time}</Text>
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedTime(slot.time)}
                    activeOpacity={0.7}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={['#D4AF37', '#E8C869']}
                        style={styles.timeSlot}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={[styles.timeSlotText, { color: '#000' }]}>{slot.time}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.timeSlot, styles.timeSlotAvailable]}>
                        <Text style={styles.timeSlotText}>{slot.time}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Reschedule Policy */}
        <View style={styles.policyCard}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.accent.blue} />
          <Text style={styles.policyText}>
            You can reschedule your appointment up to 2 hours before the scheduled time without any
            charges.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Confirm Reschedule"
          onPress={handleReschedule}
          variant="gradient"
          size="large"
          fullWidth
          loading={loading}
          disabled={!selectedTime || loading}
        />
      </View>
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
  content: {
    flex: 1,
  },
  currentBookingCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  currentBookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  currentBookingTitle: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.accent.gold,
  },
  currentBookingInfo: {
    gap: spacing.xs,
  },
  currentBookingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  label: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  datesScroll: {
    paddingLeft: spacing.lg,
  },
  dateCard: {
    width: 80,
    height: 100,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  dateCardInactive: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  dateDay: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  dateNumber: {
    ...textStyles.h2,
    fontWeight: '900',
    color: colors.text.primary,
  },
  dateMonth: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  timeSlot: {
    width: '31%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotAvailable: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  timeSlotUnavailable: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timeSlotText: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  timeSlotTextUnavailable: {
    ...textStyles.body,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.blue,
  },
  policyText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  timeSlotsLoading: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  noSlotsContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  noSlotsText: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  noSlotsSubtext: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
});
