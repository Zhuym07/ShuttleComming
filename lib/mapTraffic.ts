import { BusRun, DayOfWeek, Direction, RouteMode, ServiceTag, Station } from '../types';
import { ROUTES } from '../config/routes';
import { getRouteModeForDeparture, getScheduleForDay } from './shuttle';
import { Curve, Point, roundedCurve, sampleCurve, segments, stationOffsets } from './mapGeometry';
import { timeToMinutes } from '../utils';

export type VehiclePhase = 'preparing' | 'departing' | 'driving' | 'dwelling' | 'arriving' | 'fading';
export interface VehicleFrame { runId: string; direction: Direction; tag?: ServiceTag; p: Point; angle: number; opacity: number; phase: VehiclePhase; stationId?: string; }
export interface TripTimeline {
  run: BusRun; direction: Direction; mode: RouteMode; stations: Station[]; departure: number;
  arrivals: number[]; curve: Curve; offsets: number[]; stagger: number;
}

export function compileTimelines(day: DayOfWeek): TripTimeline[] {
  const curves = new Map<string, { curve: Curve; offsets: number[] }>();
  return Object.values(ROUTES).flatMap(route => {
    const schedule = getScheduleForDay(route.schedule, day);
    return schedule.map((run, index) => {
      const mode = getRouteModeForDeparture(run.departureTime, route.nightModeStartMinutes);
      const stations = mode === 'night' ? route.nightStations : route.dayStations;
      const key = route.id + mode;
      let geometry = curves.get(key);
      if (!geometry) {
        const path = segments(route.direction, stations).flatMap((segment, i) => i === 0 ? segment : segment.slice(1));
        const curve = roundedCurve(path, 11);
        geometry = { curve, offsets: stationOffsets(curve, stations) };
        curves.set(key, geometry);
      }
      const convoy = schedule.slice(0, index).filter(previous => previous.departureTime === run.departureTime).length;
      const departure = timeToMinutes(run.departureTime) * 60;
      return {
        run, direction: route.direction, mode, stations, departure,
        arrivals: stations.map(station => departure + station.distanceFromStart * 60),
        curve: geometry.curve, offsets: geometry.offsets.map(value => value - convoy * 65), stagger: Math.min(2, convoy * 2),
      };
    });
  });
}

// Integrated trapezoidal speed: acceleration, cruise, and braking share one path.
export function travelProgress(elapsed: number, duration: number) {
  const ramp = Math.min(4, duration / 4), stop = Math.min(8, duration / 4);
  const area = duration - (ramp + stop) / 2;
  if (elapsed <= ramp) return elapsed * elapsed / (2 * ramp * area);
  if (elapsed >= duration - stop) { const remaining = duration - Math.min(duration, elapsed); return 1 - remaining * remaining / (2 * stop * area); }
  return (elapsed - ramp / 2) / area;
}

export function vehicleAt(trip: TripTimeline, seconds: number): VehicleFrame | null {
  const end = trip.arrivals[trip.arrivals.length - 1];
  if (seconds < trip.departure - 30 || seconds >= end + 10) return null;
  let phase: VehiclePhase = 'preparing', stationId: string | undefined = trip.stations[0].id;
  let offset = trip.offsets[0], opacity = Math.min(1, Math.max(0, seconds - (trip.departure - 30)));
  if (seconds >= end) {
    offset = trip.offsets[trip.offsets.length - 1];
    stationId = trip.stations[trip.stations.length - 1].id;
    phase = seconds < end + 8 ? 'arriving' : 'fading';
    opacity = Math.min(1, (end + 10 - seconds) / 2);
  } else if (seconds >= trip.departure) {
    for (let i = 0; i < trip.arrivals.length - 1; i++) {
      const arrival = trip.arrivals[i], next = trip.arrivals[i + 1];
      if (seconds >= next) continue;
      const leave = arrival + (i === 0 ? trip.stagger : 6);
      if (seconds < leave) { offset = trip.offsets[i]; phase = i === 0 ? 'departing' : 'dwelling'; stationId = trip.stations[i].id; }
      else {
        const elapsed = seconds - leave;
        const fraction = travelProgress(elapsed, next - leave);
        offset = trip.offsets[i] + (trip.offsets[i + 1] - trip.offsets[i]) * fraction;
        phase = elapsed < 4 ? 'departing' : 'driving'; stationId = undefined;
      }
      break;
    }
  }
  return { runId: trip.run.id, direction: trip.direction, tag: trip.run.tag, ...sampleCurve(trip.curve, offset), opacity, phase, stationId };
}

export const timelineBoundaries = (trips: TripTimeline[]) => trips.flatMap(trip => [trip.departure - 30, trip.departure, trip.departure + trip.stagger + 4, ...trip.arrivals.slice(1).flatMap((arrival, i) => i === trip.arrivals.length - 2 ? [arrival, arrival + 8, arrival + 10] : [arrival, arrival + 6, arrival + 10])]);
export const phaseIsRunning = (phase: VehiclePhase) => phase === 'departing' || phase === 'driving' || phase === 'dwelling';

export type MapFocus = { kind: 'overview' } | { kind: 'station'; stationId: string; runId?: string } | { kind: 'vehicle'; runId: string };

export function getDirectionFocus(trips: TripTimeline[], direction: Direction, seconds: number, isToday: boolean): MapFocus {
  const variants = trips.filter(trip => trip.direction === direction);
  const next = variants.find(trip => !isToday || trip.departure > seconds);
  // The imminent departure takes priority over an earlier bus still on the road.
  if (isToday && (!next || next.departure - seconds > 30)) {
    const running = [...variants].reverse().find(trip => { const frame = vehicleAt(trip, seconds); return frame && phaseIsRunning(frame.phase); });
    if (running) return { kind: 'vehicle', runId: running.run.id };
  }
  if (next) return { kind: 'station', stationId: next.stations[0].id, runId: next.run.id };
  const route = Object.values(ROUTES).find(route => route.direction === direction)!;
  const stations = isToday && seconds / 60 >= route.nightModeStartMinutes ? route.nightStations : route.dayStations;
  return { kind: 'station', stationId: stations[0].id };
}

export function getVehicleArrival(trip: TripTimeline, seconds: number) {
  const frame = vehicleAt(trip, seconds);
  const stopped = frame?.stationId && frame.phase !== 'preparing' ? trip.stations.findIndex(station => station.id === frame.stationId) : -1;
  const next = trip.arrivals.findIndex((time, index) => index > 0 && time > seconds);
  const index = stopped > 0 ? stopped : next > 0 ? next : trip.stations.length - 1;
  return { station: trip.stations[index], seconds: trip.arrivals[index] };
}
