'use client';

import { useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { AlertTriangle, Bell, Lock } from 'lucide-react';

type Tab = 'notifications' | 'security' | 'management';

const TABS: { id: Tab; label: string; icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'management', label: 'Data & Account', icon: AlertTriangle },
];

type SettingsTabsProps = Record<Tab, ReactNode>;

export function SettingsTabs(panels: SettingsTabsProps) {
  const [active, setActive] = useState<Tab>('notifications');

  return (
    <>
      <div className="cset-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              id={`settings-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`settings-panel-${id}`}
              className={`cset-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActive(id)}
            >
              <Icon size={18} className="cset-tab-ico" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {TABS.map(({ id }) => (
        <div
          key={id}
          id={`settings-panel-${id}`}
          role="tabpanel"
          aria-labelledby={`settings-tab-${id}`}
          hidden={active !== id}
        >
          {panels[id]}
        </div>
      ))}
    </>
  );
}
