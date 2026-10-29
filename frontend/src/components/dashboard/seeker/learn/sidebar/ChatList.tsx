'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessagesSquare, PanelLeftClose, Plus, Search, SearchX, X } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import { getPinnedChatIds, getServerPinnedChatIds, learnChatPath, subscribePinnedChats } from '@/utils/learn';
import { useLearn } from '../LearnShell';
import { ChatItem } from './ChatItem';

export function ChatList({ loadFailed }: { loadFailed: boolean }) {
  const { chats, startNewChat, hideSidebar } = useLearn();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const pinnedIds = useSyncExternalStore(subscribePinnedChats, getPinnedChatIds, getServerPinnedChatIds);
  const pathname = usePathname();
  const router = useRouter();
  const now = useNow();

  const term = query.trim().toLowerCase();
  const searching = Boolean(term);
  const visible = searching
    ? chats.filter((chat) => chat.title.toLowerCase().includes(term))
    : [...chats.filter((chat) => pinnedIds.includes(chat.id)), ...chats.filter((chat) => !pinnedIds.includes(chat.id))];

  return (
    <aside className="learning-sidebar">
      <div className="learning-panel">
        <div className="learning-panel__toolbar">
          <div className="learning-panel__search">
            <Search size={14} aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && query) {
                  event.stopPropagation();
                  setQuery('');
                }
              }}
              placeholder="Search…"
              aria-label="Search conversations"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                className="learning-sidebar__search-clear"
                onClick={() => {
                  setQuery('');
                  searchRef.current?.focus();
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button type="button" className="learning-shell__icon-btn" aria-label="Close chats" title="Close" onClick={hideSidebar}>
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="learning-panel__body">
          <button type="button" className="learning-panel__new-chat" onClick={startNewChat}>
            <Plus size={15} strokeWidth={2.25} />
            New Chat
          </button>

          <section className="learning-panel__section">
            <div className="learning-panel__section-head">
              <span>{searching ? 'Results' : 'Recents'}</span>
            </div>
            {loadFailed && !chats.length ? (
              <div className="learning-sidebar__empty">
                <span className="learning-sidebar__empty-title">Couldn&apos;t load your chats</span>
                <button type="button" className="learning-sidebar__empty-sub" onClick={() => router.refresh()}>
                  Try again
                </button>
              </div>
            ) : !visible.length && searching ? (
              <div className="learning-sidebar__empty">
                <span className="learning-sidebar__empty-icon">
                  <SearchX size={17} />
                </span>
                <span className="learning-sidebar__empty-title">No results</span>
                <span className="learning-sidebar__empty-sub">Nothing matches &ldquo;{query.trim()}&rdquo;.</span>
              </div>
            ) : !visible.length ? (
              <div className="learning-sidebar__empty">
                <span className="learning-sidebar__empty-icon">
                  <MessagesSquare size={17} />
                </span>
                <span className="learning-sidebar__empty-title">No conversations yet</span>
                <span className="learning-sidebar__empty-sub">Start a new chat and it will show up here.</span>
              </div>
            ) : (
              <div role="list">
                {visible.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    active={pathname === learnChatPath(chat.id)}
                    pinned={pinnedIds.includes(chat.id)}
                    now={now}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}
