import { Direction, Station } from '../types';

export type Point = [number, number, number?];
export const anchors: Record<string, Point> = { nc_main: [40, 540], sc_2: [700, 370], sc_9: [900, 110] };
const leg: Point[] = [anchors.nc_main, [390, 540], [520, 370], anchors.sc_2];
const east: Point[] = [anchors.sc_9, [1020, 110], [1020, 370], anchors.sc_2];
const west: Point[] = [anchors.sc_2, [380, 370], [380, 110], [720, 110], anchors.sc_9];
export const roads = [leg, east, west];
export const project = ([x, y, z = 0]: Point): [number, number] => [Math.sqrt(3) / 2 * (x + y), (y - x) / 2 - z];
export const points = (list: Point[]) => list.map(p => project(p).join(',')).join(' ');
export function segments(direction: Direction, stations: Station[]): Point[][] {
  const south = direction === Direction.SOUTH_TO_NORTH;
  return stations.slice(1).map((_, i) => {
    const start = stations[i].id;
    return south ? (start === 'sc_9' ? east : [...leg].reverse()) : (start === 'nc_main' ? leg : west);
  });
}
export function position(path: Point[], fraction: number) {
  const lengths = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  let distance = lengths.reduce((a, b) => a + b, 0) * Math.max(0, Math.min(1, fraction));
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const a = path[i], b = path[i + 1], t = distance / lengths[i];
      return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as Point, angle: Math.atan2(b[1] - a[1], b[0] - a[0]) };
    }
    distance -= lengths[i];
  }
  return { p: path[0], angle: 0 };
}
export function tripPosition(direction: Direction, stations: Station[], elapsed: number) {
  const paths = segments(direction, stations);
  const index = stations.slice(1).findIndex(s => elapsed < s.distanceFromStart);
  const i = index < 0 ? paths.length - 1 : index;
  return position(paths[i], (elapsed - stations[i].distanceFromStart) / (stations[i + 1].distanceFromStart - stations[i].distanceFromStart));
}
