import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Languages, RotateCcw } from 'lucide-react';
import ShuttleMap from './components/ShuttleMap';
import ScheduleList from './components/ScheduleList';
import DateSelector from './components/DateSelector';
import PWAPrompt from './components/PWAPrompt';
import { Language, translate, TranslationKey } from './locales';
import { BusRun, Direction } from './types';
import { useShuttleState } from './hooks/useShuttleState';
import { useShuttleOverview } from './hooks/useShuttleOverview';
import { useInstallGuide } from './hooks/useInstallGuide';
import { getRouteForDirection, getRouteModeForDeparture } from './lib/shuttle';
import { minutesToTime, timeToMinutes } from './utils';

export default function App() {
  const [direction, setDirection] = useState(Direction.SOUTH_TO_NORTH);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [lang, setLang] = useState<Language>('zh');
  const [previewBus, setPreviewBus] = useState<BusRun | null>(null);
  const [level, setLevel] = useState(0);
  const [tab, setTab] = useState<'route' | 'schedule'>('route');
  const touchY = React.useRef(0);
  const installGuide = useInstallGuide();
  const overview = useShuttleOverview({ selectedDate });
  const shuttle = useShuttleState({ direction, selectedDate, previewBus, currentTimeMinutes: overview.currentTimeMinutes });
  const active = shuttle.schedule.find(run => shuttle.activeBuses.some(bus => bus.runId === run.id));
  const run = previewBus ?? active ?? shuttle.nextBus;
  const route = getRouteForDirection(direction);
  const mode = run ? getRouteModeForDeparture(run.departureTime, route.nightModeStartMinutes) : shuttle.routeMode;
  const stations = mode === 'night' ? route.nightStations : route.dayStations;
  const title = translate(lang, direction === Direction.SOUTH_TO_NORTH ? 'direction_sn' : 'direction_ns');
  const status = translate(lang, previewBus ? 'preview_mode' : active ? 'status_running' : run ? 'next_departure' : 'no_more_buses');
  const selectRun = (bus: BusRun) => { setPreviewBus(bus); setTab('route'); setLevel(1); };
  return <div className='map-app'>
    <header className='map-header'><strong>GT Shuttle<span>{lang === 'zh' ? '校园出行，抬眼即知' : 'Your campus, connected'}</span></strong><button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} aria-label={lang === 'zh' ? 'Switch to English' : '切换中文'}><Languages size={17} />{lang === 'zh' ? 'EN' : '中'}</button></header>
    <div className='campus-switcher'>
      {[overview.summaries.south_to_north, overview.summaries.north_to_south].map(s => <button key={s.routeId} aria-pressed={s.direction === direction} onClick={() => { setDirection(s.direction); setPreviewBus(null); }}><span>{translate(lang, s.direction === Direction.SOUTH_TO_NORTH ? 'direction_sn' : 'direction_ns')}</span><strong>{s.nextBus?.departureTime ?? '—'}<small>{translate(lang, 'next_departure')}</small></strong><span className='campus-status'>{s.activeRuns > 0 ? `${translate(lang,'status_running')} · ${s.activeRuns}` : s.nextBus ? overview.isToday ? `${Math.max(0,Math.ceil(timeToMinutes(s.nextBus.departureTime)-overview.currentTimeMinutes))} ${translate(lang,'mins')}` : translate(lang,'future_date_schedule') : translate(lang,'service_ended')}</span></button>)}
    </div>
    <main className='map-workspace'>
      <ShuttleMap direction={direction} stations={stations} schedule={shuttle.schedule} isToday={shuttle.isToday} previewBus={previewBus} nextBus={shuttle.nextBus} lang={lang} expanded={level === 2} />
      <section className={`trip-sheet sheet-level-${level}`} aria-label={title}>
        <button className='sheet-handle' aria-label={lang === 'zh' ? '展开或收起详情' : 'Expand or collapse details'} aria-expanded={level > 0} onClick={() => setLevel((level + 1) % 3)} onPointerDown={e => { touchY.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerUp={e => { const delta = touchY.current - e.clientY; if (Math.abs(delta) > 25) { setLevel(Math.max(0, Math.min(2,level + (delta > 0 ? 1 : -1)))); } }}><i /></button>
        <div className='trip-heading'><div><p>{title}</p><h1>{run?.departureTime ?? '—'}<span className={previewBus ? 'preview-pill' : ''}>{status}</span></h1></div><button className='expand-button' onClick={() => setLevel(level === 2 ? 0 : 2)} aria-label={lang === 'zh' ? '展开详情' : 'Expand details'}>{level === 2 ? <ChevronDown /> : <ChevronUp />}</button></div>
        <div className='trip-subtitle'>{previewBus ? <button onClick={() => setPreviewBus(null)}><RotateCcw size={14} />{translate(lang,'resume_live')}</button> : <span>{!shuttle.isToday ? translate(lang,'future_date_schedule') : active ? `${translate(lang,'arrive_at')} ${minutesToTime(timeToMinutes(active.departureTime)+stations[stations.length-1].distanceFromStart)}` : run ? `${translate(lang,'countdown_prefix')} ${Math.max(0,Math.ceil(timeToMinutes(run.departureTime)-overview.currentTimeMinutes))} ${translate(lang,'mins')}` : translate(lang,'view_past')}</span>}</div>
        <div className='sheet-tabs'><button aria-pressed={tab === 'route'} onClick={() => {setTab('route');setLevel(Math.max(1,level));}}>{lang === 'zh' ? '路线' : 'Route'}</button><button aria-pressed={tab === 'schedule'} onClick={() => {setTab('schedule');setLevel(2);}}>{translate(lang,'timetable')}<span>{shuttle.schedule.length}</span></button></div>
        <div className='sheet-scroll' hidden={level === 0}>
          <DateSelector selectedDate={selectedDate} onSelectDate={date => { setSelectedDate(date); setPreviewBus(null); }} lang={lang} />
          {tab === 'route' ? <div className='station-list'>{stations.map((station,i) => <div key={station.id}><i /><div><strong>{translate(lang,`station_${station.id}` as TranslationKey)}</strong><span>{i === 0 ? translate(lang,'start') : i === stations.length-1 ? (lang === 'zh' ? '终点' : 'Destination') : (lang === 'zh' ? '途经站' : 'Via')}</span></div><time>{run ? minutesToTime(timeToMinutes(run.departureTime)+station.distanceFromStart) : '—'}</time></div>)}</div> : <ScheduleList schedule={shuttle.schedule} currentTimeMinutes={shuttle.currentTimeMinutes} lang={lang} isLive={shuttle.isToday} onBusSelect={selectRun} selectedBusId={previewBus?.id ?? null} direction={direction} />}
          <footer><a href={`${import.meta.env.BASE_URL}lite.html`}>{translate(lang,'lite_version')}</a>{!installGuide.standalone && <button onClick={installGuide.openGuide}>{translate(lang,'install_btn')}</button>}<details><summary>{translate(lang,'disclaimer_title')}</summary><p>{translate(lang,'disclaimer_text')}</p></details></footer>
        </div>
      </section>
    </main>
    <PWAPrompt lang={lang} guide={installGuide} />
  </div>;
}
