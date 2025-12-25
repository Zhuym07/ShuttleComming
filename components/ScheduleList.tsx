import React, { useState } from 'react';
import { BusRun } from '../types';
import { timeToMinutes } from '../utils';
import { Calendar, ListFilter } from 'lucide-react';
import { Language, translate } from '../locales';

interface ScheduleListProps {
  schedule: BusRun[];
  currentTimeMinutes: number;
  lang: Language;
  isLive: boolean;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ schedule, currentTimeMinutes, lang, isLive }) => {
  const [showAll, setShowAll] = useState(!isLive); // Default to show all if not in live mode

  // If not live (viewing future), all buses are "upcoming" effectively, or we just show the list.
  // Logic: 
  // If Live: Filter < currentTime.
  // If Not Live: Show everything.
  const upcomingBuses = isLive 
    ? schedule.filter(bus => timeToMinutes(bus.departureTime) >= currentTimeMinutes)
    : schedule;
  
  const displayedBuses = showAll ? schedule : upcomingBuses;

  const getTagStyle = (color?: string) => {
    switch (color) {
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'green': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'orange': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mt-4">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2 text-gray-800">
            <Calendar size={18} className="text-brand-500" />
            <h3 className="font-bold text-sm uppercase tracking-wide">{translate(lang, 'timetable')}</h3>
        </div>
        {isLive && (
            <button 
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1.5 rounded-md transition-colors"
            >
                <ListFilter size={14} />
                {showAll ? translate(lang, 'show_upcoming') : translate(lang, 'show_all')}
            </button>
        )}
      </div>

      <div className="overflow-y-auto max-h-[350px] overscroll-contain scrollbar-thin scrollbar-thumb-gray-200">
        {displayedBuses.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
                <p className="text-gray-400 text-sm mb-2">{translate(lang, 'no_buses_msg')}</p>
                {!showAll && schedule.length > 0 && isLive && (
                    <button 
                      onClick={() => setShowAll(true)} 
                      className="text-brand-600 text-xs font-medium hover:underline"
                    >
                      {translate(lang, 'view_past')}
                    </button>
                )}
            </div>
        ) : (
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-medium sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-5 py-3 font-semibold w-1/3 text-gray-400">Time</th>
                        <th className="px-5 py-3 font-semibold text-gray-400">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {displayedBuses.map((bus) => {
                        const busMinutes = timeToMinutes(bus.departureTime);
                        const isPast = isLive && busMinutes < currentTimeMinutes;

                        return (
                            <tr key={bus.id} className={`group transition-colors ${isPast ? 'bg-gray-50/50' : 'hover:bg-brand-50/30'}`}>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-mono text-base font-bold ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {bus.departureTime}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        {isPast ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-400 border border-gray-200 uppercase tracking-wide">
                                                {translate(lang, 'departed')}
                                            </span>
                                        ) : (
                                            bus.color ? (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide shadow-sm ${getTagStyle(bus.color)}`}>
                                                    {translate(lang, bus.color === 'red' ? 'standard' : 'standard') === '常规' ? bus.color.toUpperCase() : bus.color}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">{translate(lang, 'standard')}</span>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;