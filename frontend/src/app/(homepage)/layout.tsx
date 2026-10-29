import type { ReactNode } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { Footer } from '@/components/homepage/Footer';
import { SignupStatusProvider } from '@/context/signupcontext';
import { authApi } from '@/lib/auth';

export default async function HomepageLayout({ children }: { children: ReactNode }) {
  const { signupEnabled } = await authApi.signupStatus();

  return (
    <SignupStatusProvider signupEnabled={signupEnabled}>
      <div className="jp">
        <Navbar />
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
        <Footer />
      </div>
    </SignupStatusProvider>
  );
}
