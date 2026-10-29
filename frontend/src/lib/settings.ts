import 'server-only';
import { apiFetch } from './client';
import type { NotificationSettings, SecuritySettings } from '@/types/settings';

export const settingsApi = {
  notifications: () => apiFetch<NotificationSettings>('/api/settings/notifications'),

  updateNotifications: (body: NotificationSettings) =>
    apiFetch<NotificationSettings>('/api/settings/notifications', { method: 'PATCH', body }),

  security: () => apiFetch<SecuritySettings>('/api/settings/security'),

  updateTwoFactor: (enabled: boolean) =>
    apiFetch<Pick<SecuritySettings, 'twoFactorEnabled'>>('/api/settings/two-factor', {
      method: 'PATCH',
      body: { enabled },
    }),

  deleteAccount: () => apiFetch<{ message: string }>('/api/settings/account', { method: 'DELETE' }),
};
