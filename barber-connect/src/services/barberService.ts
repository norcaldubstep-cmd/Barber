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
import { db, storage, auth } from './firebase';
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
    // console.error('Get barber profile error:', error);
    return null;
  }
};

// Update barber profile
export const updateBarberProfile = async (
  barberId: string,
  updates: Partial<BarberProfile>
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Verify user is the barber
    if (currentUser.uid !== barberId) {
      throw new Error('Unauthorized: You can only update your own profile');
    }

    const barberRef = doc(db, 'barbers', barberId);
    await updateDoc(barberRef, {
      ...updates,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    // console.error('Update barber profile error:', error);
    throw error;
  }
};

// Upload barber profile image
export const uploadBarberProfileImage = async (
  barberId: string,
  imageUri: string
): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Verify user is the barber
    if (currentUser.uid !== barberId) {
      throw new Error('Unauthorized: You can only upload your own profile image');
    }

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
    // console.error('Upload profile image error:', error);
    throw error;
  }
};

// Upload barber cover image
export const uploadBarberCoverImage = async (
  barberId: string,
  imageUri: string
): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Verify user is the barber
    if (currentUser.uid !== barberId) {
      throw new Error('Unauthorized: You can only upload your own cover image');
    }

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
    // console.error('Upload cover image error:', error);
    throw error;
  }
};

// Upload portfolio image
export const uploadPortfolioImage = async (
  barberId: string,
  imageUri: string
): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Verify user is the barber
    if (currentUser.uid !== barberId) {
      throw new Error('Unauthorized: You can only upload to your own portfolio');
    }

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
    // console.error('Upload portfolio image error:', error);
    throw error;
  }
};

// Delete portfolio image
export const deletePortfolioImage = async (
  barberId: string,
  imageUrl: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Verify user is the barber
    if (currentUser.uid !== barberId) {
      throw new Error('Unauthorized: You can only delete from your own portfolio');
    }

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
    // console.error('Delete portfolio image error:', error);
    throw error;
  }
};

