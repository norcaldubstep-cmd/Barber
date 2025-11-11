import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import {
  getBarberAvailability,
  updateBarberAvailability,
} from '../../services/barberService';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DaySchedule {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

type WeekSchedule = {
  [K in DayOfWeek]: DaySchedule;
};

const DEFAULT_SCHEDULE: WeekSchedule = {
  monday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  tuesday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  wednesday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  thursday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  friday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
  saturday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
  sunday: { isAvailable: false, startTime: '09:00', endTime: '18:00' },
};

const TRADITIONAL_SCHEDULE: WeekSchedule = DEFAULT_SCHEDULE;

const EXTENDED_SCHEDULE: WeekSchedule = {
  monday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
  tuesday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
  wednesday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
  thursday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
  friday: { isAvailable: true, startTime: '08:00', endTime: '21:00' },
  saturday: { isAvailable: true, startTime: '08:00', endTime: '21:00' },
  sunday: { isAvailable: true, startTime: '10:00', endTime: '18:00' },
};

const WEEKEND_ONLY_SCHEDULE: WeekSchedule = {
  monday: { isAvailable: false, startTime: '09:00', endTime: '18:00' },
  tuesday: { isAvailable: false, startTime: '09:00', endTime: '18:00' },
  wednesday: { isAvailable: false, startTime: '09:00', endTime: '18:00' },
  thursday: { isAvailable: false, startTime: '09:00', endTime: '18:00' },
  friday: { isAvailable: false, startTime: '09:00', endTime: '18:00' },
  saturday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
  sunday: { isAvailable: true, startTime: '10:00', endTime: '18:00' },
};

const DAYS_OF_WEEK: Array<{ key: DayOfWeek; label: string; short: string }> = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00',
];

