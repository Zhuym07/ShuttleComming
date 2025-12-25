import React from 'react';
import { Language, translate } from '../locales';

interface DateSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  lang: Language;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onSelectDate, lang }) => {
  // Generate next 14 days (2 weeks) for quick access
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDate = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const getDayLabel = (date: Date, index: number) => {
    if (index === 0) return translate(lang, 'today');
    if (index === 1) return translate(lang, 'tomorrow');
    const dayKey = `day_${date.getDay()}` as any;
    return translate(lang, dayKey);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[72px] z-40">
      <div className="max-w-md mx-auto">
        <div className="flex p-2 items-center">
          
          {/* Horizontal Scrollable List */}
          <div className="flex-1 overflow-x-auto no-scrollbar flex space-x-2 px-2">
            {dates.map((date, index) => {
              const isSelected = isSameDate(date, selectedDate);
              return (
                <button
                  key={index}
                  onClick={() => onSelectDate(date)}
                  className={`flex flex-col items-center justify-center min-w-[4.5rem] py-2 px-1 rounded-lg transition-all flex-shrink-0 ${
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
    </div>
  );
};

export default DateSelector;