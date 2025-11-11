export interface Review {
  id: string;
  barberId: string;
  barberName: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  bookingId?: string; // Optional reference to booking

  rating: number; // 1-5 stars
  comment: string;
  images?: string[]; // Photos of the haircut

  // Detailed ratings (optional)
  skillRating?: number;
  speedRating?: number;
  professionalismRating?: number;
  valueRating?: number;

  // Response from barber
  barberResponse?: {
    message: string;
    respondedAt: string;
  };

  // Verification
  isVerified: boolean; // True if from a confirmed booking

  // Engagement
  helpfulCount: number;
  helpfulBy: string[]; // User IDs who marked as helpful

  createdAt: string;
  updatedAt?: string;
}

export interface BarberRating {
  barberId: string;
  averageRating: number;
  totalReviews: number;

  // Rating breakdown
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;

  // Detailed averages
  averageSkill?: number;
  averageSpeed?: number;
  averageProfessionalism?: number;
  averageValue?: number;

  lastUpdated: string;
}
