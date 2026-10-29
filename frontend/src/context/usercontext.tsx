'use client';

import { createContext, useCallback, useContext, useEffect, useState, useTransition, Suspense } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getSessionUserAction, logoutAction } from '@/actions/auth.actions';
import type { AuthUser, UserRole } from '@/types/auth';

interface UserContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SERVER_GUARDED_PREFIXES = ['/auth', '/onboarding', '/dashboard'];

function PathnameWatcher({ onChange }: { onChange: (isGuarded: boolean) => void }) {
  const pathname = usePathname();
  const isServerGuarded = SERVER_GUARDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    onChange(isServerGuarded);
  }, [isServerGuarded, onChange]);

  return null;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [isServerGuarded, setIsServerGuarded] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  const refreshUser = useCallback(async () => {
    const current = await getSessionUserAction().catch(() => null);
    setUser(current);
    setIsLoading(false);
    return current;
  }, []);

  useEffect(() => {
    if (isServerGuarded) return;

    let active = true;
    getSessionUserAction()
      .catch(() => null)
      .then((current) => {
        if (!active) return;
        setUser(current);
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isServerGuarded]);

  const logout = useCallback(() => {
    setUser(null);
    startTransition(() => logoutAction());
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isLoading,
        isAuthenticated: !isLoading && Boolean(user),
        refreshUser,
        logout,
      }}
    >
      <Suspense fallback={null}>
        <PathnameWatcher onChange={setIsServerGuarded} />
      </Suspense>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
