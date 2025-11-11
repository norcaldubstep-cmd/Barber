export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  BOOTH_RENTAL = 'BOOTH_RENTAL',
}

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FILLED = 'FILLED',
}

export interface JobListing {
  id: string;
  employerId: string; // Business owner user ID
  employerName: string;
  employerAvatar?: string;
  businessName: string;

  title: string;
  description: string;
  type: JobType;
  status: JobStatus;

  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };

  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: 'hourly' | 'weekly' | 'monthly' | 'yearly';
  boothRentalCost?: number; // For booth rental positions

  // Requirements
  yearsExperienceRequired?: number;
  specialtiesRequired: string[];
  certificationsRequired?: string[];

  // Benefits & Perks
  benefits: string[];

  // Application details
  applicationCount: number;
  contactEmail?: string;
  contactPhone?: string;
  applicationUrl?: string;

  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  employerId: string;

  // Application details
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  phoneNumber?: string;
  email: string;

  // Status
  status: 'pending' | 'reviewing' | 'interviewing' | 'accepted' | 'rejected';
  notes?: string;

  createdAt: string;
  updatedAt: string;
}
