'use server';

import { redirect } from 'next/navigation';
import { errorMessage } from '@/lib/client';
import { settingsApi } from '@/lib/settings';
import { clearSessionCookie, getCurrentUser } from '@/utils/session';
import type { ActionState } from '@/types/auth';
import type { NotificationSettings, TwoFactorState } from '@/types/settings';

const SESSION_EXPIRED = 'Your session has expired. Please sign in again.';
const DELETE_CONFIRMATION = 'delete';

const isSignedIn = async () => Boolean(await getCurrentUser().catch(() => null));

export async function saveNotificationsAction(settings: NotificationSettings): Promise<ActionState> {
  if (!(await isSignedIn())) return { error: SESSION_EXPIRED };

  try {
    await settingsApi.updateNotifications(settings);
    return { message: 'Notification preferences saved' };
  } catch (err) {
    return { error: errorMessage(err, 'Could not save notification preferences.') };
  }
}

export async function updateTwoFactorAction(enabled: boolean): Promise<TwoFactorState> {
  if (!(await isSignedIn())) return { error: SESSION_EXPIRED };

  try {
    const { twoFactorEnabled } = await settingsApi.updateTwoFactor(enabled);
    return {
      twoFactorEnabled,
      message: twoFactorEnabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
    };
  } catch (err) {
    return { error: errorMessage(err, 'Could not update two-factor authentication.') };
  }
}

export async function deleteAccountAction(confirmation: string): Promise<ActionState> {
  if (!(await isSignedIn())) return { error: SESSION_EXPIRED };
  if (confirmation.trim().toLowerCase() !== DELETE_CONFIRMATION) {
    return { error: `Type "${DELETE_CONFIRMATION}" to confirm.` };
  }

  try {
    await settingsApi.deleteAccount();
  } catch (err) {
    return { error: errorMessage(err, 'Could not delete your account. Please try again.') };
  }

  await clearSessionCookie();
  redirect('/auth/login?deleted=true');
}
