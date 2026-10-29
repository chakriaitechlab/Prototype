import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { interviewsApi } from '@/lib/interviews';
import type { InterviewLanguage, SpeechKind } from '@/types/interviews';
import { getCurrentUser } from '@/utils/session';

const SPEECH_KINDS: SpeechKind[] = ['preview', 'greeting', 'question', 'transition', 'silence', 'closing'];
const LANGUAGES: InterviewLanguage[] = ['english', 'bangla'];

export async function POST(request: NextRequest, { params }: { params: Promise<{ interviewId: string }> }) {
  const user = await getCurrentUser().catch(() => null);
  if (user?.role !== 'SEEKER') return NextResponse.json({ message: 'Your session has expired. Please sign in again.' }, { status: 401 });

  const { interviewId } = await params;
  const body = (await request.json().catch(() => null)) as { kind?: unknown; language?: unknown } | null;
  const kind = SPEECH_KINDS.find((value) => value === body?.kind);
  const language = LANGUAGES.find((value) => value === body?.language);
  if (!kind) return NextResponse.json({ message: 'Invalid speech request.' }, { status: 400 });

  return interviewsApi.streamSpeech(interviewId, { kind, language }, request.signal);
}
