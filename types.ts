export enum Direction {
  SOUTH_TO_NORTH = 'SOUTH_TO_NORTH',
  NORTH_TO_SOUTH = 'NORTH_TO_SOUTH',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export type RouteId = 'south_to_north' | 'north_to_south';
export type ServiceTag = 'red' | 'blue';
export type RouteMode = 'day' | 'night';

export interface ScheduleEntry {
  id: string;
  departureTime: string;
  days: DayOfWeek[];
  tag?: ServiceTag;
  notes?: string;
}

export type BusRun = ScheduleEntry;

export interface Station {
  id: string;
  name: string;
  shortName: string;
  distanceFromStart: number;
}

export interface RouteDefinition {
  id: RouteId;
  direction: Direction;
  schedule: ScheduleEntry[];
  dayStations: Station[];
  nightStations: Station[];
  nightModeStartMinutes: number;
}

export interface DirectionSummary {
  direction: Direction;
  routeId: RouteId;
  schedule: BusRun[];
  nextBus?: BusRun;
  activeRuns: number;
  upcomingRuns: number;
  isServiceEnded: boolean;
}

export interface ShuttleOverviewState {
  currentTimeMinutes: number;
  isToday: boolean;
  summaries: Record<RouteId, DirectionSummary>;
}

export interface LiveBus {
  runId: string;
  currentMinutesFromStart: number;
  status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED';
  label?: ServiceTag;
}
