import { useMemo } from 'react';
import { DayOfWeek, ShuttleOverviewState } from '../types';
import { getDirectionSummary, isSameCalendarDate } from '../lib/shuttle';
import { ClockSnapshot } from '../lib/playbackClock';

export function useShuttleOverview({ selectedDate, clock }: { selectedDate: Date; clock: ClockSnapshot }): ShuttleOverviewState {
  const currentTimeMinutes = clock.seconds / 60;
  const isToday = clock.mode === 'simulated' || isSameCalendarDate(selectedDate, clock.date);
  const day = selectedDate.getDay() as DayOfWeek;
  const summaries = useMemo(() => ({
    south_to_north: getDirectionSummary({ routeId: 'south_to_north', currentTimeMinutes, selectedDayOfWeek: day, isToday }),
    north_to_south: getDirectionSummary({ routeId: 'north_to_south', currentTimeMinutes, selectedDayOfWeek: day, isToday }),
  }), [currentTimeMinutes, day, isToday]);
  return { currentTimeMinutes, isToday, summaries };
}
