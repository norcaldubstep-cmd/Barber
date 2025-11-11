import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  GeoPoint,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { BarberProfile, BarberSearchFilters } from '../types/barber.types';
import { Service } from '../types/booking.types';

/**
 * Barber Service
 * Handles all barber profile and management operations
 */

// Get barber profile by ID
export const getBarberProfile = async (barberId: string): Promise<BarberProfile | null> => {
  try {
    const barberDoc = await getDoc(doc(db, 'barbers', barberId));

    if (!barberDoc.exists()) {
      return null;
    }

    return { id: barberDoc.id, ...barberDoc.data() } as BarberProfile;
  } catch (error) {
    console.error('Get barber profile error:', error);
    return null;
  }
};

// Update barber profile
export const updateBarberProfile = async (
  barberId: string,
  updates: Partial<BarberProfile>
): Promise<void> => {
  try {
    const barberRef = doc(db, 'barbers', barberId);
    await updateDoc(barberRef, {
      ...updates,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update barber profile error:', error);
    throw new Error('Failed to update barber profile');
  }
};

// Upload barber profile image
export const uploadBarberProfileImage = async (
  barberId: string,
  imageUri: string
): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filename = `barbers/${barberId}/profile_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    // Update barber profile with new image URL
    await updateDoc(doc(db, 'barbers', barberId), {
      profileImage: downloadURL,
    });

    return downloadURL;
  } catch (error) {
    console.error('Upload profile image error:', error);
    throw new Error('Failed to upload profile image');
  }
};

// Upload barber cover image
export const uploadBarberCoverImage = async (
  barberId: string,
  imageUri: string
): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filename = `barbers/${barberId}/cover_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    await updateDoc(doc(db, 'barbers', barberId), {
      coverImage: downloadURL,
    });

    return downloadURL;
  } catch (error) {
    console.error('Upload cover image error:', error);
    throw new Error('Failed to upload cover image');
  }
};

