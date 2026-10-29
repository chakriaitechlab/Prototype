'use client';

import { Fragment } from 'react';
import type { FrameListener } from '@/hooks/useAgentSession';
import type { AgentSessionStatus, AgentStep } from '@/types/agent';
import { AgentQuestionCard } from './AgentQuestionCard';
import { AgentToolCard } from './AgentToolCard';
import { ChatMessage } from './ChatMessage';
import { ConnectGmailButton } from './ConnectGmailButton';

const TIME_FORMAT = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

type FeedBlock =
  | { type: 'user' | 'assistant' | 'question'; step: AgentStep }
  | { type: 'activity'; steps: AgentStep[] };

function toBlocks(steps: AgentStep[]): FeedBlock[] {
  const blocks: FeedBlock[] = [];
  for (const step of steps) {
    if (step.kind === 'USER') blocks.push({ type: 'user', step });
    else if (step.kind === 'ASSISTANT') blocks.push({ type: 'assistant', step });
    else if (step.kind === 'ASK') blocks.push({ type: 'question', step });
    else {
      const last = blocks.at(-1);
      if (last?.type === 'activity') last.steps.push(step);
      else blocks.push({ type: 'activity', steps: [step] });
    }
  }
  return blocks;
}

function firstStepOf(block: FeedBlock) {
  return block.type === 'activity' ? block.steps[0] : block.step;
}

function separatorLabel(createdAt: string) {
  const date = new Date(createdAt);
  return date.toDateString() === new Date().toDateString() ? TIME_FORMAT.format(date) : DATE_TIME_FORMAT.format(date);
}

function separatorLabels(blocks: FeedBlock[]) {
  let shown: string | null = null;
  return blocks.map((block, position) => {
    if (position > 0 && block.type !== 'user') return null;
    const label = separatorLabel(firstStepOf(block).createdAt);
    if (label === shown) return null;
    shown = label;
    return label;
  });
}

interface ActivityFeedProps {
  steps: AgentStep[];
  status: AgentSessionStatus;
  draft: string;
  subscribeFrames: (listener: FrameListener) => () => void;
  onOpenBrowser: () => void;
  onAnswer: (answer: string) => Promise<boolean>;
  gmailConnected: boolean;
}

export function ActivityFeed({ steps, status, draft, subscribeFrames, onOpenBrowser, onAnswer, gmailConnected }: ActivityFeedProps) {
  const lastStep = steps.at(-1);
  const draftStep: AgentStep | null = draft
    ? { index: (lastStep?.index ?? -1) + 1, kind: 'ASSISTANT', note: draft, url: null, createdAt: lastStep?.createdAt ?? '' }
    : null;
  const blocks = toBlocks(draftStep ? [...steps, draftStep] : steps);
  const running = status === 'RUNNING';
  const lastBlock = blocks.at(-1);
  const separators = separatorLabels(blocks);
  const lastActivity = blocks.findLast((block) => block.type === 'activity');
  const currentTurn = steps.slice(steps.findLastIndex(({ kind }) => kind === 'USER') + 1);
  const needsGmail = !gmailConnected && currentTurn.some(({ data }) => data?.type === 'connect');

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, position) => {
        const isLast = position === blocks.length - 1;
        const first = firstStepOf(block);

        return (
          <Fragment key={`${block.type}-${first.index}`}>
            {separators[position] && (
              <p className="py-1 text-center text-xs text-[#9199a3]" suppressHydrationWarning>
                {separators[position]}
              </p>
            )}
            {block.type === 'activity' ? (
              <AgentToolCard
                steps={block.steps}
                active={isLast && running}
                showPreview={block === lastActivity}
                subscribeFrames={subscribeFrames}
                onOpenBrowser={onOpenBrowser}
              />
            ) : block.type === 'question' ? (
              <AgentQuestionCard
                step={block.step}
                pending={isLast && status === 'WAITING_INPUT'}
                answer={blocks[position + 1]?.type === 'user' ? firstStepOf(blocks[position + 1]).note : null}
                onAnswer={onAnswer}
              />
            ) : (
              <ChatMessage role={block.type} content={block.step.note} />
            )}
          </Fragment>
        );
      })}

      {needsGmail && <ConnectGmailButton />}

      {running && !draft && lastBlock?.type !== 'activity' && (
        <div className="flex w-fit items-center gap-1.5 rounded-full border border-[#e4e5e8] bg-white px-4 py-3.5" aria-label="Chakri AI is thinking">
          {[0, 150, 300].map((delay) => (
            <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-[#9199a3]" style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
      )}
    </div>
  );
}
