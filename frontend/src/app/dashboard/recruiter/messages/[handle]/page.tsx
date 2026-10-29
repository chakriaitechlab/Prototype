import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChatRoute } from '@/components/dashboard/messages/chat/ChatRoute';
import { ChatSkeleton } from '@/components/dashboard/messages/chat/ChatSkeleton';

export const metadata: Metadata = {
  title: 'Chat | Messages | Recruiter Dashboard | Chakri.ai',
};

export default function RecruiterChatPage({ params }: { params: Promise<{ handle: string }> }) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatRoute role="RECRUITER" params={params} />
    </Suspense>
  );
}
