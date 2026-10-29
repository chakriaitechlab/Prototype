'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';
import { startInterviewAction } from '@/actions/interviews.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { InterviewLanguage, InterviewSession } from '@/types/interviews';
import { aiInterviewPath, interviewRoomPath } from '@/utils/routes';
import { InterviewTopBar } from '../InterviewTopBar';
import { LeaveInterviewDialog } from '../LeaveInterviewDialog';
import { ConsentDialog } from './ConsentDialog';
import { DeviceCheckCard } from './DeviceCheckCard';
import { InterviewerPreviewCard } from './InterviewerPreviewCard';
import { LanguagePicker } from './LanguagePicker';

export function LobbyView({ interview }: { interview: InterviewSession }) {
  const router = useRouter();
  const [language, setLanguage] = useState<InterviewLanguage>(interview.language);
  const [devicesReady, setDevicesReady] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, startLeaving] = useTransition();
  const [alert, setAlert] = useState<{ error?: string; trigger: number }>({ trigger: 0 });
  const [starting, startTransition] = useTransition();
  const resuming = interview.status === 'IN_PROGRESS';

  const start = () =>
    startTransition(async () => {
      await document.documentElement.requestFullscreen?.().catch(() => undefined);
      const result = await startInterviewAction(interview.id, language);
      if ('error' in result) {
        setAlert({ error: result.error, trigger: Date.now() });
        return;
      }
      router.push(interviewRoomPath(interview.id));
    });

  return (
    <>
      <FormAlert message={alert.error} trigger={alert.trigger} />
      <InterviewTopBar context={`${interview.job.title} · ${interview.job.company.name}`} onLeave={() => setLeaveOpen(true)} />

      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-7 sm:px-8">
        <h1 className="recruiter-page-title">Prepare for your interview</h1>
        <p className="mt-1 text-[13.5px] text-[#5e6670]">Meet your interviewer, check your devices, then join. About 15–20 min.</p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <InterviewerPreviewCard interviewId={interview.id} language={language} />

          <div className="grid content-start gap-4">
            <DeviceCheckCard onReadyChange={setDevicesReady} />
            {!resuming && <LanguagePicker value={language} onChange={setLanguage} />}

            <p className="flex gap-1.5 text-[12.5px] text-[#767f8c]">
              <Lock size={14} className="mt-px shrink-0" aria-hidden />
              Nothing is recorded until the interview begins.
            </p>
            <button
              type="button"
              onClick={() => setConsentOpen(true)}
              disabled={!devicesReady || starting}
              className="jp-btn jp-btn--primary h-[50px]! w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resuming ? 'Rejoin interview' : 'Join interview'}
              <ArrowRight size={17} aria-hidden />
            </button>
            {!devicesReady && <p className="text-center text-xs text-[#767f8c]">Turn on your camera and microphone to continue.</p>}
          </div>
        </div>
      </div>

      {consentOpen && <ConsentDialog starting={starting} onCancel={() => setConsentOpen(false)} onConfirm={start} />}
      {leaveOpen && (
        <LeaveInterviewDialog
          stage="lobby"
          pending={leaving}
          onCancel={() => setLeaveOpen(false)}
          onConfirm={() => startLeaving(() => router.push(aiInterviewPath(interview.id)))}
        />
      )}
    </>
  );
}
