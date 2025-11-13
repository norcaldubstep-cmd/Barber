import { db, auth } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { PromotionTier } from '../types/promotion.types';

/**
 * Analytics Service
 *
 * Tracks barber performance metrics, subscription analytics,
 * and ROI for premium plans.
 */

export interface BarberAnalytics {
  barberId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;

  // Visibility Metrics
  profileViews: number;
  searchImpressions: number;
  searchRank: number;

  // Engagement Metrics
  bookingsReceived: number;
  bookingsCompleted: number;
  bookingsCanceled: number;
  totalRevenue: number;
  platformFees: number;
  netRevenue: number;

  // Social Metrics
  postsCreated: number;
  postsViews: number;
  postsLikes: number;
  postsComments: number;
  followersGained: number;
  followersLost: number;

  // Review Metrics
  reviewsReceived: number;
  averageRating: number;

  // Performance Score
  responseTime: number; // in minutes
  responseRate: number; // percentage

  // Tier Info
  promotionTier: PromotionTier;
  subscriptionCost: number;
  roi: number; // Return on investment percentage

  createdAt: Date;
  updatedAt: Date;
}

export interface PlanPerformanceMetrics {
  tier: PromotionTier;
  activeSubscribers: number;
  totalRevenue: number;
  averageBookingsPerBarber: number;
  averageROI: number;
  retentionRate: number;
  conversionRate: number; // From free to paid
}

// ============================================================================
// TRACKING FUNCTIONS
// ============================================================================

/**
 * Track profile view
 */
