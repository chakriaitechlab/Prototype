'use client';

import { createContext, Fragment, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import type { LearnChat } from '@/types/learn';
import { LEARN_PATH, sortChats } from '@/utils/learn';
import { ChatList } from './sidebar/ChatList';

interface LearnContextValue {
  chats: LearnChat[];
  upsert: (chat: LearnChat) => void;
  patch: (id: string, changes: Partial<LearnChat>) => void;
  remove: (id: string) => void;
  startNewChat: () => void;
  closeSidebar: () => void;
  hideSidebar: () => void;
}

const MOBILE_QUERY = '(max-width: 767px)';

const LearnContext = createContext<LearnContextValue | null>(null);

export function useLearn() {
  const value = useContext(LearnContext);
  if (!value) throw new Error('useLearn must be used inside LearnShell');
  return value;
}

interface LearnShellProps {
  initialChats: LearnChat[] | null;
  children: React.ReactNode;
}

export function LearnShell({ initialChats, children }: LearnShellProps) {
  const router = useRouter();
  const [chats, setChats] = useState<LearnChat[]>(initialChats ?? []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const upsert = useCallback((chat: LearnChat) => {
    setChats((items) => sortChats([chat, ...items.filter((item) => item.id !== chat.id)]));
  }, []);

  const patch = useCallback((id: string, changes: Partial<LearnChat>) => {
    setChats((items) => sortChats(items.map((item) => (item.id === id ? { ...item, ...changes } : item))));
  }, []);

  const remove = useCallback((id: string) => {
    setChats((items) => items.filter((item) => item.id !== id));
  }, []);

  const closeSidebar = useCallback(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) setSidebarOpen(false);
  }, []);

  const hideSidebar = useCallback(() => setSidebarOpen(false), []);

  const startNewChat = useCallback(() => {
    closeSidebar();
    setResetKey((key) => key + 1);
    router.push(LEARN_PATH);
  }, [router, closeSidebar]);

  const value = useMemo(
    () => ({ chats, upsert, patch, remove, startNewChat, closeSidebar, hideSidebar }),
    [chats, upsert, patch, remove, startNewChat, closeSidebar, hideSidebar],
  );

  const sidebarClass = `learning-shell__sidebar ${sidebarOpen ? 'is-open' : 'is-collapsed'}`;

  return (
    <LearnContext.Provider value={value}>
      <div className="messenger-page learn-runtime-root flex h-full min-h-0 w-full flex-col" data-theme="light">
        <div className="learning-shell">
          {sidebarOpen && <div className="learning-shell__backdrop" onClick={hideSidebar} />}

          <div className={sidebarClass}>
            <ChatList loadFailed={!initialChats} />
          </div>

          {!sidebarOpen && (
            <button
              type="button"
              className="learning-shell__floating-toggle learning-shell__chats-toggle touch-target"
              aria-label="Open chats"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={17} />
              <span className="learning-shell__chats-toggle-label">Chats</span>
            </button>
          )}

          <Fragment key={resetKey}>{children}</Fragment>
        </div>
      </div>
    </LearnContext.Provider>
  );
}
