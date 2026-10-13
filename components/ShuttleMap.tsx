import React, { useEffect, useState } from 'react';
import { LocateFixed, Scan } from 'lucide-react';
import { BusRun, Direction, Station } from '../types';
import { Language, translate, TranslationKey } from '../locales';
import { anchors, Point, points, project, roads, segments, tripPosition } from '../lib/mapGeometry';
import { getRouteForDirection, getRouteModeForDeparture } from '../lib/shuttle';
import { timeToMinutes } from '../utils';

function Box({ x, y, w, d, h, angle = 0, bus = false }: { x: number; y: number; w: number; d: number; h: number; angle?: number; bus?: boolean }) {
  const corner = (a: number, b: number, z: number): Point => [x + Math.cos(angle) * a - Math.sin(angle) * b, y + Math.sin(angle) * a + Math.cos(angle) * b, z];
  const faces = [[corner(0, 0, 0), corner(w, 0, 0), corner(w, 0, h), corner(0, 0, h)], [corner(w, 0, 0), corner(w, d, 0), corner(w, d, h), corner(w, 0, h)], [corner(w, d, 0), corner(0, d, 0), corner(0, d, h), corner(w, d, h)], [corner(0, d, 0), corner(0, 0, 0), corner(0, 0, h), corner(0, d, h)]];
  faces.sort((a, b) => a.reduce((n, p) => n + project(p)[1], 0) - b.reduce((n, p) => n + project(p)[1], 0));
  return <g>{faces.map((face, i) => <polygon key={i} points={points(face)} fill={bus ? (i % 2 ? '#176bdd' : '#124c9e') : (i % 2 ? '#b5c8d9' : '#d1dfea')} stroke={bus ? '#176bdd' : '#acc0d0'} strokeWidth='.6' />)}<polygon points={points([corner(0, 0, h), corner(w, 0, h), corner(w, d, h), corner(0, d, h)])} fill={bus ? '#fff' : '#f6fafc'} />{bus && <polygon points={points([corner(w * .65, 2, h + .1), corner(w - 3, 2, h + .1), corner(w - 3, d - 2, h + .1), corner(w * .65, d - 2, h + .1)])} fill='#84b4dd' />}</g>;
}

interface Props { direction: Direction; stations: Station[]; schedule: BusRun[]; isToday: boolean; previewBus: BusRun | null; nextBus?: BusRun; lang: Language; expanded: boolean; }
export default function ShuttleMap({ direction, stations, schedule, isToday, previewBus, nextBus, lang, expanded }: Props) {
  const container = React.useRef<HTMLDivElement>(null);
  const [labelScale, setLabelScale] = useState(1);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setLabelScale(Math.max(1, 896 / entry.contentRect.width)));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const [now, setNow] = useState(() => new Date());
  const [follow, setFollow] = useState(true);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!isToday || previewBus) return;
    const timer = window.setInterval(() => { if (!document.hidden) setNow(new Date()); }, reduced ? 30000 : 100);
    return () => clearInterval(timer);
  }, [isToday, previewBus, reduced]);
  const route = getRouteForDirection(direction);
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 + now.getMilliseconds() / 60000;
  const buses = isToday && !previewBus ? schedule.flatMap(run => {
    const stops = getRouteModeForDeparture(run.departureTime, route.nightModeStartMinutes) === 'night' ? route.nightStations : route.dayStations;
    const elapsed = minutes - timeToMinutes(run.departureTime);
    return elapsed >= 0 && elapsed <= stops[stops.length - 1].distanceFromStart + 2 ? [{ id: run.id, ...tripPosition(direction, stops, elapsed) }] : [];
  }) : [];
  const cruising = buses.length > 0 && follow && !reduced && !expanded;
  const center = cruising ? project(buses[0].p) : [660, -80];
  const zoom = cruising ? 2.2 : 1;
  const color = previewBus ? '#d99826' : '#176bdd';
  const waiting = !buses.length && !previewBus && nextBus;
  return <div ref={container} className='shuttle-map' style={{ '--label-scale': labelScale } as React.CSSProperties}>
    <svg viewBox='100 -470 1120 790' role='img' aria-label={translate(lang, direction === Direction.SOUTH_TO_NORTH ? 'direction_sn' : 'direction_ns')}>
      <g className='map-camera' style={{ transform: `translate(${660 - center[0] * zoom}px, ${-80 - center[1] * zoom}px) scale(${zoom})` }}>
        {Array.from({ length: 21 }, (_, i) => (i - 5) * 120).map(n => <g key={n} stroke='#dbe5eb' strokeWidth='1'><polyline points={points([[n, -600], [n, 1800]])} /><polyline points={points([[-600, n], [1800, n]])} /></g>)}
        <Box x={25} y={355} w={270} d={120} h={7} /><Box x={440} y={155} w={480} d={185} h={7} />
        {roads.map((road, i) => <g key={i}><polyline points={points(road)} fill='none' stroke='#d6e0e7' strokeWidth='42' strokeLinejoin='round' strokeLinecap='round' /><polyline points={points(road)} fill='none' stroke='#fff' strokeWidth='35' strokeLinejoin='round' strokeLinecap='round' /><polyline points={points(road)} fill='none' stroke='#dbe4ec' strokeWidth='1.5' strokeDasharray='7 9' /></g>)}
        {segments(direction, stations).map((path, i) => <polyline key={i} points={points(path)} fill='none' stroke={color} strokeWidth='7' strokeOpacity='.85' strokeLinecap='round' strokeLinejoin='round' />)}
        {[[50,395,85,45,1],[170,395,85,45,.8],[475,190,105,48,1],[615,190,105,48,1],[755,190,105,48,1],[550,280,225,38,.75]].sort((a,b) => (a[1]-a[0])-(b[1]-b[0])).map(([x,y,w,d,h],i) => <Box key={i} x={x} y={y} w={w} d={d} h={52*h} />)}
        {stations.map(s => { const [x,y] = project(anchors[s.id]); return <g key={s.id}><circle cx={x} cy={y} r='10' fill='white' stroke={color} strokeWidth='4' /><g transform={`translate(${x},${y+30*labelScale/zoom}) scale(${labelScale/zoom})`}><rect x='-78' y='-9' width='156' height='34' rx='12' fill='white' stroke='#d5e0e9' /><text textAnchor='middle' y='14' fontSize='17' fontWeight='700' fill='#34485c'>{translate(lang, `short_${s.id}` as TranslationKey)}</text></g></g>; })}
        {waiting && (() => { const [x,y] = project(anchors[stations[0].id]); return <g transform={`translate(${x},${y-40*labelScale/zoom}) scale(${labelScale/zoom})`}><rect x='-98' y='-27' width='196' height='36' rx='18' fill='#176bdd' /><text textAnchor='middle' y='-3' fill='white' fontSize='16' fontWeight='700'>{nextBus.departureTime} · {translate(lang,'status_scheduled')}</text></g>; })()}
        {buses.map(bus => <Box key={bus.id} x={bus.p[0]} y={bus.p[1]} w={42} d={20} h={23} angle={bus.angle} bus />)}
      </g>
    </svg>
    <button className='map-control' onClick={() => setFollow(!follow)} aria-pressed={follow} aria-label={lang === 'zh' ? '切换车辆跟随' : 'Toggle vehicle follow'}>{follow ? <LocateFixed size={18} /> : <Scan size={18} />}{lang === 'zh' ? (follow ? '跟随车辆' : '查看全程') : (follow ? 'Follow bus' : 'Full route')}</button>
  </div>;
}
