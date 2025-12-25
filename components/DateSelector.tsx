import React from 'react';
import { Language, translate } from '../locales';
import { DayOfWeek } from '../types';

interface DateSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  lang: Language;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onSelectDate, lang }) => {
  // Generate next 5 days
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDate = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();
  };

  const getDayLabel = (date: Date, index: number) => {
    if (index === 0) return translate(lang, 'today');
    if (index === 1) return translate(lang, 'tomorrow');
    const dayKey = `day_${date.getDay()}` as any;
    return translate(lang, dayKey);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[72px] z-40">
      <div className="max-w-md mx-auto overflow-x-auto no-scrollbar">
        <div className="flex p-2 space-x-2 min-w-max px-4 justify-center">
          {dates.map((date, index) => {
            const isSelected = isSameDate(date, selectedDate);
            return (
              <button
                key={index}
                onClick={() => onSelectDate(date)}
                className={`flex flex-col items-center justify-center min-w-[4.5rem] py-2 px-1 rounded-lg transition-all ${
                  isSelected 
                    ? 'bg-brand-600 text-white shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span className={`text-xs font-medium mb-0.5 ${isSelected ? 'text-brand-100' : 'text-gray-400'}`}>
                  {getDayLabel(date, index)}
                </span>
                <span className={`text-lg font-bold leading-none ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateSelector;