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
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Review, BarberRating } from '../types/review.types';
import { notifyReviewReceived } from './notificationService';

/**
 * Reviews Service
 * Handles ratings and reviews for barbers
 */

// Create a review
export const createReview = async (
  barberId: string,
  barberName: string,
  clientId: string,
  clientName: string,
  rating: number,
  comment: string,
  data?: {
    clientAvatar?: string;
    bookingId?: string;
    images?: string[];
    skillRating?: number;
    speedRating?: number;
    professionalismRating?: number;
    valueRating?: number;
  }
): Promise<Review> => {
  try {
    // Input validation
    if (!barberId || !clientId || !clientName) {
      throw new Error('Invalid review parameters');
    }
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    if (!comment || comment.trim().length === 0) {
      throw new Error('Review comment is required');
    }
    if (comment.length > 1000) {
      throw new Error('Review comment cannot exceed 1000 characters');
    }
    if (data?.images && data.images.length > 5) {
      throw new Error('Cannot upload more than 5 images per review');
    }

    const reviewRef = doc(collection(db, 'reviews'));

    // Upload images if provided
    let uploadedImages: string[] = [];
    if (data?.images && data.images.length > 0) {
      uploadedImages = await uploadReviewImages(reviewRef.id, data.images);
    }

    const reviewData: Review = {
      id: reviewRef.id,
      barberId,
      barberName,
      clientId,
      clientName,
      clientAvatar: data?.clientAvatar,
      bookingId: data?.bookingId,
      rating,
      comment: comment.trim(),
      images: uploadedImages,
      skillRating: data?.skillRating,
      speedRating: data?.speedRating,
      professionalismRating: data?.professionalismRating,
      valueRating: data?.valueRating,
      isVerified: !!data?.bookingId, // Verified if linked to booking
      helpfulCount: 0,
      helpfulBy: [],
      createdAt: new Date().toISOString(),
    };

    await setDoc(reviewRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    // Update barber rating
    await updateBarberRating(barberId);

    // Send notification to barber
    await notifyReviewReceived(barberId, clientId, clientName, rating, reviewRef.id);

    return reviewData;
  } catch (error) {
    // console.error('Create review error:', error);
    throw error;
  }
};

// Get reviews for a barber
export const getBarberReviews = async (
  barberId: string,
  limitCount: number = 20
): Promise<Review[]> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('barberId', '==', barberId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(reviewsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    // console.error('Get barber reviews error:', error);
    return [];
  }
};

// Get review by ID
export const getReview = async (reviewId: string): Promise<Review | null> => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));

    if (!reviewDoc.exists()) {
      return null;
    }

    return { id: reviewDoc.id, ...reviewDoc.data() } as Review;
  } catch (error) {
    // console.error('Get review error:', error);
    return null;
  }
};

// Get reviews by client
export const getClientReviews = async (clientId: string): Promise<Review[]> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(reviewsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    // console.error('Get client reviews error:', error);
    return [];
  }
};

// Update review
export const updateReview = async (
  reviewId: string,
  clientId: string,
  updates: {
    rating?: number;
    comment?: string;
    skillRating?: number;
    speedRating?: number;
    professionalismRating?: number;
    valueRating?: number;
  }
): Promise<void> => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));

    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewDoc.data() as Review;

    // Verify ownership
    if (review.clientId !== clientId) {
      throw new Error('Not authorized to update this review');
    }

    await updateDoc(doc(db, 'reviews', reviewId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Update barber rating if rating changed
    if (updates.rating !== undefined) {
      await updateBarberRating(review.barberId);
    }
  } catch (error) {
    // console.error('Update review error:', error);
    throw new Error('Failed to update review');
  }
};

