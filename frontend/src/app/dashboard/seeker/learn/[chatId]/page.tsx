import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError } from '@/lib/client';
import { learnApi } from '@/lib/learn';
import { requireDashboard } from '@/utils/session';
import { ChatWindow } from '@/components/dashboard/seeker/learn/chat/ChatWindow';
import { ChatSkeleton } from '@/components/dashboard/seeker/learn/LearnSkeleton';

export const metadata: Metadata = {
  title: 'Learning Chat | Seeker Dashboard | Chakri.ai',
};

export default function SeekerLearnChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <LearnChatContent params={params} />
    </Suspense>
  );
}

async function LearnChatContent({ params }: { params: Promise<{ chatId: string }> }) {
  await requireDashboard('SEEKER');
  const { chatId } = await params;

  const chat = await learnApi.get(chatId).catch((err: unknown) => {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    throw err;
  });

  return <ChatWindow key={chat.id} initialChat={chat} />;
}
