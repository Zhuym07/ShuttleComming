import { useEffect, useMemo, useState } from 'react';
import { SCHEDULE_N_S, SCHEDULE_S_N } from '../config/schedules';
import { STATIONS_N_S, STATIONS_N_S_NIGHT, STATIONS_S_N, STATIONS_S_N_NIGHT } from '../config/stations';
import { BusRun, DayOfWeek, Direction, Station } from '../types';
import { getCurrentTimeMinutes } from '../utils';
import {
  getActiveBuses,
  getNextBus,
  getRouteMode,
  getScheduleForDay,
  isSameCalendarDate,
  RouteMode,
} from '../lib/shuttle';

interface UseShuttleStateOptions {
  direction: Direction;
  selectedDate: Date;
  previewBus: BusRun | null;
}

export const useShuttleState = ({ direction, selectedDate, previewBus }: UseShuttleStateOptions) => {
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(getCurrentTimeMinutes());
  const isToday = isSameCalendarDate(selectedDate, new Date());
  const selectedDayOfWeek = selectedDate.getDay() as DayOfWeek;

  useEffect(() => {
    setCurrentTimeMinutes(getCurrentTimeMinutes());
    if (!isToday) return undefined;

    const interval = window.setInterval(() => {
      setCurrentTimeMinutes(getCurrentTimeMinutes());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [isToday]);

  const schedule = useMemo(() => {
    const source = direction === Direction.SOUTH_TO_NORTH ? SCHEDULE_S_N : SCHEDULE_N_S;
    return getScheduleForDay(source, selectedDayOfWeek);
  }, [direction, selectedDayOfWeek]);

  const nextBus = useMemo(
    () => getNextBus(schedule, currentTimeMinutes, isToday && !previewBus),
    [currentTimeMinutes, isToday, previewBus, schedule],
  );

  const routeMode: RouteMode = useMemo(
    () => getRouteMode({ currentTimeMinutes, isToday, nextBus, previewBus }),
    [currentTimeMinutes, isToday, nextBus, previewBus],
  );

  const stations: Station[] = useMemo(() => {
    const isSouthToNorth = direction === Direction.SOUTH_TO_NORTH;
    if (isSouthToNorth) {
      return routeMode === 'night' ? STATIONS_S_N_NIGHT : STATIONS_S_N;
    }
    return routeMode === 'night' ? STATIONS_N_S_NIGHT : STATIONS_N_S;
  }, [direction, routeMode]);

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

  return {
    currentTimeMinutes,
    isToday,
    selectedDayOfWeek,
    schedule,
    nextBus,
    activeBuses,
    routeMode,
    stations,
  };
};
