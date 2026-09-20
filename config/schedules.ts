import { DayOfWeek, ScheduleEntry, ServiceTag } from '../types';

// Helper to define days
const DAILY: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
const WED_THU_FRI: DayOfWeek[] = [3, 4, 5];
const TUE_WED_THU_FRI: DayOfWeek[] = [2, 3, 4, 5];
const FRI_ONLY: DayOfWeek[] = [5];
const WED_ONLY: DayOfWeek[] = [3];
const THU_ONLY: DayOfWeek[] = [4];
const THU_FRI: DayOfWeek[] = [4, 5];
const TUE_WED_THU: DayOfWeek[] = [2, 3, 4];
const TUE_WED_FRI: DayOfWeek[] = [2, 3, 5];
const WED_FRI: DayOfWeek[] = [3, 5];

type ScheduleMeta = { tag?: ServiceTag; notes?: string };

export const dailyRun = (id: string, departureTime: string, meta: ScheduleMeta = {}): ScheduleEntry => ({
  id,
  departureTime,
  days: DAILY,
  ...meta,
});

export const weekdayRun = (id: string, departureTime: string, meta: ScheduleMeta = {}): ScheduleEntry => ({
  id,
  departureTime,
  days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY],
  ...meta,
});

export const runOn = (id: string, departureTime: string, days: DayOfWeek[], meta: ScheduleMeta = {}): ScheduleEntry => ({
  id,
  departureTime,
  days,
  ...meta,
});

// ----- Schedule Data -----
// Teaching Week 1-13, effective May 12, 2026

// South Campus -> North Campus
export const SCHEDULE_S_N: ScheduleEntry[] = [
  dailyRun('sn_0725', '07:25'),
  runOn('sn_0735_red', '07:35', TUE_WED_THU_FRI, { tag: 'red' }),
  dailyRun('sn_0745', '07:45'),
  dailyRun('sn_0810', '08:10'),
  dailyRun('sn_0830', '08:30'),
  runOn('sn_0840_red', '08:40', THU_ONLY, { tag: 'red' }),
  dailyRun('sn_0925', '09:25'),
  runOn('sn_1000_blue', '10:00', THU_ONLY, { tag: 'blue' }),
  dailyRun('sn_1005', '10:05'),
  runOn('sn_1010_red', '10:10', WED_THU_FRI, { tag: 'red' }),
  dailyRun('sn_1050', '10:50'),
  dailyRun('sn_1155', '11:55'),
  dailyRun('sn_1220', '12:20'),
  dailyRun('sn_1315', '13:15'),
  dailyRun('sn_1335', '13:35'),
  runOn('sn_1340_red', '13:40', TUE_WED_THU, { tag: 'red' }),
  runOn('sn_1440_red', '14:40', WED_ONLY, { tag: 'red' }),
  dailyRun('sn_1515', '15:15'),
  dailyRun('sn_1550', '15:50'),
  runOn('sn_1600_blue', '16:00', THU_ONLY, { tag: 'blue' }),
  runOn('sn_1605_red', '16:05', FRI_ONLY, { tag: 'red' }),
  runOn('sn_1610_blue', '16:10', THU_ONLY, { tag: 'blue' }),
  runOn('sn_1610_red', '16:10', THU_ONLY, { tag: 'red' }),
  dailyRun('sn_1725', '17:25'),
  dailyRun('sn_1800', '18:00'),
  runOn('sn_1825_red', '18:25', THU_ONLY, { tag: 'red' }),
  dailyRun('sn_1830', '18:30'),
  dailyRun('sn_1900', '19:00'),
  dailyRun('sn_1940', '19:40'),
  dailyRun('sn_2020', '20:20'),
  dailyRun('sn_2100', '21:00'),
  dailyRun('sn_2130', '21:30'),
  dailyRun('sn_2210', '22:10'),
];

// North Campus -> South Campus
export const SCHEDULE_N_S: ScheduleEntry[] = [
  dailyRun('ns_0735', '07:35'),
  dailyRun('ns_0800', '08:00'),
  dailyRun('ns_0820', '08:20'),
  dailyRun('ns_0840', '08:40'),
  runOn('ns_0915_red', '09:15', FRI_ONLY, { tag: 'red' }),
  dailyRun('ns_0955', '09:55'),
  runOn('ns_1000_red', '10:00', THU_FRI, { tag: 'red' }),
  runOn('ns_1010_blue', '10:10', THU_ONLY, { tag: 'blue' }),
  dailyRun('ns_1020', '10:20'),
  dailyRun('ns_1100', '11:00'),
  dailyRun('ns_1205', '12:05'),
  runOn('ns_1225_red', '12:25', THU_ONLY, { tag: 'red' }),
  dailyRun('ns_1230', '12:30'),
  runOn('ns_1310_red', '13:10', THU_ONLY, { tag: 'red' }),
  runOn('ns_1315_red', '13:15', TUE_WED_FRI, { tag: 'red' }),
  dailyRun('ns_1325', '13:25'),
  runOn('ns_1325_red', '13:25', THU_ONLY, { tag: 'red' }),
  dailyRun('ns_1345', '13:45'),
  dailyRun('ns_1540', '15:40'),
  dailyRun('ns_1600', '16:00'),
  runOn('ns_1600_red', '16:00', THU_ONLY, { tag: 'red' }),
  runOn('ns_1605_red', '16:05', WED_ONLY, { tag: 'red' }),
  runOn('ns_1610_blue', '16:10', THU_ONLY, { tag: 'blue' }),
  dailyRun('ns_1645', '16:45'),
  runOn('ns_1725_red', '17:25', THU_ONLY, { tag: 'red' }),
  dailyRun('ns_1745', '17:45'),
  dailyRun('ns_1815', '18:15'),
  runOn('ns_1825_red', '18:25', WED_FRI, { tag: 'red' }),
  dailyRun('ns_1845', '18:45'),
  runOn('ns_1910_red', '19:10', THU_ONLY, { tag: 'red' }),
  dailyRun('ns_1915', '19:15'),
  runOn('ns_1925_red', '19:25', THU_ONLY, { tag: 'red' }),
  dailyRun('ns_2000', '20:00'),
  dailyRun('ns_2040', '20:40'),
  dailyRun('ns_2200', '22:00'),
];
