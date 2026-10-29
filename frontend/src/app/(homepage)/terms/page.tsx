import type { Metadata } from 'next';
import { TermsView } from '@/components/homepage/terms/TermsView';

export const metadata: Metadata = {
  title: 'Terms of Service | Chakri.ai',
  description:
    'Read the Terms of Service for Chakri.ai covering candidates, employers, AI assistance, credits, and platform guidelines in Bangladesh.',
};

export default function TermsPage() {
  return <TermsView />;
}
