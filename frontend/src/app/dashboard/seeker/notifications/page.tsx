import type { Metadata } from 'next';
import { DashboardNotFound } from '@/components/ui/DashboardNotFound';

export const metadata: Metadata = {
  title: 'Notifications | Seeker Dashboard | Chakri.ai',
};

export default function SeekerNotificationsPage() {
  return <DashboardNotFound />;
}
