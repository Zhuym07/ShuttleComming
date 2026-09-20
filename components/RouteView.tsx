import React, { useMemo } from 'react';
import { Bus, Clock3, Eye, Radio, Route as RouteIcon } from 'lucide-react';
import { Language, translate } from '../locales';
import { BusRun, Direction, LiveBus, Station } from '../types';
import { getEstimatedArrivalMinutes, getCurrentStationIndex } from '../lib/shuttle';
import { minutesToTime, timeToMinutes } from '../utils';

interface RouteViewProps {
  direction: Direction;
  schedule: BusRun[];
  stations: Station[];
  currentTimeMinutes: number;
  lang: Language;
  isLive: boolean;
  previewBus: BusRun | null;
  activeBuses: LiveBus[];
  nextBus?: BusRun;
}

const RouteView: React.FC<RouteViewProps> = ({
  direction,
  schedule,
  stations,
  currentTimeMinutes,
  lang,
  isLive,
  previewBus,
  activeBuses,
  nextBus,
}) => {
  const totalDuration = stations[stations.length - 1]?.distanceFromStart ?? 0;
  const displayBus = previewBus ?? nextBus ?? (!isLive ? schedule[0] : undefined);
  const isNightRoute = stations.length < 3;

  const activeBusDetails = useMemo(() => activeBuses.map((bus) => {
    const source = schedule.find((candidate) => candidate.id === bus.runId);
    return source ? { ...bus, source } : null;
  }).filter(Boolean) as Array<LiveBus & { source: BusRun }>, [activeBuses, schedule]);

  const getStationName = (station: Station) => translate(lang, `short_${station.id}` as 'short_sc_9' | 'short_sc_2' | 'short_nc_main');

  const getLiveArrivalInfo = (station: Station) => {
    if (!isLive || previewBus || !activeBusDetails.length) return null;

    const incoming = activeBusDetails
      .filter((bus) => bus.currentMinutesFromStart < station.distanceFromStart)
      .sort((a, b) => b.currentMinutesFromStart - a.currentMinutesFromStart)[0];

    if (!incoming) return null;

    const minutesToArrival = station.distanceFromStart - incoming.currentMinutesFromStart;
    if (minutesToArrival <= 0.5) {
      return { text: `${translate(lang, 'arriving_in')} <1 ${translate(lang, 'min_suffix')}`, urgent: true };
    }
    return {
      text: `${translate(lang, 'arriving_in')} ${Math.ceil(minutesToArrival)} ${translate(lang, 'min_suffix')}`,
      urgent: minutesToArrival < 2,
    };
  };

  const renderBusOnTimeline = (stationIndex: number) => {
    if (!isLive || previewBus) return null;

    const currentStation = stations[stationIndex].distanceFromStart;
    const nextStation = stations[stationIndex + 1]?.distanceFromStart;
    const busesInSegment = activeBusDetails.filter((bus) => {
      if (nextStation === undefined) return Math.abs(bus.currentMinutesFromStart - currentStation) < 1;
      return bus.currentMinutesFromStart >= currentStation && bus.currentMinutesFromStart < nextStation;
    });

    if (!busesInSegment.length) return null;

    return (
      <div className="pointer-events-none absolute left-0 top-10 z-20 w-10">
        {busesInSegment.map((bus) => {
          const segmentLength = nextStation === undefined ? 1 : nextStation - currentStation;
          const progress = nextStation === undefined ? 0 : (bus.currentMinutesFromStart - currentStation) / segmentLength;
          const percent = Math.min(Math.max(progress * 100, 0), 90);
          return (
            <div key={bus.runId} className="absolute flex w-full justify-center transition-all duration-1000" style={{ top: `${percent}%` }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-lg" title={translate(lang, 'status_running')}>
                <Bus size={16} aria-hidden="true" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const previewArrival = (station: Station) => {
    const arrival = getEstimatedArrivalMinutes(displayBus, station);
    return arrival === null ? null : minutesToTime(arrival);
  };

  const headerTitle = previewBus
    ? translate(lang, 'selected_run')
    : isLive
      ? translate(lang, 'next_departure')
      : translate(lang, 'timetable');

  return (
    <section className={`overflow-hidden rounded-2xl border shadow-sm ${previewBus ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`} aria-label={translate(lang, 'timetable')}>
      <div className={`border-b px-5 py-5 ${previewBus ? 'border-amber-200 bg-amber-100/60' : 'border-brand-100 bg-brand-50'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${previewBus ? 'text-amber-800' : 'text-brand-800'}`}>
              {previewBus ? <Eye size={16} aria-hidden="true" /> : <Clock3 size={16} aria-hidden="true" />}
              <span>{headerTitle}</span>
            </div>
            <p className={`mt-2 text-sm font-semibold ${previewBus ? 'text-amber-900' : 'text-brand-900'}`}>
              {direction === Direction.SOUTH_TO_NORTH ? translate(lang, 'direction_sn') : translate(lang, 'direction_ns')}
            </p>
          </div>
          <div className="text-right">
            {displayBus ? (
              <>
                <div className={`font-mono text-3xl font-black tabular-nums ${previewBus ? 'text-amber-700' : 'text-brand-700'}`}>{displayBus.departureTime}</div>
                {isLive && !previewBus && nextBus && (
                  <div className="mt-1 text-xs font-bold text-brand-700">
                    {Math.max(0, timeToMinutes(nextBus.departureTime) - currentTimeMinutes)} {translate(lang, 'min_suffix')}
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm font-bold text-slate-500">{translate(lang, 'no_more_buses')}</span>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${previewBus ? 'bg-amber-200 text-amber-900' : 'bg-brand-100 text-brand-800'}`}>
            {isLive && !previewBus ? <Radio size={13} aria-hidden="true" /> : <RouteIcon size={13} aria-hidden="true" />}
            {previewBus ? translate(lang, 'preview_mode') : isLive ? translate(lang, 'live_now') : translate(lang, 'estimated')}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-slate-600">
            {isNightRoute ? translate(lang, 'route_mode_night') : translate(lang, 'route_mode_day')}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>{translate(lang, 'start')}</span>
          <span>{translate(lang, 'tap_to_preview')}</span>
        </div>
        {stations.map((station, index) => {
          const isLast = index === stations.length - 1;
          const liveInfo = getLiveArrivalInfo(station);
          const estimatedTime = previewArrival(station);
          const currentBus = activeBusDetails.find((bus) => getCurrentStationIndex(stations, bus.currentMinutesFromStart) === index);

          return (
            <div key={station.id} className="relative flex gap-4 pb-10 last:pb-0">
              {!isLast && <div className="absolute left-[1.1rem] top-9 bottom-0 w-1 rounded-full bg-slate-200" aria-hidden="true" />}
              {!isLast && renderBusOnTimeline(index)}
              <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 shadow-sm ${liveInfo ? 'border-brand-500 bg-brand-50' : previewBus ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white'}`}>
                {liveInfo ? <Radio size={14} className="text-brand-600" aria-hidden="true" /> : <span className={`h-2.5 w-2.5 rounded-full ${currentBus ? 'bg-brand-600' : previewBus ? 'bg-amber-600' : 'bg-slate-400'}`} />}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold leading-tight text-slate-900">{getStationName(station)}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      <span>{index === 0 ? translate(lang, 'start') : `+${station.distanceFromStart} ${translate(lang, 'mins')}`}</span>
                      {estimatedTime && <span className="font-mono font-semibold text-slate-400">{translate(lang, 'arrive_at')} {estimatedTime}</span>}
                    </p>
                  </div>
                  {liveInfo && (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${liveInfo.urgent ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>
                      {liveInfo.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {previewBus && (
          <p className="mt-5 rounded-xl bg-amber-100 px-3 py-2 text-center text-xs font-semibold text-amber-900">
            {translate(lang, 'viewing_run', { time: previewBus.departureTime })}
          </p>
        )}
      </div>
    </section>
  );
};

export default RouteView;
