import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface FilterState {
  distance: number;
  priceRange: [number, number];
  rating: number;
  openNow: boolean;
  acceptsWalkIns: boolean;
  selectedSpecialties: string[];
  availability: string[];
  sortBy: 'distance' | 'rating' | 'price' | 'popular';
}

const SPECIALTIES = [
  'Haircut',
  'Fade',
  'Beard Trim',
  'Hot Towel Shave',
  'Hair Coloring',
  'Braids',
  'Dreadlocks',
  'Kids Cut',
  'Line Up',
  'Taper',
  'Buzz Cut',
  'Design',
];

const AVAILABILITY_OPTIONS = ['Today', 'Tomorrow', 'This Week', 'This Weekend'];

export const FiltersScreen = ({ navigation, route }: any) => {
  const { onApplyFilters } = route.params || {};

  const [filters, setFilters] = useState<FilterState>({
    distance: 10,
    priceRange: [20, 100],
    rating: 4.0,
    openNow: false,
    acceptsWalkIns: false,
    selectedSpecialties: [],
    availability: [],
    sortBy: 'distance',
  });

  const handleSpecialtyToggle = (specialty: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedSpecialties: prev.selectedSpecialties.includes(specialty)
        ? prev.selectedSpecialties.filter((s) => s !== specialty)
        : [...prev.selectedSpecialties, specialty],
    }));
  };

  const handleAvailabilityToggle = (option: string) => {
    setFilters((prev) => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter((a) => a !== option)
        : [...prev.availability, option],
    }));
  };

  const handleReset = () => {
    setFilters({
      distance: 10,
      priceRange: [20, 100],
      rating: 4.0,
      openNow: false,
      acceptsWalkIns: false,
      selectedSpecialties: [],
      availability: [],
      sortBy: 'distance',
    });
  };

  const handleApply = () => {
    onApplyFilters?.(filters);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>{filters.distance} miles</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={filters.distance}
              onValueChange={(value) => setFilters({ ...filters, distance: value })}
              minimumTrackTintColor={colors.accent.gold}
              maximumTrackTintColor={colors.border.medium}
              thumbTintColor={colors.accent.gold}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 mi</Text>
              <Text style={styles.sliderLabel}>50 mi</Text>
            </View>
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </Text>
            <View style={styles.priceSliders}>
              <View style={styles.priceSliderRow}>
                <Text style={styles.priceLabel}>Min: ${filters.priceRange[0]}</Text>
                <Slider
                  style={styles.priceSlider}
                  minimumValue={10}
                  maximumValue={filters.priceRange[1]}
                  step={5}
                  value={filters.priceRange[0]}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priceRange: [value, filters.priceRange[1]] })
                  }
                  minimumTrackTintColor={colors.accent.gold}
                  maximumTrackTintColor={colors.border.medium}
                  thumbTintColor={colors.accent.gold}
                />
              </View>
              <View style={styles.priceSliderRow}>
                <Text style={styles.priceLabel}>Max: ${filters.priceRange[1]}</Text>
                <Slider
                  style={styles.priceSlider}
                  minimumValue={filters.priceRange[0]}
                  maximumValue={200}
                  step={5}
                  value={filters.priceRange[1]}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priceRange: [filters.priceRange[0], value] })
                  }
                  minimumTrackTintColor={colors.accent.gold}
                  maximumTrackTintColor={colors.border.medium}
                  thumbTintColor={colors.accent.gold}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Minimum Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.ratingValue}>
              <Ionicons name="star" size={20} color={colors.accent.gold} />
              <Text style={styles.sliderValue}>{filters.rating.toFixed(1)}+</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1.0}
              maximumValue={5.0}
              step={0.1}
              value={filters.rating}
              onValueChange={(value) => setFilters({ ...filters, rating: value })}
              minimumTrackTintColor={colors.accent.gold}
              maximumTrackTintColor={colors.border.medium}
              thumbTintColor={colors.accent.gold}
            />
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Filters</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="time-outline" size={20} color={colors.accent.green} />
              <Text style={styles.toggleLabel}>Open Now</Text>
            </View>
            <Switch
              value={filters.openNow}
              onValueChange={(value) => setFilters({ ...filters, openNow: value })}
              trackColor={{ false: colors.border.medium, true: colors.accent.gold }}
              thumbColor={filters.openNow ? '#FFF' : colors.background.secondary}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="walk-outline" size={20} color={colors.accent.blue} />
              <Text style={styles.toggleLabel}>Accepts Walk-ins</Text>
            </View>
            <Switch
              value={filters.acceptsWalkIns}
              onValueChange={(value) => setFilters({ ...filters, acceptsWalkIns: value })}
              trackColor={{ false: colors.border.medium, true: colors.accent.gold }}
              thumbColor={filters.acceptsWalkIns ? '#FFF' : colors.background.secondary}
            />
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.specialtiesGrid}>
            {SPECIALTIES.map((specialty) => {
              const isSelected = filters.selectedSpecialties.includes(specialty);

              return (
                <TouchableOpacity
                  key={specialty}
                  onPress={() => handleSpecialtyToggle(specialty)}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#D4AF37', '#E8C869']}
                      style={styles.specialtyChip}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={[styles.specialtyText, { color: '#000' }]}>{specialty}</Text>
                      <Ionicons name="checkmark-circle" size={16} color="#000" />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.specialtyChip, styles.specialtyChipInactive]}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityOptions}>
            {AVAILABILITY_OPTIONS.map((option) => {
              const isSelected = filters.availability.includes(option);

              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleAvailabilityToggle(option)}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#D4AF37', '#E8C869']}
                      style={styles.availabilityChip}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={[styles.availabilityText, { color: '#000' }]}>{option}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.availabilityChip, styles.availabilityChipInactive]}>
                      <Text style={styles.availabilityText}>{option}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sort By */}
        <View style={[styles.section, { marginBottom: spacing['3xl'] }]}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.sortOptions}>
            {[
              { value: 'distance', label: 'Distance', icon: 'location' },
              { value: 'rating', label: 'Rating', icon: 'star' },
              { value: 'price', label: 'Price', icon: 'cash' },
              { value: 'popular', label: 'Popular', icon: 'flame' },
            ].map((option) => {
              const isSelected = filters.sortBy === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setFilters({ ...filters, sortBy: option.value as any })}
                  activeOpacity={0.7}
                  style={{ flex: 1 }}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#D4AF37', '#E8C869']}
                      style={styles.sortOption}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={option.icon as any} size={20} color="#000" />
                      <Text style={[styles.sortOptionText, { color: '#000' }]}>
                        {option.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.sortOption, styles.sortOptionInactive]}>
                      <Ionicons name={option.icon as any} size={20} color={colors.text.secondary} />
                      <Text style={styles.sortOptionText}>{option.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Apply Filters"
          onPress={handleApply}
          variant="gradient"
          size="large"
          fullWidth
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
  resetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resetText: {
    ...textStyles.body,
    color: colors.accent.gold,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    ...textStyles.h4,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  sliderContainer: {
    marginTop: spacing.sm,
  },
  sliderValue: {
    ...textStyles.h3,
    fontWeight: '700',
    color: colors.accent.gold,
    marginBottom: spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  priceSliders: {
    gap: spacing.md,
  },
  priceSliderRow: {
    gap: spacing.sm,
  },
  priceLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  priceSlider: {
    width: '100%',
    height: 40,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleLabel: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  specialtyChipInactive: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  specialtyText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  availabilityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  availabilityChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  availabilityChipInactive: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  availabilityText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  sortOptionInactive: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  sortOptionText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
