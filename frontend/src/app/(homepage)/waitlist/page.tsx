import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WaitlistForm } from '@/components/homepage/waitlist/WaitlistForm';
import { authApi } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Join the Waitlist | Chakri.ai',
  description:
    'Signup for Chakri.ai is opening soon. Join the waitlist and we will email you as soon as your early access is ready.',
};

export default async function WaitlistPage() {
  const { signupEnabled } = await authApi.signupStatus();
  if (signupEnabled) redirect('/auth/signup');

  return (
    <section className="jp-section" style={{ paddingTop: '2.5rem' }}>
      <div className="jp-container" style={{ maxWidth: '36rem' }}>
        <div className="jp-filter-card">
          <h1 style={{ margin: '0 0 0.375rem', fontSize: '1.5rem', fontWeight: 500 }}>Join the waitlist</h1>
          <p style={{ margin: '0 0 1.5rem', color: 'var(--jp-gray-500)', fontSize: '0.9375rem' }}>
            Signup is closed for now while we prepare the next release. Leave your details and we will email you as
            soon as your early access is ready.
          </p>

          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
