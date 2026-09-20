import { BusRun, DayOfWeek, Direction, LiveBus, RouteMode, Station } from '../types';
import { getRouteId, ROUTES } from '../config/routes';
import { timeToMinutes } from '../utils';

export type { RouteMode };

export interface ShuttleSummary {
  totalRuns: number;
  upcomingRuns: number;
  activeRuns: number;
  nextDeparture?: string;
}

export interface ShuttleViewState {
  currentTimeMinutes: number;
  isToday: boolean;
  selectedDayOfWeek: DayOfWeek;
  schedule: BusRun[];
  stations: Station[];
  routeMode: RouteMode;
  nextBus?: BusRun;
  activeBuses: LiveBus[];
  summary: ShuttleSummary;
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
      label: bus.tag,
    }];
  });
};

export const getRouteModeForDeparture = (
  departureTime: string,
  nightModeStartMinutes: number,
): RouteMode => (
  timeToMinutes(departureTime) >= nightModeStartMinutes ? 'night' : 'day'
);

export const getRouteMode = ({
  currentTimeMinutes,
  isToday,
  previewBus,
  nightModeStartMinutes,
}: {
  currentTimeMinutes: number;
  isToday: boolean;
  previewBus?: BusRun | null;
  nightModeStartMinutes: number;
}): RouteMode => {
  if (previewBus) return getRouteModeForDeparture(previewBus.departureTime, nightModeStartMinutes);
  if (!isToday) return 'day';
  return currentTimeMinutes >= nightModeStartMinutes ? 'night' : 'day';
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

export const getShuttleSummary = (
  schedule: BusRun[],
  currentTimeMinutes: number,
  isToday: boolean,
  activeRuns: number,
): ShuttleSummary => {
  const upcoming = isToday
    ? schedule.filter((bus) => timeToMinutes(bus.departureTime) >= currentTimeMinutes)
    : schedule;
  return {
    totalRuns: schedule.length,
    upcomingRuns: upcoming.length,
    activeRuns,
    nextDeparture: upcoming[0]?.departureTime,
  };
};

export const getRouteForDirection = (direction: Direction) => ROUTES[getRouteId(direction)];
