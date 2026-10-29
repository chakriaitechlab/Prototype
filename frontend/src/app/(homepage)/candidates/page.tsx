import type { Metadata } from 'next';
import { CandidatesView } from '@/components/homepage/candidates/CandidatesView';

export const metadata: Metadata = {
  title: 'For Candidates — AI Career Copilot | Chakri.ai',
  description:
    'Chakri.ai tailors your CV for every role, applies smartly on your behalf, and preps you for interviews — across Dhaka and remote opportunities.',
};

export default function CandidatesPage() {
  return <CandidatesView />;
}
