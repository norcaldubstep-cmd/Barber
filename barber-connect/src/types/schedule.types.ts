export interface DaySchedule {
  isWorking: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string;   // HH:mm format (e.g., "17:00")
  isBreak?: boolean;
  isBooked?: boolean;
  bookingId?: string;
}

export interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface BarberAvailability {
  barberId: string;
  weekSchedule: WeekSchedule;
  exceptions: ScheduleException[];
  bookingBuffer: number; // minutes between appointments
  advanceBookingDays: number; // how many days in advance can book
  lastUpdated: string;
}

export interface ScheduleException {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  isAvailable: boolean;
  customSlots?: TimeSlot[];
}

export const DEFAULT_WORK_HOURS: TimeSlot = {
  startTime: '09:00',
  endTime: '18:00',
};

export const COMMON_SCHEDULES = {
  TRADITIONAL: {
    monday: { isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
    tuesday: { isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
    wednesday: { isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
    thursday: { isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
    friday: { isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
    saturday: { isWorking: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    sunday: { isWorking: false, slots: [] },
  },
  EXTENDED: {
    monday: { isWorking: true, slots: [{ startTime: '08:00', endTime: '20:00' }] },
    tuesday: { isWorking: true, slots: [{ startTime: '08:00', endTime: '20:00' }] },
    wednesday: { isWorking: true, slots: [{ startTime: '08:00', endTime: '20:00' }] },
    thursday: { isWorking: true, slots: [{ startTime: '08:00', endTime: '20:00' }] },
    friday: { isWorking: true, slots: [{ startTime: '08:00', endTime: '21:00' }] },
    saturday: { isWorking: true, slots: [{ startTime: '08:00', endTime: '21:00' }] },
    sunday: { isWorking: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
  },
  WEEKEND_ONLY: {
    monday: { isWorking: false, slots: [] },
    tuesday: { isWorking: false, slots: [] },
    wednesday: { isWorking: false, slots: [] },
    thursday: { isWorking: false, slots: [] },
    friday: { isWorking: false, slots: [] },
    saturday: { isWorking: true, slots: [{ startTime: '08:00', endTime: '20:00' }] },
    sunday: { isWorking: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
  },
};

export const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30',
];
