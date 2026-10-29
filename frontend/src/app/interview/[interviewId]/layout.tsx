import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Interview | Chakri.ai',
  robots: { index: false, follow: false },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <div className="jp min-h-dvh bg-[#f8fafc] text-[#18191c]">{children}</div>;
}
