import { BusRun, DayOfWeek } from './types';

export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = Math.floor(normalized % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const getCurrentDayOfWeek = (): DayOfWeek => new Date().getDay() as DayOfWeek;

export const getCurrentTimeMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const getBusesForToday = (allBuses: BusRun[], dayOfWeek: DayOfWeek): BusRun[] => (
  allBuses
    .filter((bus) => bus.days.includes(dayOfWeek))
    .sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime))
);

export const getDayName = (day: DayOfWeek): string => (
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
);

export const getDateLabel = (date: Date, lang: 'en' | 'zh'): string => date.toLocaleDateString(
  lang === 'en' ? 'en-US' : 'zh-CN',
  { month: 'short', day: 'numeric', weekday: 'short' },
);
