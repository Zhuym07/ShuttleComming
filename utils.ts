import { BusRun, DayOfWeek } from "./types";

/**
 * Converts "HH:mm" string to minutes from start of day (00:00)
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Formats minutes from midnight back to "HH:mm"
 */
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Get current day of week as Enum
 */
export const getCurrentDayOfWeek = (): DayOfWeek => {
  return new Date().getDay() as DayOfWeek;
};

/**
 * Get current time in minutes from midnight
 */
export const getCurrentTimeMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

/**
 * Filter buses that run today
 */
export const getBusesForToday = (allBuses: BusRun[], dayOfWeek: DayOfWeek): BusRun[] => {
  return allBuses.filter(bus => bus.days.includes(dayOfWeek)).sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime));
};

/**
 * Get friendly text for Day of Week
 */
export const getDayName = (day: DayOfWeek): string => {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[day];
};
