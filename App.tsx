import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import RouteView from './components/RouteView';
import ScheduleList from './components/ScheduleList';
import DateSelector from './components/DateSelector';
import PWAPrompt from './components/PWAPrompt';
import { Direction, BusRun, DayOfWeek } from './types';
import { SCHEDULE_N_S, SCHEDULE_S_N } from './config/schedules';
import { STATIONS_N_S, STATIONS_S_N } from './config/stations';
import { getCurrentTimeMinutes, getBusesForToday } from './utils';
import { Info } from 'lucide-react';
import { Language, translate } from './locales';

const App: React.FC = () => {
  const [direction, setDirection] = useState<Direction>(Direction.SOUTH_TO_NORTH);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(getCurrentTimeMinutes());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese based on request

  // Check if the selected date is today
  const isToday = useMemo(() => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() && 
           selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  }, [selectedDate]);

  // Update time every 30 seconds to refresh UI if viewing today
  useEffect(() => {
    // Initial set
    setCurrentTimeMinutes(getCurrentTimeMinutes());

    const interval = setInterval(() => {
      if (isToday) {
        setCurrentTimeMinutes(getCurrentTimeMinutes());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isToday]);

  // Determine the DayOfWeek for the selected date
  const selectedDayOfWeek: DayOfWeek = useMemo(() => {
    return selectedDate.getDay() as DayOfWeek;
  }, [selectedDate]);

  // Filter schedule based on selected day
  const todaysSchedule: BusRun[] = useMemo(() => {
    const rawSchedule = direction === Direction.SOUTH_TO_NORTH ? SCHEDULE_S_N : SCHEDULE_N_S;
    return getBusesForToday(rawSchedule, selectedDayOfWeek);
  }, [direction, selectedDayOfWeek]);

  const currentStations = direction === Direction.SOUTH_TO_NORTH ? STATIONS_S_N : STATIONS_N_S;

  const toggleDirection = () => {
    setDirection(prev => prev === Direction.SOUTH_TO_NORTH ? Direction.NORTH_TO_SOUTH : Direction.SOUTH_TO_NORTH);
  };

  const formattedDate = selectedDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="min-h-screen pb-12 flex flex-col font-sans bg-gray-50">
      <Header lang={lang} setLang={setLang} />

      <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} lang={lang} />

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        
        {/* Direction Switcher */}
        <button 
          onClick={toggleDirection}
          className="w-full bg-white rounded-xl p-1 shadow-sm border border-gray-200 flex relative overflow-hidden group"
        >
           <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand-500 rounded-lg shadow-sm transition-all duration-300 ease-out ${direction === Direction.SOUTH_TO_NORTH ? 'left-1' : 'left-[calc(50%+4px)]'}`}></div>
           
           <div className={`flex-1 relative z-10 py-3 text-sm font-bold text-center transition-colors duration-300 ${direction === Direction.SOUTH_TO_NORTH ? 'text-white' : 'text-gray-500'}`}>
             {translate(lang, 'direction_sn')}
           </div>
           <div className={`flex-1 relative z-10 py-3 text-sm font-bold text-center transition-colors duration-300 ${direction === Direction.NORTH_TO_SOUTH ? 'text-white' : 'text-gray-500'}`}>
             {translate(lang, 'direction_ns')}
           </div>
        </button>

        {/* Info Banner */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-3">
          <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-yellow-800">
            <p className="font-semibold mb-1">{translate(lang, 'schedule_info_title')}</p>
             {translate(lang, 'schedule_info_text')}
          </div>
        </div>

        {/* Main Timeline View */}
        <RouteView 
          direction={direction}
          schedule={todaysSchedule}
          stations={currentStations}
          currentTimeMinutes={currentTimeMinutes}
          lang={lang}
          isLive={isToday}
        />

        {/* Upcoming Schedule List */}
        <ScheduleList 
          schedule={todaysSchedule}
          currentTimeMinutes={currentTimeMinutes}
          lang={lang}
          isLive={isToday}
        />

        {/* Footer / Stats */}
        <div className="text-center text-gray-400 text-xs py-4 flex flex-col gap-1">
          <p>{translate(lang, 'displaying_runs', { count: todaysSchedule.length, date: formattedDate })}</p>
          <p>
            © Ckar | <a href="/lite.html" className="underline hover:text-brand-600">Lite Version (Legacy)</a>
          </p>
        </div>

      </main>
      
      {/* PWA Installation Prompt */}
      <PWAPrompt lang={lang} />
    </div>
  );
};

export default App;