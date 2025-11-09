import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Booking {
  id: string;
  barberName: string;
  barberAvatar: string;
  service: string;
  date: string;
  time: string;
  price: number;
}

export const RescheduleBookingScreen = ({ navigation, route }: any) => {
  const { booking }: { booking: Booking } = route.params || {};

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock available dates (next 14 days)
  const getAvailableDates = (): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Mock time slots
  const getTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    hours.forEach((hour) => {
      ['00', '30'].forEach((minutes) => {
        const time = `${hour.toString().padStart(2, '0')}:${minutes}`;
        // Randomly mark some as unavailable for demo
        const available = Math.random() > 0.3;
        slots.push({ time, available });
      });
    });

    return slots;
  };

  const availableDates = getAvailableDates();
  const timeSlots = getTimeSlots();

  const formatDate = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const handleReschedule = async () => {
    if (!selectedTime) {
      Alert.alert('Select Time', 'Please select a time slot for your appointment.');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
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
    }, 1500);
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
              {booking?.barberName || 'Mike Johnson'}
            </Text>
            <Text style={styles.currentBookingText}>
              <Text style={styles.label}>Service: </Text>
              {booking?.service || 'Haircut & Beard Trim'}
            </Text>
            <Text style={styles.currentBookingText}>
              <Text style={styles.label}>Date: </Text>
              {booking?.date || 'Thu, Nov 14'}
            </Text>
            <Text style={styles.currentBookingText}>
              <Text style={styles.label}>Time: </Text>
              {booking?.time || '10:00 AM'}
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
                      colors={['#D4AF37', '#FFD700']}
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
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((slot, index) => {
              const isSelected = selectedTime === slot.time;

              if (!slot.available) {
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
                      colors={['#D4AF37', '#FFD700']}
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
});
