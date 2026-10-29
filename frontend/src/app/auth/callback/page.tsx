import type { Metadata } from 'next';
import { OAuthCallback } from '@/components/auth/callback/OAuthCallback';

export const metadata: Metadata = {
  title: 'Signing In | Chakri.ai',
};

export default function AuthCallbackPage() {
  return <OAuthCallback />;
}
