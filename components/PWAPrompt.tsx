import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Check, Copy, Download, MoreHorizontal, ExternalLink, Smartphone, X } from 'lucide-react';
import { Language, translate, TranslationKey } from '../locales';
import { InstallGuideState } from '../hooks/useInstallGuide';

interface PWAPromptProps { lang: Language; guide: InstallGuideState; }

const PWAPrompt: React.FC<PWAPromptProps> = ({ lang, guide }) => {
  const dialogRef = useRef<HTMLElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const url = new URL(import.meta.env.BASE_URL, window.location.href).href;
  const { isOpen, dismissGuide } = guide;

  useEffect(() => {
    if (!isOpen) return;
    setCopyStatus('idle');
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.getElementById('root');
    const previousInert = root?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    dialog?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissGuide();
      if (event.key !== 'Tab' || !dialog) return;
      const elements = dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href], [tabindex="0"]');
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (root) root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen, dismissGuide]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  if (!isOpen) return null;

  let steps: TranslationKey[] = [];
  let note: TranslationKey | undefined;
  switch (guide.mode) {
    case 'wechat':
      steps = ['install_wechat_menu', 'install_wechat_browser', 'install_wechat_next'];
      if (guide.isIOS) note = 'install_ios_fallback';
      break;
    case 'ios-safari':
      steps = ['install_safari_share', 'install_home_screen_action', 'install_confirm_add'];
      break;
    case 'ios-chrome':
      steps = ['install_chrome_share', 'install_home_screen_action', 'install_confirm_add'];
      break;
    case 'ios-other':
      steps = ['install_other_share', 'install_home_screen_action', 'install_confirm_add'];
      note = 'install_ios_fallback';
      break;
    case 'android':
      steps = ['install_android_menu', 'install_android_action', 'install_confirm_add'];
      note = 'install_android_fallback';
      break;
    case 'desktop':
      steps = ['install_desktop_menu', 'install_desktop_action', 'install_confirm_add'];
      break;
  }

  const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-slate-950/45" aria-hidden="true" onClick={dismissGuide} />
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="install-guide-title" aria-describedby="install-guide-description" tabIndex={-1} className="install-guide relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-brand-100 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl focus:outline-none sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Smartphone size={23} aria-hidden="true" /></div>
          <div className="min-w-0 flex-1">
            <h2 id="install-guide-title" className="text-lg font-black leading-7 text-slate-900">{translate(lang, 'install_app')}</h2>
            <p id="install-guide-description" className="mt-1 text-sm leading-6 text-slate-500">{translate(lang, 'install_desc')}</p>
          </div>
          <button type="button" onClick={dismissGuide} className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={translate(lang, 'install_close')}><X size={20} aria-hidden="true" /></button>
        </div>

        {guide.mode === 'wechat' && (
          <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-brand-900">GT Shuttle</span>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700"><ArrowUpRight size={18} aria-hidden="true" /><span>{translate(lang, 'install_wechat_top_right')}</span><span className="rounded-xl border-2 border-brand-500 bg-white px-2 py-1"><MoreHorizontal size={24} aria-hidden="true" /></span></div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white p-3 text-sm font-bold text-brand-800"><ExternalLink size={18} aria-hidden="true" />{translate(lang, 'install_open_browser')}</div>
          </div>
        )}

        {steps.length > 0 && (
          <ol className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
            {steps.map((key, index) => <li key={key} className="flex items-start gap-3 text-sm leading-6 text-slate-600"><span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-black text-brand-700">{index + 1}</span><span>{translate(lang, key)}</span></li>)}
          </ol>
        )}
        {note && <p className="mt-3 text-xs leading-5 text-slate-500">{translate(lang, note)}</p>}
        {guide.mode === 'native' && <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-900"><Download size={22} className="shrink-0" aria-hidden="true" />{translate(lang, 'install_native_help')}</div>}
        {guide.installError && <p role="alert" className="mt-3 text-sm leading-6 text-amber-700">{translate(lang, 'install_error')}</p>}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={copyUrl} className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}><Copy size={17} aria-hidden="true" />{translate(lang, 'install_copy_url')}</button>
          {guide.mode === 'native' ? <button type="button" onClick={guide.install} disabled={guide.isInstalling} className={`${buttonClass} bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60`}><Download size={17} aria-hidden="true" />{translate(lang, guide.isInstalling ? 'install_pending' : 'install_btn')}</button> : <button type="button" onClick={dismissGuide} className={`${buttonClass} bg-brand-600 text-white hover:bg-brand-700`}><Check size={17} aria-hidden="true" />{translate(lang, 'install_done')}</button>}
        </div>
        <div aria-live="polite">
          {copyStatus === 'copied' && <p className="mt-3 text-sm text-brand-700">{translate(lang, 'install_copied')}</p>}
          {copyStatus === 'failed' && <div className="mt-3"><p className="text-xs leading-5 text-slate-600">{translate(lang, 'install_copy_failed')}</p><input readOnly value={url} aria-label={translate(lang, 'install_copy_url')} onFocus={(event) => event.currentTarget.select()} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700" /></div>}
        </div>
      </section>
    </div>, document.body,
  );
};

export default PWAPrompt;