// Upload portfolio image
export const uploadPortfolioImage = async (
  barberId: string,
  imageUri: string
): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filename = `barbers/${barberId}/portfolio/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    // Add to portfolio images array
    const barberDoc = await getDoc(doc(db, 'barbers', barberId));
    const currentImages = barberDoc.data()?.portfolioImages || [];

    await updateDoc(doc(db, 'barbers', barberId), {
      portfolioImages: [...currentImages, downloadURL],
    });

    return downloadURL;
  } catch (error) {
    console.error('Upload portfolio image error:', error);
    throw new Error('Failed to upload portfolio image');
  }
};

// Delete portfolio image
export const deletePortfolioImage = async (
  barberId: string,
  imageUrl: string
): Promise<void> => {
  try {
    // Delete from storage
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);

    // Remove from portfolio images array
    const barberDoc = await getDoc(doc(db, 'barbers', barberId));
    const currentImages = barberDoc.data()?.portfolioImages || [];
    const updatedImages = currentImages.filter((url: string) => url !== imageUrl);

    await updateDoc(doc(db, 'barbers', barberId), {
      portfolioImages: updatedImages,
    });
  } catch (error) {
    console.error('Delete portfolio image error:', error);
    throw new Error('Failed to delete portfolio image');
  }
};

// Add or update service
export const updateBarberServices = async (
  barberId: string,
  services: Service[]
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'barbers', barberId), {
      services,
    });
  } catch (error) {
    console.error('Update services error:', error);
    throw new Error('Failed to update services');
  }
};

// Search barbers with filters
export const searchBarbers = async (
  filters: BarberSearchFilters,
  limitCount: number = 20
): Promise<BarberProfile[]> => {
  try {
    let barbersQuery = query(collection(db, 'barbers'));

    // Apply filters
    if (filters.query) {
      // Search by name (prefix match)
      barbersQuery = query(
        collection(db, 'barbers'),
        where('displayName', '>=', filters.query),
        where('displayName', '<=', filters.query + '\uf8ff'),
        limit(limitCount)
      );
    }

    if (filters.verified !== undefined) {
      barbersQuery = query(barbersQuery, where('isVerified', '==', filters.verified));
    }

    if (filters.minRating) {
      barbersQuery = query(barbersQuery, where('rating', '>=', filters.minRating));
    }

    if (filters.acceptsWalkIns !== undefined) {
      barbersQuery = query(barbersQuery, where('acceptsWalkIns', '==', filters.acceptsWalkIns));
    }

    // Sort by
    switch (filters.sortBy) {
      case 'rating':
        barbersQuery = query(barbersQuery, orderBy('rating', 'desc'), limit(limitCount));
        break;
      case 'popularity':
        barbersQuery = query(barbersQuery, orderBy('followersCount', 'desc'), limit(limitCount));
        break;
      case 'promoted':
        barbersQuery = query(barbersQuery, orderBy('promotionTier', 'desc'), limit(limitCount));
        break;
      default:
        barbersQuery = query(barbersQuery, orderBy('rating', 'desc'), limit(limitCount));
    }

    const snapshot = await getDocs(barbersQuery);
    let barbers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BarberProfile));

    // Client-side filtering for specialties and location
    if (filters.specialties && filters.specialties.length > 0) {
      barbers = barbers.filter((barber) =>
        filters.specialties!.some((specialty) => barber.specialties.includes(specialty))
      );
    }

    if (filters.priceRange) {
      barbers = barbers.filter((barber) => {
        const avgPrice =
          barber.services.reduce((sum, s) => sum + s.price, 0) / barber.services.length || 0;
        return (
          avgPrice >= filters.priceRange!.min && avgPrice <= filters.priceRange!.max
        );
      });
    }

    // Calculate distance if user location provided
    if (filters.location) {
      barbers = barbers.map((barber) => ({
        ...barber,
        distance: calculateDistance(
          filters.location!.latitude,
          filters.location!.longitude,
          barber.location.latitude,
          barber.location.longitude
        ),
        distanceUnit: 'miles',
      }));

      // Filter by max distance
      if (filters.maxDistance) {
        barbers = barbers.filter((barber) => (barber.distance || 999) <= filters.maxDistance!);
      }

      // Sort by distance if requested
      if (filters.sortBy === 'distance') {
        barbers.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }
    }

    return barbers;
  } catch (error) {
    console.error('Search barbers error:', error);
    return [];
  }
};

// Get nearby barbers
export const getNearbyBarbers = async (
  latitude: number,
  longitude: number,
  radiusMiles: number = 25,
  limitCount: number = 20
): Promise<BarberProfile[]> => {
  try {
    // Get all barbers (Firestore doesn't support geo queries natively)
    const barbersQuery = query(
      collection(db, 'barbers'),
      where('isAvailable', '==', true),
      limit(100)
    );

    const snapshot = await getDocs(barbersQuery);
    let barbers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BarberProfile));

    // Calculate distances and filter
    barbers = barbers
      .map((barber) => ({
        ...barber,
        distance: calculateDistance(
          latitude,
          longitude,
          barber.location.latitude,
          barber.location.longitude
        ),
        distanceUnit: 'miles' as const,
      }))
      .filter((barber) => (barber.distance || 999) <= radiusMiles)
      .sort((a, b) => (a.distance || 999) - (b.distance || 999))
      .slice(0, limitCount);

    return barbers;
  } catch (error) {
    console.error('Get nearby barbers error:', error);
    return [];
  }
};

// Get featured/promoted barbers
export const getFeaturedBarbers = async (limitCount: number = 10): Promise<BarberProfile[]> => {
  try {
    const barbersQuery = query(
      collection(db, 'barbers'),
      where('isVerified', '==', true),
      orderBy('promotionTier', 'desc'),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(barbersQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BarberProfile));
  } catch (error) {
    console.error('Get featured barbers error:', error);
    return [];
  }
};

// Get top-rated barbers
export const getTopRatedBarbers = async (limitCount: number = 10): Promise<BarberProfile[]> => {
  try {
    const barbersQuery = query(
      collection(db, 'barbers'),
      where('rating', '>=', 4.5),
      orderBy('rating', 'desc'),
      orderBy('totalReviews', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(barbersQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BarberProfile));
  } catch (error) {
    console.error('Get top rated barbers error:', error);
    return [];
  }
};

// Helper: Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};
