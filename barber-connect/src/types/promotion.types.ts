export enum PromotionTier {
  FREE = 'FREE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface PromotionPlan {
  tier: PromotionTier;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  boostMultiplier: number;
  priority: number;
  color: string;
  icon?: string;
  description?: string;
  isPopular?: boolean;
}

export const PROMOTION_PLANS: PromotionPlan[] = [
  {
    tier: PromotionTier.FREE,
    name: 'Free',
    price: 0,
    duration: 0,
    features: ['Basic profile', 'Accept bookings', 'Post content', 'Message clients'],
    boostMultiplier: 1,
    priority: 0,
    color: '#9CA3AF',
  },
  {
    tier: PromotionTier.BRONZE,
    name: 'Bronze',
    price: 19.99,
    duration: 30,
    features: ['Featured in search', '2x visibility boost', 'Priority support', 'Analytics dashboard', 'Custom profile theme'],
    boostMultiplier: 2,
    priority: 1,
    color: '#CD7F32',
  },
  {
    tier: PromotionTier.SILVER,
    name: 'Silver',
    price: 39.99,
    duration: 30,
    features: ['Top of local results', '5x visibility boost', 'Verified badge', 'Featured posts', 'Video tutorials', 'No platform fees'],
    boostMultiplier: 5,
    priority: 2,
    color: '#C0C0C0',
  },
  {
    tier: PromotionTier.GOLD,
    name: 'Gold',
    price: 79.99,
    duration: 30,
    features: ['Premium placement', '10x visibility boost', 'Home page featured', 'Unlimited posts', 'Priority bookings', 'Advanced analytics', 'API access'],
    boostMultiplier: 10,
    priority: 3,
    color: '#FFD700',
  },
  {
    tier: PromotionTier.PLATINUM,
    name: 'Platinum',
    price: 149.99,
    duration: 30,
    features: ['Exclusive spotlight', '20x visibility boost', 'Nationwide featuring', 'Dedicated account manager', 'Custom branding', 'White-label option', 'Revenue insights'],
    boostMultiplier: 20,
    priority: 4,
    color: '#E5E4E2',
  },
];

export interface BarberPromotion {
  barberId: string;
  tier: PromotionTier;
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
}
