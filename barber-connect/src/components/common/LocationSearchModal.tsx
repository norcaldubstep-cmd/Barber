import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { Button } from './Button';
import { geocodeLocation, POPULAR_CITIES, LocationCoords } from '../../services/locationService';

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationCoords, locationName: string) => void;
  currentLocation?: LocationCoords;
}

interface CityOption {
  name: string;
  latitude: number;
  longitude: number;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  currentLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CityOption[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a city or location');
      return;
    }

    setIsSearching(true);
    try {
      const coords = await geocodeLocation(searchQuery);

      if (coords) {
        onSelectLocation(coords, searchQuery);
        setSearchQuery('');
        setSearchResults([]);
        onClose();
      } else {
        Alert.alert(
          'Location Not Found',
          'Could not find the location. Please try a different search term.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = (city: CityOption) => {
    onSelectLocation({ latitude: city.latitude, longitude: city.longitude }, city.name);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      onSelectLocation(currentLocation, 'Current Location');
      onClose();
    } else {
      Alert.alert('Error', 'Current location not available');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Location</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter city or location..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
          <Button
            title="Search"
            onPress={handleSearch}
            variant="gradient"
            size="medium"
            disabled={!searchQuery.trim() || isSearching}
            isLoading={isSearching}
          />
        </View>

        {/* Current Location Option */}
        {currentLocation && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
              activeOpacity={0.7}
            >
              <View style={styles.locationIconContainer}>
                <Ionicons name="locate" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>Use Current Location</Text>
                <Text style={styles.locationSubtitle}>
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Popular Cities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Cities</Text>
          <FlatList
            data={POPULAR_CITIES}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cityItem}
                onPress={() => handleSelectCity(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cityIconContainer}>
                  <Ionicons name="location" size={20} color={colors.accent.gold} />
                </View>
                <View style={styles.cityInfo}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityCoords}>
                    {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.h2,
    fontWeight: '700',
  },
  searchContainer: {
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  locationSubtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  cityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cityCoords: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});
