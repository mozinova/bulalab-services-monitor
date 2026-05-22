import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function NavMenu() {
  const [open, setOpen] = useState(false);

  const linkClass =
    'px-3 py-1.5 text-sm font-medium rounded-lg text-[#666] hover:text-[#111] dark:text-[#888] dark:hover:text-[#eee] hover:bg-[#eee] dark:hover:bg-[#111] transition-colors';

  const mobileLinkClass =
    'block w-full px-3 py-2 text-sm font-medium rounded-lg text-[#666] hover:text-[#111] dark:text-[#888] dark:hover:text-[#eee] hover:bg-[#eee] dark:hover:bg-[#111] transition-colors';

  const subBtnClass =
    'px-3 py-1.5 text-sm font-medium rounded-lg border border-[#ccc] dark:border-[#444] bg-[#eee] dark:bg-[#222] text-[#444] dark:text-[#bbb] hover:bg-[#ddd] dark:hover:bg-[#333] hover:text-[#111] dark:hover:text-[#eee] transition-colors';

  return (
    <>
      <div className="hidden md:flex items-center gap-1">
        <a href="/" className={linkClass}>Home</a>
        <a href="/incidents" className={linkClass}>Incidents</a>
        <button id="subscribe-btn" className={subBtnClass}>Get Updates</button>
        <ThemeToggle />
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#666] hover:text-[#111] dark:text-[#888] dark:hover:text-[#eee] hover:bg-[#eee] dark:hover:bg-[#111] transition-colors shrink-0"
        aria-label="Menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed left-0 right-0 top-14 z-30 md:hidden bg-white dark:bg-[#000] border-b border-[#e5e5e5] dark:border-[#222] px-4 py-3 flex flex-col gap-1">
          <a href="/" className={mobileLinkClass} onClick={() => setOpen(false)}>Home</a>
          <a href="/incidents" className={mobileLinkClass} onClick={() => setOpen(false)}>Incidents</a>
          <button
            className="block w-full px-3 py-2 text-sm font-medium rounded-lg border border-[#ccc] dark:border-[#444] bg-[#eee] dark:bg-[#222] text-[#444] dark:text-[#bbb] hover:bg-[#ddd] dark:hover:bg-[#333] hover:text-[#111] dark:hover:text-[#eee] transition-colors"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent('open-subscribe'));
            }}
          >Get Updates</button>
        </div>
      )}
    </>
  );
}
