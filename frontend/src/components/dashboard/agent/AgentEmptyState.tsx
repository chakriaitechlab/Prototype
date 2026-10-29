import { Bot } from 'lucide-react';

const DESCRIPTIONS = {
  SEEKER: 'Chat with Chakri AI, or give it a task. It searches the web and works in its own browser, and you can watch it live.',
  RECRUITER: 'Ask about your job posts, find candidates, or give it a task on the web. It works in its own browser, and you can watch it live.',
} as const;

export function AgentEmptyState({ role }: { role: keyof typeof DESCRIPTIONS }) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7f0fa] text-[#0a65cc]">
        <Bot size={28} />
      </span>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#18191c] sm:text-[28px]">What should I do for you?</h1>
      <p className="max-w-md text-sm leading-6 text-[#767f8c]">
        {DESCRIPTIONS[role]}
      </p>
    </div>
  );
}
