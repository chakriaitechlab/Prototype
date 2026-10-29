import type { Metadata } from 'next';
import { SettingsView } from '@/components/dashboard/settings/SettingsView';

export const metadata: Metadata = {
  title: 'Settings | Chakri.ai',
};

export default function RecruiterSettingsPage() {
  return <SettingsView role="RECRUITER" />;
}
