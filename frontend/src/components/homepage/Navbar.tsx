'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ChakriBetaBadgeButton } from '@/components/ui/ChakriBetaBadge';
import { useUser } from '@/context/usercontext';
import { UserContent } from '@/components/homepage/UserContent';
import { SignupLink } from '@/components/homepage/SignupLink';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Find Job', href: '/jobs' },
  { label: 'Employers', href: '/employers' },
  { label: 'Candidates', href: '/candidates' },
  { label: 'Pricing Plans', href: '/pricing' },
  { label: 'Supports', href: '/support' },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const { isAuthenticated, isLoading } = useUser();

  // Close drawer on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="jp-nav">
      <div className="jp-container jp-nav-inner">
        {/* Brand Logo */}
        <div className="jp-logo jp-logo--with-beta !items-center !gap-2.5">
          <Link href="/" className="jp-logo-link" aria-label="Chakri.ai home">
            <Image
              src="/jobpilot/chakri-logo.png"
              alt="Chakri.ai"
              width={795}
              height={221}
              className="jp-logo-img jp-logo-img--md !h-12 !max-w-[175px]"
              priority
              loading="eager"
            />
          </Link>
          <ChakriBetaBadgeButton className="!h-6 !px-2.5 !text-[11px] !font-bold !leading-none" />
        </div>

        {/* Desktop Navigation Links */}
        <div className="jp-nav-center">
          <nav className="jp-nav-links" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={isActive(link.href) ? 'is-active' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions (User Avatar / Sign In / Sign Up) */}
        <div className="jp-nav-actions">
          {isLoading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          ) : isAuthenticated ? (
            <UserContent />
          ) : (
            <>
              <Link href="/auth/login" className="jp-btn jp-btn--outline jp-btn--nav-signin">
                Sign In
              </Link>
              <SignupLink label="Sign Up" withArrow className="jp-btn jp-btn--primary jp-btn--nav-signup" />
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className={`jp-nav-toggle${open ? ' is-open' : ''}`}
            aria-expanded={open}
            aria-controls="homepage-mobile-drawer"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`jp-nav-backdrop${open ? ' is-open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Mobile Slide-in Drawer */}
      <aside
        id="homepage-mobile-drawer"
        className={`jp-nav-drawer${open ? ' is-open' : ''}`}
        aria-label="Mobile Navigation"
        aria-hidden={!open}
      >
        <div className="jp-nav-drawer-head">
          <div className="jp-logo jp-logo--with-beta !items-center !gap-2">
            <Link href="/" className="jp-logo-link" onClick={() => setOpen(false)}>
              <Image
                src="/jobpilot/chakri-logo.png"
                alt="Chakri.ai"
                width={795}
                height={221}
                className="jp-logo-img jp-logo-img--md"
                priority
                loading="eager"
              />
            </Link>
            <ChakriBetaBadgeButton className="!h-[24px] !px-2.5 !text-[11px] !font-bold !leading-none" />
          </div>
          <button
            type="button"
            className="jp-nav-drawer-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="jp-nav-drawer-links" aria-label="Mobile menu">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={isActive(link.href) ? 'is-active' : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="jp-nav-drawer-actions">
          {isLoading ? (
            <div className="h-[40px] w-[40px] animate-pulse rounded-full bg-slate-200 mx-auto my-2" />
          ) : isAuthenticated ? (
            <div className="flex justify-center py-2">
              <UserContent />
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="jp-btn jp-btn--outline jp-btn--block"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
              <SignupLink
                label="Sign Up"
                withArrow
                className="jp-btn jp-btn--primary jp-btn--block"
                onClick={() => setOpen(false)}
              />
            </>
          )}
        </div>
      </aside>
    </header>
  );
}
