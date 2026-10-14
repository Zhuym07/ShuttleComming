import React, { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { LocateFixed, Scan, X } from 'lucide-react';
import { BusRun, Direction, RouteMode, ShuttleOverviewState } from '../types';
import { Language, translate, TranslationKey } from '../locales';
import { anchors, Point, points, project, roads, roundedCurve } from '../lib/mapGeometry';
import { getDirectionFocus, getVehicleArrival, MapFocus, TripTimeline, phaseIsRunning, vehicleAt, VehicleFrame } from '../lib/mapTraffic';
import { PlaybackClock } from '../lib/playbackClock';
import { minutesToTime } from '../utils';
import { getDepartureCountdown, getRouteForDirection, getUpcomingDepartures } from '../lib/shuttle';
import MapVehicle, { VehicleHandle } from './MapVehicle';

const campusBuildings = [[50,395,85,45,52],[170,395,85,45,42],[475,190,105,48,52],[615,190,105,48,52],[755,190,105,48,52],[550,280,225,38,39]].sort((a,b)=>(a[1]-a[0])-(b[1]-b[0]));
const roadCurves = roads.map(road=>roundedCurve(road));
const StaticGround = memo(function StaticGround() {
  return <g className='map-ground'>
    {Array.from({length:23},(_,i)=>(i-6)*120).map(n=><g key={n} stroke='#e8eff7' strokeWidth='1.5'><polyline points={points([[n,-720],[n,1920]])}/><polyline points={points([[-720,n],[1920,n]])}/></g>)}
    <polygon points={points([[25,355,3],[295,355,3],[295,475,3],[25,475,3]])} fill='#e5f0eb' stroke='#c6dcd4' strokeWidth='3'/>
    <polygon points={points([[440,155,3],[920,155,3],[920,340,3],[440,340,3]])} fill='#e5f0eb' stroke='#c6dcd4' strokeWidth='3'/>
    {roadCurves.map((curve,i)=><g key={i}><polyline points={points(curve.samples)} fill='none' stroke='#d0dce7' strokeWidth='46' strokeLinejoin='round' strokeLinecap='round'/><polyline points={points(curve.samples)} fill='none' stroke='#fff' strokeWidth='2' strokeDasharray='9 12' vectorEffect='non-scaling-stroke'/></g>)}
    {Object.values(anchors).map(([x,y],i)=><polygon key={i} points={points([[x-38,y-20],[x+45,y-20],[x+45,y+20],[x-38,y+20]])} fill='#eef5fb' stroke='#9bb9d0' strokeWidth='3'/>)}
    {campusBuildings.map(([x,y,w,d,h],i)=><g key={i}>
      <polygon points={points([[x,y,0],[x+w,y,0],[x+w,y,h],[x,y,h]])} fill='#afc4d2'/>
      <polygon points={points([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]])} fill='#91adbf'/>
      <polygon points={points([[x+w,y+d,0],[x,y+d,0],[x,y+d,h],[x+w,y+d,h]])} fill='#bed0dc'/>
      <polygon points={points([[x,y,0],[x,y+d,0],[x,y+d,h],[x,y,h]])} fill='#a6bece'/>
      <polygon points={points([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]])} fill='#e4edf3' stroke='#f7fbff' strokeWidth='4'/>
    </g>)}
  </g>;
});

