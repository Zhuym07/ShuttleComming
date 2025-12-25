import React, { useEffect, useState } from 'react';
import { getDayName, getCurrentDayOfWeek } from '../utils';
import { Language, translate } from '../locales';
import { Languages } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  const dayKey = `day_${getCurrentDayOfWeek()}` as any;
  const dayName = translate(lang, dayKey);

  return (
    <div className="bg-brand-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{translate(lang, 'app_title')}</h1>
          <p className="text-brand-100 text-xs font-medium">{translate(lang, 'subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={toggleLang}
                className="p-2 bg-brand-700/50 hover:bg-brand-700 rounded-lg transition-colors flex items-center justify-center"
                aria-label="Switch Language"
            >
                <span className="text-xs font-bold">{lang === 'en' ? 'EN' : '中'}</span>
            </button>
            <div className="text-right min-w-[60px]">
                <div className="text-2xl font-mono font-bold leading-none">{formatTime(time)}</div>
                <div className="text-xs text-brand-100 uppercase mt-1 tracking-wider">{dayName}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Header;