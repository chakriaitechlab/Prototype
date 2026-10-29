import type { Metadata } from 'next';
import { ChatWindow } from '@/components/dashboard/seeker/learn/chat/ChatWindow';

export const metadata: Metadata = {
  title: 'Learning Chat | Seeker Dashboard | Chakri.ai',
};

export default function SeekerLearnPage() {
  return <ChatWindow initialChat={null} />;
}