// Barber responds to review
export const respondToReview = async (
  reviewId: string,
  barberId: string,
  responseMessage: string
): Promise<void> => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));

    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewDoc.data() as Review;

    // Verify barber owns this review
    if (review.barberId !== barberId) {
      throw new Error('Not authorized to respond to this review');
    }

    await updateDoc(doc(db, 'reviews', reviewId), {
      barberResponse: {
        message: responseMessage,
        respondedAt: new Date().toISOString(),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // console.error('Respond to review error:', error);
    throw new Error('Failed to respond to review');
  }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId: string, userId: string): Promise<void> => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));

    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewDoc.data() as Review;

    // Toggle helpful status
    if (review.helpfulBy.includes(userId)) {
      // Remove helpful
      await updateDoc(doc(db, 'reviews', reviewId), {
        helpfulBy: arrayRemove(userId),
        helpfulCount: increment(-1),
      });
    } else {
      // Add helpful
      await updateDoc(doc(db, 'reviews', reviewId), {
        helpfulBy: arrayUnion(userId),
        helpfulCount: increment(1),
      });
    }
  } catch (error) {
    // console.error('Mark review helpful error:', error);
    throw new Error('Failed to mark review as helpful');
  }
};

// Get barber rating summary
export const getBarberRating = async (barberId: string): Promise<BarberRating | null> => {
  try {
    const ratingDoc = await getDoc(doc(db, 'barberRatings', barberId));

    if (!ratingDoc.exists()) {
      return null;
    }

    return { barberId, ...ratingDoc.data() } as BarberRating;
  } catch (error) {
    // console.error('Get barber rating error:', error);
    return null;
  }
};

// Update barber rating (recalculate from all reviews)
export const updateBarberRating = async (barberId: string): Promise<void> => {
  try {
    // Get all reviews for barber
    const reviewsQuery = query(collection(db, 'reviews'), where('barberId', '==', barberId));

    const snapshot = await getDocs(reviewsQuery);
    const reviews = snapshot.docs.map((doc) => doc.data() as Review);

    if (reviews.length === 0) {
      return;
    }

    // Calculate averages
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Rating breakdown
    const fiveStars = reviews.filter((r) => r.rating === 5).length;
    const fourStars = reviews.filter((r) => r.rating === 4).length;
    const threeStars = reviews.filter((r) => r.rating === 3).length;
    const twoStars = reviews.filter((r) => r.rating === 2).length;
    const oneStar = reviews.filter((r) => r.rating === 1).length;

    // Detailed averages
    const skillRatings = reviews.filter((r) => r.skillRating).map((r) => r.skillRating!);
    const speedRatings = reviews.filter((r) => r.speedRating).map((r) => r.speedRating!);
    const professionalismRatings = reviews.filter((r) => r.professionalismRating).map((r) => r.professionalismRating!);
    const valueRatings = reviews.filter((r) => r.valueRating).map((r) => r.valueRating!);

    const ratingData: BarberRating = {
      barberId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      fiveStars,
      fourStars,
      threeStars,
      twoStars,
      oneStar,
      averageSkill: skillRatings.length > 0 ? skillRatings.reduce((a, b) => a + b, 0) / skillRatings.length : undefined,
      averageSpeed: speedRatings.length > 0 ? speedRatings.reduce((a, b) => a + b, 0) / speedRatings.length : undefined,
      averageProfessionalism: professionalismRatings.length > 0 ? professionalismRatings.reduce((a, b) => a + b, 0) / professionalismRatings.length : undefined,
      averageValue: valueRatings.length > 0 ? valueRatings.reduce((a, b) => a + b, 0) / valueRatings.length : undefined,
      lastUpdated: new Date().toISOString(),
    };

    // Save to barberRatings collection
    await setDoc(doc(db, 'barberRatings', barberId), ratingData);

    // Update barber profile
    await updateDoc(doc(db, 'barbers', barberId), {
      rating: ratingData.averageRating,
      totalReviews: ratingData.totalReviews,
    });
  } catch (error) {
    // console.error('Update barber rating error:', error);
  }
};

// Helper: Upload review images
const uploadReviewImages = async (reviewId: string, imageUris: string[]): Promise<string[]> => {
  try {
    const uploadPromises = imageUris.map(async (uri, index) => {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `reviews/${reviewId}/${index}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    // console.error('Upload review images error:', error);
    return [];
  }
};
