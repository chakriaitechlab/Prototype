import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser, rememberReturnTo } from '@/utils/session';
import { chatPath, messagesPath, pathForUser } from '@/utils/routes';

export async function GET(request: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    await rememberReturnTo(request.nextUrl.pathname);
    return redirectTo('/auth/login?continue=message');
  }
  if (user.nextStep !== 'done') return redirectTo(pathForUser(user));
  if (user.username === handle.toLowerCase()) return redirectTo(messagesPath(user.role));
  return redirectTo(chatPath(user.role, handle));
}
