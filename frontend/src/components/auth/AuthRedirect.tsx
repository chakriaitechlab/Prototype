import { redirectIfAuthenticated } from '@/utils/session';

export async function AuthRedirect() {
  await redirectIfAuthenticated();
  return null;
}
