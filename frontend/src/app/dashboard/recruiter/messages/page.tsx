import type { Metadata } from 'next';
import { EmptyChat } from '@/components/dashboard/messages/chat/EmptyChat';

export const metadata: Metadata = {
  title: 'Messages | Recruiter Dashboard | Chakri.ai',
};

export default function RecruiterMessagesPage() {
  return <EmptyChat />;
}
