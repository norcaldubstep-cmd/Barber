import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PromotionTier } from '../types/promotion.types';
import { TIER_LIMITS, TierFeatureCheck } from '../types/payment.types';

/**
 * Feature Enforcement Service
 *
 * Checks if barbers can perform actions based on their promotion tier.
 * Enforces limits on portfolio images, services, posts, etc.
 */

// ============================================================================
// TIER CHECKING
// ============================================================================

/**
 * Get barber's current promotion tier
 */
export const getBarberTier = async (barberId: string): Promise<PromotionTier> => {
  try {
    const barberDoc = await getDoc(doc(db, 'barbers', barberId));
    if (!barberDoc.exists()) {
      throw new Error('Barber not found');
    }

    return barberDoc.data().promotionTier || PromotionTier.FREE;
  } catch (error) {
    console.error('Error getting barber tier:', error);
    return PromotionTier.FREE;
  }
};

/**
 * Get feature limits for a tier
 */
export const getTierLimits = (tier: PromotionTier) => {
  return TIER_LIMITS[tier];
};

// ============================================================================
// PORTFOLIO ENFORCEMENT
// ============================================================================

/**
 * Check if barber can add more portfolio images
 */
export const canAddPortfolioImage = async (
  barberId: string,
  currentCount: number
): Promise<TierFeatureCheck> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    const allowed = currentCount < limits.maxPortfolioImages;

    if (!allowed && tier !== PromotionTier.PLATINUM) {
      // Find the next tier that would allow this
      const upgradeToTier = getNextTierForFeature('portfolio', currentCount + 1);

      return {
        allowed: false,
        currentUsage: currentCount,
        limit: limits.maxPortfolioImages,
        requiresUpgrade: true,
        upgradeToTier,
      };
    }

    return {
      allowed,
      currentUsage: currentCount,
      limit: limits.maxPortfolioImages,
      requiresUpgrade: false,
    };
  } catch (error) {
    console.error('Error checking portfolio limit:', error);
    throw error;
  }
};

/**
 * Validate portfolio upload
 */
export const validatePortfolioUpload = async (
  barberId: string,
  currentImages: string[]
): Promise<void> => {
  const check = await canAddPortfolioImage(barberId, currentImages.length);

  if (!check.allowed) {
    const limits = getTierLimits(await getBarberTier(barberId));
    throw new Error(
      `Portfolio limit reached (${limits.maxPortfolioImages} images). Upgrade to ${check.upgradeToTier} plan to add more photos.`
    );
  }
};

// ============================================================================
// SERVICES ENFORCEMENT
// ============================================================================

/**
 * Check if barber can add more services
 */
export const canAddService = async (
  barberId: string,
  currentCount: number
): Promise<TierFeatureCheck> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    const allowed = currentCount < limits.maxServices;

    if (!allowed) {
      const upgradeToTier = getNextTierForFeature('services', currentCount + 1);

      return {
        allowed: false,
        currentUsage: currentCount,
        limit: limits.maxServices,
        requiresUpgrade: true,
        upgradeToTier,
      };
    }

    return {
      allowed,
      currentUsage: currentCount,
      limit: limits.maxServices,
      requiresUpgrade: false,
    };
  } catch (error) {
    console.error('Error checking service limit:', error);
    throw error;
  }
};

/**
 * Validate service creation
 */
export const validateServiceCreation = async (
  barberId: string,
  currentServicesCount: number
): Promise<void> => {
  const check = await canAddService(barberId, currentServicesCount);

  if (!check.allowed) {
    const limits = getTierLimits(await getBarberTier(barberId));
    throw new Error(
      `Service limit reached (${limits.maxServices} services). Upgrade to ${check.upgradeToTier} plan to add more services.`
    );
  }
};

// ============================================================================
// POSTS ENFORCEMENT
// ============================================================================

/**
 * Check if barber can create a post today
 */
export const canCreatePost = async (
  barberId: string,
  postsToday: number
): Promise<TierFeatureCheck> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    const allowed = limits.canCreatePosts && postsToday < limits.maxPostsPerDay;

    if (!allowed) {
      const upgradeToTier = getNextTierForFeature('posts', postsToday + 1);

      return {
        allowed: false,
        currentUsage: postsToday,
        limit: limits.maxPostsPerDay,
        requiresUpgrade: true,
        upgradeToTier,
      };
    }

    return {
      allowed,
      currentUsage: postsToday,
      limit: limits.maxPostsPerDay,
      requiresUpgrade: false,
    };
  } catch (error) {
    console.error('Error checking post limit:', error);
    throw error;
  }
};

