import { DayOfWeek, Direction, Station, BusRun } from './types';

// ----- Configuration -----

// Travel times in minutes
// South -> North: 9 (0m) -> 2 (2m) -> North (12m)
// North -> South: North (0m) -> 2 (10m) -> 9 (12m)

export const STATIONS_S_N: Station[] = [
  { id: 'sc_9', name: 'South Campus Gate 9', shortName: 'SC Gate 9', distanceFromStart: 0 },
  { id: 'sc_2', name: 'South Campus Gate 2', shortName: 'SC Gate 2', distanceFromStart: 2 },
  { id: 'nc_main', name: 'North Campus Main Gate', shortName: 'NC Main', distanceFromStart: 12 },
];

export const STATIONS_N_S: Station[] = [
  { id: 'nc_main', name: 'North Campus Main Gate', shortName: 'NC Main', distanceFromStart: 0 },
  { id: 'sc_2', name: 'South Campus Gate 2', shortName: 'SC Gate 2', distanceFromStart: 10 },
  { id: 'sc_9', name: 'South Campus Gate 9', shortName: 'SC Gate 9', distanceFromStart: 12 },
];

// Helper to define days
const DAILY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri
const WED_FRI = [3, 5];
const WED_THU_FRI = [3, 4, 5];
const TUE_WED_THU_FRI = [2, 3, 4, 5];
const FRI_ONLY = [5];
const WED_ONLY = [3];
const THU_ONLY = [4];
const TUE_THU = [2, 4];
const MON_FRI = [1, 5];
const TUE_ONLY = [2];

// ----- Schedule Data (Transcribed from Image) -----

// South Campus -> North Campus
export const SCHEDULE_S_N: BusRun[] = [
  { id: 'sn_0725', departureTime: '07:25', days: DAILY },
  { id: 'sn_0725_red', departureTime: '07:25', days: WED_THU_FRI, color: 'red' },
  { id: 'sn_0740', departureTime: '07:40', days: TUE_WED_THU_FRI, color: 'red' },
  { id: 'sn_0745', departureTime: '07:45', days: DAILY },
  { id: 'sn_0810', departureTime: '08:10', days: DAILY },
  { id: 'sn_0830', departureTime: '08:30', days: DAILY },
  { id: 'sn_0925', departureTime: '09:25', days: DAILY },
  { id: 'sn_0950', departureTime: '09:50', days: FRI_ONLY, color: 'green' },
  { id: 'sn_0955', departureTime: '09:55', days: WED_FRI, color: 'red' },
  { id: 'sn_1000', departureTime: '10:00', days: FRI_ONLY, color: 'orange' },
  { id: 'sn_1005', departureTime: '10:05', days: WED_THU_FRI, color: 'red' },
  { id: 'sn_1005_blk', departureTime: '10:05', days: DAILY },
  { id: 'sn_1010', departureTime: '10:10', days: [3, 5], color: 'blue' }, // Wed, Fri (Assuming Blue)
  { id: 'sn_1050', departureTime: '10:50', days: DAILY },
  { id: 'sn_1155', departureTime: '11:55', days: DAILY },
  { id: 'sn_1220', departureTime: '12:20', days: DAILY },
  { id: 'sn_1315', departureTime: '13:15', days: DAILY },
  { id: 'sn_1325', departureTime: '13:25', days: [4], color: 'blue' }, // Thu
  { id: 'sn_1330', departureTime: '13:30', days: [4, 5], color: 'red' }, // Thu, Fri
  { id: 'sn_1335', departureTime: '13:35', days: DAILY },
  { id: 'sn_1335_red', departureTime: '13:35', days: WED_ONLY, color: 'red' },
  { id: 'sn_1340', departureTime: '13:40', days: [2, 4, 5], color: 'blue' }, // Tue, Thu, Fri
  { id: 'sn_1345', departureTime: '13:45', days: [4, 5], color: 'red' }, // Thu, Fri
  { id: 'sn_1440', departureTime: '14:40', days: FRI_ONLY, color: 'red' },
  { id: 'sn_1515', departureTime: '15:15', days: DAILY },
  { id: 'sn_1550', departureTime: '15:50', days: DAILY },
  { id: 'sn_1555', departureTime: '15:55', days: [3, 4, 5], color: 'red' }, // Wed, Thu, Fri (Note: Image says Thu twice? Assuming typox)
  { id: 'sn_1605', departureTime: '16:05', days: [3, 4], color: 'blue' }, // Wed, Thu
  { id: 'sn_1610', departureTime: '16:10', days: [3, 4, 5], color: 'orange' }, // Wed, Thu, Fri
  { id: 'sn_1610_blk', departureTime: '16:10', days: DAILY },
  { id: 'sn_1655', departureTime: '16:55', days: FRI_ONLY, color: 'red' },
  { id: 'sn_1725', departureTime: '17:25', days: DAILY },
  { id: 'sn_1800', departureTime: '18:00', days: DAILY },
  { id: 'sn_1830', departureTime: '18:30', days: DAILY },
  { id: 'sn_1900', departureTime: '19:00', days: DAILY },
  { id: 'sn_1940', departureTime: '19:40', days: DAILY },
  { id: 'sn_2020', departureTime: '20:20', days: DAILY },
  { id: 'sn_2100', departureTime: '21:00', days: DAILY },
  { id: 'sn_2130', departureTime: '21:30', days: DAILY },
  { id: 'sn_2210', departureTime: '22:10', days: DAILY },
];

