'use client';

import { useState } from 'react';
import { Check, Loader2, MessageCircleQuestion, ShieldCheck, X } from 'lucide-react';
import type { AgentStep } from '@/types/agent';

interface AgentQuestionCardProps {
  step: AgentStep;
  pending: boolean;
  answer: string | null;
  onAnswer: (answer: string) => Promise<boolean>;
}

export function AgentQuestionCard({ step, pending, answer, onAnswer }: AgentQuestionCardProps) {
  const [sending, setSending] = useState<string | null>(null);
  const { note, data } = step;
  const disabled = !pending || sending !== null;

  const choose = async (choice: string) => {
    setSending(choice);
    if (!(await onAnswer(choice))) setSending(null);
  };

  if (data?.type === 'approval') {
    const { title, fields, body, confirmLabel, cancelLabel } = data;
    const approved = answer !== null && answer.trim().toLowerCase() === confirmLabel.toLowerCase();
    const destructive = /trash|delete/i.test(confirmLabel);

    return (
      <div className={`w-full max-w-xl rounded-2xl border bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${pending ? 'border-[#cee0f5]' : 'border-[#e4e5e8]'}`}>
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f0fa] text-[#0a65cc]">
            <ShieldCheck size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#18191c]">{title}</p>
            <p className="text-[12px] text-[#767f8c]">{pending ? 'Waiting for your approval' : approved ? 'You approved this' : 'You declined this'}</p>
          </div>
        </div>

        <dl className="divide-y divide-[#f1f2f4] rounded-xl border border-[#f1f2f4] text-[13px]">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex gap-3 px-3.5 py-2">
              <dt className="w-16 shrink-0 text-[#9199a3]">{label}</dt>
              <dd className="min-w-0 flex-1 break-words text-[#18191c]">{value}</dd>
            </div>
          ))}
        </dl>

        {body && (
          <div className="mt-3 max-h-56 overflow-y-auto rounded-xl bg-[#f7f8f9] px-3.5 py-3 text-[13px] leading-6 whitespace-pre-wrap text-[#18191c]">{body}</div>
        )}

        {pending ? (
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => void choose(cancelLabel)}
              disabled={disabled}
              className="cursor-pointer disabled:cursor-not-allowed inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e4e5e8] px-4 text-[13px] font-medium text-[#18191c] transition-colors hover:bg-[#f7f8f9] disabled:opacity-60"
            >
              {sending === cancelLabel && <Loader2 size={14} className="animate-spin" />}
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => void choose(confirmLabel)}
              disabled={disabled}
              className={`cursor-pointer disabled:cursor-not-allowed inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-white transition-colors disabled:opacity-60 ${destructive ? 'bg-[#e05151] hover:bg-[#c94141]' : 'bg-[#0a65cc] hover:bg-[#094e9f]'}`}
            >
              {sending === confirmLabel && <Loader2 size={14} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        ) : (
          answer !== null && (
            <p className={`mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium ${approved ? 'text-[#0ba02c]' : 'text-[#767f8c]'}`}>
              {approved ? <Check size={14} /> : <X size={14} />}
              {approved ? 'Approved' : 'Declined'}
            </p>
          )
        )}
      </div>
    );
  }

  const options = data?.type === 'question' ? data.options : [];

  return (
    <div className={`w-full max-w-xl rounded-2xl border bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${pending ? 'border-[#f5c46b]' : 'border-[#e4e5e8]'}`}>
      <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#b26b00]">
        <MessageCircleQuestion size={15} />
        {pending ? 'The agent needs your input' : 'The agent asked'}
      </div>
      <p className="text-[14px] leading-6 whitespace-pre-wrap text-[#18191c]">{note}</p>

      {options.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {options.map((option) => {
            const chosen = answer === option || sending === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => void choose(option)}
                disabled={disabled}
                className={`cursor-pointer disabled:cursor-not-allowed flex items-center justify-between gap-2 rounded-xl border border-dashed px-3.5 py-2.5 text-left text-[13px] transition-colors ${chosen ? 'border-[#0a65cc] bg-[#e7f0fa] text-[#0a65cc]' : 'border-[#cfd3d8] text-[#18191c] hover:border-[#0a65cc] hover:bg-[#f7fafe]'} ${!pending && !chosen ? 'opacity-50' : ''}`}
              >
                {option}
                {sending === option ? <Loader2 size={14} className="animate-spin" /> : chosen && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}

      {pending && <p className="mt-3 text-[12px] text-[#767f8c]">{options.length ? 'Pick an answer, or type your own below.' : 'Reply below to let the agent continue.'}</p>}
    </div>
  );
}