interface Props {
  clock: PlaybackClock; trips: TripTimeline[]; isToday: boolean; previewBus: BusRun | null;
  summaries: ShuttleOverviewState['summaries'];
  direction: Direction; lang: Language; expanded: boolean; selectedRunId: string | null;
  focusRequest: {direction:Direction} | null;
  onSelectVehicle: (trip: TripTimeline) => void; onSelectDirection: (direction: Direction) => void;
  onClearVehicle: () => void;
}
interface LabelPlacement {left:number;top:number;width:number;height:number;x:number;y:number;compact:boolean}
export default memo(function ShuttleMap({ clock, trips, isToday, summaries, previewBus, direction, lang, expanded, selectedRunId, focusRequest, onSelectVehicle, onSelectDirection, onClearVehicle }: Props) {
  const snapshot = useSyncExternalStore(clock.subscribe, clock.getSnapshot);
  const container = useRef<HTMLDivElement>(null), world = useRef<SVGGElement>(null);
  const vehicles = useRef(new Map<string, VehicleHandle>());
  const labels = useRef(new Map<string, HTMLElement>());
  const leaders = useRef(new Map<string, SVGLineElement>());
  const labelPlacements = useRef(new Map<string, LabelPlacement>());
  const labelPositions = useRef(new Map<string, {left:number;top:number}>());
  const vehicleInfo = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({width:390,height:500});
  const [focus, setFocus] = useState<MapFocus>({kind:'overview'});
  const following = focus.kind !== 'overview';
  const [reduced, setReduced] = useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const camera = useRef({x:0,y:0,scale:1,revision:-1,previous:0});
  const active = isToday && !previewBus;
  useEffect(()=> { const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height})); if(container.current)observer.observe(container.current); return ()=>observer.disconnect(); },[]);
  useEffect(()=> { const media=matchMedia('(prefers-reduced-motion: reduce)'); const change=()=>setReduced(media.matches); media.addEventListener('change',change);return ()=>media.removeEventListener('change',change);},[]);
  useEffect(()=>setFocus(selectedRunId?{kind:'vehicle',runId:selectedRunId}:{kind:'overview'}),[selectedRunId]);
  useEffect(()=>setFocus({kind:'overview'}),[previewBus,isToday,snapshot.revision]);
  useEffect(()=>{
    if(!focusRequest)return;
    const target=getDirectionFocus(trips,focusRequest.direction,clock.read(),isToday);
    setFocus(target);
    if(target.kind==='vehicle')onSelectVehicle(trips.find(trip=>trip.run.id===target.runId)!);
  },[focusRequest,clock,trips,isToday,onSelectVehicle]);
  const focusTrip=focus.kind==='overview'?undefined:trips.find(trip=>trip.run.id===focus.runId);
  useEffect(()=>{
    if(focus.kind==='station'&&focusTrip&&active&&snapshot.seconds>=focusTrip.departure) {
      const frame=vehicleAt(focusTrip,snapshot.seconds);
      if(frame&&phaseIsRunning(frame.phase)){setFocus({kind:'vehicle',runId:focusTrip.run.id});onSelectVehicle(focusTrip);}
      else setFocus({kind:'overview'});
    }
  },[focus,focusTrip,active,snapshot.seconds,onSelectVehicle]);

  const previewTrip = previewBus ? trips.find(trip=>trip.run.id===previewBus.id&&trip.direction===direction) : undefined;
  const roadModes = useMemo(()=> {
    const result: TripTimeline[]=[];
    for(const d of [Direction.SOUTH_TO_NORTH,Direction.NORTH_TO_SOUTH]) {
      const variants = trips.filter(trip=>trip.direction===d);
      const modes = new Set<RouteMode>([previewTrip?.mode ?? (isToday && snapshot.seconds >= 19.5*3600 ? 'night' : 'day')]);
      if(active) variants.forEach(trip=> {if(snapshot.seconds>=trip.departure-30&&snapshot.seconds<=trip.arrivals[trip.arrivals.length-1]+10)modes.add(trip.mode);});
      modes.forEach(mode=> {const trip=variants.find(item=>item.mode===mode);if(trip)result.push(trip);});
    }
    return result;
  },[trips,isToday,active,snapshot.seconds,previewTrip]);
  // Keep the full view until the final daytime trip has left Gate 9.
  const nightOnly = roadModes.length > 0 && roadModes.every(trip=>trip.mode==='night');
  const nightBounds = useMemo(()=> {
    const curves = new Set(trips.filter(trip=>trip.mode==='night').map(trip=>trip.curve));
    const projected = [...curves].flatMap(curve=>curve.samples.map(project));
    projected.push(project(anchors.sc_2),project(anchors.nc_main));
    return {left:Math.min(...projected.map(p=>p[0])),right:Math.max(...projected.map(p=>p[0])),top:Math.min(...projected.map(p=>p[1])),bottom:Math.max(...projected.map(p=>p[1]))};
  },[trips]);
  const base = useMemo(()=> {
    if(nightOnly) {
      const width=nightBounds.right-nightBounds.left, height=nightBounds.bottom-nightBounds.top;
      const scale=Math.max(.1,Math.min((size.width-76)/width,(size.height-164)/height));
      return {scale,x:size.width/2-(nightBounds.left+nightBounds.right)/2*scale,y:64+(size.height-144)/2-(nightBounds.top+nightBounds.bottom)/2*scale};
    }
    const scale=Math.max(.1,Math.min((size.width-66)/940,(size.height-126)/880));
    return {scale,x:size.width/2-795*scale,y:54+(size.height-100)/2+86*scale};
  },[size,nightOnly,nightBounds]);
  const selectedTrip=trips.find(trip=>trip.run.id===selectedRunId);
  const selectedFrame=selectedTrip&&active?vehicleAt(selectedTrip,snapshot.seconds):null;
  const selectedArrival=selectedTrip?getVehicleArrival(selectedTrip,snapshot.seconds):undefined;
  const showVehicleInfo=Boolean(selectedFrame&&size.height>=300&&window.innerWidth<900);
  const stationInfo = Object.keys(anchors).map(id=> {
    const summary=summaries[id==='nc_main'?'north_to_south':'south_to_north'];
    const transit=id==='sc_2'&&!nightOnly;
    const next=transit?undefined:getUpcomingDepartures(getRouteForDirection(summary.direction),summary.schedule,snapshot.seconds/60,isToday,id)[0];
    const arrived=active && trips.some(trip=>trip.stations[trip.stations.length-1].id===id&&snapshot.seconds>=trip.arrivals[trip.arrivals.length-1]&&snapshot.seconds<trip.arrivals[trip.arrivals.length-1]+8);
    const previewIndex=previewTrip?.stations.findIndex(station=>station.id===id)??-1;
    const previewing=Boolean(!transit&&previewTrip&&previewIndex>=0);
    const text=transit?'':previewing ? translate(lang,previewIndex===0?'map_preview_departure':'map_preview_arrival',{time:minutesToTime(previewTrip!.arrivals[previewIndex]/60)}) : next ? translate(lang,isToday?'map_next_departure':'map_first_departure',{time:next.departureTime})+(next.runs.length>1?' · '+translate(lang,'departure_count',{count:next.runs.length}):'') : translate(lang,isToday&&snapshot.seconds>=19.5*3600&&id==='sc_9'?'map_night_closed':isToday?'departure_none':'departure_none_date');
    const time=previewing?minutesToTime(previewTrip!.arrivals[previewIndex]/60):next?.departureTime;
    const arrival=previewing&&previewIndex>0;
    const countdown=time&&isToday&&!previewing?getDepartureCountdown(time,snapshot.seconds/60):undefined;
    const countdownText=countdown?translate(lang,arrival?(countdown.unit==='seconds'?'arrival_seconds':'arrival_minutes'):(countdown.unit==='seconds'?'departure_seconds':'departure_minutes'),{count:countdown.value}):'';
    const feedback=!transit&&!previewing&&arrived&&!countdownText?translate(lang,'vehicle_arrived'):'';
    return {id,text,time,arrival,previewing,transit,count:next&&!previewing?next.runs.length:1,countdownText,urgent:Boolean(countdown?.urgent),feedback,selectDirection:summary.direction};
  });
  const labelLayout=stationInfo.map(info=>[Boolean(info.time),Boolean(info.countdownText),Boolean(info.feedback),info.count>1,info.transit].join(':')).join('|')+'|'+showVehicleInfo;

  useEffect(()=> {
    let visibleTrips: TripTimeline[]=[], nextBoundary=0, previousSeconds=-1, lastReduced=-Infinity, lastPhases='';
    let drawn=new Set<string>(), labelsMoving=false;
    const labelSizes=new Map([...labels.current].map(([id,node])=> {
      node.hidden=false;
      const wasCompact=node.classList.contains('station-compact');
      node.classList.remove('station-compact');
      const full={width:node.offsetWidth,height:node.offsetHeight};
      node.classList.add('station-compact');
      const compact={width:node.offsetWidth,height:node.offsetHeight};
      node.classList.toggle('station-compact',wasCompact);
      return [id,{full,compact}] as const;
    }));
    const placements=labelPlacements.current, positions=labelPositions.current;
    const labelBottom=showVehicleInfo?(vehicleInfo.current?.offsetHeight??0)+18:10;
    const desktop=window.innerWidth>=900;
    vehicles.current.forEach(vehicle=>vehicle.draw(null,base.scale,30));
    const positionLabels=(frames: VehicleFrame[],seconds:number,dt:number,jump:boolean)=> {
      if(jump){placements.clear();positions.clear();}
      labelsMoving=false;
      const used: {left:number;top:number;width:number;height:number}[]=[];
      const playback=clock.getSnapshot();
      const leadSeconds=playback.mode==='real'?.65:playback.playing?.65*playback.speed:0;
      const futureFrames=visibleTrips.map(trip=>vehicleAt(trip,seconds+leadSeconds));
      const vehicleObstacles = frames.map(frame => {
        const p = project(frame.p);
        const x = p[0] * camera.current.scale + camera.current.x;
        const y = p[1] * camera.current.scale + camera.current.y;
        const future=futureFrames.find(item=>item?.runId===frame.runId);
        const q=future?project(future.p):p;
        const nextX=q[0]*camera.current.scale+camera.current.x, nextY=q[1]*camera.current.scale+camera.current.y;
        const size = desktop ? (frame.runId===selectedRunId?52:36) : (frame.runId===selectedRunId?36:30);
        return { left: Math.min(x,nextX) - size * .65 - 10, top: Math.min(y,nextY) - size - 12, width: Math.abs(nextX-x)+size * 1.3 + 20, height: Math.abs(nextY-y)+size + 30 };
      });
      for(const id of ['sc_9','sc_2','nc_main']) {
        const node=labels.current.get(id); if(!node)continue;
        const p=project(anchors[id]); const x=p[0]*camera.current.scale+camera.current.x, y=p[1]*camera.current.scale+camera.current.y;
        const leader=leaders.current.get(id);
        node.hidden=(nightOnly&&id==='sc_9')||(following&&(x < -20 || x>size.width+20 || y<0 || y>size.height+20));
        if(leader)leader.style.display='none';
        if(node.hidden){placements.delete(id);positions.delete(id);continue;}
        const labelTop=size.height<260&&!following?38:50;
        let placement: {left:number;top:number;width:number;height:number;compact:boolean}|undefined;
        const previous=placements.get(id);
        for(const compact of previous?.compact?[true]:[false,true]) {
          const {width,height}=labelSizes.get(id)![compact?'compact':'full'];
          const bottom=size.height-height-labelBottom;
          if(bottom<labelTop)continue;
          const tryPosition=(candidateX:number,candidateY:number,margin:number)=> {
            const left=Math.max(10,Math.min(size.width-width-10,candidateX));
            const top=Math.max(labelTop,Math.min(bottom,candidateY));
            const overlaps=(rect:{left:number;top:number;width:number;height:number},gap:number)=>left<rect.left+rect.width+gap&&left+width+gap>rect.left&&top<rect.top+rect.height+gap&&top+height+gap>rect.top;
            if(used.some(rect=>overlaps(rect,8))||vehicleObstacles.some(rect=>overlaps(rect,margin)))return false;
            placement={left,top,width,height,compact};
            return true;
          };
          // Follow the anchor continuously; only choose another slot when it becomes unsafe.
          if(previous&&previous.compact===compact&&tryPosition(previous.left+x-previous.x,previous.top+y-previous.y,8))break;
          const choices=id==='sc_9'?[[0,-height-22],[-width/2-22,-height/2],[width/2+22,-height/2],[0,24]]:[[-width/2-22,-height/2],[width/2+22,-height/2],[0,24],[0,-height-22]];
          for(const [dx,dy] of choices){if(tryPosition(x+dx-width/2,y+dy,28))break;}
          if(!placement){
            const edgeCandidates: number[][]=[];
            for(let row=labelTop;row<=bottom;row+=12)edgeCandidates.push([10,row],[size.width-width-10,row]);
            edgeCandidates.sort((a,b)=>Math.hypot(a[0]+width/2-x,a[1]+height/2-y)-Math.hypot(b[0]+width/2-x,b[1]+height/2-y));
            for(const [left,top] of edgeCandidates){if(tryPosition(left,top,28))break;}
          }
          if(placement)break;
        }
        // In a crowded, short viewport, the departure cards still carry the times.
        if(!placement){node.hidden=true;placements.delete(id);positions.delete(id);continue;}
        const {left,top,width,height,compact}=placement;
        node.classList.toggle('station-compact',compact);
        const position=positions.get(id)??{left,top};
        const distance=Math.hypot(left-position.left,top-position.top);
        const alpha=reduced||jump?1:Math.min(1-Math.exp(-dt*12),distance>0?420*dt/distance:1);
        position.left+=(left-position.left)*alpha;position.top+=(top-position.top)*alpha;
        if(Math.hypot(left-position.left,top-position.top)<.1){position.left=left;position.top=top;}else labelsMoving=true;
        positions.set(id,position);
        node.style.transform='translate3d('+position.left+'px,'+position.top+'px,0)';
        // During a cross-map move, let a vehicle remain visible and clickable underneath.
        const yielding=vehicleObstacles.some(rect=>position.left<rect.left+rect.width&&position.left+width>rect.left&&position.top<rect.top+rect.height&&position.top+height>rect.top);
        node.classList.toggle('station-yielding',yielding);
        used.push({left,top,width,height});
        placements.set(id,{...placement,x,y});
        if(leader){
          leader.setAttribute('x1',String(x));leader.setAttribute('y1',String(y));
          leader.setAttribute('x2',String(Math.max(position.left,Math.min(position.left+width,x))));
          leader.setAttribute('y2',String(Math.max(position.top,Math.min(position.top+height,y))));
          leader.style.display='';
        }
      }
    };
    const tick=(seconds:number,timestamp:number)=> {
      if(seconds<previousSeconds||seconds>=nextBoundary||previousSeconds<0) {
        visibleTrips=active?trips.filter(trip=>seconds>=trip.departure-30&&seconds<trip.arrivals[trip.arrivals.length-1]+10):[];
        nextBoundary=trips.reduce((minimum,trip)=>Math.min(minimum,...[trip.departure-30,trip.arrivals[trip.arrivals.length-1]+10].filter(time=>time>seconds)),Infinity);
      }
      const frames: VehicleFrame[]=visibleTrips.map(trip=>vehicleAt(trip,seconds)).filter((frame):frame is VehicleFrame=>frame!==null);
      const phases=frames.map(frame=>frame.runId+frame.phase).join('|');
      if(reduced&&timestamp-lastReduced<1000&&previousSeconds>=0&&phases===lastPhases&&camera.current.revision===clock.getSnapshot().revision)return;
      lastReduced=timestamp;lastPhases=phases;
      const followRun=focus.kind==='vehicle'?focus.runId:focus.kind==='station'&&active&&focusTrip&&seconds>=focusTrip.departure?focusTrip.run.id:undefined;
      const target=followRun?frames.find(frame=>frame.runId===followRun&&frame.phase!=='arriving'&&frame.phase!=='fading'):undefined;
      if(focus.kind==='vehicle'&&!target)setFocus({kind:'overview'});
      const stationTarget=focus.kind==='station'&&!followRun?anchors[focus.stationId]:undefined;
      const tracking=(target||stationTarget)&&(!expanded||desktop);
      const remaining=active&&focusTrip?focusTrip.departure-seconds:Infinity;
      const attention=Math.max(0,Math.min(1,(30-remaining)/30));
      const emphasis=attention*attention*(3-2*attention);
      const zoom=target?(desktop?2.2:1.6):desktop?1.45+.35*emphasis:1.2+.3*emphasis;
      const point=target?project(target.p):stationTarget?project(stationTarget):[0,0];
      const goal=tracking?{scale:base.scale*zoom,x:size.width/2-point[0]*base.scale*zoom,y:size.height*.53-point[1]*base.scale*zoom}:base;
      const dt=Math.min(.1,Math.max(0,(timestamp-camera.current.previous)/1000));
      const jump=camera.current.revision!==clock.getSnapshot().revision||camera.current.previous===0;
      if(previousSeconds===seconds&&!jump&&!labelsMoving&&Math.abs(camera.current.x-goal.x)<.01&&Math.abs(camera.current.y-goal.y)<.01&&Math.abs(camera.current.scale-goal.scale)<.00001)return;
      previousSeconds=seconds;
      const alpha=reduced||jump?1:1-Math.exp(-dt*6);
      camera.current.x+=(goal.x-camera.current.x)*alpha;camera.current.y+=(goal.y-camera.current.y)*alpha;camera.current.scale+=(goal.scale-camera.current.scale)*alpha;
      camera.current.previous=timestamp;camera.current.revision=clock.getSnapshot().revision;
      world.current?.setAttribute('transform','translate('+camera.current.x+','+camera.current.y+') scale('+camera.current.scale+')');
      const current=new Set(frames.map(frame=>frame.runId));
      drawn.forEach(id=> {if(!current.has(id))vehicles.current.get(id)?.draw(null,camera.current.scale,30);});
      frames.forEach(frame=> {
        const selected=frame.runId===selectedRunId;
        const screenSize=desktop?(selected?52:36):(selected?36:30);
        vehicles.current.get(frame.runId)?.draw(frame,camera.current.scale,screenSize);
      });drawn=current;
      positionLabels(frames,seconds,dt,jump);
    };
    tick(clock.read(),performance.now());
    return clock.onFrame(tick);
  },[clock,trips,active,focus,focusTrip,selectedRunId,reduced,expanded,base,size,lang,labelLayout,nightOnly]);

  return <div ref={container} className={'shuttle-map'+(size.height<260?' map-dense':'')} data-focus={focus.kind}>
    <svg width={size.width} height={size.height} viewBox={'0 0 '+size.width+' '+size.height} aria-label={lang==='zh'?'南北校区班车路线':'Both campus shuttle routes'}>
      <g ref={world}>
        <StaticGround />
        {roadModes.filter(trip=>!previewTrip||trip.direction!==previewTrip.direction).map(trip=><polyline className='route-line' key={trip.direction+trip.mode} opacity={following && trip.direction!==direction ? .45 : 1} points={points(trip.curve.samples)} fill='none' stroke={trip.direction===Direction.SOUTH_TO_NORTH?'#176bdd':'#079d9c'} strokeWidth='3.5' strokeDasharray='11 15' vectorEffect='non-scaling-stroke' strokeLinecap='round' strokeLinejoin='round' />)}
        {previewTrip&&<polyline className='route-line preview-route' points={points(previewTrip.curve.samples)} fill='none' stroke='#d89b2d' strokeWidth='4' strokeDasharray='11 15' vectorEffect='non-scaling-stroke' strokeLinecap='round' />}
        {trips.map(trip=><MapVehicle key={trip.run.id} ref={handle=> {if(handle)vehicles.current.set(trip.run.id,handle);else vehicles.current.delete(trip.run.id);}} runId={trip.run.id} label={trip.run.departureTime+' '+translate(lang,trip.direction===Direction.SOUTH_TO_NORTH?'direction_sn':'direction_ns')+(trip.run.tag==='red'?' red':'')} onSelect={()=>{setFocus({kind:'vehicle',runId:trip.run.id});onSelectVehicle(trip);}} />)}
      </g>
    </svg>
    <svg className='station-leaders' width={size.width} height={size.height} aria-hidden='true'>{Object.keys(anchors).map(id=><line key={id} ref={node=>{if(node)leaders.current.set(id,node);else leaders.current.delete(id);}}/>)}</svg>
    <div className='map-toolbar'><div className='map-legend'><span>↗ {lang==='zh'?'往北校':'To North'}</span><span>↙ {lang==='zh'?'往南校':'To South'}</span></div>{(following||selectedFrame&&(selectedFrame.phase==='preparing'||phaseIsRunning(selectedFrame.phase)))&&<button className='map-control' aria-pressed={following} onClick={()=>setFocus(following?{kind:'overview'}:selectedRunId?{kind:'vehicle',runId:selectedRunId}:{kind:'overview'})}>{following?<Scan size={16}/>:<LocateFixed size={16}/>} {lang==='zh'?(following?'查看全程':'跟随车辆'):(following?'Overview':'Follow bus')}</button>}</div>
    <div className='station-labels'>{stationInfo.map(info=>{
      const Label=info.transit?'span':'button';
      const emphasized=focus.kind==='station'&&focus.stationId===info.id||selectedFrame?.stationId===info.id;
      return <Label key={info.id} ref={(node:HTMLElement|null)=>{if(node)labels.current.set(info.id,node);else labels.current.delete(info.id);}} aria-label={[translate(lang,('short_'+info.id) as TranslationKey),info.text,info.countdownText].filter(Boolean).join('，')} className={'station-label'+(info.transit?' station-transit':info.arrival?' station-arrival':' station-origin')+(info.urgent?' station-departure-urgent':'')+(info.previewing?' station-preview':'')+(emphasized?' station-focused':'')} data-station={info.id} onClick={info.transit?undefined:()=>onSelectDirection(info.selectDirection)}>
        <div className='station-label-title'><strong>{translate(lang,('short_'+info.id) as TranslationKey)}</strong>{info.count>1&&<small>{translate(lang,'departure_count_short',{count:info.count})}</small>}</div>
        {info.time?<div className='station-time-line'><time>{info.time}</time><span>{translate(lang,info.previewing?'preview_mode':info.arrival?'station_arrival':'station_departure')}</span></div>:info.text&&<span>{info.text}</span>}
        {info.countdownText&&<b>{info.countdownText}</b>}{info.feedback&&<span className='station-feedback'>{info.feedback}</span>}
      </Label>;
    })}</div>
    {showVehicleInfo&&selectedTrip&&selectedFrame&&selectedArrival&&<div ref={vehicleInfo} className='map-vehicle-info'><div><strong>{translate(lang,selectedFrame.phase==='preparing'?'vehicle_waiting':selectedFrame.phase==='arriving'||selectedFrame.phase==='fading'?'vehicle_arrived':'vehicle_running')} · {translate(lang,selectedTrip.direction===Direction.SOUTH_TO_NORTH?'direction_sn':'direction_ns')}{selectedTrip.run.tag==='red'&&<span className='red-tag'>R</span>}</strong><p>{translate(lang,'vehicle_arrival_at',{time:minutesToTime(selectedArrival.seconds/60),station:translate(lang,('short_'+selectedArrival.station.id) as TranslationKey)})}</p></div><button aria-label={translate(lang,'close_vehicle')} onClick={onClearVehicle}><X size={18}/></button></div>}
  </div>;
});
