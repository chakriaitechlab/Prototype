import type { Metadata } from 'next';
import { DashboardNotFound } from '@/components/ui/DashboardNotFound';

export const metadata: Metadata = {
  title: 'Notifications | Recruiter Dashboard | Chakri.ai',
};

export default function RecruiterNotificationsPage() {
  return <DashboardNotFound />;
}
