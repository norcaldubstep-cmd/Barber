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
    name: 'Starter',
    price: 0,
    duration: 0,
    features: [
      'Basic profile listing',
      'Accept bookings',
      'Portfolio (up to 10 photos)',
      'Message clients',
      'Standard search visibility',
    ],
    boostMultiplier: 1,
    priority: 0,
    color: '#9CA3AF',
    icon: 'star-outline',
    description: 'Perfect for getting started',
  },
  {
    tier: PromotionTier.BRONZE,
    name: 'Professional',
    price: 29.99,
    duration: 30,
    features: [
      'Enhanced search ranking',
      'Portfolio (up to 30 photos)',
      'Basic analytics dashboard',
      'Priority customer support',
      'Profile badge',
      'Featured in local results',
    ],
    boostMultiplier: 2,
    priority: 1,
    color: '#CD7F32',
    icon: 'trophy-outline',
    description: 'Grow your local presence',
  },
  {
    tier: PromotionTier.SILVER,
    name: 'Premium',
    price: 49.99,
    duration: 30,
    features: [
      'Top 3 in local search',
      'Unlimited portfolio photos',
      'Verified business badge',
      'Advanced analytics & insights',
      'Featured posts promotion',
      'Reduced booking fees (5%)',
      'Priority booking notifications',
    ],
    boostMultiplier: 5,
    priority: 2,
    color: '#C0C0C0',
    icon: 'medal-outline',
    description: 'Stand out from competitors',
    isPopular: true,
  },
  {
    tier: PromotionTier.GOLD,
    name: 'Elite',
    price: 99.99,
    duration: 30,
    features: [
      'Guaranteed top search position',
      'Homepage featured spotlight',
      'Video portfolio showcase',
      'No booking fees (0%)',
      'Advanced revenue analytics',
      'Automated review requests',
      'Multi-location support',
      'Custom profile URL',
    ],
    boostMultiplier: 10,
    priority: 3,
    color: '#FFD700',
    icon: 'ribbon-outline',
    description: 'Maximum visibility & growth',
  },
  {
    tier: PromotionTier.PLATINUM,
    name: 'Enterprise',
    price: 199.99,
    duration: 30,
    features: [
      'Exclusive nationwide spotlight',
      'Dedicated success manager',
      'Team management (unlimited barbers)',
      'Custom branding & themes',
      'API & integration access',
      'White-label booking page',
      'Premium support (24/7)',
      'Revenue optimization tools',
      'Early access to new features',
    ],
    boostMultiplier: 20,
    priority: 4,
    color: '#E5E4E2',
    icon: 'diamond-outline',
    description: 'For serious businesses',
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
