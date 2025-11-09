export enum UserRole {
  CLIENT = 'CLIENT',
  BARBER = 'BARBER',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
}

export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  isBusinessOwner: boolean; // Barbers can also be business owners
  profileImageUrl?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: string;
}

export type User = BaseUser;
