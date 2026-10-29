'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSignupEnabled } from '@/context/signupcontext';

interface SignupLinkProps {
  label: string;
  href?: string;
  waitlistLabel?: string;
  withArrow?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function SignupLink({
  label,
  href = '/auth/signup',
  waitlistLabel = 'Join Waitlist',
  withArrow = false,
  className,
  style,
  onClick,
}: SignupLinkProps) {
  const signupEnabled = useSignupEnabled();

  return (
    <Link href={signupEnabled ? href : '/waitlist'} className={className} style={style} onClick={onClick}>
      {signupEnabled ? label : waitlistLabel}
      {withArrow && <ArrowRight size={16} aria-hidden />}
    </Link>
  );
}
