import { useMemo } from 'react';
import { BusRun, DayOfWeek, Direction } from '../types';
import { getActiveBuses, getNextBus, getRouteForDirection, getRouteMode, getRouteModeForDeparture, getScheduleForDay, getShuttleSummary, ShuttleViewState } from '../lib/shuttle';

interface Options { direction: Direction; selectedDate: Date; previewBus: BusRun | null; currentTimeMinutes: number; isToday: boolean; }
export function useShuttleState({ direction, selectedDate, previewBus, currentTimeMinutes, isToday }: Options): ShuttleViewState {
  const route = getRouteForDirection(direction);
  const selectedDayOfWeek = selectedDate.getDay() as DayOfWeek;
  const schedule = useMemo(() => getScheduleForDay(route.schedule, selectedDayOfWeek), [route, selectedDayOfWeek]);
  const nextBus = getNextBus(schedule, currentTimeMinutes, isToday);
  const routeMode = getRouteMode({ currentTimeMinutes, isToday, previewBus, nightModeStartMinutes: route.nightModeStartMinutes });
  const stations = routeMode === 'night' ? route.nightStations : route.dayStations;
  const activeBuses = getActiveBuses(schedule, currentTimeMinutes, bus => {
    const stops = getRouteModeForDeparture(bus.departureTime, route.nightModeStartMinutes) === 'night' ? route.nightStations : route.dayStations;
    return stops[stops.length - 1].distanceFromStart;
  }, isToday, Boolean(previewBus));
  return { currentTimeMinutes, isToday, selectedDayOfWeek, schedule, nextBus, routeMode, stations, activeBuses, summary: getShuttleSummary(schedule, currentTimeMinutes, isToday, activeBuses.length) };
}
