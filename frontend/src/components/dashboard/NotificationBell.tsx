'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

type Filter = 'all' | 'unread';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

export function NotificationBell({ href }: { href: string }) {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div className="cdash-bell-wrap relative" ref={wrapRef}>
      <button
        type="button"
        className={`cdash-bell${open ? ' is-active' : ''}`}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <BellIcon className="cdash-ico-lg" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications popover"
          className="absolute right-0 mt-2 w-[360px] sm:w-[390px] rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[82vh]"
        >
          <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[19px] font-bold text-slate-900 tracking-tight">Notifications</h3>
            </div>

            <div className="flex items-center gap-1.5">
              {FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filter === value ? 'bg-[#0a65cc]/10 text-[#0a65cc]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Bell size={22} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                {filter === 'unread'
                  ? "You've read all your recent notifications."
                  : 'Application updates, interview calls and alerts will appear here.'}
              </p>
            </div>
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50/70 shrink-0 text-center">
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="block w-full py-2 px-3 rounded-lg text-xs font-bold text-[#0a65cc] hover:bg-blue-100/50 hover:text-blue-700 transition-colors"
            >
              See all in notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
