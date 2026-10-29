'use client';

import { useEffect, useRef, useState } from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ContactButton, OnlineStatus } from './ContactCard';

const SECTION_OFFSET = 145;
const SCROLL_OFFSET = 130;
const CLICK_LOCK_MS = 900;

type Tab = { id: string; label: string };

interface StickyProfileNavProps {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  contactHref: string;
  hasSkills: boolean;
  hasServices: boolean;
}

export function StickyProfileNav({ displayName, username, avatarUrl, contactHref, hasSkills, hasServices }: StickyProfileNavProps) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('about-me');
  const clickLock = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tabs: Tab[] = [
    { id: 'about-me', label: 'About Me' },
    ...(hasSkills ? [{ id: 'skills', label: 'Skills' }] : []),
    ...(hasServices ? [{ id: 'services', label: 'Services' }] : []),
  ];
  const tabIds = tabs.map(({ id }) => id).join(',');

  useEffect(() => {
    const ids = tabIds.split(',');

    const onScroll = () => {
      const avatar = document.getElementById('profile-main-avatar');
      const navbarBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      if (avatar) {
        const rect = avatar.getBoundingClientRect();
        setVisible(rect.top + rect.height * 0.6 <= navbarBottom);
      } else {
        setVisible(window.scrollY > 175);
      }

      if (clickLock.current) return;

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActive(ids[ids.length - 1]);
        return;
      }

      const current = ids.filter((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top <= SECTION_OFFSET : false;
      });
      setActive(current[current.length - 1] ?? 'about-me');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (clickLock.current) clearTimeout(clickLock.current);
    };
  }, [tabIds]);

  const scrollTo = (id: string) => {
    setActive(id);
    if (clickLock.current) clearTimeout(clickLock.current);
    clickLock.current = setTimeout(() => {
      clickLock.current = null;
    }, CLICK_LOCK_MS);

    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET, behavior: 'smooth' });
  };

  return (
    <div
      aria-hidden={!visible}
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#dadbdd] shadow-sm transition-[transform,opacity,visibility] duration-200 ease-out will-change-transform ${
        visible ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3.5 pt-3 pb-1.5 sm:pt-3.5 sm:pb-2">
            <UserAvatar
              src={avatarUrl}
              name={displayName}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#dadbdd] shadow-2xs text-sm"
              fallbackClassName="bg-[#e7f0fa] text-[#0a65cc] font-bold"
            />
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[#222325] truncate leading-tight">{displayName}</h3>
              <p className="text-xs sm:text-sm text-[#5e6670] flex items-center gap-1.5 mt-0.5">
                <OnlineStatus labelClassName="font-semibold text-[#18191c]" />
                <span className="text-[#9199a3]">•</span>
                <span className="truncate text-[#5e6670]">@{username}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-7 sm:gap-10 -mb-[1px] pt-1 pb-2 sm:pb-2.5 overflow-x-auto no-scrollbar">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className={`pb-1.5 text-sm sm:text-[15px] transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                  active === id
                    ? 'border-[#0a65cc] text-[#0a65cc] font-bold'
                    : 'border-transparent text-[#404145] hover:text-[#18191c] font-semibold'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ContactButton href={contactHref} className="h-10 px-5 sm:px-6 rounded-[4px] shrink-0 shadow-xs" />
      </div>
    </div>
  );
}
