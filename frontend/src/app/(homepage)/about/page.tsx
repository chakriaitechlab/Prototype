import type { Metadata } from 'next';
import { AboutView } from '@/components/homepage/about/AboutView';

export const metadata: Metadata = {
  title: 'About Us | Chakri.ai - AI-Powered Recruitment Platform',
  description:
    "Bangladesh's first AI-powered hiring platform — smart candidate matching, automated resume screening, and data-driven recruitment.",
};

export default function AboutPage() {
  return <AboutView />;
}
