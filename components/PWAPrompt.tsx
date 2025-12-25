import React, { useState, useEffect } from 'react';
import { Share, X, Download, PlusSquare } from 'lucide-react';
import { Language, translate } from '../locales';

interface PWAPromptProps {
  lang: Language;
}

const PWAPrompt: React.FC<PWAPromptProps> = ({ lang }) => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if app is already standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // 2. Check if user dismissed it recently
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed) return;

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // 4. Handle Android/Chrome "beforeinstallprompt"
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. If iOS, show after a short delay (since we don't get an event)
    if (ios) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-3 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-50 rounded-bl-full -z-0 opacity-50"></div>
        
        <div className="flex justify-between items-start z-10">
          <div className="flex gap-3">
             <div className="bg-brand-100 p-2 rounded-lg text-brand-600 flex items-center justify-center h-10 w-10">
                <Download size={20} />
             </div>
             <div>
               <h4 className="font-bold text-gray-900">{translate(lang, 'install_app')}</h4>
               <p className="text-xs text-gray-500 mt-0.5">{translate(lang, 'install_desc')}</p>
             </div>
          </div>
          <button 
            onClick={handleDismiss} 
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>

        {isIOS ? (
           <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2">
                 <span className="bg-gray-200 p-1 rounded"><Share size={14} className="text-blue-500" /></span>
                 <span>1. {translate(lang, 'install_ios_instr')}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="bg-gray-200 p-1 rounded"><PlusSquare size={14} className="text-gray-600" /></span>
                 <span>2. {translate(lang, 'install_ios_action')}</span>
              </div>
           </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-brand-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-brand-700 transition-colors shadow-sm mt-1"
          >
            {translate(lang, 'install_btn')}
          </button>
        )}
      </div>
    </div>
  );
};

export default PWAPrompt;