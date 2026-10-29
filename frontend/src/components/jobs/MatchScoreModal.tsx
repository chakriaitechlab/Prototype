'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Briefcase, CheckCircle2, GraduationCap, Lightbulb, RefreshCw, ShieldAlert, Sparkles, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getMatchExplanationAction } from '@/actions/jobs.actions';
import type { MatchExplanation } from '@/types/jobs';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 30;
const SLOW_MESSAGE = 'Match score is taking longer than expected. Please check back later.';

type Status = 'loading' | 'pending' | 'loaded' | 'error';

type MatchScoreModalProps = {
  opportunityId: string;
  onClose: () => void;
};

const noopSubscribe = () => () => {};

function scoreColor(score: number) {
  if (score >= 80) return '#059669';
  if (score >= 65) return '#0a65cc';
  if (score >= 50) return '#d97706';
  return '#e11d48';
}

function ScoreRing({ score, size = 68 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  const color = scoreColor(score);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" aria-hidden>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={5} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size * 0.28} fontWeight={800} fill={color}>
        {score}%
      </text>
    </svg>
  );
}

function Section({ icon: Icon, color, title, children }: { icon: LucideIcon; color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="flex h-[18px] w-[18px] items-center justify-center">
          <Icon size={16} color={color} />
        </span>
        <h3 className="m-0 text-[13.5px] font-bold tracking-[-0.01em] text-slate-900">{title}</h3>
      </div>
      <div className="pl-[26px] text-[13px] leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

function ListBlock({ items, icon: Icon, color }: { items: string[]; icon: LucideIcon; color: string }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-700">
          <Icon size={14} color={color} className="mt-0.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Spinner() {
  return <div className="mx-auto mb-3.5 h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#0a65cc]" />;
}

export function MatchScoreModal({ opportunityId, onClose }: MatchScoreModalProps) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<MatchExplanation | null>(null);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pollCountRef = useRef(0);

  const load = useCallback(async () => {
    const result = await getMatchExplanationAction(opportunityId);

    if ('error' in result) {
      setErrorMsg(result.error);
      setStatus('error');
      return;
    }

    if (result.data.status === 'PENDING') {
      pollCountRef.current += 1;
      if (pollCountRef.current > MAX_POLLS) {
        setErrorMsg(SLOW_MESSAGE);
        setStatus('error');
        return;
      }
      setStatus('pending');
      return;
    }

    setData(result.data.explanation);
    setScore(result.data.score);
    setStatus('loaded');
  }, [opportunityId]);

  useEffect(() => {
    if (status !== 'loading' && status !== 'pending') return;
    const timer = setTimeout(() => void load(), status === 'pending' ? POLL_INTERVAL_MS : 0);
    return () => clearTimeout(timer);
  }, [status, load]);

  const retry = () => {
    pollCountRef.current = 0;
    setStatus('loading');
  };

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [mounted]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Match score explanation"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[88dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-[#fafbfc] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a65cc]/10 text-[#0a65cc]">
              <Sparkles size={16} />
            </span>
            <h2 className="m-0 text-[15px] font-bold text-slate-900">AI Match Breakdown</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close match explanation"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {status === 'loading' && (
            <div className="py-10 text-center">
              <Spinner />
              <p className="m-0 text-[13.5px] font-medium text-slate-500">Analyzing profile and requirements…</p>
            </div>
          )}

          {status === 'pending' && (
            <div className="py-10 text-center">
              <Spinner />
              <p className="m-0 mb-1 text-sm font-semibold text-slate-900">Calculating Match Score</p>
              <p className="m-0 text-[12.5px] text-slate-500">AI matching in progress. Will update automatically.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8 text-center">
              <AlertCircle size={32} color="#f97316" className="mx-auto mb-2.5 block" />
              <p className="m-0 mb-4 text-[13.5px] text-slate-500">{errorMsg}</p>
              <button
                type="button"
                onClick={retry}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0a65cc] px-[18px] py-2 text-[13.5px] font-semibold text-white"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          )}

          {status === 'loaded' && data && (
            <div>
              <div className="mb-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                <ScoreRing score={score} />
                <div className="flex-1">
                  <div className="mb-0.5 text-[11.5px] font-bold uppercase tracking-[0.04em] text-slate-500">
                    Match Assessment
                  </div>
                  <p className="m-0 text-[13px] leading-[1.55] text-slate-700">
                    {data.summary || 'Profile evaluated against core job criteria.'}
                  </p>
                </div>
              </div>

              {data.strengths.length > 0 && (
                <Section icon={CheckCircle2} color="#059669" title="Key Strengths">
                  <ListBlock items={data.strengths} icon={CheckCircle2} color="#059669" />
                </Section>
              )}

              {data.weaknesses.length > 0 && (
                <Section icon={ShieldAlert} color="#d97706" title="Areas to Improve">
                  <ListBlock items={data.weaknesses} icon={ShieldAlert} color="#d97706" />
                </Section>
              )}

              {data.skillsMatch && (
                <Section icon={Sparkles} color="#0a65cc" title="Skills Alignment">
                  <p className="m-0">{data.skillsMatch}</p>
                </Section>
              )}

              {data.experienceMatch && (
                <Section icon={Briefcase} color="#0a65cc" title="Experience Level">
                  <p className="m-0">{data.experienceMatch}</p>
                </Section>
              )}

              {data.educationMatch && (
                <Section icon={GraduationCap} color="#0a65cc" title="Education & Qualifications">
                  <p className="m-0">{data.educationMatch}</p>
                </Section>
              )}

              {data.recommendations.length > 0 && (
                <Section icon={Lightbulb} color="#0a65cc" title="Recommendations">
                  <ListBlock items={data.recommendations} icon={Lightbulb} color="#0a65cc" />
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
