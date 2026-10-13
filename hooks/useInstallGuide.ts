import { useCallback, useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type InstallGuideMode = 'wechat' | 'native' | 'ios-safari' | 'ios-chrome' | 'ios-other' | 'android' | 'desktop';

const VISIT_KEY = 'gt-shuttle-install-visit';
const WECHAT_COUNT_KEY = 'gt-shuttle-wechat-visits';
const INSTALLED_KEY = 'gt-shuttle-pwa-installed';
const REMINDER_PAUSE_KEY = 'gt-shuttle-install-reminder-paused-until';
const REMINDER_PAUSE_MS = 3 * 24 * 60 * 60 * 1_000;

const getEnvironment = () => {
  const ua = navigator.userAgent;
  const isWechat = /MicroMessenger/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const iosBrowser: 'chrome' | 'safari' | 'other' = /CriOS/i.test(ua) ? 'chrome' : /Safari/i.test(ua) && !/FxiOS|EdgiOS|OPiOS|QQBrowser|UCBrowser|MicroMessenger/i.test(ua) ? 'safari' : 'other';
  return { isWechat, isIOS, isMobile: isIOS || isAndroid, iosBrowser };
};

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

interface Visit { shown: boolean; wechatEligible: boolean; }

// Shared by the whole document so StrictMode/remounts cannot count another visit.
let currentVisit: Visit | undefined;

const saveVisit = (visit: Visit) => {
  try { sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit)); } catch { /* Current-document state still works. */ }
};

const getVisit = (isWechat: boolean): Visit => {
  if (currentVisit) return currentVisit;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navigation?.type === 'reload' || navigation?.type === 'back_forward') {
    let wechatEligible = false;
    try { wechatEligible = JSON.parse(sessionStorage.getItem(VISIT_KEY) || 'null')?.wechatEligible === true; } catch { /* Do not guess a previous visit. */ }
    currentVisit = { shown: true, wechatEligible };
  } else {
    let wechatEligible = false;
    if (isWechat) {
      try {
        const storedCount = Number(localStorage.getItem(WECHAT_COUNT_KEY));
        const count = Math.min(2, (Number.isFinite(storedCount) ? Math.max(0, storedCount) : 0) + 1);
        localStorage.setItem(WECHAT_COUNT_KEY, String(count));
        wechatEligible = count >= 2;
      } catch { /* No persistent count: only offer the manual guide. */ }
    }
    currentVisit = { shown: false, wechatEligible };
  }
  saveVisit(currentVisit);
  return currentVisit;
};

const wasInstalled = () => {
  try { return localStorage.getItem(INSTALLED_KEY) === 'true'; } catch { return false; }
};

const recordInstalled = () => {
  try { localStorage.setItem(INSTALLED_KEY, 'true'); } catch { /* Standalone detection remains available. */ }
};

const areRemindersPaused = () => {
  try { return Number(localStorage.getItem(REMINDER_PAUSE_KEY)) > Date.now(); } catch { return false; }
};

export const useInstallGuide = () => {
  const [environment] = useState(getEnvironment);
  const [visit] = useState(() => getVisit(environment.isWechat));
  const [standalone, setStandalone] = useState(isStandalone);
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const installedRef = useRef(isStandalone() || wasInstalled());
  const standaloneRef = useRef(standalone);

  const dismissGuide = useCallback(() => {
    visit.shown = true;
    saveVisit(visit);
    setIsOpen(false);
  }, [visit]);

  const pauseReminders = useCallback(() => {
    try { localStorage.setItem(REMINDER_PAUSE_KEY, String(Date.now() + REMINDER_PAUSE_MS)); } catch { /* Dismiss this visit when storage is unavailable. */ }
    dismissGuide();
  }, [dismissGuide]);

  const openGuide = useCallback(() => {
    if (standaloneRef.current) return;
    visit.shown = true;
    saveVisit(visit);
    setInstallError(false);
    setIsOpen(true);
  }, [visit]);

  useEffect(() => {
    let timer: number | undefined;
    let ready = false;
    const media = window.matchMedia('(display-mode: standalone)');

    const completeInstallation = () => {
      installedRef.current = true;
      recordInstalled();
      promptRef.current = null;
      setDeferredPrompt(null);
      dismissGuide();
    };

    const showIfEligible = () => {
      if (!ready || visit.shown || installedRef.current || standaloneRef.current || areRemindersPaused() || document.visibilityState !== 'visible') return;
      const eligible = environment.isWechat ? visit.wechatEligible : environment.isMobile || Boolean(promptRef.current);
      if (eligible) openGuide();
    };

    const onLoad = () => {
      timer = window.setTimeout(() => {
        ready = true;
        showIfEligible();
      }, 2_000);
    };

    const onBeforeInstall = (event: Event) => {
      if (environment.isWechat || standaloneRef.current) return;
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptRef.current);
      showIfEligible();
    };

    const onDisplayModeChange = () => {
      const value = isStandalone();
      standaloneRef.current = value;
      setStandalone(value);
      if (value) completeInstallation();
    };

    if (standaloneRef.current) recordInstalled();
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', completeInstallation);
    media.addEventListener('change', onDisplayModeChange);
    document.addEventListener('visibilitychange', showIfEligible);
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', completeInstallation);
      media.removeEventListener('change', onDisplayModeChange);
      document.removeEventListener('visibilitychange', showIfEligible);
    };
  }, [dismissGuide, environment, openGuide, visit]);

  const install = async () => {
    const event = promptRef.current;
    if (!event || isInstalling) return;
    // Consume the event before invoking the browser: every event can prompt once.
    promptRef.current = null;
    setDeferredPrompt(null);
    setIsInstalling(true);
    setInstallError(false);
    try {
      await event.prompt();
      await event.userChoice;
      dismissGuide();
    } catch {
      setInstallError(true);
    } finally {
      setIsInstalling(false);
    }
  };

  const mode: InstallGuideMode = environment.isWechat ? 'wechat'
    : deferredPrompt || isInstalling ? 'native'
    : environment.isIOS ? `ios-${environment.iosBrowser}`
    : environment.isMobile ? 'android' : 'desktop';

  return { isOpen, mode, isIOS: environment.isIOS, standalone, isInstalling, installError, openGuide, dismissGuide, pauseReminders, install };
};

export type InstallGuideState = ReturnType<typeof useInstallGuide>;
