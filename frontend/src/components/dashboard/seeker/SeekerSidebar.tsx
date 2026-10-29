'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useState } from 'react';
import type { ComponentType, FocusEvent, MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Briefcase, Compass, CreditCard, FileText, Gem, LayoutDashboard, Menu, MessageSquare, Mic, PanelLeftClose, PanelLeftOpen, Search, Settings, UserCheck, X } from 'lucide-react';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { MessagesNavBadge } from '@/components/dashboard/MessagesNavBadge';
import { LearningChatIcon } from './LearningChatIcon';
import { SIDEBAR_COLLAPSED_COOKIE } from '@/utils/cookies';

const DRAWER_ID = 'seeker-navigation-drawer';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type IconProps = { size?: number; strokeWidth?: number; className?: string };

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  exact?: boolean;
  badge?: string;
  unread?: boolean;
};

type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'SaaS Console',
    items: [
      { href: '/dashboard/seeker/agent', label: 'Chakri AI', icon: Compass, badge: 'AI' },
      { href: '/dashboard/seeker', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/seeker/jobs', label: 'Find Jobs', icon: Search },
      { href: '/dashboard/seeker/applications', label: 'Applications', icon: Briefcase },
      { href: '/dashboard/seeker/saved', label: 'Saved Jobs', icon: Bookmark },
      { href: '/dashboard/seeker/inbox', label: 'Messages', icon: MessageSquare, unread: true },
      { href: '/dashboard/seeker/learn', label: 'Learning Chat', icon: LearningChatIcon, badge: 'AI' },
      { href: '/dashboard/seeker/ai-interview', label: 'AI Interview', icon: Mic },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { href: '/dashboard/seeker/cv', label: 'CV Generator', icon: FileText },
      { href: '/dashboard/seeker/profile', label: 'Your Profile', icon: UserCheck },
      { href: '/dashboard/seeker/credits', label: 'Plans & Pricing', icon: CreditCard },
      { href: '/dashboard/seeker/usage', label: 'Usage', icon: Gem },
      { href: '/dashboard/seeker/settings', label: 'Settings', icon: Settings, exact: true },
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
  if (!drawer) throw new Error('useDrawer must be used inside SeekerDrawerProvider');
  return drawer;
}

export function SeekerDrawerProvider({
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
    document.body.classList.add('seeker-drawer-lock');
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('seeker-drawer-lock');
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

export function SeekerMenuButton() {
  const { open, toggle } = useDrawer();

  return (
    <button
      type="button"
      className="seeker-mobile-menu"
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
  const { href, label, icon: Icon, badge, unread } = item;

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
    >
      <Icon size={20} strokeWidth={active ? 2.1 : 1.8} className="cdash-side-ico" />
      <span className="cdash-side-label">{label}</span>
      {unread ? <MessagesNavBadge /> : badge && <span className="cdash-side-badge">{badge}</span>}
    </Link>
  );
}

export function SeekerSidebar() {
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
        className={`cdash-sidebar seeker-sidebar dash-sidebar${open ? ' is-open' : ''}`}
        data-collapsed={collapsed}
        aria-label="Job seeker navigation"
      >
        <div className="seeker-sidebar-mobile-head">
          <div>
            <strong>Job Seeker</strong>
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
          <LogoutButton className="dash-logout w-full" />
        </div>

        {tooltip && (
          <div className="dash-tooltip" style={{ top: tooltip.top, left: tooltip.left }} role="tooltip">
            {tooltip.label}
          </div>
        )}
      </aside>

      <button
        type="button"
        className={`seeker-drawer-backdrop${open ? ' is-open' : ''}`}
        onClick={close}
        aria-label="Close navigation menu"
        tabIndex={open ? 0 : -1}
      />
    </>
  );
}
