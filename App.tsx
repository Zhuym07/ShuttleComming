import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Info, RotateCcw } from 'lucide-react';
import Header from './components/Header';
import RouteView from './components/RouteView';
import ScheduleList from './components/ScheduleList';
import DateSelector from './components/DateSelector';
import PWAPrompt from './components/PWAPrompt';
import { Language, translate } from './locales';
import { BusRun, Direction } from './types';
import { useShuttleState } from './hooks/useShuttleState';
import { getDateLabel } from './utils';

const liteHref = `${import.meta.env.BASE_URL}lite.html`;

const App: React.FC = () => {
  const [direction, setDirection] = useState<Direction>(Direction.SOUTH_TO_NORTH);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [lang, setLang] = useState<Language>('zh');
  const [previewBus, setPreviewBus] = useState<BusRun | null>(null);

  const shuttle = useShuttleState({ direction, selectedDate, previewBus });

  useEffect(() => {
    setPreviewBus(null);
  }, [direction, selectedDate]);

  const formattedDate = useMemo(
    () => getDateLabel(selectedDate, lang),
    [lang, selectedDate],
  );

  const effectiveText = lang === 'en'
    ? 'Effective from May 12, 2026 · Teaching Weeks 1–13'
    : '生效日期：2026年5月12日 · 教学周第1–13周';

  const toggleDirection = () => {
    setDirection((current) => (
      current === Direction.SOUTH_TO_NORTH
        ? Direction.NORTH_TO_SOUTH
        : Direction.SOUTH_TO_NORTH
    ));
  };

  const handleBusSelect = (bus: BusRun) => {
    setPreviewBus(bus);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 text-slate-900">
      <Header lang={lang} setLang={setLang} />
      <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} lang={lang} />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm" aria-label={translate(lang, 'direction_switcher')}>
          <button
            type="button"
            onClick={toggleDirection}
            className="relative flex min-h-12 w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label={translate(lang, 'toggle_direction')}
          >
            <span
              className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-brand-600 shadow-sm transition-transform duration-300 ${
                direction === Direction.NORTH_TO_SOUTH ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            <span className={`relative z-10 flex flex-1 items-center justify-center px-3 text-sm font-bold transition-colors ${direction === Direction.SOUTH_TO_NORTH ? 'text-white' : 'text-slate-500'}`}>
              {translate(lang, 'direction_sn')}
            </span>
            <span className={`relative z-10 flex flex-1 items-center justify-center px-3 text-sm font-bold transition-colors ${direction === Direction.NORTH_TO_SOUTH ? 'text-white' : 'text-slate-500'}`}>
              {translate(lang, 'direction_ns')}
            </span>
          </button>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm" aria-live="polite">
          <Info className="mt-0.5 shrink-0 text-amber-600" size={18} aria-hidden="true" />
          <div className="min-w-0 text-sm leading-6">
            <p className="font-bold">{translate(lang, 'schedule_info_title')}</p>
            <p className="mt-1 text-amber-900/80">{translate(lang, 'schedule_info_text')}</p>
            <p className="mt-2 font-semibold text-amber-900">{effectiveText}</p>
          </div>
        </section>

        {previewBus && (
          <div className="sticky top-[8.5rem] z-30 flex justify-center">
            <button
              type="button"
              onClick={() => setPreviewBus(null)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-600 px-5 text-sm font-bold text-white shadow-lg transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <RotateCcw size={16} aria-hidden="true" />
              {translate(lang, 'resume_live')}
            </button>
          </div>
        )}

        <RouteView
          direction={direction}
          schedule={shuttle.schedule}
          stations={shuttle.stations}
          currentTimeMinutes={shuttle.currentTimeMinutes}
          lang={lang}
          isLive={shuttle.isToday}
          previewBus={previewBus}
          activeBuses={shuttle.activeBuses}
          nextBus={shuttle.nextBus}
        />

        <ScheduleList
          schedule={shuttle.schedule}
          currentTimeMinutes={shuttle.currentTimeMinutes}
          lang={lang}
          isLive={shuttle.isToday}
          onBusSelect={handleBusSelect}
          selectedBusId={previewBus?.id ?? null}
        />

        <footer className="flex flex-col items-center gap-2 px-2 py-4 text-center text-xs text-slate-400">
          <p>{translate(lang, 'displaying_runs', { count: shuttle.schedule.length, date: formattedDate })}</p>
          <p>
            © Ckar · <a href={liteHref} className="font-medium text-brand-600 underline-offset-2 hover:underline">{translate(lang, 'lite_version')}</a>
          </p>
          <details className="w-full max-w-md rounded-xl border border-slate-200 bg-white text-left shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span>{translate(lang, 'disclaimer_title')}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </summary>
            <p className="border-t border-slate-100 px-4 py-3 text-[11px] leading-5 text-slate-500">
              {translate(lang, 'disclaimer_text')}
            </p>
          </details>
        </footer>
      </main>

      <PWAPrompt lang={lang} />
    </div>
  );
};

export default App;


