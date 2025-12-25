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

// Represents a scheduled bus run
export interface BusRun {
  id: string;
  departureTime: string; // "HH:mm" format
  days: DayOfWeek[]; // Days this bus operates
  notes?: string;
  color?: string; // UI hint based on the timetable colors
}

// Represents the static data of a station
export interface Station {
  id: string;
  name: string;
  shortName: string;
  distanceFromStart: number; // in minutes
}

// Represents the real-time calculated state of a bus
export interface LiveBus {
  runId: string;
  currentMinutesFromStart: number; // How many minutes since departure
  status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED';
  label?: string; // e.g. "Departing soon"
}
