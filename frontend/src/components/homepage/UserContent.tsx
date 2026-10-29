'use client';

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ArrowUpRight, LayoutDashboard, LogOut, Settings, UserCheck } from 'lucide-react';
import { useUser } from '@/context/usercontext';
import { pathForUser } from '@/utils/routes';

export function UserContent({ className = '' }: { className?: string }) {
  const router = useRouter();
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { user, role, logout } = useUser();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const avatarUrl = user?.avatarUrl;
  const initial = (displayName[0] || 'U').toUpperCase();

  const isRecruiter = role === 'RECRUITER';
  const roleLabel = !role ? 'Not Selected' : isRecruiter ? 'Recruiter' : 'Job Seeker';
  const profileHref = !role ? '/onboarding/role' : isRecruiter ? '/dashboard/recruiter/company-profile' : '/dashboard/seeker/profile';
  const settingsHref = !role ? '/onboarding/role' : isRecruiter ? '/dashboard/recruiter/settings' : '/dashboard/seeker/settings';

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const closeDropdown = useCallback(() => {
    setUserDropdownOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Handle "Go to Dashboard" click
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeDropdown();

    router.push(user ? pathForUser(user) : '/auth/login');
  };

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when logout modal is active
  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogoutModal]);

  // Close dropdown and modal on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (showLogoutModal) {
          setShowLogoutModal(false);
        } else if (userDropdownOpen) {
          closeDropdown();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal, userDropdownOpen, closeDropdown]);

  const handleConfirmedSignOut = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <div className={`relative ${className}`} ref={wrapRef}>
        {/* User Avatar Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setUserDropdownOpen((prev) => !prev)}
          className={`flex items-center justify-center rounded-full border border-slate-200 bg-white p-0.5 shadow-xs transition hover:border-slate-300 hover:ring-2 hover:ring-[#0a65cc]/20 focus:outline-none focus:ring-2 focus:ring-[#0a65cc]/20 cursor-pointer ${
            userDropdownOpen ? 'ring-2 ring-[#0a65cc]/30 border-[#0a65cc]/40' : ''
          }`}
          aria-label="User menu"
          aria-expanded={userDropdownOpen}
          aria-haspopup="menu"
          aria-controls={userDropdownOpen ? menuId : undefined}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0a65cc] text-sm font-bold text-white shadow-xs">
              {initial}
            </div>
          )}
        </button>

        {/* User Dropdown Menu (Smart Service UI style) */}
        {userDropdownOpen && (
          <div
            id={menuId}
            role="menu"
            aria-label="User account menu"
            className="absolute right-0 mt-2 w-72 rounded-none border border-slate-300 bg-white p-3 z-50 shadow-[0_12px_32px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-100"
          >
            {/* User Profile Header */}
            <div className="rounded-none border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-none border border-slate-300 object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-none border border-slate-300 bg-slate-100 text-sm font-bold text-slate-800 shrink-0">
                    {initial}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 leading-tight">
                    {displayName}
                  </p>
                  {email && (
                    <p className="truncate text-[11px] text-slate-500 leading-tight mt-0.5">
                      {email}
                    </p>
                  )}
                </div>
              </div>

              {/* Backend Role Badge */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Role
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-none px-2.5 py-0.5 text-xs font-black uppercase tracking-wider border ${
                    !role
                      ? 'text-amber-700 border-amber-400 bg-amber-50/50'
                      : 'text-[#0a65cc] border-blue-400 bg-transparent'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      !role ? 'bg-amber-500' : 'bg-[#0a65cc]'
                    }`}
                  />
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Go to Dashboard Navigation Link (Smart Service style) */}
            <div className="mt-2.5 space-y-1">
              <button
                type="button"
                onClick={handleDashboardClick}
                className="group flex w-full items-center justify-between rounded-none border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-bold text-slate-800 transition hover:border-[#0a65cc]/40 hover:bg-blue-50/50 hover:text-[#0a65cc] cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard size={15} className="text-slate-500 group-hover:text-[#0a65cc] transition-colors" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#0a65cc]">
                    Go to Dashboard
                  </span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-[#0a65cc] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <Link
                href={profileHref}
                onClick={closeDropdown}
                className="group flex items-center justify-between rounded-none border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-[#0a65cc]/40 hover:bg-blue-50/50 hover:text-[#0a65cc] cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck size={14} className="text-slate-500 group-hover:text-[#0a65cc] transition-colors" />
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0a65cc]">
                    {isRecruiter ? 'Company Profile' : 'Your Profile'}
                  </span>
                </div>
                <ArrowUpRight size={13} className="text-slate-400 group-hover:text-[#0a65cc]" />
              </Link>

              <Link
                href={settingsHref}
                onClick={closeDropdown}
                className="group flex items-center justify-between rounded-none border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-[#0a65cc]/40 hover:bg-blue-50/50 hover:text-[#0a65cc] cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={14} className="text-slate-500 group-hover:text-[#0a65cc] transition-colors" />
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0a65cc]">
                    Settings
                  </span>
                </div>
                <ArrowUpRight size={13} className="text-slate-400 group-hover:text-[#0a65cc]" />
              </Link>
            </div>

            {/* Sign Out Action (Smart Service style - rectangular red outline) */}
            <div className="mt-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false);
                  setShowLogoutModal(true);
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

      {/* Sign Out Confirmation Alert Dialog via React Portal (Smart Service style) */}
      {isClient &&
        showLogoutModal &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="homepage-logout-dialog-title"
            className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            {/* Full Screen Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
              onClick={() => setShowLogoutModal(false)}
            />

            {/* Dialog Card - Centered in screen */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-none border border-slate-300 bg-white p-6 animate-in zoom-in-95 fade-in duration-150 shadow-2xl">
              <h3 id="homepage-logout-dialog-title" className="text-base font-bold text-slate-900 mb-2">
                Sign Out
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to sign out? You will need to sign back in to access your account and dashboard.
              </p>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="rounded-none border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmedSignOut}
                  className="rounded-none border border-rose-700 bg-rose-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-rose-700 hover:border-rose-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
