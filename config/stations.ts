import { Station } from '../types';

// Travel times in minutes
// South -> North (Day): 9 (0m) -> 2 (3m) -> North (3+5 = 8m)
// South -> North (Night > 19:30): 2 (0m) -> North (5m) [Gate 9 Closed]

// North -> South (Day): North (0m) -> 2 (5m) -> 9 (5+3 = 8m)
// North -> South (Night > 19:30): North (0m) -> 2 (5m) [Gate 9 Closed]

export const STATIONS_S_N: Station[] = [
  { id: 'sc_9', name: 'South Campus Gate 9', shortName: 'SC Gate 9', distanceFromStart: 0 },
  { id: 'sc_2', name: 'South Campus Gate 2', shortName: 'SC Gate 2', distanceFromStart: 3 },
  { id: 'nc_main', name: 'North Campus Main Gate', shortName: 'NC Main', distanceFromStart: 8 },
];

export const STATIONS_S_N_NIGHT: Station[] = [
  { id: 'sc_2', name: 'South Campus Gate 2', shortName: 'SC Gate 2', distanceFromStart: 0 },
  { id: 'nc_main', name: 'North Campus Main Gate', shortName: 'NC Main', distanceFromStart: 5 },
];

export const STATIONS_N_S: Station[] = [
  { id: 'nc_main', name: 'North Campus Main Gate', shortName: 'NC Main', distanceFromStart: 0 },
  { id: 'sc_2', name: 'South Campus Gate 2', shortName: 'SC Gate 2', distanceFromStart: 5 },
  { id: 'sc_9', name: 'South Campus Gate 9', shortName: 'SC Gate 9', distanceFromStart: 8 },
];

export const STATIONS_N_S_NIGHT: Station[] = [
  { id: 'nc_main', name: 'North Campus Main Gate', shortName: 'NC Main', distanceFromStart: 0 },
  { id: 'sc_2', name: 'South Campus Gate 2', shortName: 'SC Gate 2', distanceFromStart: 5 },
];