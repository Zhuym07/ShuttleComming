import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import ShuttleMap from '../components/ShuttleMap';
import { compileTimelines } from '../lib/mapTraffic';
import { createPlaybackClock } from '../lib/playbackClock';
import { Direction } from '../types';
import { useShuttleOverview } from '../hooks/useShuttleOverview';
import '../styles.css';

// Four-vehicle stress fixture; the production timetable is never changed.
const source=compileTimelines(4);
const south=source.filter(trip=>trip.run.departureTime==='13:35');
const north=source.filter(trip=>trip.run.departureTime==='12:30'&&trip.direction===Direction.NORTH_TO_SOUTH).map(trip=>({ ...trip,run:{...trip.run,id:'stress_'+trip.run.id},departure:trip.departure+3900,arrivals:trip.arrivals.map(time=>time+3900) }));
const clock=createPlaybackClock();
clock.seek(13*3600+35*60+15,new Date(2026,9,15),true);clock.setSpeed(20);clock.start();
const stressTrips=[...south,...north];
function Fixture() {
  const snapshot=useSyncExternalStore(clock.subscribe,clock.getSnapshot);
  const overview=useShuttleOverview({selectedDate:snapshot.date,clock:snapshot});
  return <div className='map-workspace' style={{height:'100dvh','--sheet-height':'0px'} as React.CSSProperties}><ShuttleMap clock={clock} trips={stressTrips} isToday summaries={overview.summaries} previewBus={null} direction={Direction.SOUTH_TO_NORTH} lang='zh' expanded={false} selectedRunId={null} focusRequest={null} onSelectVehicle={()=>{}} onSelectDirection={()=>{}} onClearVehicle={()=>{}}/></div>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
