import type { Metadata } from 'next';
import { PrivacyView } from '@/components/homepage/privacy/PrivacyView';

export const metadata: Metadata = {
  title: 'Privacy Policy | Chakri.ai',
  description:
    'Learn how Chakri.ai collects, uses, and protects personal data for candidates and employers across our AI job platform in Bangladesh.',
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
