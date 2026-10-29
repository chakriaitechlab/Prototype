import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChatRoute } from '@/components/dashboard/messages/chat/ChatRoute';
import { ChatSkeleton } from '@/components/dashboard/messages/chat/ChatSkeleton';

export const metadata: Metadata = {
  title: 'Chat | Messages | Seeker Dashboard | Chakri.ai',
};

export default function SeekerChatPage({ params }: { params: Promise<{ handle: string }> }) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatRoute role="SEEKER" params={params} />
    </Suspense>
  );
}
