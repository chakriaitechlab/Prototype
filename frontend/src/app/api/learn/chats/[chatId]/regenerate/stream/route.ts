import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { learnApi } from '@/lib/learn';
import { getCurrentUser } from '@/utils/session';

export async function POST(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const user = await getCurrentUser().catch(() => null);
  if (user?.role !== 'SEEKER') return NextResponse.json({ message: 'Your session has expired. Please sign in again.' }, { status: 401 });

  const { chatId } = await params;
  return learnApi.streamRegenerate(chatId, request.signal);
}
