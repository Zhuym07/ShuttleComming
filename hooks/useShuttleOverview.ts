import { useEffect, useMemo, useState } from 'react';
import { getCurrentTimeMinutes } from '../utils';
import { DayOfWeek, RouteId, ShuttleOverviewState } from '../types';
import { getDirectionSummary, isSameCalendarDate } from '../lib/shuttle';

interface UseShuttleOverviewOptions {
  selectedDate: Date;
}

export const useShuttleOverview = ({ selectedDate }: UseShuttleOverviewOptions): ShuttleOverviewState => {
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(getCurrentTimeMinutes());
  const isToday = isSameCalendarDate(selectedDate, new Date());
  const selectedDayOfWeek = selectedDate.getDay() as DayOfWeek;

  useEffect(() => {
    setCurrentTimeMinutes(getCurrentTimeMinutes());
    if (!isToday) return undefined;
    const interval = window.setInterval(() => setCurrentTimeMinutes(getCurrentTimeMinutes()), 30_000);
    return () => window.clearInterval(interval);
  }, [isToday, selectedDate]);

  const summaries = useMemo(() => {
    const routeIds: RouteId[] = ['south_to_north', 'north_to_south'];
    return routeIds.reduce((result, routeId) => {
      result[routeId] = getDirectionSummary({
        routeId,
        currentTimeMinutes,
        selectedDayOfWeek,
        isToday,
      });
      return result;
    }, {} as ShuttleOverviewState['summaries']);
  }, [currentTimeMinutes, isToday, selectedDayOfWeek]);

  return { currentTimeMinutes, isToday, summaries };
};
