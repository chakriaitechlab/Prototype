'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeInterviewAction, reportViolationAction, startInterviewAction, submitAnswerAction } from '@/actions/interviews.actions';
import type { InterviewSession, InterviewTurn, Violation, ViolationType } from '@/types/interviews';
import { interviewReportPath } from '@/utils/routes';
import { useInterviewSpeech } from './useInterviewSpeech';
import { useInterviewTranscriber } from './useInterviewTranscriber';

const READY_PAUSE_MS = 1_500;
const GREETING_PAUSE_MS = 1_000;
const NEXT_SKILL_PAUSE_MS = 1_200;
const FIRST_SILENCE_MS = 10_000;
const FINAL_SILENCE_MS = 5_000;
const END_OF_SPEECH_MS = 2_000;
const VIOLATION_COOLDOWN_MS = 5_000;

export type InterviewPhase = 'starting' | 'speaking' | 'listening' | 'thinking' | 'finishing' | 'error';

interface FlowSteps {
  ask: (turn: InterviewTurn, transition: boolean) => Promise<void>;
  finalize: (skipped?: boolean) => Promise<void>;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useInterviewFlow(interview: InterviewSession) {
  const router = useRouter();
  const [phase, setPhase] = useState<InterviewPhase>('starting');
  const [turn, setTurn] = useState<InterviewTurn | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState(0);
  const [warning, setWarning] = useState<{ message: string | null; trigger: number }>({ message: null, trigger: 0 });

  const endedRef = useRef(false);
  const answeringRef = useRef(false);
  const spokeRef = useRef(false);
  const pendingAnswerRef = useRef<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastViolationRef = useRef<Partial<Record<ViolationType, number>>>({});
  const stepsRef = useRef<FlowSteps | null>(null);
  const turnRef = useRef<InterviewTurn | null>(null);
  const questionNumberRef = useRef(1);

  const speech = useInterviewSpeech(interview.id);
  const { speak, clearCaption } = speech;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const after = useCallback((ms: number, run: () => void) => {
    timersRef.current.push(setTimeout(run, ms));
  }, []);

  const onSpeech = useCallback(() => {
    if (answeringRef.current) return;
    spokeRef.current = true;
    clearTimers();
    after(END_OF_SPEECH_MS, () => void stepsRef.current?.finalize());
  }, [after, clearTimers]);

  const transcriber = useInterviewTranscriber({ interviewId: interview.id, onSpeech });
  const { start: startListening, stop: stopListening, reset: resetTranscript } = transcriber;

  const exitToReport = useCallback(async () => {
    endedRef.current = true;
    clearTimers();
    speech.stop();
    await stopListening();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    router.replace(interviewReportPath(interview.id));
  }, [clearTimers, interview.id, router, speech, stopListening]);

  const openMic = useCallback(async () => {
    setPhase('listening');
    await startListening().catch((cause: unknown) => console.warn('Live transcription could not start:', cause));
  }, [startListening]);

  const listen = useCallback(async () => {
    spokeRef.current = false;
    answeringRef.current = false;
    if (endedRef.current) return;
    await openMic();

    after(FIRST_SILENCE_MS, async () => {
      if (spokeRef.current || endedRef.current) return;
      await stopListening();
      setPhase('speaking');
      await speak('silence');
      if (endedRef.current) return;
      await openMic();
      after(FINAL_SILENCE_MS, () => {
        if (!spokeRef.current) void stepsRef.current?.finalize(true);
      });
    });
  }, [after, openMic, speak, stopListening]);

  const ask = useCallback(
    async (next: InterviewTurn, transition: boolean) => {
      const previous = turnRef.current;
      const sameSkill = next.phase === 'SKILL' && previous?.phase === 'SKILL' && previous.skill === next.skill;
      const skillChanged = next.phase === 'SKILL' && previous?.phase === 'SKILL' && previous.skill !== next.skill;
      questionNumberRef.current = sameSkill ? questionNumberRef.current + 1 : 1;
      turnRef.current = next;
      setTurn(next);
      setQuestionNumber(questionNumberRef.current);

      if (skillChanged) await pause(NEXT_SKILL_PAUSE_MS);
      if (endedRef.current) return;

      setPhase('speaking');
      if (transition) await speak('transition');
      if (endedRef.current) return;
      await speak('question');
      if (endedRef.current) return;
      await listen();
    },
    [listen, speak],
  );

  const submit = useCallback(
    async (answer: string, skipped = false) => {
      setError(null);
      const request = submitAnswerAction(interview.id, answer);
      if (skipped) {
        setPhase('speaking');
        await speak('skip');
        if (endedRef.current) return;
      }
      setPhase('thinking');
      const result = await request;
      if (endedRef.current) return;

      if ('error' in result) {
        pendingAnswerRef.current = answer;
        setError(result.error);
        setPhase('error');
        return;
      }

      pendingAnswerRef.current = null;
      if (!result.data.done) {
        await ask(result.data.turn, result.data.transition);
        return;
      }

      setPhase('finishing');
      await speak('closing');
      await completeInterviewAction(interview.id, 'finished');
      await exitToReport();
    },
    [ask, exitToReport, interview.id, speak],
  );

  const finalize = useCallback(
    async (skipped = false) => {
      if (answeringRef.current || endedRef.current) return;
      answeringRef.current = true;
      clearTimers();
      const answer = await stopListening();
      clearCaption();
      resetTranscript();
      await submit(answer, skipped);
    },
    [clearCaption, clearTimers, resetTranscript, stopListening, submit],
  );

  useEffect(() => {
    stepsRef.current = { ask, finalize };
  }, [ask, finalize]);

  useEffect(() => {
    let cancelled = false;

    void startInterviewAction(interview.id, interview.language).then(async (result) => {
      if (cancelled) return;
      if ('error' in result) {
        setError(result.error);
        setPhase('error');
        return;
      }

      await pause(READY_PAUSE_MS);
      if (cancelled || endedRef.current) return;
      if (result.data.turn.position === 0) {
        setPhase('speaking');
        await speak('greeting');
        await pause(GREETING_PAUSE_MS);
        if (cancelled || endedRef.current) return;
      }
      void stepsRef.current?.ask(result.data.turn, false);
    });

    return () => {
      cancelled = true;
    };
  }, [interview.id, interview.language, speak]);

  useEffect(() => clearTimers, [clearTimers]);

  const reportViolation = useCallback(
    (violation: Violation) => {
      if (endedRef.current) return;
      const now = Date.now();
      if (now - (lastViolationRef.current[violation.type] ?? 0) < VIOLATION_COOLDOWN_MS) return;
      lastViolationRef.current[violation.type] = now;

      void reportViolationAction(interview.id, violation.type).then((result) => {
        if ('error' in result) return;
        setWarnings(result.data.warnings);
        setWarning({ message: violation.message, trigger: now });
        if (result.data.ended) void exitToReport();
      });
    },
    [exitToReport, interview.id],
  );

  const leave = useCallback(() => {
    endedRef.current = true;
    setPhase('finishing');
    void completeInterviewAction(interview.id, 'left').then(exitToReport);
  }, [exitToReport, interview.id]);

  const retry = useCallback(() => {
    const answer = pendingAnswerRef.current;
    if (answer !== null) void submit(answer);
    else router.refresh();
  }, [router, submit]);

  return {
    phase,
    turn,
    questionNumber,
    error,
    warnings,
    warning,
    caption: speech.caption,
    speaking: speech.speaking,
    transcript: transcriber.transcript,
    reportViolation,
    leave,
    retry,
  };
}
