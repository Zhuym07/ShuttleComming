import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronUp, Languages, RotateCcw, X } from 'lucide-react';
import DirectionSummaryCards from './components/DirectionSummaryCards';
import ShuttleMap from './components/ShuttleMap';
import ScheduleList from './components/ScheduleList';
import DateSelector from './components/DateSelector';
import PWAPrompt from './components/PWAPrompt';
import { Language, translate, TranslationKey } from './locales';
import { BusRun, DayOfWeek, Direction } from './types';
import { useShuttleState } from './hooks/useShuttleState';
import { useShuttleOverview } from './hooks/useShuttleOverview';
import { useInstallGuide } from './hooks/useInstallGuide';
import { usePlaybackClock } from './hooks/usePlaybackClock';
import { getRouteForDirection, getRouteModeForDeparture, isSameCalendarDate } from './lib/shuttle';
import { compileTimelines, getVehicleArrival, timelineBoundaries, TripTimeline } from './lib/mapTraffic';
import { getDateLabel, minutesToTime, timeToMinutes } from './utils';

export default function App() {
  const [direction,setDirection]=useState(Direction.SOUTH_TO_NORTH);
  const [selectedDate,setSelectedDate]=useState(()=>new Date());
  const [lang,setLang]=useState<Language>('zh');
  const [previewBus,setPreviewBus]=useState<BusRun|null>(null);
  const [selectedRunId,setSelectedRunId]=useState<string|null>(null);
  const [focusRequest,setFocusRequest]=useState<{direction:Direction}|null>(null);
  const [level,setLevel]=useState(0);
  const touch=useRef({x:0,y:0,moved:false,tracking:false});
  const workspace=useRef<HTMLElement>(null),sheet=useRef<HTMLElement>(null);
  const content=useRef<HTMLDivElement>(null);
  const {clock,snapshot}=usePlaybackClock();
  const installGuide=useInstallGuide();
  const overview=useShuttleOverview({selectedDate,clock:snapshot});
  const shuttle=useShuttleState({direction,selectedDate,previewBus,currentTimeMinutes:overview.currentTimeMinutes,isToday:overview.isToday});
  const day=selectedDate.getDay() as DayOfWeek;
  const trips=useMemo(()=>compileTimelines(day),[day]);
  useEffect(()=>clock.setBoundaries(timelineBoundaries(trips)),[clock,trips]);
  useEffect(()=> {
    const observer=new ResizeObserver(([entry])=>workspace.current?.style.setProperty('--sheet-height',entry.target.getBoundingClientRect().height+'px'));
    if(sheet.current)observer.observe(sheet.current);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const media=matchMedia('(max-width:899px)');
    const update=()=>{if(content.current)content.current.inert=media.matches&&level===0;};
    update();media.addEventListener('change',update);
    return ()=>media.removeEventListener('change',update);
  },[level]);
  const selectDirection=useCallback((value:Direction)=>{setDirection(value);setPreviewBus(null);setSelectedRunId(null);setFocusRequest({direction:value});},[]);
  const selectVehicle=useCallback((trip:TripTimeline)=>{setDirection(trip.direction);setPreviewBus(null);setSelectedRunId(trip.run.id);setFocusRequest(null);},[]);
  const selectDate=(date:Date)=>{clock.reset();setSelectedDate(date);setPreviewBus(null);setSelectedRunId(null);setFocusRequest(null);};
  const restore=()=>{clock.reset();setSelectedDate(new Date());setPreviewBus(null);setSelectedRunId(null);setFocusRequest(null);};
  const changeSheetLevel=(next:number)=>{if(next===0)setPreviewBus(null);setLevel(next);};
  const chosen=shuttle.schedule.find(run=>run.id===selectedRunId);
  const chosenTrip=chosen?trips.find(trip=>trip.run.id===chosen.id):undefined;
  const chosenVisible=overview.isToday&&chosenTrip&&snapshot.seconds>=chosenTrip.departure-30&&snapshot.seconds<chosenTrip.arrivals[chosenTrip.arrivals.length-1]+10;
  const run=previewBus??(chosenVisible?chosen:undefined)??shuttle.nextBus;
  const route=getRouteForDirection(direction);
  const mode=run?getRouteModeForDeparture(run.departureTime,route.nightModeStartMinutes):shuttle.routeMode;
  const stations=mode==='night'?route.nightStations:route.dayStations;
  const isArrived=Boolean(chosenVisible&&chosenTrip&&snapshot.seconds>=chosenTrip.arrivals[chosenTrip.arrivals.length-1]);
  const inspecting=Boolean(chosenVisible && !previewBus);
  const title=translate(lang,direction===Direction.SOUTH_TO_NORTH?'direction_sn':'direction_ns');
  const status=previewBus?translate(lang,'preview_departure',{time:previewBus.departureTime}):translate(lang,isArrived?'vehicle_arrived':snapshot.seconds<(chosenTrip?.departure??0)?'vehicle_waiting':'vehicle_running');
  const arrival=chosenTrip?getVehicleArrival(chosenTrip,snapshot.seconds):undefined;
  const detail=inspecting&&arrival?translate(lang,'vehicle_arrival_at',{time:minutesToTime(arrival.seconds/60),station:translate(lang,('short_'+arrival.station.id) as TranslationKey)}):run?translate(lang,overview.isToday?'map_next_departure':'map_first_departure',{time:run.departureTime}):translate(lang,overview.isToday?'departure_none':'departure_none_date');
  const isTomorrow=(()=>{const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);return isSameCalendarDate(selectedDate,tomorrow);})();
  useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en';},[lang]);
  return <div className='map-app'>
    <header className='map-header'><div className='brand'><span>GT SHUTTLE</span><h1>{lang==='zh'?'班车查询':'Campus shuttle'}</h1></div><div className='header-tools'><button className='tool-button' aria-label={lang==='zh'?'Switch to English':'切换中文'} onClick={()=>setLang(lang==='zh'?'en':'zh')}><Languages size={16}/>{lang==='zh'?'EN':'中'}</button></div></header>
    <div className='date-context'><span>{snapshot.mode==='simulated'?(lang==='zh'?'模拟 · ':'Simulation · '):''}{getDateLabel(selectedDate,lang)}</span><button onClick={()=>{const date=new Date();if(!isTomorrow)date.setDate(date.getDate()+1);selectDate(date);}}>{translate(lang,isTomorrow?'today':'tomorrow')}</button></div>
    <main ref={workspace} className={'map-workspace level-'+level+(!overview.isToday?' future-date':'')}>
      <ShuttleMap clock={clock} trips={trips} isToday={overview.isToday} summaries={overview.summaries} previewBus={previewBus} direction={direction} lang={lang} expanded={level===2} selectedRunId={selectedRunId} focusRequest={focusRequest} onSelectVehicle={selectVehicle} onSelectDirection={selectDirection} onClearVehicle={()=>setSelectedRunId(null)}/>
      <section ref={sheet} className={'trip-sheet sheet-level-'+level+(inspecting?' inspecting-vehicle':'')+(previewBus?' previewing-run':'')} aria-label={title}
        onPointerDownCapture={event=>{const target=event.target as Element;touch.current={x:event.clientX,y:event.clientY,moved:false,tracking:window.innerWidth<900&&!target.closest('.sheet-scroll')};if(touch.current.tracking)(target.closest('button')??event.currentTarget).setPointerCapture(event.pointerId);}}
        onPointerUpCapture={event=>{const delta=touch.current.y-event.clientY;if(touch.current.tracking&&Math.abs(delta)>25&&Math.abs(delta)>Math.abs(touch.current.x-event.clientX)){touch.current.moved=true;changeSheetLevel(Math.max(0,Math.min(2,level+(delta>0?1:-1))));}touch.current.tracking=false;}}
        onPointerCancel={()=>{touch.current.tracking=false;}}
        onClickCapture={event=>{if(touch.current.moved){event.preventDefault();event.stopPropagation();touch.current.moved=false;}}}>
        <div className='sheet-dock-controls'><button className='sheet-handle' aria-label={translate(lang,'sheet_toggle')} aria-expanded={level>0} aria-controls='shuttle-details' onClick={()=>changeSheetLevel(level===2?0:level+1)} onKeyDown={event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown'||event.key==='Escape'){event.preventDefault();changeSheetLevel(event.key==='Escape'?0:Math.max(0,Math.min(2,level+(event.key==='ArrowUp'?1:-1))));}}}><i/></button></div>
        <div className='mobile-departures'><DirectionSummaryCards layout='dock' summaries={[overview.summaries.south_to_north,overview.summaries.north_to_south]} selectedDirection={direction} currentTimeMinutes={overview.currentTimeMinutes} isToday={overview.isToday} lang={lang} onSelectDirection={selectDirection}/></div>
        <button className='sheet-peek' tabIndex={level===0?0:-1} aria-hidden={level!==0} aria-label={title+' · '+translate(lang,'sheet_expand')} aria-expanded={level>0} aria-controls='shuttle-details' onClick={()=>changeSheetLevel(1)}>
          <span className='sheet-peek-heading'><strong>{translate(lang,'route_and_schedule')}</strong><span>{translate(lang,'sheet_swipe')}<ChevronUp size={14} aria-hidden='true'/></span></span>
          <span className='sheet-peek-stations' aria-hidden='true'>{stations.map((station,index)=><React.Fragment key={station.id}>{index>0&&<i>→</i>}<span>{translate(lang,('short_'+station.id) as TranslationKey)}</span></React.Fragment>)}</span>
        </button>
        <div ref={content} id='shuttle-details' className='sheet-content'>
          {(previewBus||inspecting)&&<div className='trip-heading'><div><p>{title}{run?.tag==='red'&&<span className='red-tag'>R</span>}</p><h2 className={previewBus?'preview-pill':''}>{status}</h2></div>{inspecting&&<button className='clear-vehicle' onClick={()=>setSelectedRunId(null)} aria-label={translate(lang,'close_vehicle')}><X size={18}/></button>}</div>}
          {previewBus?<button className='resume-live' onClick={()=>setPreviewBus(null)}><RotateCcw size={14}/>{translate(lang,'resume_live')}</button>:inspecting&&<p className='trip-subtitle'>{detail}</p>}
          {inspecting&&run&&<p className='vehicle-departure-note'>{translate(lang,snapshot.seconds<timeToMinutes(run.departureTime)*60?'vehicle_departs_at':'vehicle_departed_at',{time:run.departureTime})}</p>}
          <div className='sheet-scroll'><DateSelector selectedDate={selectedDate} onSelectDate={selectDate} lang={lang}/>
            <section className='route-stops' aria-label={title}><div className='route-stops-heading'><strong>{title}</strong><span>{translate(lang,mode==='night'?'route_mode_night':'route_mode_day')}</span></div><ol>{stations.map((station,index)=><li key={station.id}><span>{translate(lang,('short_'+station.id) as TranslationKey)}</span><time>{run?minutesToTime(timeToMinutes(run.departureTime)+station.distanceFromStart):'—'}</time><small>{translate(lang,index===0?'station_departure':'station_arrival')}</small></li>)}</ol></section>
            <ScheduleList schedule={shuttle.schedule} currentTimeMinutes={shuttle.currentTimeMinutes} lang={lang} isLive={overview.isToday} onBusSelect={bus=>{setPreviewBus(bus);setSelectedRunId(null);setFocusRequest(null);if(level===0)setLevel(1);}} selectedBusId={previewBus?.id??null} direction={direction}/>
            <footer><a href={import.meta.env.BASE_URL+'lite.html'}>{translate(lang,'lite_version')}</a>{!installGuide.standalone&&<button onClick={installGuide.openGuide}>{translate(lang,'install_btn')}</button>}<details><summary>{translate(lang,'disclaimer_title')}</summary><p>{translate(lang,'disclaimer_text')}</p></details></footer>
          </div>
        </div>
        <div className='desktop-departures'><DirectionSummaryCards layout='dock' summaries={[overview.summaries.south_to_north,overview.summaries.north_to_south]} selectedDirection={direction} currentTimeMinutes={overview.currentTimeMinutes} isToday={overview.isToday} lang={lang} onSelectDirection={selectDirection}/></div>
      </section>
    </main>
    <PWAPrompt lang={lang} guide={installGuide}/>
  </div>;
}