// Add or update service
export const updateBarberServices = async (
  barberId: string,
  services: Service[]
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Verify user is the barber
    if (currentUser.uid !== barberId) {
      throw new Error('Unauthorized: You can only update your own services');
    }

    await updateDoc(doc(db, 'barbers', barberId), {
      services,
    });
  } catch (error) {
    // console.error('Update services error:', error);
    throw error;
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
    // console.error('Search barbers error:', error);
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
    // console.error('Get nearby barbers error:', error);
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
    // console.error('Get featured barbers error:', error);
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
    // console.error('Get top rated barbers error:', error);
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

// Get barber services
export const getBarberServices = async (barberId: string): Promise<Service[]> => {
  try {
    const barberProfile = await getBarberProfile(barberId);
    return barberProfile?.services || [];
  } catch (error) {
    // console.error('Get barber services error:', error);
    return [];
  }
};

// Add barber service
export const addBarberService = async (
  barberId: string,
  service: Omit<Service, 'id'>
): Promise<void> => {
  try {
    const barberProfile = await getBarberProfile(barberId);
    if (!barberProfile) {
      throw new Error('Barber profile not found');
    }

    const newService: Service = {
      ...service,
      id: `service_${Date.now()}`,
    };

    const updatedServices = [...barberProfile.services, newService];
    await updateBarberServices(barberId, updatedServices);
  } catch (error) {
    // console.error('Add barber service error:', error);
    throw new Error('Failed to add service');
  }
};

// Update barber service
export const updateBarberService = async (
  barberId: string,
  serviceId: string,
  updates: Partial<Omit<Service, 'id'>>
): Promise<void> => {
  try {
    const barberProfile = await getBarberProfile(barberId);
    if (!barberProfile) {
      throw new Error('Barber profile not found');
    }

    const updatedServices = barberProfile.services.map((s) =>
      s.id === serviceId ? { ...s, ...updates } : s
    );
    await updateBarberServices(barberId, updatedServices);
  } catch (error) {
    // console.error('Update barber service error:', error);
    throw new Error('Failed to update service');
  }
};

// Delete barber service
export const deleteBarberService = async (
  barberId: string,
  serviceId: string
): Promise<void> => {
  try {
    const barberProfile = await getBarberProfile(barberId);
    if (!barberProfile) {
      throw new Error('Barber profile not found');
    }

    const updatedServices = barberProfile.services.filter((s) => s.id !== serviceId);
    await updateBarberServices(barberId, updatedServices);
  } catch (error) {
    // console.error('Delete barber service error:', error);
    throw new Error('Failed to delete service');
  }
};

// Get barber portfolio
export const getBarberPortfolio = async (barberId: string): Promise<string[]> => {
  try {
    const barberProfile = await getBarberProfile(barberId);
    return barberProfile?.portfolioImages || [];
  } catch (error) {
    // console.error('Get barber portfolio error:', error);
    return [];
  }
};

// Add portfolio image with description
export const addPortfolioImage = async (
  barberId: string,
  imageUrl: string,
  description?: string
): Promise<void> => {
  try {
    const barberDoc = await getDoc(doc(db, 'barbers', barberId));
    const currentImages = barberDoc.data()?.portfolioImages || [];

    await updateDoc(doc(db, 'barbers', barberId), {
      portfolioImages: [...currentImages, imageUrl],
    });
  } catch (error) {
    // console.error('Add portfolio image error:', error);
    throw new Error('Failed to add portfolio image');
  }
};

// Get barber availability/schedule
export const getBarberAvailability = async (barberId: string): Promise<any> => {
  try {
    const availabilityDoc = await getDoc(doc(db, 'barberAvailability', barberId));

    if (!availabilityDoc.exists()) {
      return null;
    }

    return { barberId, ...availabilityDoc.data() };
  } catch (error) {
    // console.error('Get barber availability error:', error);
    return null;
  }
};

// Update barber availability/schedule
export const updateBarberAvailability = async (
  barberId: string,
  availability: any
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Verify user is the barber
    if (currentUser.uid !== barberId) {
      throw new Error('Unauthorized: You can only update your own availability');
    }

    await setDoc(doc(db, 'barberAvailability', barberId), {
      ...availability,
      barberId,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    // console.error('Update barber availability error:', error);
    throw error;
  }
};

// Get barber analytics
export const getBarberAnalytics = async (
  barberId: string,
  startDate: Date,
  endDate: Date
): Promise<any> => {
  try {
    // Query bookings for the date range
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('barberId', '==', barberId),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      where('date', '<=', endDate.toISOString().split('T')[0]),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(bookingsQuery);
    const bookings = snapshot.docs.map((doc) => doc.data());

    // Calculate analytics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

    // Get unique clients
    const uniqueClients = new Set(bookings.map(b => b.clientId));
    const newClients = uniqueClients.size;

    // Top services
    const serviceCount: Record<string, { name: string; count: number; revenue: number }> = {};
    bookings.forEach((booking) => {
      const serviceName = booking.serviceName || 'Unknown';
      if (!serviceCount[serviceName]) {
        serviceCount[serviceName] = { name: serviceName, count: 0, revenue: 0 };
      }
      serviceCount[serviceName].count++;
      serviceCount[serviceName].revenue += booking.price || 0;
    });

    const topServices = Object.values(serviceCount)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Revenue by day/week/month (simplified)
    const revenueByDay: Record<string, number> = {};
    bookings.forEach((booking) => {
      const day = booking.date;
      revenueByDay[day] = (revenueByDay[day] || 0) + (booking.price || 0);
    });

    return {
      revenue: totalRevenue,
      bookings: totalBookings,
      newClients,
      profileViews: 0, // Would need to track this separately
      revenueChange: 0, // Would need previous period data
      bookingsChange: 0, // Would need previous period data
      topServices,
      revenueByDay: Object.entries(revenueByDay).map(([day, amount]) => ({
        day,
        amount,
      })),
    };
  } catch (error) {
    // console.error('Get barber analytics error:', error);
    return {
      revenue: 0,
      bookings: 0,
      newClients: 0,
      profileViews: 0,
      revenueChange: 0,
      bookingsChange: 0,
      topServices: [],
      revenueByDay: [],
    };
  }
};
