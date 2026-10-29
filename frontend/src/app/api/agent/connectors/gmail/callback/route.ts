import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { agentApi } from '@/lib/agent';
import { getCurrentUser } from '@/utils/session';
import { dashboardPath, pathForUser } from '@/utils/routes';

export async function GET(request: NextRequest) {
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));
  const user = await getCurrentUser().catch(() => null);

  if (!user) return redirectTo('/auth/login');
  if ((user.role !== 'SEEKER' && user.role !== 'RECRUITER') || user.nextStep !== 'done') return redirectTo(pathForUser(user));

  const agentPath = `${dashboardPath(user.role)}/agent`;

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (!code || !state) return redirectTo(`${agentPath}?gmail=denied`);

  const connected = await agentApi
    .connectGmail(code, state)
    .then(() => true)
    .catch(() => false);
  return redirectTo(`${agentPath}?gmail=${connected ? 'connected' : 'failed'}`);
}
