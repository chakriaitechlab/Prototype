'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { saveNotificationsAction } from '@/actions/settings.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';
import type { AlertKey, NotificationSettings, SettingsCopy } from '@/types/settings';
import { ToggleCard, ToggleSwitch } from './ToggleCard';

type NotificationKey = keyof NotificationSettings;

interface NotificationOption {
  key: NotificationKey;
  title: string;
  note: string;
}

const ACTIVITY_ALERT_KEYS: AlertKey[] = ['applicationUpdates', 'interviewReminders', 'jobMatches'];

interface NotificationsFormProps {
  email: string;
  alerts: SettingsCopy['alerts'];
  initialSettings: NotificationSettings;
}

export function NotificationsForm({ email, alerts, initialSettings }: NotificationsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  const optionsFor = (keys: AlertKey[]): NotificationOption[] => keys.map((key) => ({ key, ...alerts[key] }));

  const deliveryChannels: NotificationOption[] = [
    { key: 'emailEnabled', title: 'Email Notifications', note: `Send updates to ${email || 'your registered email'}.` },
    ...optionsFor(['pushEnabled', 'smsEnabled']),
  ];

  const toggle = (key: NotificationKey) => setSettings((current) => ({ ...current, [key]: !current[key] }));

  const save = () =>
    startTransition(async () => {
      setState(await saveNotificationsAction(settings));
    });

  const renderOptions = (options: NotificationOption[]) => (
    <div className="cset-privacy-grid">
      {options.map(({ key, title, note }) => (
        <ToggleCard key={key} title={title} note={note}>
          <ToggleSwitch checked={settings[key]} onToggle={() => toggle(key)} />
        </ToggleCard>
      ))}
    </div>
  );

  return (
    <>
      <FormAlert message={state.error ?? state.message} type={state.error ? 'error' : 'success'} trigger={state} />

      <section className="cset-section cset-section--ruled">
        <h3 className="cset-section-title">Delivery Channels</h3>
        {renderOptions(deliveryChannels)}
      </section>

      <section className="cset-section">
        <h3 className="cset-section-title">Activity Alerts</h3>
        {renderOptions(optionsFor(ACTIVITY_ALERT_KEYS))}

        <div className="cset-save-row">
          <button type="button" className="cset-btn-primary" disabled={pending} onClick={save}>
            {pending && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </section>
    </>
  );
}
