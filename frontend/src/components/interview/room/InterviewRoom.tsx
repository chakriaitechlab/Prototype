'use client';

import { useRef, useState } from 'react';
import { useInterviewFlow } from '@/hooks/useInterviewFlow';
import { useInterviewProctoring } from '@/hooks/useInterviewProctoring';
import type { InterviewSession } from '@/types/interviews';
import { initialsOf } from '@/utils/format';
import { InterviewerVideo } from '../InterviewerVideo';
import { LeaveInterviewDialog } from '../LeaveInterviewDialog';
import { LiveAnswer } from './LiveAnswer';
import { ProctoringToast } from './ProctoringToast';
import { ProgressSteps } from './ProgressSteps';
import { QuestionCaption } from './QuestionCaption';
import { RoomControls } from './RoomControls';
import { RoomHeader } from './RoomHeader';
import { SelfView } from './SelfView';

export function InterviewRoom({ interview, candidateName }: { interview: InterviewSession; candidateName: string }) {
  const flow = useInterviewFlow(interview);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const { phase, turn } = flow;

  useInterviewProctoring({
    enabled: cameraOn && phase !== 'starting' && phase !== 'finishing',
    videoRef,
    onViolation: flow.reportViolation,
  });

  const questionLabel = turn?.phase === 'SKILL' ? turn.skill : turn ? 'Introduction' : null;

  return (
    <div className="relative h-dvh overflow-hidden bg-black text-white">
      <InterviewerVideo speaking={flow.speaking} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-36 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-64 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      <RoomHeader title={`${interview.job.title} · ${interview.job.company.name}`} warnings={flow.warnings} />
      <ProctoringToast message={flow.warning.message} warnings={flow.warnings} trigger={flow.warning.trigger} />
      <ProgressSteps skills={interview.skills} turn={turn} questionNumber={flow.questionNumber} />
      <SelfView videoRef={videoRef} initials={initialsOf(candidateName, 'You')} onCameraChange={setCameraOn} />

      <div className="absolute inset-x-0 bottom-0 z-[3] px-4 pb-5 sm:px-6">
        {phase === 'starting' && <p className="text-center text-sm text-slate-300">Connecting to your interviewer…</p>}
        {phase === 'thinking' && <p className="text-center text-sm text-slate-300">Zayn is thinking…</p>}
        {phase === 'finishing' && <p className="text-center text-sm text-slate-300">Wrapping up your interview…</p>}
        {phase === 'error' ? (
          <div className="mx-auto max-w-[560px] border border-white/10 bg-slate-900/80 px-4 py-3 text-center text-sm">
            <p className="text-slate-200">{flow.error}</p>
            <button type="button" onClick={flow.retry} className="mt-2.5 cursor-pointer rounded-md bg-[#0a65cc] px-4 py-2 text-sm font-semibold hover:bg-[#084f9e]">
              Try again
            </button>
          </div>
        ) : (
          phase !== 'finishing' && <QuestionCaption question={flow.caption} speaking={flow.speaking} label={questionLabel} />
        )}
        <LiveAnswer
          listening={phase === 'listening'}
          finalText={flow.transcript.final}
          interimText={flow.transcript.interim}
          language={interview.language}
        />
        <RoomControls leaving={phase === 'finishing'} onLeave={() => setLeaveOpen(true)} />
      </div>

      {leaveOpen && <LeaveInterviewDialog stage="room" pending={phase === 'finishing'} onCancel={() => setLeaveOpen(false)} onConfirm={flow.leave} />}
    </div>
  );
}
