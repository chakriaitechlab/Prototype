'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

const SignupStatusContext = createContext(true);

export function SignupStatusProvider({ signupEnabled, children }: { signupEnabled: boolean; children: ReactNode }) {
  return <SignupStatusContext.Provider value={signupEnabled}>{children}</SignupStatusContext.Provider>;
}

export function useSignupEnabled(): boolean {
  return useContext(SignupStatusContext);
}
