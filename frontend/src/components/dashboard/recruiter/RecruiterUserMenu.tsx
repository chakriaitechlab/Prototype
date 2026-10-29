'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Building2, LogOut, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LogoutDialog } from '@/components/dashboard/LogoutButton';
import { initialsOf } from '@/utils/format';

type RecruiterUserMenuProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  profilePercent: number;
};

const MENU_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard/recruiter/company-profile', label: 'Company Profile', icon: Building2 },
  { href: '/dashboard/recruiter/settings', label: 'Settings', icon: Settings },
];

function Avatar({ src, name, className }: { src: string | null; name: string; className: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`} aria-hidden>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}

export function RecruiterUserMenu({ name, email, avatarUrl, profilePercent }: RecruiterUserMenuProps) {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const percent = Math.min(100, Math.max(0, profilePercent));

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
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <div className="relative" ref={wrapRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`flex items-center justify-center rounded-full border border-slate-200 bg-white p-0.5 shadow-xs transition hover:border-slate-300 hover:ring-2 hover:ring-[#0a65cc]/20 focus:outline-none focus:ring-2 focus:ring-[#0a65cc]/20 cursor-pointer ${
            open ? 'ring-2 ring-[#0a65cc]/30 border-[#0a65cc]/40' : ''
          }`}
          aria-label="User menu"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={open ? menuId : undefined}
        >
          <Avatar
            src={avatarUrl}
            name={name}
            className="h-[36px] w-[36px] rounded-full bg-[#0a65cc] text-xs font-bold text-white shadow-xs"
          />
        </button>

        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label="Recruiter user menu"
            className="absolute right-0 mt-2 w-72 rounded-none border border-slate-300 bg-white p-3 z-50 shadow-[0_12px_32px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="rounded-none border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={avatarUrl}
                  name={name}
                  className="h-10 w-10 rounded-none border border-slate-300 bg-slate-100 text-sm font-bold text-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 leading-tight">{name}</p>
                  <p className="truncate text-[11px] text-slate-500 leading-tight mt-0.5">{email}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Role</span>
                <span className="inline-flex items-center gap-1.5 rounded-none px-2.5 py-0.5 text-xs font-black uppercase tracking-wider border text-[#0a65cc] border-blue-400 bg-transparent">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0a65cc]" />
                  Recruiter
                </span>
              </div>

              <div className="mt-2.5 border-t border-slate-200 pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Company Profile</span>
                  <span className="text-xs font-bold text-[#0a65cc]">{percent}%</span>
                </div>
                <div
                  className="h-1.5 w-full bg-slate-100 rounded-none overflow-hidden"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full bg-[#0a65cc] transition-all duration-300" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-2.5 space-y-1">
              {MENU_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between rounded-none border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-[#0a65cc]/40 hover:bg-blue-50/50 hover:text-[#0a65cc] cursor-pointer"
                  role="menuitem"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className="text-slate-500 group-hover:text-[#0a65cc] transition-colors" />
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0a65cc]">{label}</span>
                  </div>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-[#0a65cc]" />
                </Link>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setLogoutOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-none border border-rose-600 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white active:scale-[0.98] cursor-pointer"
                role="menuitem"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        label="Sign Out"
        message="Are you sure you want to sign out? You will need to sign back in to access your recruiter workspace and dashboard."
      />
    </>
  );
}
