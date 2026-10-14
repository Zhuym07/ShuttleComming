import React, { memo, useRef, useImperativeHandle, forwardRef } from 'react';
import { Direction } from '../types';
import { Point, project, points } from '../lib/mapGeometry';
import { VehicleFrame } from '../lib/mapTraffic';

export interface VehicleHandle { draw: (frame: VehicleFrame | null, worldScale: number, screenSize: number) => void; }
interface Props { runId: string; label: string; onSelect: () => void; }
const MapVehicle = memo(forwardRef<VehicleHandle, Props>(function MapVehicle({ runId, label, onSelect }, ref) {
  const group = useRef<SVGGElement>(null);
  const geometry = useRef({ angle: Infinity, scale: 0, parts: new Map<string, SVGElement>() });
  useImperativeHandle(ref, () => ({ draw(frame, worldScale, screenSize) {
    const root = group.current;
    if (!root) return;
    root.style.display = frame ? '' : 'none';
    if (!frame) return;
    root.setAttribute('data-phase', frame.phase);
    root.setAttribute('opacity', String(frame.opacity));
    const [px, py] = project(frame.p);
    root.setAttribute('transform', 'translate(' + px + ',' + py + ')');
    const u = [Math.cos(frame.angle), Math.sin(frame.angle)], v = [-u[1], u[0]];
    const bounds=[-36,36].flatMap(x=>[-18,18].flatMap(y=>[8,35].map(z=>project([u[0]*x+v[0]*y,u[1]*x+v[1]*y,z]))));
    const span=Math.max(Math.max(...bounds.map(p=>p[0]))-Math.min(...bounds.map(p=>p[0])),Math.max(...bounds.map(p=>p[1]))-Math.min(...bounds.map(p=>p[1])));
    const size = screenSize / (span * worldScale);
    const cached=geometry.current;
    if (Math.abs(cached.angle-frame.angle)<1e-5 && Math.abs(cached.scale-size)<1e-5) return;
    cached.angle=frame.angle;cached.scale=size;
    if (!cached.parts.size) root.querySelectorAll<SVGElement>('[data-part]').forEach(node=>cached.parts.set(node.dataset.part!,node));
    const corner = (x: number, y: number, z: number): Point => [(u[0] * x + v[0] * y) * size, (u[1] * x + v[1] * y) * size, z * size];
    const set = (name: string, vertices: Point[], fill?: string, visible = true) => {
      const node = cached.parts.get(name)!;
      node.setAttribute('points', points(vertices));
      if (fill) node.setAttribute('fill', fill);
      node.style.display = visible ? '' : 'none';
    };
    const isRed = frame.tag === 'red';
    const color = isRed ? '#b82e43' : frame.direction === Direction.SOUTH_TO_NORTH ? '#176bdd' : '#079d9c';
    const body = [[-36,-14],[-32,-18],[30,-18],[36,-12],[36,12],[30,18],[-32,18],[-36,14]];
    const faces = body.map(([x,y], i) => { const [nx,ny] = body[(i+1)%8]; return [corner(x,y,8),corner(nx,ny,8),corner(nx,ny,35),corner(x,y,35)]; });
    faces.sort((a,b) => a.reduce((sum,p)=>sum+project(p)[1],0)-b.reduce((sum,p)=>sum+project(p)[1],0));
    set('shadow', [corner(-43,-23,0),corner(43,-23,0),corner(43,23,0),corner(-43,23,0)], '#244961');
    faces.forEach((face,i) => {
      set('body'+i,face,isRed ? (i%2 ? '#ed7581' : '#cb4052') : (i%2 ? '#e9f2f8' : '#c6d8e5'));
      cached.parts.get('body'+i)!.setAttribute('stroke',isRed?'#b73749':'#b2cbdc');
    });
    [-1,1].forEach((sign,i) => {
      const visible = (-v[0]+v[1])*sign > 0;
      set('stripe'+i,[corner(-30,18*sign,9),corner(30,18*sign,9),corner(30,18*sign,16),corner(-30,18*sign,16)],color,visible);
      set('windows'+i,[corner(-27,18*sign,20),corner(22,18*sign,20),corner(22,18*sign,31),corner(-27,18*sign,31)],'#31546e',visible);
      [-23,23].forEach((x,j) => {
        const wheel = Array.from({length:16},(_,n)=>corner(x+Math.cos(n*Math.PI/8)*7,19*sign,8+Math.sin(n*Math.PI/8)*7));
        set('wheel'+i+j,wheel,'#253c50',visible);
        set('hub'+i+j,Array.from({length:12},(_,n)=>corner(x+Math.cos(n*Math.PI/6)*3,19.1*sign,8+Math.sin(n*Math.PI/6)*3)),'#a6bfce',visible);
      });
    });
    set('front',[corner(36,-10,19),corner(36,10,19),corner(36,10,30),corner(36,-10,30)],'#254d6b',-u[0]+u[1]>0);
    set('roof',body.map(([x,y])=>corner(x,y,35)),isRed?'#f28a94':'#fff');
    set('roof-light',[corner(-16,-8,35.1),corner(10,-8,35.1),corner(10,8,35.1),corner(-16,8,35.1)],isRed?'#ffd4d9':'#dce8ef');
    const hit=cached.parts.get('hit')!;
    hit.setAttribute('r',String(Math.max(22,screenSize/2)/worldScale));hit.setAttribute('cy',String(-12*size));
  } }), []);
  const names = ['shadow',...Array.from({length:8},(_,i)=>'body'+i),'stripe0','windows0','wheel00','hub00','wheel01','hub01','stripe1','windows1','wheel10','hub10','wheel11','hub11','front','roof','roof-light'];
  return <g ref={group} data-run={runId} className='map-vehicle' role='button' tabIndex={0} aria-label={label} style={{display:'none'}} onClick={onSelect} onKeyDown={event => { if(event.key==='Enter'||event.key===' ') {event.preventDefault();onSelect();} }}>
    {names.map(name => <polygon key={name} data-part={name} strokeLinejoin='round' stroke={name.startsWith('body')?'#b2cbdc':'none'} strokeWidth='.5' opacity={name==='shadow'?.13:1} />)}
    <circle data-part='hit' fill='transparent' />
  </g>;
}));
export default MapVehicle;
