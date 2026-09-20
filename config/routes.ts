import { Direction, RouteDefinition, RouteId, ScheduleEntry, Station } from '../types';
import { SCHEDULE_N_S, SCHEDULE_S_N } from './schedules';
import {
  STATIONS_N_S,
  STATIONS_N_S_NIGHT,
  STATIONS_S_N,
  STATIONS_S_N_NIGHT,
} from './stations';

export const NIGHT_MODE_START_MINUTES = 19 * 60 + 30;

export const createRoute = ({
  id,
  direction,
  schedule,
  dayStations,
  nightStations,
  nightModeStartMinutes = NIGHT_MODE_START_MINUTES,
}: {
  id: RouteId;
  direction: Direction;
  schedule: ScheduleEntry[];
  dayStations: Station[];
  nightStations: Station[];
  nightModeStartMinutes?: number;
}): RouteDefinition => ({
  id,
  direction,
  schedule,
  dayStations,
  nightStations,
  nightModeStartMinutes,
});

export const ROUTES: Record<RouteId, RouteDefinition> = {
  south_to_north: createRoute({
    id: 'south_to_north',
    direction: Direction.SOUTH_TO_NORTH,
    schedule: SCHEDULE_S_N,
    dayStations: STATIONS_S_N,
    nightStations: STATIONS_S_N_NIGHT,
  }),
  north_to_south: createRoute({
    id: 'north_to_south',
    direction: Direction.NORTH_TO_SOUTH,
    schedule: SCHEDULE_N_S,
    dayStations: STATIONS_N_S,
    nightStations: STATIONS_N_S_NIGHT,
  }),
};

export const getRouteId = (direction: Direction): RouteId => (
  direction === Direction.SOUTH_TO_NORTH ? 'south_to_north' : 'north_to_south'
);
