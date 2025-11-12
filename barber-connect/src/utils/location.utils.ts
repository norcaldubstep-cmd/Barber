import * as ExpoLocation from 'expo-location';
import { Location } from '../types/location.types';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    // console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<Location | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    const location = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    // console.error('Error getting current location:', error);
    return null;
  }
};

export const getAddressFromCoords = async (
  latitude: number,
  longitude: number
): Promise<Partial<Location> | null> => {
  try {
    const addresses = await ExpoLocation.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addresses.length > 0) {
      const address = addresses[0];
      return {
        address: `${address.street}, ${address.name}`,
        city: address.city || undefined,
        state: address.region || undefined,
        zipCode: address.postalCode || undefined,
        country: address.country || undefined,
      };
    }
    return null;
  } catch (error) {
    // console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'miles' | 'km' = 'miles'
): number => {
  const R = unit === 'miles' ? 3959 : 6371; // Earth's radius in miles or km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const formatDistance = (distance: number, unit: 'miles' | 'km' = 'miles'): string => {
  if (distance < 1) {
    return `< 1 ${unit === 'miles' ? 'mi' : 'km'}`;
  }
  return `${distance} ${unit === 'miles' ? 'mi' : 'km'}`;
};
