export enum BookingStatus {
  PENDING = 'PENDING', // Awaiting barber approval
  CONFIRMED = 'CONFIRMED', // Barber approved
  DENIED = 'DENIED', // Barber declined
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED', // Cancelled by client or barber after confirmation
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
  denialReason?: string; // Reason for denial (if status is DENIED)

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
