import React from 'react';
import { Language, translate } from '../locales';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  lang: Language;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onSelectDate, lang }) => {
  // Generate next 5 days for quick access
  const dates = Array.from({ length: 5 }, (_, i) => {
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

  // Helper to check if the selected date is within the quick access list
  const isSelectedInList = dates.some(d => isSameDate(d, selectedDate));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Create date from YYYY-MM-DD string, ensuring local time (by splitting or using component logic)
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      onSelectDate(newDate);
    }
  };

  // Format date for input default value: YYYY-MM-DD
  const dateInputValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

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

          {/* Vertical Separator */}
          <div className="w-px h-10 bg-gray-100 mx-1"></div>

          {/* Calendar Button (Using label to trigger input properly) */}
          <div className="relative px-1">
             <label 
                className={`flex flex-col items-center justify-center w-[4.5rem] h-[3.8rem] rounded-lg transition-all border relative overflow-hidden cursor-pointer ${
                  !isSelectedInList
                    ? 'bg-brand-50 text-brand-600 border-brand-200 shadow-sm' 
                    : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                }`}
             >
                <CalendarIcon size={20} className="mb-1" />
                <span className="text-[10px] font-medium leading-none">{translate(lang, 'select_date')}</span>
                
                {/* Invisible Date Input covering the area */}
                <input 
                  type="date" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleDateChange}
                  value={dateInputValue}
                />
             </label>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DateSelector;