import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { BarberProfile, Service } from '../../types/barber.types';
import { getBarberProfile } from '../../services/barberService';
import { createBooking, getAvailableTimeSlots } from '../../services/bookingService';
import { TimeSlot } from '../../types/booking.types';
import { useAuthStore } from '../../store/authStore';

export const BookingScreen = ({ route, navigation }: any) => {
  const { barberId } = route.params;
  const { user } = useAuthStore();

  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'service' | 'datetime' | 'confirm'>('service');
  const [loading, setLoading] = useState(false);
  const [loadingBarber, setLoadingBarber] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Fetch barber profile on mount
  useEffect(() => {
    const fetchBarber = async () => {
      try {
        setLoadingBarber(true);
        const barberProfile = await getBarberProfile(barberId);
        if (barberProfile) {
          setBarber(barberProfile);
        } else {
          Alert.alert('Error', 'Barber not found');
          navigation.goBack();
        }
      } catch (error) {
        // console.error('Error fetching barber:', error);
        Alert.alert('Error', 'Failed to load barber profile. Please try again.');
        navigation.goBack();
      } finally {
        setLoadingBarber(false);
      }
    };

    fetchBarber();
  }, [barberId]);

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!barberId || !selectedDate) return;

      try {
        setLoadingTimeSlots(true);
        const dateString = selectedDate.toISOString().split('T')[0];
        const slots = await getAvailableTimeSlots(barberId, dateString);

        // Convert to display format (12-hour time)
        const formattedSlots = slots.map(slot => ({
          time: formatTime12Hour(slot.time),
          isAvailable: slot.isAvailable,
          barberId: slot.barberId,
        }));

        setTimeSlots(formattedSlots);
      } catch (error) {
        // console.error('Error fetching time slots:', error);
        Alert.alert('Error', 'Failed to load available time slots');
        setTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    if (step === 'datetime') {
      fetchTimeSlots();
    }
  }, [barberId, selectedDate, step]);

  // Generate next 14 days for calendar
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

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

  const formatDate = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const formatFullDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleContinue = () => {
    if (step === 'service' && selectedService) {
      setStep('datetime');
    } else if (step === 'datetime' && selectedDate && selectedTime) {
      setStep('confirm');
    }
  };

  const handleBooking = async () => {
    if (!user || !barber || !selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Missing required booking information');
      return;
    }

    try {
      setLoading(true);

      const dateString = selectedDate.toISOString().split('T')[0];
      const startTime24 = convert12to24Hour(selectedTime);

      await createBooking(
        user.id,
        `${user.firstName} ${user.lastName}` || 'Guest',
        barberId,
        barber.displayName,
        [selectedService],
        dateString,
        startTime24,
        notes || undefined,
        user.profileImageUrl,
        barber.profileImage
      );

      Alert.alert(
        'Booking Confirmed!',
        `Your appointment with ${barber.displayName} has been booked for ${formatFullDate(selectedDate)} at ${selectedTime}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs', {
              screen: 'BookingsTab',
              params: { bookingConfirmed: true },
            }),
          },
        ]
      );
    } catch (error) {
      // console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed',
        'Failed to create booking. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (): number => {
    return selectedService?.price || 0;
  };

  if (loadingBarber) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading barber profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!barber) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width:
                  step === 'service' ? '33%' : step === 'datetime' ? '66%' : '100%',
              },
            ]}
          />
        </View>
        <View style={styles.progressSteps}>
          <View style={styles.progressStep}>
            <View
              style={[
                styles.stepCircle,
                step === 'service' && styles.stepCircleActive,
                (step === 'datetime' || step === 'confirm') && styles.stepCircleComplete,
              ]}
            >
              {step === 'datetime' || step === 'confirm' ? (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              ) : (
                <Text style={styles.stepNumber}>1</Text>
              )}
            </View>
            <Text style={styles.stepLabel}>Service</Text>
          </View>
          <View style={styles.progressStep}>
            <View
              style={[
                styles.stepCircle,
                step === 'datetime' && styles.stepCircleActive,
                step === 'confirm' && styles.stepCircleComplete,
              ]}
            >
              {step === 'confirm' ? (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              ) : (
                <Text style={styles.stepNumber}>2</Text>
              )}
            </View>
            <Text style={styles.stepLabel}>Date & Time</Text>
          </View>
          <View style={styles.progressStep}>
            <View
              style={[styles.stepCircle, step === 'confirm' && styles.stepCircleActive]}
            >
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Confirm</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Barber Info */}
        <Card style={styles.barberCard}>
          <View style={styles.barberInfo}>
            <Avatar
              name={barber.displayName}
              size="lg"
              verified={barber.isVerified}
              showGradientBorder={barber.promotionTier !== 'FREE'}
            />
            <View style={styles.barberDetails}>
              <Text style={styles.barberName}>{barber.displayName}</Text>
              {barber.worksAt && (
                <View style={styles.worksAtRow}>
                  <Ionicons name="business" size={14} color={colors.text.secondary} />
                  <Text style={styles.worksAtText}>{barber.worksAt}</Text>
                </View>
              )}
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={colors.accent.gold} />
                <Text style={styles.ratingText}>
                  {barber.rating} ({barber.totalReviews} reviews)
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Service</Text>
            <View style={styles.servicesGrid}>
              {barber.services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedService(service)}
                  activeOpacity={0.7}
                >
                  <Card
                    style={[
                      styles.serviceCard,
                      selectedService?.id === service.id && styles.serviceCardSelected,
                    ]}
                  >
                    {service.isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.description && (
                      <Text style={styles.serviceDescription} numberOfLines={2}>
                        {service.description}
                      </Text>
                    )}
                    <View style={styles.serviceMeta}>
                      <View style={styles.serviceMetaItem}>
                        <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
                        <Text style={styles.serviceMetaText}>{service.duration} min</Text>
                      </View>
                      <Text style={styles.servicePrice}>${service.price}</Text>
                    </View>
                    {selectedService?.id === service.id && (
                      <View style={styles.selectedCheck}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.accent.gold} />
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 'datetime' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <FlatList
                horizontal
                data={dates}
                keyExtractor={(item) => item.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDate(item);
                      setSelectedTime(null); // Reset time when date changes
                    }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        isSameDate(item, selectedDate)
                          ? ['#D4AF37', '#FFD700']
                          : [colors.background.secondary, colors.background.secondary]
                      }
                      style={[
                        styles.dateCard,
                        isSameDate(item, selectedDate) && styles.dateCardSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateDay,
                          isSameDate(item, selectedDate) && styles.dateDaySelected,
                        ]}
                      >
                        {formatDate(item)}
                      </Text>
                      <Text
                        style={[
                          styles.dateNumber,
                          isSameDate(item, selectedDate) && styles.dateNumberSelected,
                        ]}
                      >
                        {item.getDate()}
                      </Text>
                      {isToday(item) && !isSameDate(item, selectedDate) && (
                        <View style={styles.todayDot} />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Time</Text>
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
                  {timeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => slot.isAvailable && setSelectedTime(slot.time)}
                      disabled={!slot.isAvailable}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={
                          selectedTime === slot.time
                            ? ['#D4AF37', '#FFD700']
                            : [colors.background.secondary, colors.background.secondary]
                        }
                        style={[
                          styles.timeSlot,
                          !slot.isAvailable && styles.timeSlotDisabled,
                          selectedTime === slot.time && styles.timeSlotSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            !slot.isAvailable && styles.timeTextDisabled,
                            selectedTime === slot.time && styles.timeTextSelected,
                          ]}
                        >
                          {slot.time}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>{selectedService?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{selectedService?.duration} min</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{formatFullDate(selectedDate)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${calculateTotal()}</Text>
              </View>
            </Card>

            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Additional Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Any specific requests or preferences?"
                placeholderTextColor={colors.text.secondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Card style={styles.policyCard}>
              <View style={styles.policyRow}>
                <Ionicons name="information-circle" size={20} color={colors.accent.gold} />
                <Text style={styles.policyText}>
                  Free cancellation up to 24 hours before appointment
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>${calculateTotal()}</Text>
        </View>
        <View style={styles.actionButtons}>
          {step !== 'service' && (
            <Button
              title="Back"
              onPress={() =>
                setStep(step === 'confirm' ? 'datetime' : 'service')
              }
              variant="outline"
              size="large"
              style={styles.backActionButton}
            />
          )}
          <Button
            title={step === 'confirm' ? 'Confirm Booking' : 'Continue'}
            onPress={step === 'confirm' ? handleBooking : handleContinue}
            variant="gradient"
            size="large"
            isLoading={loading}
            disabled={
              loading ||
              (step === 'service' && !selectedService) ||
              (step === 'datetime' && (!selectedDate || !selectedTime))
            }
            style={styles.continueButton}
            icon={step === 'confirm' ? 'checkmark' : 'arrow-forward'}
            iconPosition="right"
          />
        </View>
      </View>
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
  headerTitle: { ...textStyles.h3, fontWeight: '700' },
  progressContainer: { padding: spacing.lg, paddingTop: spacing.md },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.gold,
    borderRadius: borderRadius.full,
  },
  progressSteps: { flexDirection: 'row', justifyContent: 'space-between' },
  progressStep: { alignItems: 'center', gap: spacing.xs },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  stepCircleActive: {
    backgroundColor: colors.accent.gold,
    borderColor: colors.accent.gold,
  },
  stepCircleComplete: {
    backgroundColor: colors.accent.gold,
    borderColor: colors.accent.gold,
  },
  stepNumber: { ...textStyles.bodySmall, fontWeight: '700', color: colors.text.secondary },
  stepLabel: { ...textStyles.caption, color: colors.text.secondary },
  barberCard: { margin: spacing.lg, marginBottom: spacing.md, padding: spacing.md },
  barberInfo: { flexDirection: 'row', gap: spacing.md },
  barberDetails: { flex: 1, gap: spacing.xs },
  barberName: { ...textStyles.body, fontWeight: '700' },
  worksAtRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  worksAtText: { ...textStyles.bodySmall, color: colors.text.secondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingText: { ...textStyles.bodySmall, color: colors.text.secondary },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.md },
  servicesGrid: { gap: spacing.md },
  serviceCard: {
    padding: spacing.md,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceCardSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '10',
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  popularText: { fontSize: 10, fontWeight: '700', color: colors.accent.gold },
  serviceName: { ...textStyles.body, fontWeight: '700', marginBottom: spacing.xs },
  serviceDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceMetaText: { ...textStyles.caption, color: colors.text.secondary },
  servicePrice: { ...textStyles.h3, color: colors.accent.gold, fontWeight: '700' },
  selectedCheck: { position: 'absolute', top: spacing.md, right: spacing.md },
  datesList: { gap: spacing.sm },
  dateCard: {
    width: 64,
    height: 80,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    position: 'relative',
  },
  dateCardSelected: {
    ...shadows.md,
  },
  dateDay: { ...textStyles.caption, color: colors.text.secondary, fontWeight: '600' },
  dateDaySelected: { color: '#000', fontWeight: '700' },
  dateNumber: { ...textStyles.h3, fontWeight: '700', color: colors.text.primary },
  dateNumberSelected: { color: '#000' },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.gold,
    position: 'absolute',
    bottom: spacing.sm,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    minWidth: 100,
    alignItems: 'center',
  },
  timeSlotDisabled: {
    opacity: 0.3,
  },
  timeSlotSelected: {
    ...shadows.sm,
  },
  timeText: { ...textStyles.bodySmall, fontWeight: '600', color: colors.text.primary },
  timeTextDisabled: { color: colors.text.secondary },
  timeTextSelected: { color: '#000', fontWeight: '700' },
  summaryCard: { padding: spacing.lg, gap: spacing.md },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { ...textStyles.body, color: colors.text.secondary },
  summaryValue: { ...textStyles.body, fontWeight: '600', color: colors.text.primary },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  totalLabel: { ...textStyles.h3, fontWeight: '700' },
  totalValue: { ...textStyles.h2, color: colors.accent.gold, fontWeight: '700' },
  notesSection: { marginTop: spacing.lg },
  notesLabel: { ...textStyles.body, fontWeight: '600', marginBottom: spacing.sm },
  notesInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  policyCard: { marginTop: spacing.lg, padding: spacing.md },
  policyRow: { flexDirection: 'row', gap: spacing.sm },
  policyText: { ...textStyles.bodySmall, color: colors.text.secondary, flex: 1 },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    ...shadows.lg,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priceLabel: { ...textStyles.body, color: colors.text.secondary },
  priceValue: { ...textStyles.h2, color: colors.accent.gold, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', gap: spacing.sm },
  backActionButton: { flex: 1 },
  continueButton: { flex: 2 },
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
  timeSlotsLoading: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
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
