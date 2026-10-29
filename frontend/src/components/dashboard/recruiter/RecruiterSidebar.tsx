'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useState } from 'react';
import type { ComponentType, FocusEvent, MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Bot, Briefcase, Building2, Compass, CreditCard, Gem, Menu, MessageSquare, PanelLeftClose, PanelLeftOpen, Search, Settings, Users, X } from 'lucide-react';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { MessagesNavBadge } from '@/components/dashboard/MessagesNavBadge';
import { SIDEBAR_COLLAPSED_COOKIE } from '@/utils/cookies';

const DRAWER_ID = 'recruiter-navigation-drawer';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type IconProps = { size?: number; strokeWidth?: number; className?: string };

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  exact?: boolean;
  badge?: string;
  unread?: boolean;
  external?: boolean;
};

type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Recruiter Console',
    items: [
      { href: '/dashboard/recruiter/agent', label: 'Chakri Agent', icon: Bot },
      { href: '/dashboard/recruiter/ai-search', label: 'AI Search', icon: Search },
      { href: '/dashboard/recruiter', label: 'Recruiter Hub', icon: Compass, exact: true },
      { href: '/dashboard/recruiter/my-posts', label: 'My Posts', icon: Briefcase },
      { href: '/dashboard/recruiter/candidates', label: 'Candidates', icon: Users },
      { href: '/dashboard/recruiter/favorites', label: 'Saved Candidate', icon: Bookmark },
      { href: '/dashboard/recruiter/messages', label: 'Messages', icon: MessageSquare, unread: true },
      { href: '/dashboard/recruiter/company-profile', label: 'Company Profile', icon: Building2 },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { href: '/dashboard/recruiter/credits', label: 'Plans & Pricing', icon: CreditCard },
      { href: '/dashboard/recruiter/usage', label: 'Usage', icon: Gem },
      { href: '/dashboard/recruiter/settings', label: 'Settings', icon: Settings, exact: true },
    ],
  },
];

function isActive(pathname: string, { href, exact }: NavItem) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

type DrawerState = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
};

type Tooltip = { label: string; top: number; left: number };

const DrawerContext = createContext<DrawerState | null>(null);

function useDrawer() {
  const drawer = useContext(DrawerContext);
  if (!drawer) throw new Error('useDrawer must be used inside RecruiterDrawerProvider');
  return drawer;
}

export function RecruiterDrawerProvider({
  defaultCollapsed,
  children,
}: {
  defaultCollapsed: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = useCallback(() => setCollapsed((value) => !value), []);

  useEffect(() => {
    document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${collapsed ? 1 : 0}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }, [collapsed]);

  useEffect(() => {
    const toggleOnShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', toggleOnShortcut);
    return () => window.removeEventListener('keydown', toggleOnShortcut);
  }, [toggleCollapsed]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.classList.add('recruiter-drawer-lock');
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('recruiter-drawer-lock');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const drawer: DrawerState = {
    open,
    toggle: () => setOpen((value) => !value),
    close: () => setOpen(false),
    collapsed,
    toggleCollapsed,
  };

  return <DrawerContext value={drawer}>{children}</DrawerContext>;
}

export function RecruiterMenuButton() {
  const { open, toggle } = useDrawer();

  return (
    <button
      type="button"
      className="recruiter-mobile-menu"
      onClick={toggle}
      aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={open}
      aria-controls={DRAWER_ID}
    >
      {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
    </button>
  );
}

type TooltipHandlers = {
  onShowTooltip: (label: string, event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>) => void;
  onHideTooltip: () => void;
};

function SidebarLink({
  item,
  active,
  onNavigate,
  onShowTooltip,
  onHideTooltip,
}: { item: NavItem; active: boolean; onNavigate: () => void } & TooltipHandlers) {
  const { href, label, icon: Icon, badge, unread, external } = item;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      onMouseEnter={(event) => onShowTooltip(label, event)}
      onMouseLeave={onHideTooltip}
      onFocus={(event) => onShowTooltip(label, event)}
      onBlur={onHideTooltip}
      className={`cdash-side-item${active ? ' is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
      {...(external && { target: '_blank', rel: 'noreferrer' })}
    >
      <Icon size={20} strokeWidth={active ? 2.1 : 1.8} className="cdash-side-ico" />
      <span className="cdash-side-label">{label}</span>
      {unread ? <MessagesNavBadge /> : badge && <span className="cdash-side-badge">{badge}</span>}
    </Link>
  );
}

export function RecruiterSidebar() {
  const pathname = usePathname();
  const { open, close, collapsed, toggleCollapsed } = useDrawer();
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const collapseLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  const showTooltip: TooltipHandlers['onShowTooltip'] = (label, event) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2, left: rect.right + 10 });
  };
  const hideTooltip = () => setTooltip(null);

  return (
    <>
      <aside
        id={DRAWER_ID}
        className={`cdash-sidebar recruiter-sidebar dash-sidebar${open ? ' is-open' : ''}`}
        data-collapsed={collapsed}
        aria-label="Recruiter navigation"
      >
        <div className="recruiter-sidebar-mobile-head">
          <div>
            <strong>Recruiter</strong>
            <span>Workspace navigation</span>
          </div>
          <button type="button" onClick={close} aria-label="Close navigation menu">
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="dash-sidebar-scroll no-scrollbar" onScroll={hideTooltip}>
          {NAV_SECTIONS.map(({ title, items }, index) => (
            <Fragment key={title}>
              {index > 0 ? (
                <hr className="dash-sidebar-divider" />
              ) : (
                <div className="cdash-sidebar-head">
                  <span>{title}</span>
                  <button
                    type="button"
                    onClick={() => {
                      hideTooltip();
                      toggleCollapsed();
                    }}
                    onMouseEnter={(event) => showTooltip(collapseLabel, event)}
                    onMouseLeave={hideTooltip}
                    className="dash-collapse-toggle"
                    aria-label={collapseLabel}
                    title={collapsed ? undefined : collapseLabel}
                    aria-expanded={!collapsed}
                    aria-controls={DRAWER_ID}
                  >
                    <CollapseIcon size={18} strokeWidth={1.8} aria-hidden />
                  </button>
                </div>
              )}
              <nav className="cdash-sidebar-nav" aria-label={title}>
                {items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    active={isActive(pathname, item)}
                    onNavigate={close}
                    onShowTooltip={showTooltip}
                    onHideTooltip={hideTooltip}
                  />
                ))}
              </nav>
            </Fragment>
          ))}
        </div>

        <div className="cdash-sidebar-foot shrink-0 border-t border-slate-200">
          <LogoutButton
            className="dash-logout w-full"
            message="Are you sure you want to log out? You will need to sign back in to access your recruiter workspace and dashboard."
          />
        </div>

        {tooltip && (
          <div className="dash-tooltip" style={{ top: tooltip.top, left: tooltip.left }} role="tooltip">
            {tooltip.label}
          </div>
        )}
      </aside>

      <button
        type="button"
        className={`recruiter-drawer-backdrop${open ? ' is-open' : ''}`}
        onClick={close}
        aria-label="Close navigation menu"
        tabIndex={open ? 0 : -1}
      />
    </>
  );
}
