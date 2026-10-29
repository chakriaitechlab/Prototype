import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { AuthSidebar } from '@/components/auth/AuthSidebar';

export const metadata: Metadata = {
  title: 'Chakri.ai - Account Setup',
  robots: { index: false, follow: true },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-login-root">
      <div className="jp jp-auth jp-auth--light">
        <div className="jp-auth-brand-corner">
          <Link href="/" className="jp-logo">
            <Image
              src="/jobpilot/chakri-logo.png"
              alt="Chakri.ai"
              width={795}
              height={221}
              className="jp-logo-img jp-logo-img--md"
              priority
              loading="eager"
            />
          </Link>
        </div>

        <AuthSidebar />

        <div className="jp-auth-panel">
          <div className="jp-auth-panel-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
