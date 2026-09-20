import React from 'react';
import { Activity, CalendarDays, Clock3 } from 'lucide-react';
import { Language, translate } from '../locales';
import { ShuttleSummary } from '../lib/shuttle';

interface SummaryMetricsProps {
  summary: ShuttleSummary;
  lang: Language;
  isLive: boolean;
}

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ summary, lang, isLive }) => {
  const metrics = [
    { label: translate(lang, 'today_runs'), value: summary.totalRuns, icon: CalendarDays },
    { label: translate(lang, 'upcoming_departure'), value: summary.nextDeparture ?? '—', icon: Clock3 },
    { label: translate(lang, 'running_now'), value: isLive ? summary.activeRuns : '—', icon: Activity },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-label={translate(lang, 'desktop_summary')}>
      {metrics.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 sm:px-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <Icon size={14} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </div>
          <div className="mt-2 text-lg font-black tabular-nums text-slate-900 sm:text-xl">{value}</div>
        </div>
      ))}
    </div>
  );
};

export default SummaryMetrics;
