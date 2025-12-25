import React, { useMemo } from 'react';
import { BusRun, Direction, Station, LiveBus } from '../types';
import { timeToMinutes, minutesToTime } from '../utils';
import { Bus, Clock, Radio, Eye } from 'lucide-react';
import { Language, translate } from '../locales';

interface RouteViewProps {
  direction: Direction;
  schedule: BusRun[];
  stations: Station[];
  currentTimeMinutes: number;
  lang: Language;
  isLive: boolean; // Only show live bus positions if viewing "Today"
  previewBus: BusRun | null;
}

const RouteView: React.FC<RouteViewProps> = ({ direction, schedule, stations, currentTimeMinutes, lang, isLive, previewBus }) => {
  // Calculate total route duration (last station distance)
  const totalDuration = stations[stations.length - 1].distanceFromStart;

  // Identify active buses (Only when NOT in preview mode)
  const activeBuses: LiveBus[] = useMemo(() => {
    if (!isLive || previewBus) return []; // Disable live tracking during preview

    const active: LiveBus[] = [];
    
    schedule.forEach(bus => {
      const departure = timeToMinutes(bus.departureTime);
      const minutesSinceDeparture = currentTimeMinutes - departure;

      if (minutesSinceDeparture >= 0 && minutesSinceDeparture <= totalDuration + 2) {
        // Bus is currently running (with 2 min buffer at end for visualization)
        active.push({
          runId: bus.id,
          currentMinutesFromStart: minutesSinceDeparture,
          status: 'RUNNING',
          label: bus.color
        });
      }
    });
    return active;
  }, [schedule, currentTimeMinutes, totalDuration, isLive, previewBus]);

  // Determine which bus to display in the header (Next or Previewed)
  const displayBus = useMemo(() => {
    if (previewBus) return previewBus;
    if (!isLive) {
        return schedule.length > 0 ? schedule[0] : undefined;
    }
    return schedule.find(bus => timeToMinutes(bus.departureTime) > currentTimeMinutes);
  }, [schedule, currentTimeMinutes, isLive, previewBus]);

  // Helper to get translated station name
  const getStationName = (station: Station) => {
    const key = `short_${station.id}` as any;
    return translate(lang, key);
  };

  // Helper to get dynamic countdown for a station
  const getLiveArrivalInfo = (station: Station) => {
    // Disable live countdown in preview mode
    if (!isLive || activeBuses.length === 0 || previewBus) return null;

    // Find the closest bus that hasn't passed this station yet
    // Filter buses where currentMinutesFromStart < station.distanceFromStart
    const incomingBuses = activeBuses.filter(b => b.currentMinutesFromStart < station.distanceFromStart);
    
    if (incomingBuses.length === 0) return null;

    // Get the one closest to the station (largest currentMinutesFromStart)
    const closestBus = incomingBuses.sort((a, b) => b.currentMinutesFromStart - a.currentMinutesFromStart)[0];
    const minutesToArrival = station.distanceFromStart - closestBus.currentMinutesFromStart;

    if (minutesToArrival <= 0.5) return { text: translate(lang, 'arriving_in') + ' < 1 ' + translate(lang, 'min_suffix'), urgent: true };
    return { text: Math.ceil(minutesToArrival) + ' ' + translate(lang, 'min_suffix'), urgent: minutesToArrival < 2 };
  };

  // Helper to render bus icon on timeline
  const renderBusOnTimeline = (stationIndex: number) => {
    // Do not render moving buses in preview mode
    if (!isLive || previewBus) return null;

    const currentStationDist = stations[stationIndex].distanceFromStart;
    const nextStationDist = stations[stationIndex + 1]?.distanceFromStart;

    // Find buses in this segment
    const busesInSegment = activeBuses.filter(bus => {
      if (!nextStationDist) {
        return Math.abs(bus.currentMinutesFromStart - currentStationDist) < 1;
      }
      return bus.currentMinutesFromStart >= currentStationDist && bus.currentMinutesFromStart < nextStationDist;
    });

    if (busesInSegment.length === 0) return null;

    return (
      <div className="absolute left-0 top-10 bottom-0 w-10 pointer-events-none z-20">
        {busesInSegment.map(bus => {
          // Calculate percentage position between stations
          let percent = 0;
          if (nextStationDist) {
            const segmentLength = nextStationDist - currentStationDist;
            const progress = bus.currentMinutesFromStart - currentStationDist;
            percent = (progress / segmentLength) * 100;
          } else {
            percent = 0;
          }

          // Cap percentage for UI to keep it within the line segment roughly
          percent = Math.min(Math.max(percent, 0), 90);

          return (
            <div 
              key={bus.runId}
              className="absolute w-full flex justify-center transition-all duration-1000 ease-linear"
              style={{ top: `${percent}%` }}
            >
              <div className="relative transform -translate-y-1/2 flex items-center">
                  <div className={`relative bg-white p-1 rounded-full shadow-md border-2 z-20 ${bus.label === 'red' ? 'border-red-500 text-red-500' : 'border-brand-600 text-brand-600'}`}>
                    <Bus size={20} className="relative z-10" />
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate estimated arrival time string for a station (Static Schedule based)
  const getEstimatedArrivalTime = (station: Station) => {
    if (!displayBus) return null;
    const baseTime = timeToMinutes(displayBus.departureTime);
    const arrivalTime = baseTime + station.distanceFromStart;
    return minutesToTime(arrivalTime);
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${previewBus ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
      
      {/* Next Bus Info Header */}
      <div className={`p-4 border-b flex items-center justify-between ${previewBus ? 'bg-amber-100/50 border-amber-200' : 'bg-brand-50 border-brand-100'}`}>
        <div className={`flex items-center space-x-2 ${previewBus ? 'text-amber-800' : 'text-brand-800'}`}>
          {previewBus ? <Eye size={18} /> : <Clock size={18} />}
          <span className="font-semibold text-sm uppercase tracking-wide">
             {previewBus 
                ? translate(lang, 'selected_run') 
                : (isLive ? translate(lang, 'next_departure') : translate(lang, 'timetable'))
             }
          </span>
        </div>
        <div className="text-right">
          {displayBus ? (
            <>
              <span className={`text-2xl font-bold ${previewBus ? 'text-amber-700' : 'text-brand-700'}`}>
                {displayBus.departureTime}
              </span>
              {isLive && !previewBus && (
                  <span className="ml-2 text-xs font-medium text-brand-500 px-2 py-0.5 bg-brand-100 rounded-full">
                    {timeToMinutes(displayBus.departureTime) - currentTimeMinutes} {translate(lang, 'min_suffix')}
                  </span>
              )}
            </>
          ) : (
            <span className="text-gray-500 font-medium">{translate(lang, 'no_more_buses')}</span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 relative">
        {stations.map((station, index) => {
          const isLast = index === stations.length - 1;
          const estimatedTime = getEstimatedArrivalTime(station);
          const liveInfo = getLiveArrivalInfo(station);
          
          return (
            <div key={station.id} className="relative flex pb-12 last:pb-0 group">
              {/* Vertical Line */}
              {!isLast && (
                <div className="absolute left-[18px] top-8 bottom-0 w-1 bg-gray-200 group-last:hidden z-0"></div>
              )}

              {/* Bus on Timeline */}
              {!isLast && renderBusOnTimeline(index)}

              {/* Station Node */}
              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-4 flex items-center justify-center shadow-sm transition-colors ${
                  liveInfo ? 'bg-brand-50 border-brand-500' : 
                  (previewBus ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-300')
              }`}>
                {liveInfo ? (
                   <Radio size={14} className="text-brand-600 animate-pulse" />
                ) : (
                   // If preview mode and this is the start station, maybe show a dot?
                   <div className={`w-2.5 h-2.5 rounded-full ${previewBus ? 'bg-amber-600' : 'bg-gray-400 group-first:bg-brand-600 group-last:bg-brand-600'}`}></div>
                )}
              </div>

              {/* Station Info */}
              <div className="ml-4 pt-1 flex-1 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight flex items-center gap-2">
                        {getStationName(station)}
                        {liveInfo && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${liveInfo.urgent ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-700'}`}>
                                {liveInfo.text}
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide flex items-center gap-1">
                      <span>
                        {index === 0 ? translate(lang, 'start') : `+${station.distanceFromStart} ${translate(lang, 'mins')}`}
                      </span>
                      {/* Always show scheduled time if available, especially in preview mode */}
                      {estimatedTime && !liveInfo && (
                        <span className={`font-medium font-mono ${previewBus ? 'text-amber-700 font-bold' : 'text-gray-400'}`}>
                          ({estimatedTime})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteView;