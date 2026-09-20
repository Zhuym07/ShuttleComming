import React, { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { getCurrentDayOfWeek } from '../utils';
import { Language, translate } from '../locales';

interface HeaderProps { lang: Language; setLang: (lang: Language) => void; }

const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const toggleLang = () => setLang(lang === 'en' ? 'zh' : 'en');
  const dayName = translate(lang, `day_${getCurrentDayOfWeek()}` as `day_${0 | 1 | 2 | 3 | 4 | 5 | 6}`);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-600">GT Shuttle</p>
          <h1 className="mt-1 truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{translate(lang, 'app_title')}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={toggleLang} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={lang === 'en' ? '切换为中文' : 'Switch to English'}>
            <Languages size={15} aria-hidden="true" /><span>{lang === 'en' ? '中' : 'EN'}</span>
          </button>
          <div className="text-right">
            <div className="font-mono text-xl font-bold leading-none tabular-nums text-slate-900">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{dayName}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
