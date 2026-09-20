import { BusRun, DayOfWeek, Direction, LiveBus, Station } from '../types';
import { timeToMinutes } from '../utils';

export const NIGHT_MODE_START_MINUTES = 19 * 60 + 30;

export type RouteMode = 'day' | 'night';

export interface ShuttleContext {
  isToday: boolean;
  selectedDayOfWeek: DayOfWeek;
  schedule: BusRun[];
  nextBus?: BusRun;
  activeBuses: LiveBus[];
  routeMode: RouteMode;
}

export const isSameCalendarDate = (left: Date, right: Date): boolean => (
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()
);

export const getScheduleForDay = (schedule: BusRun[], dayOfWeek: DayOfWeek): BusRun[] => (
  [...schedule]
    .filter((bus) => bus.days.includes(dayOfWeek))
    .sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime))
);

export const getNextBus = (
  schedule: BusRun[],
  currentTimeMinutes: number,
  isLive: boolean,
): BusRun | undefined => {
  if (!schedule.length) return undefined;
  if (!isLive) return schedule[0];
  return schedule.find((bus) => timeToMinutes(bus.departureTime) >= currentTimeMinutes);
};

export const getActiveBuses = (
  schedule: BusRun[],
  currentTimeMinutes: number,
  totalDuration: number,
  isLive: boolean,
  isPreviewing: boolean,
): LiveBus[] => {
  if (!isLive || isPreviewing) return [];

  return schedule.flatMap((bus) => {
    const elapsed = currentTimeMinutes - timeToMinutes(bus.departureTime);
    if (elapsed < 0 || elapsed > totalDuration + 2) return [];

    return [{
      runId: bus.id,
      currentMinutesFromStart: elapsed,
      status: 'RUNNING' as const,
      label: bus.color,
    }];
  });
};

export const getRouteModeForDeparture = (departureTime: string): RouteMode => (
  timeToMinutes(departureTime) >= NIGHT_MODE_START_MINUTES ? 'night' : 'day'
);

export const getRouteMode = ({
  currentTimeMinutes,
  isToday,
  nextBus,
  previewBus,
}: {
  currentTimeMinutes: number;
  isToday: boolean;
  nextBus?: BusRun;
  previewBus?: BusRun | null;
}): RouteMode => {
  if (previewBus) {
    return getRouteModeForDeparture(previewBus.departureTime);
  }

  if (!isToday) return 'day';

  if (nextBus) {
    return getRouteModeForDeparture(nextBus.departureTime);
  }

  return currentTimeMinutes >= NIGHT_MODE_START_MINUTES ? 'night' : 'day';
};

export const getEstimatedArrivalMinutes = (bus: BusRun | undefined, station: Station): number | null => (
  bus ? timeToMinutes(bus.departureTime) + station.distanceFromStart : null
);

export const getCurrentStationIndex = (stations: Station[], elapsedMinutes: number): number => {
  if (stations.length < 2) return 0;

  for (let index = 0; index < stations.length - 1; index += 1) {
    if (elapsedMinutes < stations[index + 1].distanceFromStart) return index;
  }

  return stations.length - 1;
};

export const getDirectionLabel = (direction: Direction): string => (
  direction === Direction.SOUTH_TO_NORTH ? 'South to North' : 'North to South'
);
