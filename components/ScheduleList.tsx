import React from 'react';
import { CalendarDays, Clock3, ListFilter } from 'lucide-react';
import { Language, translate } from '../locales';
import { BusRun, Direction } from '../types';
import { timeToMinutes } from '../utils';

interface ScheduleListProps {
  schedule: BusRun[];
  currentTimeMinutes: number;
  lang: Language;
  isLive: boolean;
  onBusSelect: (bus: BusRun) => void;
  selectedBusId: string | null;
  direction: Direction;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ schedule, currentTimeMinutes, lang, isLive, onBusSelect, selectedBusId, direction }) => {
  const [showAll, setShowAll] = React.useState(!isLive);
  React.useEffect(() => setShowAll(!isLive), [isLive]);

  const upcomingBuses = React.useMemo(
    () => isLive ? schedule.filter((bus) => timeToMinutes(bus.departureTime) >= currentTimeMinutes) : schedule,
    [currentTimeMinutes, isLive, schedule],
  );
  const displayedBuses = showAll ? schedule : upcomingBuses;
  const isEmptyToday = isLive && upcomingBuses.length === 0;

  const getTagStyle = (tag?: BusRun['tag']) => {
    switch (tag) {
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft" aria-label={translate(lang, 'timetable')}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays size={18} className="shrink-0 text-brand-600" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-800">{translate(lang, 'timetable')}</h2>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{direction === Direction.SOUTH_TO_NORTH ? translate(lang, 'direction_sn') : translate(lang, 'direction_ns')}</p><p className="mt-0.5 truncate text-xs text-slate-400">{translate(lang, 'tap_to_preview')}</p>
          </div>
        </div>
        {isLive && (
          <button type="button" onClick={() => setShowAll((current) => !current)} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-brand-50 px-3 text-xs font-bold text-brand-700 transition hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-pressed={showAll}>
            <ListFilter size={14} aria-hidden="true" />
            {showAll ? translate(lang, 'show_upcoming') : translate(lang, 'show_all')}
          </button>
        )}
      </div>
      {displayedBuses.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <Clock3 size={22} className="text-slate-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-slate-500">{isEmptyToday ? translate(lang, 'no_more_buses') : translate(lang, 'no_buses_msg')}</p>
          {!showAll && schedule.length > 0 && isLive && (
            <button type="button" onClick={() => setShowAll(true)} className="mt-2 min-h-10 text-xs font-bold text-brand-700 underline-offset-2 hover:underline">
              {translate(lang, 'view_past')}
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {displayedBuses.map((bus) => {
            const isPast = isLive && timeToMinutes(bus.departureTime) < currentTimeMinutes;
            const isSelected = bus.id === selectedBusId;
            return (
              <button
                key={bus.id}
                type="button"
                onClick={() => onBusSelect(bus)}
                className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 lg:grid-cols-[6rem_1fr_auto] lg:px-6 ${isSelected ? 'bg-amber-50' : isPast ? 'bg-slate-50/70' : 'hover:bg-brand-50/60'}`}
                aria-label={translate(lang, 'viewing_run', { time: bus.departureTime })}
              >
                <span className={`font-mono text-xl font-black tabular-nums ${isSelected ? 'text-amber-700' : isPast ? 'text-slate-400' : 'text-slate-900'}`}>
                  {bus.departureTime}
                </span>
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  {isSelected && <span className="rounded-full bg-amber-200 px-2 py-1 text-[10px] font-bold text-amber-900">{translate(lang, 'preview_mode')}</span>}
                  {isPast && !isSelected ? (
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{translate(lang, 'departed')}</span>
                  ) : bus.tag ? (
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getTagStyle(bus.tag)}`}>{bus.tag}</span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">{translate(lang, 'status_scheduled')}</span>
                  )}
                </span>
                <span className="text-right text-lg text-slate-300" aria-hidden="true">›</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ScheduleList;
