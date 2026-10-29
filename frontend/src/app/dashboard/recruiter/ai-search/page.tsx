import type { Metadata } from 'next';
import { DashboardNotFound } from '@/components/ui/DashboardNotFound';

export const metadata: Metadata = {
  title: 'AI Search | Recruiter Dashboard | Chakri.ai',
};

export default function RecruiterAiSearchPage() {
  return <DashboardNotFound />;
}
