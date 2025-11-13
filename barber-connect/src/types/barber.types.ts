import { Service } from './booking.types';
import { PromotionTier } from './promotion.types';
import { Location } from './location.types';

// Re-export Service for convenience
export type { Service };

export interface SocialLink {
  title: string;
  url: string;
  icon?: string;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  bookingUrl?: string;
  customLinks?: SocialLink[];
}

export interface BarberProfile {
  id: string;
  userId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;

  // Professional Info
  specialties: string[];
  yearsOfExperience: number;
  certifications: string[];
  awards?: string[];

  // Location
  location: Location;
  worksAt?: string; // Business name
  businessOwnerId?: string;

  // Social Stats
  followersCount: number;
  followingCount: number;
  postsCount: number;
  rating: number;
  totalReviews: number;
  totalClients: number;

  // Services
  services: Service[];

  // Availability
  isAvailable: boolean;
  acceptsWalkIns: boolean;
  instantBooking: boolean;

  // Verification & Status
  isVerified: boolean;
  promotionTier: PromotionTier;
  joinedDate: string;

  // Customization
  themeColor?: string;
  pageLayout?: 'default' | 'modern' | 'minimal' | 'showcase';

  // Portfolio
  portfolioImages: string[];
  featuredWork: string[];

  // Engagement
  responseTime: string; // e.g., "Within 1 hour"
  responseRate: number; // percentage

  // Social & Professional Links
  socialLinks?: SocialLinks;

  // Distance (calculated on client)
  distance?: number;
  distanceUnit?: 'miles' | 'km';
}

export interface BarberSearchFilters {
  query?: string;
  location?: Location;
  maxDistance?: number; // in miles
  specialties?: string[];
  minRating?: number;
  priceRange?: { min: number; max: number };
  availability?: 'now' | 'today' | 'this_week' | 'any';
  verified?: boolean;
  acceptsWalkIns?: boolean;
  sortBy?: 'distance' | 'rating' | 'price' | 'popularity' | 'promoted';
}

export const SPECIALTIES = [
  'Fades',
  'Beard Trim',
  'Buzz Cut',
  'Taper',
  'Bald Fade',
  'Line Up',
  'Hot Towel Shave',
  'Hair Coloring',
  'Perms',
  'Dreadlocks',
  'Braids',
  'Kids Haircuts',
  'Senior Cuts',
  'Beard Sculpting',
  'Hair Treatments',
];
