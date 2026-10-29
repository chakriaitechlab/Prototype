import { Suspense } from 'react';
import { MessengerLayout } from '@/components/dashboard/messages/MessengerLayout';
import { MessengerSkeleton } from '@/components/dashboard/messages/MessengerSkeleton';

export default function RecruiterMessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<MessengerSkeleton />}>
      <MessengerLayout role="RECRUITER">{children}</MessengerLayout>
    </Suspense>
  );
}
