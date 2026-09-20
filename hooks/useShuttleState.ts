import { useEffect, useMemo, useState } from 'react';
import { getRouteForDirection } from '../lib/shuttle';
import { BusRun, DayOfWeek, Direction, RouteMode, Station } from '../types';
import { getCurrentTimeMinutes } from '../utils';
import {
  getActiveBuses,
  getNextBus,
  getRouteMode,
  getScheduleForDay,
  getShuttleSummary,
  isSameCalendarDate,
  ShuttleViewState,
} from '../lib/shuttle';

interface UseShuttleStateOptions {
  direction: Direction;
  selectedDate: Date;
  previewBus: BusRun | null;
  currentTimeMinutes?: number;
}

export const useShuttleState = ({ direction, selectedDate, previewBus, currentTimeMinutes: sharedCurrentTimeMinutes }: UseShuttleStateOptions): ShuttleViewState => {
  const [localCurrentTimeMinutes, setLocalCurrentTimeMinutes] = useState(getCurrentTimeMinutes());
  const currentTimeMinutes = sharedCurrentTimeMinutes ?? localCurrentTimeMinutes;
  const isToday = isSameCalendarDate(selectedDate, new Date());
  const selectedDayOfWeek = selectedDate.getDay() as DayOfWeek;
  const route = getRouteForDirection(direction);

  useEffect(() => {
    if (sharedCurrentTimeMinutes !== undefined || !isToday) return undefined;
    const interval = window.setInterval(() => setLocalCurrentTimeMinutes(getCurrentTimeMinutes()), 30_000);
    return () => window.clearInterval(interval);
  }, [isToday, sharedCurrentTimeMinutes]);

  const schedule = useMemo(() => getScheduleForDay(route.schedule, selectedDayOfWeek), [route.schedule, selectedDayOfWeek]);
  const nextBus = useMemo(
    () => getNextBus(schedule, currentTimeMinutes, isToday && !previewBus),
    [currentTimeMinutes, isToday, previewBus, schedule],
  );
  const routeMode: RouteMode = useMemo(
    () => getRouteMode({
      currentTimeMinutes,
      isToday,
      previewBus,
      nightModeStartMinutes: route.nightModeStartMinutes,
    }),
    [currentTimeMinutes, isToday, previewBus, route.nightModeStartMinutes],
  );
  const stations: Station[] = routeMode === 'night' ? route.nightStations : route.dayStations;
  const activeBuses = useMemo(
    () => getActiveBuses(
      schedule,
      currentTimeMinutes,
      stations[stations.length - 1]?.distanceFromStart ?? 0,
      isToday,
      Boolean(previewBus),
    ),
    [currentTimeMinutes, isToday, previewBus, schedule, stations],
  );
  const summary = useMemo(
    () => getShuttleSummary(schedule, currentTimeMinutes, isToday, activeBuses.length),
    [activeBuses.length, currentTimeMinutes, isToday, schedule],
  );

  return {
    currentTimeMinutes,
    isToday,
    selectedDayOfWeek,
    schedule,
    nextBus,
    activeBuses,
    routeMode,
    stations,
    summary,
  };
};
