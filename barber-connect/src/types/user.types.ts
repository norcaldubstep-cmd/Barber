export enum UserRole {
  CLIENT = 'CLIENT',
  BARBER = 'BARBER',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
}

export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string;
}

export type User = BaseUser;
