'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, X } from 'lucide-react';
import { searchUsersAction } from '@/actions/messages.actions';
import type { ChatPeer } from '@/types/messages';
import { PeerAvatar } from '../PeerAvatar';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface UserSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

interface UserSearchResultsProps extends UserSearchProps {
  ownUsername: string | null;
  hrefFor: (peer: ChatPeer) => string;
}

type SearchState = { query: string; items: ChatPeer[]; error?: string };

export const normalizeQuery = (value: string) => value.trim().toLowerCase().replace(/^@/, '');

export function UserSearchInput({ query, onQueryChange }: UserSearchProps) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-full bg-[#f1f2f4] px-3.5 text-[#5e6670] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0a65cc]/30">
      <Search size={16} aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by username"
        aria-label="Search by username"
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#18191c] outline-none placeholder:text-[#9199a3] [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button type="button" onClick={() => onQueryChange('')} aria-label="Clear search" className="text-[#767f8c] hover:text-[#18191c]">
          <X size={16} aria-hidden />
        </button>
      )}
    </label>
  );
}

export function UserSearchResults({ query, ownUsername, hrefFor, onQueryChange }: UserSearchResultsProps) {
  const term = normalizeQuery(query);
  const [state, setState] = useState<SearchState>({ query: '', items: [] });

  useEffect(() => {
    if (term.length < MIN_QUERY_LENGTH) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await searchUsersAction(term);
      if (!cancelled) setState({ query: term, items: result.data?.items ?? [], error: result.error });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  if (term === ownUsername) {
    return (
      <p className="px-4 py-8 text-center text-sm text-[#767f8c]">
        <span className="font-semibold text-[#18191c]">@{term}</span> is your own username
      </p>
    );
  }

  if (term.length < MIN_QUERY_LENGTH) {
    return <p className="px-4 py-8 text-center text-sm text-[#767f8c]">Type at least {MIN_QUERY_LENGTH} characters of a username</p>;
  }

  if (state.query !== term) {
    return (
      <div className="flex justify-center py-8 text-[#767f8c]">
        <Loader2 size={20} className="animate-spin" aria-label="Searching" />
      </div>
    );
  }

  if (state.error) return <p className="px-4 py-8 text-center text-sm text-rose-600">{state.error}</p>;

  if (!state.items.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-[#767f8c]">
        No one found with username <span className="font-semibold text-[#18191c]">@{term}</span>
      </p>
    );
  }

  return (
    <ul className="py-1">
      {state.items.map((peer) => (
        <li key={peer.id}>
          <Link href={hrefFor(peer)} onClick={() => onQueryChange('')} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f4f5f7]">
            <PeerAvatar peer={peer} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[#18191c]">{peer.name}</span>
              <span className="block truncate text-xs text-[#767f8c]">
                {peer.username ? `@${peer.username} · ` : ''}
                {peer.subtitle}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