// North Campus -> South Campus
export const SCHEDULE_N_S: BusRun[] = [
  { id: 'ns_0735', departureTime: '07:35', days: WED_THU_FRI, color: 'red' },
  { id: 'ns_0800', departureTime: '08:00', days: DAILY },
  { id: 'ns_0820', departureTime: '08:20', days: DAILY },
  { id: 'ns_0840', departureTime: '08:40', days: DAILY },
  { id: 'ns_0840_red', departureTime: '08:40', days: WED_ONLY, color: 'red' },
  { id: 'ns_0955', departureTime: '09:55', days: DAILY },
  { id: 'ns_0955_blue', departureTime: '09:55', days: FRI_ONLY, color: 'blue' },
  { id: 'ns_1000', departureTime: '10:00', days: [3], color: 'blue' }, // Wed
  { id: 'ns_1005', departureTime: '10:05', days: MON_FRI, color: 'red' },
  { id: 'ns_1010', departureTime: '10:10', days: FRI_ONLY, color: 'green' },
  { id: 'ns_1020', departureTime: '10:20', days: DAILY },
  { id: 'ns_1100', departureTime: '11:00', days: DAILY },
  { id: 'ns_1125', departureTime: '11:25', days: FRI_ONLY, color: 'red' },
  { id: 'ns_1140', departureTime: '11:40', days: FRI_ONLY, color: 'red' },
  { id: 'ns_1205', departureTime: '12:05', days: DAILY },
  { id: 'ns_1220', departureTime: '12:20', days: TUE_ONLY, color: 'red' },
  { id: 'ns_1225', departureTime: '12:25', days: [3, 5], color: 'red' }, // Wed, Fri
  { id: 'ns_1230', departureTime: '12:30', days: DAILY },
  { id: 'ns_1240', departureTime: '12:40', days: FRI_ONLY, color: 'red' },
  { id: 'ns_1315', departureTime: '13:15', days: THU_ONLY, color: 'red' },
  { id: 'ns_1325', departureTime: '13:25', days: DAILY },
  { id: 'ns_1345', departureTime: '13:45', days: DAILY },
  { id: 'ns_1415', departureTime: '14:15', days: TUE_THU, color: 'red' },
  { id: 'ns_1515', departureTime: '15:15', days: TUE_ONLY, color: 'red' },
  { id: 'ns_1540', departureTime: '15:40', days: DAILY },
  { id: 'ns_1555', departureTime: '15:55', days: [4], color: 'blue' }, // Thu
  { id: 'ns_1600', departureTime: '16:00', days: DAILY },
  { id: 'ns_1605', departureTime: '16:05', days: THU_ONLY, color: 'red' },
  { id: 'ns_1645', departureTime: '16:45', days: DAILY },
  { id: 'ns_1725', departureTime: '17:25', days: FRI_ONLY, color: 'red' },
  { id: 'ns_1745', departureTime: '17:45', days: DAILY },
  { id: 'ns_1815', departureTime: '18:15', days: DAILY },
  { id: 'ns_1820', departureTime: '18:20', days: [4, 5], color: 'red' }, // Thu, Fri
  { id: 'ns_1835', departureTime: '18:35', days: THU_ONLY, color: 'red' },
  { id: 'ns_1845', departureTime: '18:45', days: DAILY },
  { id: 'ns_1910', departureTime: '19:10', days: [3, 4, 5], color: 'red' }, // Wed, Thu, Fri
  { id: 'ns_1915', departureTime: '19:15', days: DAILY },
  { id: 'ns_1925', departureTime: '19:25', days: [3, 4, 5], color: 'red' }, // Wed, Thu, Fri
  { id: 'ns_1940', departureTime: '19:40', days: THU_ONLY, color: 'red' },
  { id: 'ns_2000', departureTime: '20:00', days: DAILY },
  { id: 'ns_2040', departureTime: '20:40', days: DAILY },
  { id: 'ns_2200', departureTime: '22:00', days: DAILY },
];
