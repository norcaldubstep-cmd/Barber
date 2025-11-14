import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  Booking,
  BookingStatus,
  Service,
  TimeSlot,
  AvailableDate,
} from '../types/booking.types';
import { BarberAvailability, WeekSchedule } from '../types/schedule.types';
import {
  notifyBookingRequested,
  notifyBookingApproved,
  notifyBookingDenied,
  notifyBookingCancelled,
} from './notificationService';

/**
 * Booking Service
 * Handles all booking-related operations with Firestore
 */

// Create a new booking
export const createBooking = async (
  clientId: string,
  clientName: string,
  barberId: string,
  barberName: string,
  services: Service[],
  date: string,
  startTime: string,
  notes?: string,
  clientAvatar?: string,
  barberAvatar?: string
): Promise<Booking> => {
  try {
    const bookingRef = doc(collection(db, 'bookings'));

    // Calculate total duration and price
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

    // Calculate end time
    const endTime = calculateEndTime(startTime, totalDuration);

    const bookingData: Booking = {
      id: bookingRef.id,
      clientId,
      clientName,
      clientAvatar,
      barberId,
      barberName,
      barberAvatar,
      services,
      totalDuration,
      totalPrice,
      date,
      startTime,
      endTime,
      status: BookingStatus.PENDING,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(bookingRef, {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update barber's total clients count
    await updateDoc(doc(db, 'barbers', barberId), {
      totalClients: increment(1),
    });

    // Notify barber about new booking request
    try {
      await notifyBookingRequested(
        barberId,
        bookingData.id,
        clientId,
        clientName,
        clientAvatar,
        services[0].name,
        date,
        startTime
      );
    } catch (notifError) {
      // console.error('Error sending booking notification:', notifError);
      // Don't fail the booking if notification fails
    }

    return bookingData;
  } catch (error) {
    // console.error('Create booking error:', error);
    throw new Error('Failed to create booking');
  }
};

// Get booking by ID
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));

    if (!bookingDoc.exists()) {
      return null;
    }

    return { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
  } catch (error) {
    // console.error('Get booking error:', error);
    return null;
  }
};

