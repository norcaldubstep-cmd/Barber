export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  imageUrl?: string;
  category: 'haircut' | 'beard' | 'styling' | 'coloring' | 'treatment' | 'other';
  isPopular?: boolean;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  barberId: string;
  barberName: string;
  barberAvatar?: string;

  services: Service[];
  totalDuration: number;
  totalPrice: number;

  date: string;
  startTime: string;
  endTime: string;

  status: BookingStatus;
  notes?: string;

  location?: {
    address: string;
    city: string;
    state: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  barberId?: string;
}

export interface AvailableDate {
  date: string;
  slots: TimeSlot[];
}
