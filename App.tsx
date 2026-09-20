import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import Header from './components/Header';
import RouteView from './components/RouteView';
import ScheduleList from './components/ScheduleList';
import DirectionSummaryCards from './components/DirectionSummaryCards';
import DateSelector from './components/DateSelector';
import PWAPrompt from './components/PWAPrompt';
import { Language, translate } from './locales';
import { BusRun, Direction } from './types';
import { useShuttleState } from './hooks/useShuttleState';
import { useShuttleOverview } from './hooks/useShuttleOverview';
import { getDateLabel } from './utils';

const liteHref = `${import.meta.env.BASE_URL}lite.html`;

const App: React.FC = () => {
  const [direction, setDirection] = useState<Direction>(Direction.SOUTH_TO_NORTH);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [lang, setLang] = useState<Language>('zh');
  const [previewBus, setPreviewBus] = useState<BusRun | null>(null);
  const overview = useShuttleOverview({ selectedDate });
  const shuttle = useShuttleState({ direction, selectedDate, previewBus, currentTimeMinutes: overview.currentTimeMinutes });

  useEffect(() => setPreviewBus(null), [direction, selectedDate]);

  const formattedDate = useMemo(() => getDateLabel(selectedDate, lang), [lang, selectedDate]);

  const handleBusSelect = (bus: BusRun) => {
    setPreviewBus(bus);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDirectionSelect = (nextDirection: Direction) => {
    setDirection(nextDirection);
    setPreviewBus(null);

    if (window.innerWidth < 1024) {
      window.setTimeout(() => {
        document.getElementById('route-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-10 text-slate-900">
      <Header lang={lang} setLang={setLang} />
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setPreviewBus(null);
        }}
        lang={lang}
      />

      <main className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-5">
          <DirectionSummaryCards
            summaries={[overview.summaries.south_to_north, overview.summaries.north_to_south]}
            selectedDirection={direction}
            lang={lang}
            isToday={overview.isToday}
            currentTimeMinutes={overview.currentTimeMinutes}
            onSelectDirection={handleDirectionSelect}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-7">
          <div id="route-detail" className="scroll-mt-32 space-y-5 lg:sticky lg:top-[10.5rem]">
            {previewBus && (
              <button
                type="button"
                onClick={() => setPreviewBus(null)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              >
                <RotateCcw size={16} aria-hidden="true" />
                {translate(lang, 'resume_live')}
              </button>
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
              routeMode={shuttle.routeMode}
            />
          </div>

          <div className="space-y-5">
            <ScheduleList
              schedule={shuttle.schedule}
              currentTimeMinutes={shuttle.currentTimeMinutes}
              lang={lang}
              isLive={shuttle.isToday}
              onBusSelect={handleBusSelect}
              selectedBusId={previewBus?.id ?? null}
              direction={direction}
            />

            <footer className="flex flex-col items-center gap-2 px-2 py-2 text-center text-xs text-slate-400">
              <p>{translate(lang, 'displaying_runs', { count: shuttle.schedule.length, date: formattedDate })}</p>
              <p>
                © Ckar ·{' '}
                <a href={liteHref} className="font-medium text-brand-600 underline-offset-2 hover:underline">
                  {translate(lang, 'lite_version')}
                </a>
              </p>
              <details className="w-full rounded-2xl border border-slate-200 bg-white text-left shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <span>{translate(lang, 'disclaimer_title')}</span>
                  <ChevronDown size={14} aria-hidden="true" />
                </summary>
                <p className="border-t border-slate-100 px-4 py-3 text-[11px] leading-5 text-slate-500">
                  {translate(lang, 'disclaimer_text')}
                </p>
              </details>
            </footer>
          </div>
        </div>
      </main>

      <PWAPrompt lang={lang} />
    </div>
  );
};

export default App;
