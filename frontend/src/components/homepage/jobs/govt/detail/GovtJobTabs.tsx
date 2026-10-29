'use client';

import { useEffect, useRef, useState } from 'react';
import { GOVT_JOB_SECTIONS } from '@/utils/govt-job-detail';

type SectionId = (typeof GOVT_JOB_SECTIONS)[number]['id'];

/** Navbar + tab bar height: a section counts as current once its top passes below them. */
const ACTIVE_OFFSET_PX = 160;

function currentSection(): SectionId {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) return GOVT_JOB_SECTIONS[GOVT_JOB_SECTIONS.length - 1].id;

  let current: SectionId = GOVT_JOB_SECTIONS[0].id;
  for (const { id } of GOVT_JOB_SECTIONS) {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) current = id;
  }
  return current;
}

export function GovtJobTabs() {
  const [active, setActive] = useState<SectionId>(GOVT_JOB_SECTIONS[0].id);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(currentSection()));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Keep the active tab visible when the bar overflows horizontally (mobile).
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!nav || !tab) return;
    const left = tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2;
    nav.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  const scrollTo = (id: SectionId) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      ref={navRef}
      aria-label="Circular sections"
      className="sticky top-[calc(73px+1rem)] z-30 mb-6 flex items-center gap-1.5 overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white px-2 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {GOVT_JOB_SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            data-section={id}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => scrollTo(id)}
            className={`cursor-pointer whitespace-nowrap rounded-lg border-b-2 px-[1.1rem] py-2.5 text-[0.925rem] transition-all duration-150 ${
              isActive
                ? 'border-[#16a34a] bg-[#ecfdf5] font-bold text-[#15803d]'
                : 'border-transparent bg-transparent font-medium text-[#475569]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
