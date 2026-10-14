import { Direction, Station } from '../types';

export type Point = [number, number, number?];
export const anchors: Record<string, Point> = { nc_main: [40, 540], sc_2: [700, 370], sc_9: [900, 110] };
const leg: Point[] = [anchors.nc_main, [390, 540], [520, 370], anchors.sc_2];
const east: Point[] = [anchors.sc_9, [1020, 110], [1020, 370], anchors.sc_2];
// The northbound arrival continues into a turning loop instead of reversing at Gate 2.
const west: Point[] = [anchors.sc_2, [800, 370], [800, 460], [380, 460], [380, 110], [720, 110], anchors.sc_9];
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
export interface Curve { samples: Point[]; distances: number[]; angles: number[]; length: number; }
const distance = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const mix = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export function roundedCurve(path: Point[], lane = 0): Curve {
  const samples: Point[] = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const a = path[i - 1], b = path[i], c = path[i + 1];
    const trim = Math.min(48, distance(a, b) / 3, distance(b, c) / 3);
    const entry = mix(b, a, trim / distance(a, b));
    const exit = mix(b, c, trim / distance(b, c));
    samples.push(entry);
    for (let step = 1; step <= 24; step++) {
      const t = step / 24;
      samples.push(mix(mix(entry, b, t), mix(b, exit, t), t));
    }
  }
  samples.push(path[path.length - 1]);
  const tangents = samples.map((p, i) => {
    const before = samples[Math.max(0, i - 1)], after = samples[Math.min(samples.length - 1, i + 1)];
    return Math.atan2(after[1] - before[1], after[0] - before[0]);
  });
  const shifted = samples.map((p, i): Point => [p[0] - Math.sin(tangents[i]) * lane, p[1] + Math.cos(tangents[i]) * lane]);
  const distances = [0];
  shifted.slice(1).forEach((p, i) => distances.push(distances[i] + distance(shifted[i], p)));
  const angles = shifted.map((p, i) => {
    const before = shifted[Math.max(0, i - 1)], after = shifted[Math.min(shifted.length - 1, i + 1)];
    return Math.atan2(after[1] - before[1], after[0] - before[0]);
  });
  return { samples: shifted, distances, angles, length: distances[distances.length - 1] };
}

export function sampleCurve(curve: Curve, offset: number) {
  if (offset < 0) return { p: [curve.samples[0][0] + Math.cos(curve.angles[0]) * offset, curve.samples[0][1] + Math.sin(curve.angles[0]) * offset] as Point, angle: curve.angles[0] };
  const d = Math.min(offset, curve.length);
  let low = 0, high = curve.distances.length - 1;
  while (high - low > 1) { const mid = (low + high) >> 1; if (curve.distances[mid] < d) low = mid; else high = mid; }
  const t = (d - curve.distances[low]) / (curve.distances[high] - curve.distances[low]);
  const turn = Math.atan2(Math.sin(curve.angles[high] - curve.angles[low]), Math.cos(curve.angles[high] - curve.angles[low]));
  return { p: mix(curve.samples[low], curve.samples[high], t), angle: curve.angles[low] + turn * t };
}

export function stationOffsets(curve: Curve, stations: Station[]) {
  return stations.map((station, index) => {
    if (index === 0) return 0;
    if (index === stations.length - 1) return curve.length;
    let nearest = 0;
    curve.samples.forEach((p, i) => { if (distance(p, anchors[station.id]) < distance(curve.samples[nearest], anchors[station.id])) nearest = i; });
    return curve.distances[nearest];
  });
}
