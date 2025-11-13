import { auth, db } from './firebase';
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
} from 'firebase/firestore';
import {
  Subscription,
  PaymentHistory,
  BillingCycle,
  SubscriptionStatus,
  PaymentMethod,
} from '../types/payment.types';
import { PromotionTier } from '../types/promotion.types';

/**
 * Payment Service
 *
 * Handles all payment-related operations including subscriptions,
 * payment methods, and billing history.
 *
 * IMPORTANT: This service provides the client-side interface.
 * Actual Stripe API calls should be made from Cloud Functions for security.
 */

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Get active subscription for a barber
 */
export const getActiveSubscription = async (
  barberId: string
): Promise<Subscription | null> => {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('barberId', '==', barberId),
      where('status', '==', 'active'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      currentPeriodStart: data.currentPeriodStart?.toDate(),
      currentPeriodEnd: data.currentPeriodEnd?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Subscription;
  } catch (error) {
    console.error('Error getting active subscription:', error);
    throw error;
  }
};

/**
 * Create a new subscription
 * This calls a Cloud Function which handles Stripe API
 */
export const createSubscription = async (
  barberId: string,
  tier: PromotionTier,
  billingCycle: BillingCycle,
  paymentMethodId?: string
): Promise<{ subscriptionId: string; clientSecret?: string }> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    // In production, this would call a Cloud Function
    // For now, we'll create a mock subscription
    const subscriptionId = `sub_${Date.now()}`;

    // Create subscription document
    const subscriptionData = {
      userId: currentUser.uid,
      barberId,
      tier,
      status: 'active' as SubscriptionStatus,
      billingCycle,
      currentPeriodStart: Timestamp.now(),
      currentPeriodEnd: Timestamp.fromDate(
        new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
      ),
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: `cus_${currentUser.uid}`,
      pricePerCycle: 0, // Would be set by Cloud Function
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'subscriptions', subscriptionId), subscriptionData);

    // Update barber profile with new tier
    await updateDoc(doc(db, 'barbers', barberId), {
      promotionTier: tier,
      subscriptionId,
      updatedAt: serverTimestamp(),
    });

    return { subscriptionId };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Cancel subscription at period end
 */
export const cancelSubscription = async (
  subscriptionId: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    // Verify ownership
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', subscriptionId));
    if (!subscriptionDoc.exists()) {
      throw new Error('Subscription not found');
    }

    const subscription = subscriptionDoc.data();
    if (subscription.userId !== currentUser.uid) {
      throw new Error('Unauthorized');
    }

    // In production, call Cloud Function to cancel in Stripe
    // For now, just update the document
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      cancelAtPeriodEnd: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Reactivate a canceled subscription
 */
export const reactivateSubscription = async (
  subscriptionId: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    // Verify ownership
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', subscriptionId));
    if (!subscriptionDoc.exists()) {
      throw new Error('Subscription not found');
    }

    const subscription = subscriptionDoc.data();
    if (subscription.userId !== currentUser.uid) {
      throw new Error('Unauthorized');
    }

    // In production, call Cloud Function
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      cancelAtPeriodEnd: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
};

/**
 * Update subscription tier
 */
export const updateSubscriptionTier = async (
  subscriptionId: string,
  newTier: PromotionTier
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    // Verify ownership
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', subscriptionId));
    if (!subscriptionDoc.exists()) {
      throw new Error('Subscription not found');
    }

    const subscription = subscriptionDoc.data();
    if (subscription.userId !== currentUser.uid) {
      throw new Error('Unauthorized');
    }

    // In production, call Cloud Function to update in Stripe
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      tier: newTier,
      updatedAt: serverTimestamp(),
    });

    // Update barber profile
    await updateDoc(doc(db, 'barbers', subscription.barberId), {
      promotionTier: newTier,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    throw error;
  }
};

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Get payment methods for user
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const methodsRef = collection(db, 'users', currentUser.uid, 'paymentMethods');
    const snapshot = await getDocs(methodsRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PaymentMethod[];
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
};

/**
 * Add payment method
 * In production, this would use Stripe Elements and call Cloud Function
 */
export const addPaymentMethod = async (
  paymentMethodId: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    // In production, call Cloud Function to attach to Stripe customer
    const methodData = {
      stripePaymentMethodId: paymentMethodId,
      isDefault: false,
      createdAt: serverTimestamp(),
    };

    await setDoc(
      doc(db, 'users', currentUser.uid, 'paymentMethods', paymentMethodId),
      methodData
    );
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

/**
 * Remove payment method
 */
export const removePaymentMethod = async (
  paymentMethodId: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    // In production, call Cloud Function to detach from Stripe
    await updateDoc(
      doc(db, 'users', currentUser.uid, 'paymentMethods', paymentMethodId),
      {
        deleted: true,
        deletedAt: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error('Error removing payment method:', error);
    throw error;
  }
};

/**
 * Set default payment method
 */
export const setDefaultPaymentMethod = async (
  paymentMethodId: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    // Get all payment methods
    const methodsRef = collection(db, 'users', currentUser.uid, 'paymentMethods');
    const snapshot = await getDocs(methodsRef);

    // Update all to non-default
    const batch = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isDefault: doc.id === paymentMethodId })
    );

    await Promise.all(batch);
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

// ============================================================================
// PAYMENT HISTORY
// ============================================================================

/**
 * Get payment history for user
 */
export const getPaymentHistory = async (
  limitCount: number = 50
): Promise<PaymentHistory[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const historyRef = collection(db, 'paymentHistory');
    const q = query(
      historyRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        paidAt: data.paidAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as PaymentHistory;
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    throw error;
  }
};

/**
 * Record a payment in history
 */
export const recordPayment = async (
  amount: number,
  tier: PromotionTier,
  billingCycle: BillingCycle,
  status: 'succeeded' | 'failed' | 'pending' | 'refunded'
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    const paymentData = {
      userId: currentUser.uid,
      amount,
      currency: 'usd',
      description: `${tier} plan - ${billingCycle}`,
      status,
      tier,
      billingCycle,
      paidAt: status === 'succeeded' ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(collection(db, 'paymentHistory')), paymentData);
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

// ============================================================================
// PRICING HELPERS
// ============================================================================

/**
 * Calculate subscription price with discount
 */
export const calculatePrice = (
  basePrice: number,
  billingCycle: BillingCycle
): number => {
  if (billingCycle === 'yearly') {
    // 17% discount for yearly billing
    return Math.floor(basePrice * 0.83);
  }
  return basePrice;
};

/**
 * Calculate yearly savings
 */
export const calculateYearlySavings = (basePrice: number): number => {
  const monthlyTotal = basePrice * 12;
  const yearlyTotal = calculatePrice(basePrice, 'yearly') * 12;
  return monthlyTotal - yearlyTotal;
};

/**
 * Calculate booking fee based on tier
 */
export const calculateBookingFee = (
  bookingAmount: number,
  tier: PromotionTier
): number => {
  const feePercentages: Record<PromotionTier, number> = {
    [PromotionTier.FREE]: 0.15, // 15%
    [PromotionTier.BRONZE]: 0.10, // 10%
    [PromotionTier.SILVER]: 0.05, // 5%
    [PromotionTier.GOLD]: 0.0, // 0%
    [PromotionTier.PLATINUM]: 0.0, // 0%
  };

  return bookingAmount * (feePercentages[tier] || 0.15);
};

/**
 * Calculate barber payout after fees
 */
export const calculateBarberPayout = (
  bookingAmount: number,
  tier: PromotionTier
): number => {
  const fee = calculateBookingFee(bookingAmount, tier);
  return bookingAmount - fee;
};