// Get bookings for a client
export const getClientBookings = async (
  clientId: string,
  status?: BookingStatus,
  limitCount: number = 50
): Promise<Booking[]> => {
  try {
    let q = query(
      collection(db, 'bookings'),
      where('clientId', '==', clientId),
      orderBy('date', 'desc'),
      orderBy('startTime', 'desc'),
      limit(limitCount)
    );

    if (status) {
      q = query(
        collection(db, 'bookings'),
        where('clientId', '==', clientId),
        where('status', '==', status),
        orderBy('date', 'desc'),
        orderBy('startTime', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (error) {
    // console.error('Get client bookings error:', error);
    return [];
  }
};

// Get bookings for a barber
export const getBarberBookings = async (
  barberId: string,
  status?: BookingStatus,
  limitCount: number = 50
): Promise<Booking[]> => {
  try {
    let q = query(
      collection(db, 'bookings'),
      where('barberId', '==', barberId),
      orderBy('date', 'desc'),
      orderBy('startTime', 'desc'),
      limit(limitCount)
    );

    if (status) {
      q = query(
        collection(db, 'bookings'),
        where('barberId', '==', barberId),
        where('status', '==', status),
        orderBy('date', 'desc'),
        orderBy('startTime', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (error) {
    // console.error('Get barber bookings error:', error);
    return [];
  }
};

// Get upcoming bookings for a client
export const getUpcomingClientBookings = async (clientId: string): Promise<Booking[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const q = query(
      collection(db, 'bookings'),
      where('clientId', '==', clientId),
      where('date', '>=', today),
      where('status', 'in', [BookingStatus.PENDING, BookingStatus.CONFIRMED]),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (error) {
    // console.error('Get upcoming bookings error:', error);
    return [];
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Get booking to verify ownership
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify user is either the client or barber
    if (currentUser.uid !== booking.clientId && currentUser.uid !== booking.barberId) {
      throw new Error('Unauthorized: You do not have permission to update this booking');
    }

    await updateDoc(doc(db, 'bookings', bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // console.error('Update booking status error:', error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Get booking to verify ownership
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify user is either the client or barber
    if (currentUser.uid !== booking.clientId && currentUser.uid !== booking.barberId) {
      throw new Error('Unauthorized: You do not have permission to cancel this booking');
    }

    await updateBookingStatus(bookingId, BookingStatus.CANCELLED);

    // Notify the other party about the cancellation
    try {
      const isClient = currentUser.uid === booking.clientId;
      const recipientId = isClient ? booking.barberId : booking.clientId;
      const cancellerName = isClient ? booking.clientName : booking.barberName;

      await notifyBookingCancelled(recipientId, bookingId, cancellerName);
    } catch (notifError) {
      // console.error('Error sending cancellation notification:', notifError);
      // Don't fail the cancellation if notification fails
    }
  } catch (error) {
    // console.error('Cancel booking error:', error);
    throw error;
  }
};

// Approve booking (barber only)
export const approveBooking = async (bookingId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Get booking to verify barber ownership
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only barber can approve
    if (currentUser.uid !== booking.barberId) {
      throw new Error('Unauthorized: Only the barber can approve this booking');
    }

    // Can only approve pending bookings
    if (booking.status !== BookingStatus.PENDING) {
      throw new Error('Can only approve pending bookings');
    }

    await updateBookingStatus(bookingId, BookingStatus.CONFIRMED);

    // Notify client that booking was approved
    try {
      await notifyBookingApproved(
        booking.clientId,
        bookingId,
        booking.barberId,
        booking.barberName,
        booking.barberAvatar,
        booking.date,
        booking.startTime
      );
    } catch (notifError) {
      // console.error('Error sending approval notification:', notifError);
      // Don't fail the approval if notification fails
    }
  } catch (error) {
    // console.error('Approve booking error:', error);
    throw error;
  }
};

// Deny booking (barber only)
export const denyBooking = async (bookingId: string, reason?: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Get booking to verify barber ownership
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only barber can deny
    if (currentUser.uid !== booking.barberId) {
      throw new Error('Unauthorized: Only the barber can deny this booking');
    }

    // Can only deny pending bookings
    if (booking.status !== BookingStatus.PENDING) {
      throw new Error('Can only deny pending bookings');
    }

    // Update status to denied and optionally store reason
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: BookingStatus.DENIED,
      denialReason: reason,
      updatedAt: serverTimestamp(),
    });

    // Notify client that booking was denied
    try {
      await notifyBookingDenied(
        booking.clientId,
        bookingId,
        booking.barberId,
        booking.barberName,
        booking.barberAvatar,
        reason
      );
    } catch (notifError) {
      // console.error('Error sending denial notification:', notifError);
      // Don't fail the denial if notification fails
    }
  } catch (error) {
    // console.error('Deny booking error:', error);
    throw error;
  }
};

// Delete booking (admin only)
export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Get booking to verify ownership
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only the client who created the booking can delete it
    if (currentUser.uid !== booking.clientId) {
      throw new Error('Unauthorized: Only the client can delete this booking');
    }

    await deleteDoc(doc(db, 'bookings', bookingId));
  } catch (error) {
    // console.error('Delete booking error:', error);
    throw error;
  }
};

// Get available time slots for a barber on a specific date
export const getAvailableTimeSlots = async (
  barberId: string,
  date: string
): Promise<TimeSlot[]> => {
  try {
    // Get barber's schedule
    const availabilityDoc = await getDoc(doc(db, 'barberAvailability', barberId));

    if (!availabilityDoc.exists()) {
      return [];
    }

    const availability = availabilityDoc.data() as BarberAvailability;

    // Get day of week
    const dateObj = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dateObj.getDay()] as keyof WeekSchedule;

    const daySchedule = availability.weekSchedule[dayName];

    if (!daySchedule.isWorking) {
      return [];
    }

    // Check for exceptions (holidays, time off, etc.)
    const exception = availability.exceptions.find((e) => e.date === date);
    if (exception && !exception.isAvailable) {
      return [];
    }

    // Use custom slots if exception exists
    const workSlots = exception?.customSlots || daySchedule.slots;

    // Get existing bookings for this date
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('barberId', '==', barberId),
      where('date', '==', date),
      where('status', 'in', [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS])
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map((doc) => doc.data() as Booking);

    // Generate time slots
    const timeSlots: TimeSlot[] = [];
    const slotInterval = 30; // 30-minute intervals
    const buffer = availability.bookingBuffer || 0;

    for (const workSlot of workSlots) {
      if (workSlot.isBreak) continue;

      const startMinutes = timeToMinutes(workSlot.startTime);
      const endMinutes = timeToMinutes(workSlot.endTime);

      for (let minutes = startMinutes; minutes < endMinutes; minutes += slotInterval) {
        const slotTime = minutesToTime(minutes);
        const slotEndTime = minutesToTime(minutes + slotInterval);

        // Check if slot is booked
        const isBooked = bookings.some((booking) => {
          const bookingStart = timeToMinutes(booking.startTime);
          const bookingEnd = timeToMinutes(booking.endTime);
          const slotStart = minutes;
          const slotEnd = minutes + slotInterval;

          return (
            (slotStart >= bookingStart && slotStart < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotStart <= bookingStart && slotEnd >= bookingEnd)
          );
        });

        timeSlots.push({
          time: slotTime,
          isAvailable: !isBooked,
          barberId,
        });
      }
    }

    return timeSlots;
  } catch (error) {
    // console.error('Get available time slots error:', error);
    return [];
  }
};

// Get available dates for a barber (next N days)
export const getAvailableDates = async (
  barberId: string,
  daysAhead: number = 30
): Promise<AvailableDate[]> => {
  try {
    const dates: AvailableDate[] = [];
    const today = new Date();

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      const slots = await getAvailableTimeSlots(barberId, dateString);

      if (slots.length > 0) {
        dates.push({
          date: dateString,
          slots,
        });
      }
    }

    return dates;
  } catch (error) {
    // console.error('Get available dates error:', error);
    return [];
  }
};

// Set barber availability/schedule
export const setBarberAvailability = async (
  barberId: string,
  weekSchedule: WeekSchedule,
  bookingBuffer: number = 0,
  advanceBookingDays: number = 30
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Unauthorized: User must be authenticated');
    }

    // Verify user is the barber
    if (currentUser.uid !== barberId) {
      throw new Error('Unauthorized: You can only set your own availability');
    }

    const availabilityData: BarberAvailability = {
      barberId,
      weekSchedule,
      exceptions: [],
      bookingBuffer,
      advanceBookingDays,
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(doc(db, 'barberAvailability', barberId), availabilityData);
  } catch (error) {
    // console.error('Set barber availability error:', error);
    throw error;
  }
};

// Helper: Convert time string to minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper: Convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Helper: Calculate end time based on start time and duration
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(endMinutes);
};
