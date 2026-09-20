import React, { useEffect, useState } from 'react';
import { Download, PlusSquare, Share2, X } from 'lucide-react';
import { Language, translate } from '../locales';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAPromptProps {
  lang: Language;
}

const DISMISS_KEY = 'gt-shuttle-pwa-prompt-dismissed';

const PWAPrompt: React.FC<PWAPromptProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;
    let animationFrameId: number | undefined;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    if (isStandalone) return undefined;

    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      dismissed = false;
    }
    if (dismissed) return undefined;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      animationFrameId = window.requestAnimationFrame(() => setIsOpen(true));
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (ios) {
      timeoutId = window.setTimeout(() => {
        animationFrameId = window.requestAnimationFrame(() => setIsOpen(true));
      }, 2_000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const dismiss = () => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Storage can be unavailable in private browsing; the prompt still closes for this render.
    }
  };

  const install = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (error) {
      console.warn('PWA install prompt failed:', error);
    } finally {
      setDeferredPrompt(null);
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:max-w-sm" aria-live="polite">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Download size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-slate-900">{translate(lang, 'install_app')}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{translate(lang, 'install_desc')}</p>
            </div>
          </div>
          <button type="button" onClick={dismiss} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={translate(lang, 'dismiss')}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {isIOS ? (
          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <div className="flex items-center gap-2"><Share2 size={15} className="text-brand-600" aria-hidden="true" /><span>1. {translate(lang, 'install_ios_instr')}</span></div>
            <div className="flex items-center gap-2"><PlusSquare size={15} className="text-slate-500" aria-hidden="true" /><span>2. {translate(lang, 'install_ios_action')}</span></div>
          </div>
        ) : (
          <button type="button" onClick={install} className="mt-4 min-h-11 w-full rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            {translate(lang, 'install_btn')}
          </button>
        )}
      </div>
    </aside>
  );
};

export default PWAPrompt;
