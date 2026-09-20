import React from 'react';
import { ArrowRight, BusFront, Clock3, Eye, Radio, Route as RouteIcon } from 'lucide-react';
import { Language, translate } from '../locales';
import { Direction, DirectionSummary } from '../types';
import { timeToMinutes } from '../utils';

interface DirectionSummaryCardsProps {
  summaries: DirectionSummary[];
  selectedDirection: Direction;
  lang: Language;
  isToday: boolean;
  currentTimeMinutes: number;
  onSelectDirection: (direction: Direction) => void;
}

const DirectionSummaryCards: React.FC<DirectionSummaryCardsProps> = ({
  summaries,
  selectedDirection,
  lang,
  isToday,
  currentTimeMinutes,
  onSelectDirection,
}) => {
  const getTitle = (direction: Direction) => direction === Direction.SOUTH_TO_NORTH
    ? translate(lang, 'south_departure')
    : translate(lang, 'north_departure');

  return (
    <section aria-labelledby="direction-overview-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">GT Shuttle</p>
          <h2 id="direction-overview-title" className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {translate(lang, 'direction_overview')}
          </h2>
        </div>
        <p className="hidden text-right text-xs font-semibold text-slate-500 sm:block">{translate(lang, 'direction_overview_hint')}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {summaries.map((summary) => {
          const isSelected = summary.direction === selectedDirection;
          const countdown = isToday && summary.nextBus
            ? Math.max(0, timeToMinutes(summary.nextBus.departureTime) - currentTimeMinutes)
            : null;
          const status = summary.isServiceEnded
            ? translate(lang, 'service_ended')
            : summary.activeRuns > 0
              ? `${translate(lang, 'running_now')} · ${summary.activeRuns}`
              : summary.nextBus
                ? isToday
                  ? `${translate(lang, 'countdown_prefix')} ${countdown} ${translate(lang, 'min_suffix')}`
                  : translate(lang, 'future_date_schedule')
                : translate(lang, 'service_ended');
          const icon = summary.activeRuns > 0 ? <Radio size={17} aria-hidden="true" /> : isSelected ? <Eye size={17} aria-hidden="true" /> : <BusFront size={17} aria-hidden="true" />;

          return (
            <button
              key={summary.routeId}
              type="button"
              onClick={() => onSelectDirection(summary.direction)}
              className={`group min-h-[156px] rounded-3xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${isSelected ? 'border-brand-500 bg-brand-50 shadow-[0_12px_30px_rgba(14,116,144,0.12)]' : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40'}`}
              aria-pressed={isSelected}
              aria-label={`${getTitle(summary.direction)}. ${translate(lang, 'view_route')}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <RouteIcon size={17} aria-hidden="true" />
                    </span>
                    <span className="truncate">{getTitle(summary.direction)}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">{isSelected ? translate(lang, 'current_direction') : translate(lang, 'view_route')}</p>
                </div>
                <ArrowRight className={`shrink-0 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-brand-700' : 'text-slate-300'}`} size={18} aria-hidden="true" />
              </div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <div className={`font-mono text-3xl font-black tabular-nums ${summary.nextBus ? (isSelected ? 'text-brand-800' : 'text-slate-900') : 'text-slate-400'}`}>
                    {summary.nextBus?.departureTime ?? '—'}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    {icon}
                    <span>{status}</span>
                  </div>
                </div>
                <div className="text-right text-xs font-semibold text-slate-500">
                  <div>{translate(lang, 'upcoming_count')}</div>
                  <div className="mt-1 text-lg font-black tabular-nums text-slate-900">{summary.upcomingRuns}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default DirectionSummaryCards;