/**
 * Check if barber can feature a post
 */
export const canFeaturePost = async (barberId: string): Promise<boolean> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    return limits.featuredPosts;
  } catch (error) {
    console.error('Error checking featured post capability:', error);
    return false;
  }
};

// ============================================================================
// ANALYTICS & FEATURES
// ============================================================================

/**
 * Check if barber has access to analytics
 */
export const hasAnalyticsAccess = async (barberId: string): Promise<boolean> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    return limits.analytics;
  } catch (error) {
    console.error('Error checking analytics access:', error);
    return false;
  }
};

/**
 * Check if barber can use custom page layout
 */
export const canUseCustomLayout = async (barberId: string): Promise<boolean> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    return limits.customPageLayout;
  } catch (error) {
    console.error('Error checking custom layout access:', error);
    return false;
  }
};

/**
 * Check if barber can upload video portfolio
 */
export const canUploadVideo = async (barberId: string): Promise<boolean> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    return limits.videoPortfolio;
  } catch (error) {
    console.error('Error checking video access:', error);
    return false;
  }
};

/**
 * Check if barber has priority support
 */
export const hasPrioritySupport = async (barberId: string): Promise<boolean> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    return limits.prioritySupport;
  } catch (error) {
    console.error('Error checking priority support:', error);
    return false;
  }
};

// ============================================================================
// BOOKING FEES
// ============================================================================

/**
 * Get booking fee percentage for barber's tier
 */
export const getBookingFeePercentage = async (
  barberId: string
): Promise<number> => {
  try {
    const tier = await getBarberTier(barberId);
    const limits = getTierLimits(tier);
    return limits.bookingFeePercentage;
  } catch (error) {
    console.error('Error getting booking fee percentage:', error);
    return 0.15; // Default to 15%
  }
};

/**
 * Calculate booking fee for a barber
 */
export const calculateBookingFee = async (
  barberId: string,
  bookingAmount: number
): Promise<number> => {
  try {
    const feePercentage = await getBookingFeePercentage(barberId);
    return bookingAmount * feePercentage;
  } catch (error) {
    console.error('Error calculating booking fee:', error);
    return bookingAmount * 0.15; // Default to 15%
  }
};

/**
 * Calculate barber payout after platform fees
 */
export const calculateBarberPayout = async (
  barberId: string,
  bookingAmount: number
): Promise<{ payout: number; fee: number; feePercentage: number }> => {
  try {
    const fee = await calculateBookingFee(barberId, bookingAmount);
    const feePercentage = await getBookingFeePercentage(barberId);

    return {
      payout: bookingAmount - fee,
      fee,
      feePercentage,
    };
  } catch (error) {
    console.error('Error calculating payout:', error);
    const fee = bookingAmount * 0.15;
    return {
      payout: bookingAmount - fee,
      fee,
      feePercentage: 0.15,
    };
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the next tier that supports a feature requirement
 */
const getNextTierForFeature = (
  feature: 'portfolio' | 'services' | 'posts',
  requiredCount: number
): PromotionTier | undefined => {
  const tiers = [
    PromotionTier.FREE,
    PromotionTier.BRONZE,
    PromotionTier.SILVER,
    PromotionTier.GOLD,
    PromotionTier.PLATINUM,
  ];

  for (const tier of tiers) {
    const limits = getTierLimits(tier);
    let limitValue = 0;

    switch (feature) {
      case 'portfolio':
        limitValue = limits.maxPortfolioImages;
        break;
      case 'services':
        limitValue = limits.maxServices;
        break;
      case 'posts':
        limitValue = limits.maxPostsPerDay;
        break;
    }

    if (limitValue >= requiredCount) {
      return tier;
    }
  }

  return PromotionTier.PLATINUM;
};

/**
 * Get all feature limits for a barber
 */
export const getBarberFeatureLimits = async (barberId: string) => {
  try {
    const tier = await getBarberTier(barberId);
    return getTierLimits(tier);
  } catch (error) {
    console.error('Error getting feature limits:', error);
    return getTierLimits(PromotionTier.FREE);
  }
};

/**
 * Check if barber is verified (Silver tier or higher)
 */
export const shouldBeVerified = (tier: PromotionTier): boolean => {
  return [
    PromotionTier.SILVER,
    PromotionTier.GOLD,
    PromotionTier.PLATINUM,
  ].includes(tier);
};