export const trackProfileView = async (
  barberId: string,
  viewerId?: string
): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const analyticsId = `${barberId}_${today}`;

    const analyticsRef = doc(db, 'analytics', analyticsId);
    const analyticsDoc = await getDoc(analyticsRef);

    if (analyticsDoc.exists()) {
      await updateDoc(analyticsRef, {
        profileViews: increment(1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(analyticsRef, {
        barberId,
        period: 'daily',
        date: Timestamp.fromDate(new Date(today)),
        profileViews: 1,
        searchImpressions: 0,
        searchRank: 0,
        bookingsReceived: 0,
        bookingsCompleted: 0,
        bookingsCanceled: 0,
        totalRevenue: 0,
        platformFees: 0,
        netRevenue: 0,
        postsCreated: 0,
        postsViews: 0,
        postsLikes: 0,
        postsComments: 0,
        followersGained: 0,
        followersLost: 0,
        reviewsReceived: 0,
        averageRating: 0,
        responseTime: 0,
        responseRate: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking profile view:', error);
  }
};

/**
 * Track search impression
 */
export const trackSearchImpression = async (
  barberId: string,
  searchRank: number
): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const analyticsId = `${barberId}_${today}`;

    const analyticsRef = doc(db, 'analytics', analyticsId);
    await updateDoc(analyticsRef, {
      searchImpressions: increment(1),
      searchRank,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error tracking search impression:', error);
  }
};

/**
 * Track booking received
 */
export const trackBookingReceived = async (
  barberId: string,
  bookingAmount: number,
  platformFee: number
): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const analyticsId = `${barberId}_${today}`;

    const analyticsRef = doc(db, 'analytics', analyticsId);
    await updateDoc(analyticsRef, {
      bookingsReceived: increment(1),
      totalRevenue: increment(bookingAmount),
      platformFees: increment(platformFee),
      netRevenue: increment(bookingAmount - platformFee),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error tracking booking received:', error);
  }
};

/**
 * Track booking completed
 */
export const trackBookingCompleted = async (barberId: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const analyticsId = `${barberId}_${today}`;

    const analyticsRef = doc(db, 'analytics', analyticsId);
    await updateDoc(analyticsRef, {
      bookingsCompleted: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error tracking booking completed:', error);
  }
};

/**
 * Track post creation
 */
export const trackPostCreated = async (barberId: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const analyticsId = `${barberId}_${today}`;

    const analyticsRef = doc(db, 'analytics', analyticsId);
    await updateDoc(analyticsRef, {
      postsCreated: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error tracking post created:', error);
  }
};

/**
 * Track follower gained
 */
export const trackFollowerGained = async (barberId: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const analyticsId = `${barberId}_${today}`;

    const analyticsRef = doc(db, 'analytics', analyticsId);
    await updateDoc(analyticsRef, {
      followersGained: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error tracking follower gained:', error);
  }
};

/**
 * Track review received
 */
export const trackReviewReceived = async (
  barberId: string,
  rating: number
): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const analyticsId = `${barberId}_${today}`;

    const analyticsRef = doc(db, 'analytics', analyticsId);
    const analyticsDoc = await getDoc(analyticsRef);

    if (analyticsDoc.exists()) {
      const data = analyticsDoc.data();
      const currentReviews = data.reviewsReceived || 0;
      const currentAverage = data.averageRating || 0;
      const newAverage = (currentAverage * currentReviews + rating) / (currentReviews + 1);

      await updateDoc(analyticsRef, {
        reviewsReceived: increment(1),
        averageRating: newAverage,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking review received:', error);
  }
};

// ============================================================================
// ANALYTICS RETRIEVAL
// ============================================================================

/**
 * Get barber analytics for a specific period
 */
export const getBarberAnalytics = async (
  barberId: string,
  startDate: Date,
  endDate: Date
): Promise<BarberAnalytics[]> => {
  try {
    const analyticsRef = collection(db, 'analytics');
    const q = query(
      analyticsRef,
      where('barberId', '==', barberId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as BarberAnalytics;
    });
  } catch (error) {
    console.error('Error getting barber analytics:', error);
    return [];
  }
};

/**
 * Get analytics summary for barber
 */
export const getAnalyticsSummary = async (
  barberId: string,
  days: number = 30
): Promise<{
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  newFollowers: number;
}> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await getBarberAnalytics(barberId, startDate, endDate);

    return {
      totalViews: analytics.reduce((sum, a) => sum + a.profileViews, 0),
      totalBookings: analytics.reduce((sum, a) => sum + a.bookingsReceived, 0),
      totalRevenue: analytics.reduce((sum, a) => sum + a.netRevenue, 0),
      averageRating: analytics.reduce((sum, a) => sum + a.averageRating, 0) / (analytics.length || 1),
      newFollowers: analytics.reduce((sum, a) => sum + a.followersGained, 0),
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return {
      totalViews: 0,
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      newFollowers: 0,
    };
  }
};

/**
 * Calculate ROI for subscription
 */
export const calculateSubscriptionROI = async (
  barberId: string,
  subscriptionCost: number,
  days: number = 30
): Promise<number> => {
  try {
    const summary = await getAnalyticsSummary(barberId, days);

    // ROI = ((Revenue - Cost) / Cost) * 100
    if (subscriptionCost === 0) return 0;

    const roi = ((summary.totalRevenue - subscriptionCost) / subscriptionCost) * 100;
    return Math.round(roi * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating ROI:', error);
    return 0;
  }
};

/**
 * Get plan performance metrics (admin only)
 */
export const getPlanPerformanceMetrics = async (
  tier: PromotionTier
): Promise<PlanPerformanceMetrics | null> => {
  try {
    // This would typically be called by admin/backend
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('tier', '==', tier),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    const activeSubscribers = snapshot.size;

    // Calculate aggregate metrics
    // In production, this would be pre-computed and cached

    return {
      tier,
      activeSubscribers,
      totalRevenue: 0, // Would be calculated from payment history
      averageBookingsPerBarber: 0,
      averageROI: 0,
      retentionRate: 0,
      conversionRate: 0,
    };
  } catch (error) {
    console.error('Error getting plan performance metrics:', error);
    return null;
  }
};

/**
 * Export analytics data for barber
 */
export const exportAnalyticsData = async (
  barberId: string,
  startDate: Date,
  endDate: Date
): Promise<string> => {
  try {
    const analytics = await getBarberAnalytics(barberId, startDate, endDate);

    // Convert to CSV format
    const headers = [
      'Date',
      'Profile Views',
      'Bookings',
      'Revenue',
      'Platform Fees',
      'Net Revenue',
      'Posts',
      'New Followers',
      'Reviews',
      'Avg Rating',
    ];

    const rows = analytics.map(a => [
      a.date.toLocaleDateString(),
      a.profileViews,
      a.bookingsReceived,
      `$${a.totalRevenue.toFixed(2)}`,
      `$${a.platformFees.toFixed(2)}`,
      `$${a.netRevenue.toFixed(2)}`,
      a.postsCreated,
      a.followersGained,
      a.reviewsReceived,
      a.averageRating.toFixed(1),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    return '';
  }
};
