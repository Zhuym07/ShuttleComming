import React from 'react';
import { Language, translate } from '../locales';

interface DateSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  lang: Language;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onSelectDate, lang }) => {
  const dates = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return date;
  });

  const isSameDate = (left: Date, right: Date) => (
    left.getFullYear() === right.getFullYear()
      && left.getMonth() === right.getMonth()
      && left.getDate() === right.getDate()
  );

  const getDayLabel = (date: Date, index: number) => {
    if (index === 0) return translate(lang, 'today');
    if (index === 1) return translate(lang, 'tomorrow');
    return translate(lang, `day_${date.getDay()}` as `day_${0 | 1 | 2 | 3 | 4 | 5 | 6}`);
  };

  return (
    <nav className="sticky top-[4.5rem] z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label={translate(lang, 'select_date')}>
      <div className="mx-auto flex max-w-xl gap-2 overflow-x-auto px-4 py-3 no-scrollbar sm:px-6">
        {dates.map((date, index) => {
          const isSelected = isSameDate(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-pressed={isSelected}
              className={`flex min-w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-xl border px-2 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-brand-600 bg-brand-600 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50'
              }`}
            >
              <span className={`text-[11px] font-semibold ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                {getDayLabel(date, index)}
              </span>
              <span className="mt-0.5 text-xl font-bold leading-none">{date.getDate()}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DateSelector;
