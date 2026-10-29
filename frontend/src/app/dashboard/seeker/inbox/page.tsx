import type { Metadata } from 'next';
import { EmptyChat } from '@/components/dashboard/messages/chat/EmptyChat';

export const metadata: Metadata = {
  title: 'Messages | Seeker Dashboard | Chakri.ai',
};

export default function SeekerMessagesPage() {
  return <EmptyChat />;
}
