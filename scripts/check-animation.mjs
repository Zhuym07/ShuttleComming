import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const temporary = mkdtempSync(join(tmpdir(), 'shuttle-animation-'));
try {
  const bundle = buildSync({ stdin: { contents: "export * from './lib/mapTraffic'; export * from './lib/mapGeometry'; export * from './lib/shuttle'; export * from './lib/playbackClock';", resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm', write: false });
  const modulePath = join(temporary, 'animation.mjs');
  writeFileSync(modulePath, bundle.outputFiles[0].contents);
  const { compileTimelines, vehicleAt, sampleCurve, getActiveBuses, createPlaybackClock, getDirectionSummary, getDepartureCountdown, getDirectionFocus, getVehicleArrival } = await import(pathToFileURL(modulePath));
  const summaryAt=(time,isToday=true)=>getDirectionSummary({routeId:'south_to_north',currentTimeMinutes:time,selectedDayOfWeek:4,isToday});
  const before=summaryAt(13*60+34+33/60);
  assert.deepEqual(before.upcomingDepartures.map(group=>group.departureTime),['13:35','15:15','15:50']);
  assert.equal(before.upcomingDepartures[0].runs.length,2);
  assert.equal(before.upcomingDepartures[0].origin.id,'sc_9');
  assert.deepEqual(getDepartureCountdown('13:35',13*60+34+33/60),{value:27,unit:'seconds',urgent:true});
  assert.equal(getDepartureCountdown('13:35',13*60+34+1/60).value,59);
  assert.equal(getDepartureCountdown('13:35',13*60+34).unit,'minutes');
  const departed=summaryAt(13*60+35);
  assert.equal(departed.nextBus.departureTime,'15:15');
  assert.equal(departed.activeRuns,2);
  assert.equal(departed.upcomingDepartures.some(group=>group.departureTime==='13:35'),false);
  assert.equal(summaryAt(19*60+29).upcomingDepartures[0].origin.id,'sc_2');
  const last=summaryAt(22*60+10);
  assert.equal(last.upcomingDepartures.length,0);
  assert.equal(last.activeRuns,1);
  assert.equal(last.isServiceEnded,false);
  assert.equal(summaryAt(22*60+15).isServiceEnded,true);
  assert.equal(summaryAt(23*60,false).upcomingDepartures[0].departureTime,'07:25');
  let checked = 0;
  for (let day = 0; day <= 6; day++) {
    const trips = compileTimelines(day);
    for (const trip of trips) {
      const end = trip.arrivals.at(-1);
      assert.equal(vehicleAt(trip, trip.departure - 30.01), null);
      assert.equal(vehicleAt(trip, trip.departure - 29.5).opacity, .5);
      assert.equal(vehicleAt(trip, trip.departure - 1).phase, 'preparing');
      assert.equal(vehicleAt(trip, trip.departure).phase, 'departing');
      assert.equal(vehicleAt(trip, end).phase, 'arriving');
      assert.equal(vehicleAt(trip, end + 8).phase, 'fading');
      assert.equal(vehicleAt(trip, end + 9).opacity, .5);
      assert.equal(vehicleAt(trip, end + 10), null);
      const boundaries = [trip.departure, trip.departure + trip.stagger, trip.departure + trip.stagger + 4, ...trip.arrivals.slice(1).flatMap((time, index) => index === trip.arrivals.length - 2 ? [time] : [time, time + 6])];
      for (const time of boundaries) {
        const before = vehicleAt(trip, time - .0001), after = vehicleAt(trip, time + .0001);
        assert.ok(Math.hypot(before.p[0] - after.p[0], before.p[1] - after.p[1]) < .02, trip.run.id + ' jumped at ' + time);
        assert.ok(Math.abs(Math.atan2(Math.sin(before.angle-after.angle),Math.cos(before.angle-after.angle))) < .01, trip.run.id + ' snapped orientation');
      }
      for (let i=1;i<trip.arrivals.length;i++) {
        const actual=vehicleAt(trip,trip.arrivals[i]), expected=sampleCurve(trip.curve,trip.offsets[i]);
        assert.deepEqual(actual.p,expected.p);
        if(i<trip.arrivals.length-1){assert.equal(actual.phase,'dwelling');assert.deepEqual(vehicleAt(trip,trip.arrivals[i]+5.9).p,actual.p);}
      }
      for (let offset=1;offset<trip.curve.length;offset+=1) {
        const a=sampleCurve(trip.curve,offset-1), b=sampleCurve(trip.curve,offset);
        const turn=Math.abs(Math.atan2(Math.sin(a.angle-b.angle),Math.cos(a.angle-b.angle)));
        assert.ok(turn < .45, trip.run.id + ' abrupt turn: ' + turn);
      }
      assert.equal(getActiveBuses([trip.run],end/60,trip.stations.at(-1).distanceFromStart,true,false).length,0);
      const stepped=vehicleAt(trip,trip.departure+90);
      for(let second=trip.departure-30;second<trip.departure+90;second+=.25)vehicleAt(trip,second);
      assert.deepEqual(vehicleAt(trip,trip.departure+90),stepped);
      checked++;
    }
  }
  const thursday=compileTimelines(4),regular=thursday.find(t=>t.run.id==='sn_1335'),red=thursday.find(t=>t.run.id==='sn_1335_red');
  assert.equal(regular.departure,red.departure);
  for(const seconds of [-20,0,2,10,90,180,300,480]) {
    const a=vehicleAt(regular,regular.departure+seconds),b=vehicleAt(red,red.departure+seconds);
    assert.ok(Math.hypot(a.p[0]-b.p[0],a.p[1]-b.p[1])>20,'same-time buses overlapped');
  }
  assert.deepEqual(thursday.find(t=>t.run.id==='sn_1940').stations.map(s=>s.id),['sc_2','nc_main']);
  assert.deepEqual(thursday.find(t=>t.run.id==='ns_1915').stations.map(s=>s.id),['nc_main','sc_2','sc_9']);

  const south='SOUTH_TO_NORTH', north='NORTH_TO_SOUTH';
  const first=thursday.find(trip=>trip.run.id==='sn_0725');
  assert.deepEqual(getDirectionFocus(thursday,south,7*3600+24*60,true),{kind:'station',stationId:'sc_9',runId:first.run.id});
  assert.equal(getDirectionFocus(thursday,south,7*3600+26*60,true).runId,first.run.id);
  assert.equal(getDirectionFocus(thursday,south,7*3600+26*60,true).kind,'vehicle');
  // An imminent departure wins over an earlier, still-running trip.
  assert.equal(getDirectionFocus(thursday,north,18*3600+29*60+45,true).kind,'station');
  assert.equal(getDirectionFocus(thursday,south,19*3600+39*60+35,true).stationId,'sc_2');
  assert.deepEqual(getDirectionFocus(thursday,south,23*3600,true),{kind:'station',stationId:'sc_2'});
  assert.deepEqual(getDirectionFocus(thursday,south,23*3600,false),{kind:'station',stationId:'sc_9',runId:first.run.id});
  assert.equal(getVehicleArrival(first,first.departure+60).station.id,'sc_2');
  assert.equal(getVehicleArrival(first,first.arrivals[1]+3).station.id,'sc_2');
  assert.equal(getVehicleArrival(first,first.arrivals[1]+6).station.id,'nc_main');
  assert.equal(getVehicleArrival(first,first.arrivals.at(-1)).station.id,'nc_main');

  const originalPerformance=globalThis.performance, originalDocument=globalThis.document;
  let now=0,frame;
  globalThis.performance={now:()=>now};
  globalThis.document=new EventTarget();globalThis.document.hidden=false;
  globalThis.requestAnimationFrame=callback=>{frame=callback;return 1;};globalThis.cancelAnimationFrame=()=>{};
  try {
    const clock=createPlaybackClock(),stop=clock.start();
    clock.seek(100,new Date(2026,9,15),true);clock.setSpeed(20);
    now+=1000;frame(now);assert.equal(clock.read(),120);
    clock.setPlaying(false);now+=1000;frame(now);assert.equal(clock.read(),120);
    clock.seek(30,undefined,false);assert.equal(clock.read(),30);
    clock.setPlaying(true);globalThis.document.hidden=true;globalThis.document.dispatchEvent(new Event('visibilitychange'));
    now+=10000;frame(now);assert.equal(clock.read(),30);
    globalThis.document.hidden=false;globalThis.document.dispatchEvent(new Event('visibilitychange'));
    now+=1000;frame(now);assert.equal(clock.read(),50);
    clock.reset();assert.equal(clock.getSnapshot().mode,'real');stop();
  } finally {globalThis.performance=originalPerformance;globalThis.document=originalDocument;delete globalThis.requestAnimationFrame;delete globalThis.cancelAnimationFrame;}
  console.log('PASS: '+checked+' trips, timing/position/orientation continuity, dwell/fade, red convoy, night rules, direction focus, next-stop details, deterministic seek, pause/background clock.');
} finally {rmSync(temporary,{recursive:true,force:true});}
