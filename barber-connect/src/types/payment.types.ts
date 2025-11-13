import { PromotionTier } from './promotion.types';

export type BillingCycle = 'monthly' | 'yearly';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string; // Visa, Mastercard, etc.
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  barberId: string;
  tier: PromotionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  pricePerCycle: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  clientSecret?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  invoiceUrl?: string;
  createdAt: Date;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';

export interface PaymentHistory {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  tier: PromotionTier;
  billingCycle: BillingCycle;
  paidAt?: Date;
  createdAt: Date;
}

// Stripe Configuration
export interface StripeConfig {
  publishableKey: string;
  secretKey?: string; // Only on backend
  webhookSecret?: string;
}

// Price IDs for each tier (would be set up in Stripe Dashboard)
export interface StripePriceIds {
  [key: string]: {
    monthly: string;
    yearly: string;
  };
}

export const STRIPE_PRICE_IDS: StripePriceIds = {
  [PromotionTier.BRONZE]: {
    monthly: 'price_professional_monthly',
    yearly: 'price_professional_yearly',
  },
  [PromotionTier.SILVER]: {
    monthly: 'price_premium_monthly',
    yearly: 'price_premium_yearly',
  },
  [PromotionTier.GOLD]: {
    monthly: 'price_elite_monthly',
    yearly: 'price_elite_yearly',
  },
  [PromotionTier.PLATINUM]: {
    monthly: 'price_enterprise_monthly',
    yearly: 'price_enterprise_yearly',
  },
};

// Feature limits by tier
export const TIER_LIMITS = {
  [PromotionTier.FREE]: {
    maxPortfolioImages: 10,
    maxServices: 5,
    maxFeaturedWork: 0,
    videoPortfolio: false,
    customPageLayout: false,
    analytics: false,
    prioritySupport: false,
    bookingFeePercentage: 0.15, // 15%
    canCreatePosts: true,
    maxPostsPerDay: 3,
    featuredPosts: false,
  },
  [PromotionTier.BRONZE]: {
    maxPortfolioImages: 30,
    maxServices: 15,
    maxFeaturedWork: 3,
    videoPortfolio: false,
    customPageLayout: false,
    analytics: true,
    prioritySupport: false,
    bookingFeePercentage: 0.10, // 10%
    canCreatePosts: true,
    maxPostsPerDay: 10,
    featuredPosts: false,
  },
  [PromotionTier.SILVER]: {
    maxPortfolioImages: 999, // Unlimited
    maxServices: 50,
    maxFeaturedWork: 10,
    videoPortfolio: false,
    customPageLayout: true,
    analytics: true,
    prioritySupport: false,
    bookingFeePercentage: 0.05, // 5%
    canCreatePosts: true,
    maxPostsPerDay: 20,
    featuredPosts: true,
  },
  [PromotionTier.GOLD]: {
    maxPortfolioImages: 999, // Unlimited
    maxServices: 999,
    maxFeaturedWork: 20,
    videoPortfolio: true,
    customPageLayout: true,
    analytics: true,
    prioritySupport: true,
    bookingFeePercentage: 0.0, // 0%
    canCreatePosts: true,
    maxPostsPerDay: 50,
    featuredPosts: true,
  },
  [PromotionTier.PLATINUM]: {
    maxPortfolioImages: 999, // Unlimited
    maxServices: 999,
    maxFeaturedWork: 50,
    videoPortfolio: true,
    customPageLayout: true,
    analytics: true,
    prioritySupport: true,
    bookingFeePercentage: 0.0, // 0%
    canCreatePosts: true,
    maxPostsPerDay: 999, // Unlimited
    featuredPosts: true,
  },
};

export interface TierFeatureCheck {
  allowed: boolean;
  currentUsage?: number;
  limit?: number;
  requiresUpgrade?: boolean;
  upgradeToTier?: PromotionTier;
}
