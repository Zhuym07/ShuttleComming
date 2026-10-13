import { DayOfWeek, ScheduleEntry, ServiceTag } from '../types';

// Helper to define days
const DAILY: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];
const WED_THU_FRI: DayOfWeek[] = [DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];
const FRI_ONLY: DayOfWeek[] = [DayOfWeek.FRIDAY];
const THU_FRI: DayOfWeek[] = [DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];
const TUE_WED_THU: DayOfWeek[] = [DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY];

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
// Effective October 12, 2026. Black runs operate daily; red runs operate in teaching weeks.

// South Campus -> North Campus
export const SCHEDULE_S_N: ScheduleEntry[] = [
  dailyRun('sn_0725', '07:25'),
  weekdayRun('sn_0735_red', '07:35', { tag: 'red' }),
  dailyRun('sn_0745', '07:45'),
  dailyRun('sn_0810', '08:10'),
  dailyRun('sn_0830', '08:30'),
  dailyRun('sn_0925', '09:25'),
  runOn('sn_0950_red', '09:50', THU_FRI, { tag: 'red' }),
  dailyRun('sn_1005', '10:05'),
  dailyRun('sn_1050', '10:50'),
  runOn('sn_1050_red', '10:50', [DayOfWeek.THURSDAY], { tag: 'red' }),
  runOn('sn_1145_red', '11:45', [DayOfWeek.TUESDAY], { tag: 'red' }),
  dailyRun('sn_1155', '11:55'),
  dailyRun('sn_1220', '12:20'),
  runOn('sn_1235_red', '12:35', FRI_ONLY, { tag: 'red' }),
  dailyRun('sn_1315', '13:15'),
  dailyRun('sn_1335', '13:35'),
  weekdayRun('sn_1335_red', '13:35', { tag: 'red' }),
  dailyRun('sn_1515', '15:15'),
  dailyRun('sn_1550', '15:50'),
  runOn('sn_1550_red', '15:50', WED_THU_FRI, { tag: 'red' }),
  dailyRun('sn_1610', '16:10'),
  dailyRun('sn_1725', '17:25'),
  dailyRun('sn_1800', '18:00'),
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
  dailyRun('ns_0935', '09:35'),
  dailyRun('ns_1020', '10:20'),
  dailyRun('ns_1100', '11:00'),
  dailyRun('ns_1205', '12:05'),
  dailyRun('ns_1230', '12:30'),
  runOn('ns_1230_red', '12:30', WED_THU_FRI, { tag: 'red' }),
  runOn('ns_1315_red', '13:15', THU_FRI, { tag: 'red' }),
  dailyRun('ns_1325', '13:25'),
  dailyRun('ns_1345', '13:45'),
  runOn('ns_1415_red', '14:15', TUE_WED_THU, { tag: 'red' }),
  dailyRun('ns_1540', '15:40'),
  dailyRun('ns_1600', '16:00'),
  runOn('ns_1615_red', '16:15', [DayOfWeek.MONDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY], { tag: 'red' }),
  dailyRun('ns_1645', '16:45'),
  dailyRun('ns_1745', '17:45'),
  dailyRun('ns_1815', '18:15'),
  weekdayRun('ns_1830_red', '18:30', { tag: 'red' }),
  dailyRun('ns_1845', '18:45'),
  dailyRun('ns_1915', '19:15'),
  runOn('ns_1915_red', '19:15', WED_THU_FRI, { tag: 'red' }),
  dailyRun('ns_2000', '20:00'),
  runOn('ns_2015_red', '20:15', TUE_WED_THU, { tag: 'red' }),
  dailyRun('ns_2040', '20:40'),
  dailyRun('ns_2200', '22:00'),
];