export const ScheduleEditorScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setLoading(true);
      const availability = await getBarberAvailability(user.id);

      if (availability && availability.schedule) {
        setSchedule(availability.schedule);
      }
    } catch (err) {
      console.error('Load schedule error:', err);
      Alert.alert('Error', 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const toggleDayAvailability = (day: DayOfWeek) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        isAvailable: !schedule[day].isAvailable,
      },
    });
  };

  const updateDayHours = (day: DayOfWeek, field: 'start' | 'end', value: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field === 'start' ? 'startTime' : 'endTime']: value,
      },
    });
  };

  const applyToAllDays = () => {
    if (!selectedDay) return;

    Alert.alert(
      'Apply to All Days',
      'This will apply the current day\'s schedule to all days. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            const templateSchedule = schedule[selectedDay];
            const newSchedule: WeekSchedule = {} as WeekSchedule;
            DAYS_OF_WEEK.forEach((day) => {
              newSchedule[day.key] = { ...templateSchedule };
            });
            setSchedule(newSchedule);
            Alert.alert('Success', 'Schedule applied to all days');
          },
        },
      ]
    );
  };

  const applyTemplate = (templateName: 'TRADITIONAL' | 'EXTENDED' | 'WEEKEND_ONLY') => {
    Alert.alert(
      'Apply Template',
      `Apply the ${templateName.toLowerCase().replace('_', ' ')} schedule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            const templates = {
              TRADITIONAL: TRADITIONAL_SCHEDULE,
              EXTENDED: EXTENDED_SCHEDULE,
              WEEKEND_ONLY: WEEKEND_ONLY_SCHEDULE,
            };
            setSchedule(templates[templateName]);
            Alert.alert('Success', 'Template applied successfully');
          },
        },
      ]
    );
  };

  const saveSchedule = async () => {
    // Validate schedule
    const hasAtLeastOneDay = DAYS_OF_WEEK.some((day) => schedule[day.key].isAvailable);
    if (!hasAtLeastOneDay) {
      Alert.alert('Error', 'You must be available at least one day of the week');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setSaving(true);
      await updateBarberAvailability(user.id, { schedule });
      Alert.alert('Success', 'Your schedule has been saved!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Save schedule error:', err);
      Alert.alert('Error', 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const getTotalHoursPerWeek = (): number => {
    let total = 0;
    DAYS_OF_WEEK.forEach((day) => {
      const daySchedule = schedule[day.key];
      if (daySchedule.isAvailable) {
        const [startHours, startMinutes] = daySchedule.startTime.split(':').map(Number);
        const [endHours, endMinutes] = daySchedule.endTime.split(':').map(Number);
        const start = startHours * 60 + startMinutes;
        const end = endHours * 60 + endMinutes;
        total += (end - start) / 60;
      }
    });
    return total;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Schedule</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={24} color={colors.accent.gold} />
              <Text style={styles.statValue}>
                {DAYS_OF_WEEK.filter((day) => schedule[day.key].isAvailable).length}
              </Text>
              <Text style={styles.statLabel}>Active Days</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color={colors.accent.blue} />
              <Text style={styles.statValue}>{getTotalHoursPerWeek()}</Text>
              <Text style={styles.statLabel}>Hours/Week</Text>
            </View>
          </View>
        </Card>

        {/* Quick Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Templates</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templatesContainer}
          >
            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => applyTemplate('TRADITIONAL')}
            >
              <View style={[styles.templateIcon, { backgroundColor: colors.accent.gold + '20' }]}>
                <Ionicons name="business" size={24} color={colors.accent.gold} />
              </View>
              <Text style={styles.templateName}>Traditional</Text>
              <Text style={styles.templateDesc}>Mon-Sat, 9AM-6PM</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => applyTemplate('EXTENDED')}
            >
              <View style={[styles.templateIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                <Ionicons name="time" size={24} color={colors.accent.blue} />
              </View>
              <Text style={styles.templateName}>Extended</Text>
              <Text style={styles.templateDesc}>7 Days, 8AM-8PM</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => applyTemplate('WEEKEND_ONLY')}
            >
              <View style={[styles.templateIcon, { backgroundColor: colors.accent.red + '20' }]}>
                <Ionicons name="calendar" size={24} color={colors.accent.red} />
              </View>
              <Text style={styles.templateName}>Weekend</Text>
              <Text style={styles.templateDesc}>Sat-Sun, 10AM-8PM</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Days Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            {selectedDay && (
              <TouchableOpacity onPress={applyToAllDays}>
                <Text style={styles.applyAllText}>Apply to All</Text>
              </TouchableOpacity>
            )}
          </View>

          {DAYS_OF_WEEK.map((day) => (
            <Card key={day.key} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayLabel}>{day.label}</Text>
                  {schedule[day.key].isAvailable && (
                    <Text style={styles.dayHours}>
                      {formatTime12Hour(schedule[day.key].startTime)} -{' '}
                      {formatTime12Hour(schedule[day.key].endTime)}
                    </Text>
                  )}
                  {!schedule[day.key].isAvailable && (
                    <Text style={styles.dayClosedText}>Closed</Text>
                  )}
                </View>
                <Switch
                  value={schedule[day.key].isAvailable}
                  onValueChange={() => toggleDayAvailability(day.key)}
                  trackColor={{
                    false: colors.border.medium,
                    true: colors.accent.gold + '50',
                  }}
                  thumbColor={
                    schedule[day.key].isAvailable ? colors.accent.gold : colors.background.secondary
                  }
                />
              </View>

              {schedule[day.key].isAvailable && (
                <View style={styles.dayTimeSettings}>
                  <TouchableOpacity
                    style={styles.dayExpand}
                    onPress={() => setSelectedDay(selectedDay === day.key ? null : day.key)}
                  >
                    <Ionicons
                      name={selectedDay === day.key ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.text.secondary}
                    />
                    <Text style={styles.expandText}>
                      {selectedDay === day.key ? 'Collapse' : 'Customize hours'}
                    </Text>
                  </TouchableOpacity>

                  {selectedDay === day.key && (
                    <View style={styles.timePickersContainer}>
                      {/* Start Time */}
                      <View style={styles.timePicker}>
                        <Text style={styles.timePickerLabel}>Start Time</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.timeSlots}
                        >
                          {TIME_SLOTS.map((time) => (
                            <TouchableOpacity
                              key={`start-${time}`}
                              onPress={() => updateDayHours(day.key, 'start', time)}
                            >
                              <LinearGradient
                                colors={
                                  schedule[day.key].startTime === time
                                    ? ['#D4AF37', '#FFD700']
                                    : [colors.background.secondary, colors.background.secondary]
                                }
                                style={styles.timeSlot}
                              >
                                <Text
                                  style={[
                                    styles.timeSlotText,
                                    schedule[day.key].startTime === time && styles.timeSlotTextActive,
                                  ]}
                                >
                                  {formatTime12Hour(time)}
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* End Time */}
                      <View style={styles.timePicker}>
                        <Text style={styles.timePickerLabel}>End Time</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.timeSlots}
                        >
                          {TIME_SLOTS.map((time) => (
                            <TouchableOpacity
                              key={`end-${time}`}
                              onPress={() => updateDayHours(day.key, 'end', time)}
                            >
                              <LinearGradient
                                colors={
                                  schedule[day.key].endTime === time
                                    ? ['#D4AF37', '#FFD700']
                                    : [colors.background.secondary, colors.background.secondary]
                                }
                                style={styles.timeSlot}
                              >
                                <Text
                                  style={[
                                    styles.timeSlotText,
                                    schedule[day.key].endTime === time && styles.timeSlotTextActive,
                                  ]}
                                >
                                  {formatTime12Hour(time)}
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </Card>
          ))}
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <Button
          title="Save Schedule"
          onPress={saveSchedule}
          variant="gradient"
          size="large"
          fullWidth
          icon="checkmark"
          disabled={saving}
          loading={saving}
        />
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
  headerTitle: { ...textStyles.h2, fontWeight: '700' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  statsCard: { margin: spacing.lg, padding: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: spacing.xs },
  statValue: { ...textStyles.h2, fontWeight: '700', marginTop: spacing.xs },
  statLabel: { ...textStyles.caption, color: colors.text.secondary },
  statDivider: { width: 1, height: 60, backgroundColor: colors.border.light },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...textStyles.h3, fontWeight: '700' },
  applyAllText: { ...textStyles.bodySmall, color: colors.accent.gold, fontWeight: '600' },
  templatesContainer: { gap: spacing.md },
  templateCard: {
    width: 140,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  templateName: { ...textStyles.body, fontWeight: '700' },
  templateDesc: { ...textStyles.caption, color: colors.text.secondary, textAlign: 'center' },
  dayCard: { padding: spacing.md, marginBottom: spacing.md },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayInfo: { flex: 1 },
  dayLabel: { ...textStyles.body, fontWeight: '700', marginBottom: 4 },
  dayHours: { ...textStyles.bodySmall, color: colors.text.secondary },
  dayClosedText: { ...textStyles.bodySmall, color: colors.error },
  dayTimeSettings: { marginTop: spacing.md },
  dayExpand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  expandText: { ...textStyles.bodySmall, color: colors.text.secondary },
  timePickersContainer: { gap: spacing.lg, marginTop: spacing.md },
  timePicker: { gap: spacing.sm },
  timePickerLabel: { ...textStyles.bodySmall, fontWeight: '600', color: colors.text.secondary },
  timeSlots: { gap: spacing.xs },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    minWidth: 90,
    alignItems: 'center',
  },
  timeSlotText: { ...textStyles.bodySmall, fontWeight: '600', color: colors.text.primary },
  timeSlotTextActive: { color: '#000', fontWeight: '700' },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.card,
  },
});
