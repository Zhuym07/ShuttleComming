import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ListFilter } from 'lucide-react';
import { Language, translate } from '../locales';
import { BusRun } from '../types';
import { timeToMinutes } from '../utils';

interface ScheduleListProps {
  schedule: BusRun[];
  currentTimeMinutes: number;
  lang: Language;
  isLive: boolean;
  onBusSelect: (bus: BusRun) => void;
  selectedBusId: string | null;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ schedule, currentTimeMinutes, lang, isLive, onBusSelect, selectedBusId }) => {
  const [showAll, setShowAll] = useState(!isLive);

  useEffect(() => {
    setShowAll(!isLive);
  }, [isLive]);

  const upcomingBuses = useMemo(
    () => isLive ? schedule.filter((bus) => timeToMinutes(bus.departureTime) >= currentTimeMinutes) : schedule,
    [currentTimeMinutes, isLive, schedule],
  );

  const displayedBuses = showAll ? schedule : upcomingBuses;

  const getTagStyle = (color?: string) => {
    switch (color) {
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label={translate(lang, 'timetable')}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-brand-600" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-800">{translate(lang, 'timetable')}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{translate(lang, 'tap_to_preview')}</p>
          </div>
        </div>
        {isLive && (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand-50 px-3 text-xs font-bold text-brand-700 transition hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-pressed={showAll}
          >
            <ListFilter size={14} aria-hidden="true" />
            {showAll ? translate(lang, 'show_upcoming') : translate(lang, 'show_all')}
          </button>
        )}
      </div>

      {displayedBuses.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <p className="text-sm font-semibold text-slate-500">{translate(lang, 'no_buses_msg')}</p>
          {!showAll && schedule.length > 0 && isLive && (
            <button type="button" onClick={() => setShowAll(true)} className="mt-2 text-xs font-bold text-brand-700 underline-offset-2 hover:underline">
              {translate(lang, 'view_past')}
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">{translate(lang, 'time')}</th>
                <th className="px-5 py-3">{translate(lang, 'status')}</th>
                <th className="px-5 py-3 text-right"><ChevronDown size={15} className="ml-auto rotate-[-45deg]" aria-hidden="true" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedBuses.map((bus) => {
                const isPast = isLive && timeToMinutes(bus.departureTime) < currentTimeMinutes;
                const isSelected = bus.id === selectedBusId;
                return (
                  <tr key={bus.id} className={`transition ${isSelected ? 'bg-amber-50' : isPast ? 'bg-slate-50/70' : 'hover:bg-brand-50/50'}`}>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => onBusSelect(bus)}
                        className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                        aria-label={translate(lang, 'viewing_run', { time: bus.departureTime })}
                      >
                        <span className={`font-mono text-lg font-black tabular-nums ${isSelected ? 'text-amber-700' : isPast ? 'text-slate-400' : 'text-slate-900'}`}>{bus.departureTime}</span>
                        {isSelected && <span className="rounded-full bg-amber-200 px-2 py-1 text-[10px] font-bold text-amber-900">{translate(lang, 'preview_mode')}</span>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      {isPast && !isSelected ? (
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{translate(lang, 'departed')}</span>
                      ) : bus.color ? (
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getTagStyle(bus.color)}`}>{bus.color}</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">{translate(lang, 'status_scheduled')}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300" aria-hidden="true">›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ScheduleList;
