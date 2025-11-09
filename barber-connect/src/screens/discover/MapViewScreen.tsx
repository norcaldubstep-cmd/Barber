import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

const { width, height } = Dimensions.get('window');

interface Barber {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  distance: string;
  specialties: string[];
  latitude: number;
  longitude: number;
  isOpen: boolean;
}

// Mock barbers with locations
const MOCK_BARBERS: Barber[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4.9,
    reviewCount: 342,
    distance: '0.5 mi',
    specialties: ['Fade', 'Beard'],
    latitude: 37.78825,
    longitude: -122.4324,
    isOpen: true,
  },
  {
    id: '2',
    name: 'James Smith',
    avatar: 'https://i.pravatar.cc/150?img=13',
    rating: 4.8,
    reviewCount: 289,
    distance: '0.8 mi',
    specialties: ['Fade', 'Lineup'],
    latitude: 37.78925,
    longitude: -122.4344,
    isOpen: true,
  },
  {
    id: '3',
    name: 'Chris Brown',
    avatar: 'https://i.pravatar.cc/150?img=14',
    rating: 4.7,
    reviewCount: 215,
    distance: '1.2 mi',
    specialties: ['Taper', 'Design'],
    latitude: 37.79025,
    longitude: -122.4304,
    isOpen: false,
  },
];

export const MapViewScreen = ({ navigation }: any) => {
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [mapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const handleBarberPress = (barber: Barber) => {
    setSelectedBarber(barber);
  };

  const handleViewProfile = () => {
    if (selectedBarber) {
      navigation.navigate('BarberProfile', { barberId: selectedBarber.id });
    }
  };

  const handleBookNow = () => {
    if (selectedBarber) {
      navigation.navigate('Booking', { barberId: selectedBarber.id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Barbers Near You</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder (will integrate with react-native-maps) */}
      <View style={styles.mapContainer}>
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.mapPlaceholder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="map" size={80} color={colors.accent.gold} />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Showing {MOCK_BARBERS.length} barbers nearby
          </Text>

          {/* Mock Markers */}
          {MOCK_BARBERS.map((barber, index) => (
            <TouchableOpacity
              key={barber.id}
              style={[
                styles.marker,
                {
                  top: `${30 + index * 20}%`,
                  left: `${20 + index * 25}%`,
                },
              ]}
              onPress={() => handleBarberPress(barber)}
            >
              <View
                style={[
                  styles.markerDot,
                  selectedBarber?.id === barber.id && styles.markerDotSelected,
                ]}
              />
              {selectedBarber?.id === barber.id && (
                <View style={styles.markerPulse} />
              )}
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>

      {/* Current Location Button */}
      <TouchableOpacity style={styles.locationButton} activeOpacity={0.8}>
        <LinearGradient
          colors={['#D4AF37', '#FFD700']}
          style={styles.locationButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="locate" size={24} color="#000" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Selected Barber Card */}
      {selectedBarber && (
        <View style={styles.bottomCard}>
          <View style={styles.barberCard}>
            {/* Avatar */}
            <Image source={{ uri: selectedBarber.avatar }} style={styles.avatar} />

            {/* Info */}
            <View style={styles.barberInfo}>
              <View style={styles.barberHeader}>
                <Text style={styles.barberName}>{selectedBarber.name}</Text>
                {selectedBarber.isOpen ? (
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Open</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, styles.statusBadgeClosed]}>
                    <Text style={styles.statusTextClosed}>Closed</Text>
                  </View>
                )}
              </View>

              <View style={styles.barberMeta}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={colors.accent.gold} />
                  <Text style={styles.rating}>{selectedBarber.rating}</Text>
                  <Text style={styles.reviewCount}>({selectedBarber.reviewCount})</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.distanceContainer}>
                  <Ionicons name="location" size={16} color={colors.accent.blue} />
                  <Text style={styles.distance}>{selectedBarber.distance}</Text>
                </View>
              </View>

              <View style={styles.specialties}>
                {selectedBarber.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyBadge}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setSelectedBarber(null)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={handleViewProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBookNow} activeOpacity={0.8}>
              <LinearGradient
                colors={['#D4AF37', '#FFD700']}
                style={styles.bookButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    fontWeight: '700',
  },
  mapPlaceholderSubtext: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent.gold,
    borderWidth: 3,
    borderColor: '#000',
  },
  markerDotSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent.gold,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  markerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.gold,
    opacity: 0.3,
  },
  locationButton: {
    position: 'absolute',
    top: height * 0.15,
    right: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  barberCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  barberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  barberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  barberName: {
    ...textStyles.h3,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  statusBadgeClosed: {
    backgroundColor: colors.error,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  statusText: {
    ...textStyles.caption,
    color: '#FFF',
    fontWeight: '700',
  },
  statusTextClosed: {
    ...textStyles.caption,
    color: '#FFF',
    fontWeight: '700',
  },
  barberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rating: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  reviewCount: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.medium,
    marginHorizontal: spacing.sm,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  distance: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  specialties: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  specialtyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
  },
  specialtyText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  viewProfileButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  viewProfileText: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  bookButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    ...textStyles.body,
    fontWeight: '700',
    color: '#000',
  },
});
