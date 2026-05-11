import { BusRun } from '../types';

// Helper to define days
const DAILY = [0, 1, 2, 3, 4, 5, 6];
const WED_THU_FRI = [3, 4, 5];
const TUE_WED_THU_FRI = [2, 3, 4, 5];
const FRI_ONLY = [5];
const WED_ONLY = [3];
const THU_ONLY = [4];
const THU_FRI = [4, 5];
const TUE_WED_THU = [2, 3, 4];
const TUE_WED_FRI = [2, 3, 5];
const WED_FRI = [3, 5];

// ----- Schedule Data -----
// Teaching Week 1-13, effective May 12, 2026

// South Campus -> North Campus
export const SCHEDULE_S_N: BusRun[] = [
  { id: 'sn_0725', departureTime: '07:25', days: DAILY },
  { id: 'sn_0735_red', departureTime: '07:35', days: TUE_WED_THU_FRI, color: 'red' },
  { id: 'sn_0745', departureTime: '07:45', days: DAILY },
  { id: 'sn_0810', departureTime: '08:10', days: DAILY },
  { id: 'sn_0830', departureTime: '08:30', days: DAILY },
  { id: 'sn_0840_red', departureTime: '08:40', days: THU_ONLY, color: 'red' },
  { id: 'sn_0925', departureTime: '09:25', days: DAILY },
  { id: 'sn_1000_blue', departureTime: '10:00', days: THU_ONLY, color: 'blue' },
  { id: 'sn_1005', departureTime: '10:05', days: DAILY },
  { id: 'sn_1010_red', departureTime: '10:10', days: WED_THU_FRI, color: 'red' },
  { id: 'sn_1050', departureTime: '10:50', days: DAILY },
  { id: 'sn_1155', departureTime: '11:55', days: DAILY },
  { id: 'sn_1220', departureTime: '12:20', days: DAILY },
  { id: 'sn_1315', departureTime: '13:15', days: DAILY },
  { id: 'sn_1335', departureTime: '13:35', days: DAILY },
  { id: 'sn_1340_red', departureTime: '13:40', days: TUE_WED_THU, color: 'red' },
  { id: 'sn_1440_red', departureTime: '14:40', days: WED_ONLY, color: 'red' },
  { id: 'sn_1515', departureTime: '15:15', days: DAILY },
  { id: 'sn_1550', departureTime: '15:50', days: DAILY },
  { id: 'sn_1600_blue', departureTime: '16:00', days: THU_ONLY, color: 'blue' },
  { id: 'sn_1605_red', departureTime: '16:05', days: FRI_ONLY, color: 'red' },
  { id: 'sn_1610_blue', departureTime: '16:10', days: THU_ONLY, color: 'blue' },
  { id: 'sn_1610_red', departureTime: '16:10', days: THU_ONLY, color: 'red' },
  { id: 'sn_1725', departureTime: '17:25', days: DAILY },
  { id: 'sn_1800', departureTime: '18:00', days: DAILY },
  { id: 'sn_1825_red', departureTime: '18:25', days: THU_ONLY, color: 'red' },
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
  { id: 'ns_0735', departureTime: '07:35', days: DAILY },
  { id: 'ns_0800', departureTime: '08:00', days: DAILY },
  { id: 'ns_0820', departureTime: '08:20', days: DAILY },
  { id: 'ns_0840', departureTime: '08:40', days: DAILY },
  { id: 'ns_0915_red', departureTime: '09:15', days: FRI_ONLY, color: 'red' },
  { id: 'ns_0955', departureTime: '09:55', days: DAILY },
  { id: 'ns_1000_red', departureTime: '10:00', days: THU_FRI, color: 'red' },
  { id: 'ns_1010_blue', departureTime: '10:10', days: THU_ONLY, color: 'blue' },
  { id: 'ns_1020', departureTime: '10:20', days: DAILY },
  { id: 'ns_1100', departureTime: '11:00', days: DAILY },
  { id: 'ns_1205', departureTime: '12:05', days: DAILY },
  { id: 'ns_1225_red', departureTime: '12:25', days: THU_ONLY, color: 'red' },
  { id: 'ns_1230', departureTime: '12:30', days: DAILY },
  { id: 'ns_1310_red', departureTime: '13:10', days: THU_ONLY, color: 'red' },
  { id: 'ns_1315_red', departureTime: '13:15', days: TUE_WED_FRI, color: 'red' },
  { id: 'ns_1325', departureTime: '13:25', days: DAILY },
  { id: 'ns_1325_red', departureTime: '13:25', days: THU_ONLY, color: 'red' },
  { id: 'ns_1345', departureTime: '13:45', days: DAILY },
  { id: 'ns_1540', departureTime: '15:40', days: DAILY },
  { id: 'ns_1600', departureTime: '16:00', days: DAILY },
  { id: 'ns_1600_red', departureTime: '16:00', days: THU_ONLY, color: 'red' },
  { id: 'ns_1605_red', departureTime: '16:05', days: WED_ONLY, color: 'red' },
  { id: 'ns_1610_blue', departureTime: '16:10', days: THU_ONLY, color: 'blue' },
  { id: 'ns_1645', departureTime: '16:45', days: DAILY },
  { id: 'ns_1725_red', departureTime: '17:25', days: THU_ONLY, color: 'red' },
  { id: 'ns_1745', departureTime: '17:45', days: DAILY },
  { id: 'ns_1815', departureTime: '18:15', days: DAILY },
  { id: 'ns_1825_red', departureTime: '18:25', days: WED_FRI, color: 'red' },
  { id: 'ns_1845', departureTime: '18:45', days: DAILY },
  { id: 'ns_1910_red', departureTime: '19:10', days: THU_ONLY, color: 'red' },
  { id: 'ns_1915', departureTime: '19:15', days: DAILY },
  { id: 'ns_1925_red', departureTime: '19:25', days: THU_ONLY, color: 'red' },
  { id: 'ns_2000', departureTime: '20:00', days: DAILY },
  { id: 'ns_2040', departureTime: '20:40', days: DAILY },
  { id: 'ns_2200', departureTime: '22:00', days: DAILY },
];
