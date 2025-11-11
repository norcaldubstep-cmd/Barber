import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { requestLocationPermission as requestPermission, getCurrentLocation as getDeviceLocation } from '../utils/location.utils';

// Storage keys
const LOCATION_STORAGE_KEY = '@barber_connect:last_location';
const LOCATION_TIMESTAMP_KEY = '@barber_connect:location_timestamp';

// Default location (San Francisco)
const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
};

// Cache duration (15 minutes in milliseconds)
const CACHE_DURATION = 15 * 60 * 1000;

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request location permissions from the user
 * @returns Promise<boolean> - true if granted, false otherwise
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    if (status === 'denied' && !canAskAgain) {
      console.log('Location permission permanently denied. User must enable in settings.');
    }

    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Check current location permission status
 * @returns Promise<LocationPermissionStatus>
 */
export const checkLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return { granted: false, canAskAgain: true };
  }
};

/**
 * Get current device location using GPS
 * @returns Promise<LocationCoords | null> - location coordinates or null if unavailable
 */
export const getCurrentLocation = async (): Promise<LocationCoords | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Cache the location
    await saveLocation(coords.latitude, coords.longitude);

    return coords;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Get the last known location from AsyncStorage
 * @returns Promise<LocationCoords | null> - cached location or null if not found
 */
export const getStoredLocation = async (): Promise<LocationCoords | null> => {
  try {
    const [locationStr, timestampStr] = await Promise.all([
      AsyncStorage.getItem(LOCATION_STORAGE_KEY),
      AsyncStorage.getItem(LOCATION_TIMESTAMP_KEY),
    ]);

    if (!locationStr || !timestampStr) {
      return null;
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();

    // Check if cached location is still valid
    if (now - timestamp > CACHE_DURATION) {
      console.log('Cached location expired');
      return null;
    }

    const location = JSON.parse(locationStr);
    return location;
  } catch (error) {
    console.error('Error getting stored location:', error);
    return null;
  }
};

/**
 * Save location to AsyncStorage for caching
 * @param latitude - latitude coordinate
 * @param longitude - longitude coordinate
 * @returns Promise<void>
 */
export const saveLocation = async (latitude: number, longitude: number): Promise<void> => {
  try {
    const location = { latitude, longitude };
    const timestamp = Date.now().toString();

    await Promise.all([
      AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location)),
      AsyncStorage.setItem(LOCATION_TIMESTAMP_KEY, timestamp),
    ]);

    console.log('Location cached successfully');
  } catch (error) {
    console.error('Error saving location:', error);
  }
};

/**
 * Clear cached location from storage
 * @returns Promise<void>
 */
export const clearStoredLocation = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(LOCATION_STORAGE_KEY),
      AsyncStorage.removeItem(LOCATION_TIMESTAMP_KEY),
    ]);
    console.log('Cached location cleared');
  } catch (error) {
    console.error('Error clearing location:', error);
  }
};

/**
 * Get location with the following priority:
 * 1. Cached location (if valid)
 * 2. Current device location (if permission granted)
 * 3. Default location (San Francisco)
 *
 * @param forceRefresh - if true, skip cache and fetch fresh location
 * @returns Promise<LocationCoords> - always returns a location (never null)
 */
export const getLocationOrDefault = async (forceRefresh = false): Promise<LocationCoords> => {
  try {
    // Try cached location first (unless force refresh)
    if (!forceRefresh) {
      const cached = await getStoredLocation();
      if (cached) {
        console.log('Using cached location:', cached);
        return cached;
      }
    }

    // Try to get current location
    const current = await getCurrentLocation();
    if (current) {
      console.log('Using current location:', current);
      return current;
    }

    // Fall back to default location
    console.log('Using default location (San Francisco)');
    return DEFAULT_LOCATION;
  } catch (error) {
    console.error('Error getting location, using default:', error);
    return DEFAULT_LOCATION;
  }
};

/**
 * Check if location services are enabled on the device
 * @returns Promise<boolean>
 */
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
};

/**
 * Get a user-friendly message for location permission status
 * @returns Promise<string>
 */
export const getLocationStatusMessage = async (): Promise<string> => {
  const { granted, canAskAgain } = await checkLocationPermission();
  const servicesEnabled = await isLocationEnabled();

  if (!servicesEnabled) {
    return 'Location services are disabled. Please enable them in your device settings.';
  }

  if (granted) {
    return 'Location access granted';
  }

  if (!canAskAgain) {
    return 'Location permission denied. Please enable it in your device settings to see nearby barbers.';
  }

  return 'Location permission needed to find nearby barbers';
};

export default {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentLocation,
  getStoredLocation,
  saveLocation,
  clearStoredLocation,
  getLocationOrDefault,
  isLocationEnabled,
  getLocationStatusMessage,
  DEFAULT_LOCATION,
};
