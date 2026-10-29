import { Suspense } from 'react';
import { settingsApi } from '@/lib/settings';
import { requireDashboard } from '@/utils/session';
import { SETTINGS_COPY } from '@/utils/settings';
import type { UserRole } from '@/types/auth';
import { SettingsTabs } from './SettingsTabs';
import { SettingsSkeleton } from './SettingsSkeleton';
import { NotificationsForm } from './NotificationsForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { TwoFactorToggle } from './TwoFactorToggle';
import { LoginSessions } from './LoginSessions';
import { DeleteAccountSection } from './DeleteAccountSection';

export function SettingsView({ role }: { role: UserRole }) {
  const copy = SETTINGS_COPY[role];

  return (
    <div className="w-full pb-10">
      <div className="mb-6">
        <h1 className="cset-title mb-1">{copy.title}</h1>
        <p className="text-sm text-gray-500">Manage your notifications, account security, and data preferences.</p>
      </div>

      <SettingsTabs
        notifications={
          <Suspense fallback={<SettingsSkeleton />}>
            <Notifications role={role} />
          </Suspense>
        }
        security={
          <>
            <ChangePasswordForm />
            <Suspense fallback={<SettingsSkeleton />}>
              <Security />
            </Suspense>
          </>
        }
        management={<DeleteAccountSection copy={copy.deleteAccount} />}
      />
    </div>
  );
}

async function Notifications({ role }: { role: UserRole }) {
  const [{ email }, settings] = await Promise.all([requireDashboard(role), settingsApi.notifications()]);

  return <NotificationsForm email={email} alerts={SETTINGS_COPY[role].alerts} initialSettings={settings} />;
}

async function Security() {
  const { twoFactorEnabled, sessions } = await settingsApi.security();

  return (
    <>
      <TwoFactorToggle initialEnabled={twoFactorEnabled} />
      <LoginSessions sessions={sessions} />
    </>
  );
}
