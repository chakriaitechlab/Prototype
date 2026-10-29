'use client';

import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { removeCandidateAction } from '@/actions/favorites.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import { Pagination } from '@/components/ui/Pagination';
import type { FavoriteItem } from '@/types/favorites';
import { FavoriteCard } from './FavoriteCard';
import { FavoriteRow } from './FavoriteRow';
import { FavoritesEmpty } from './FavoritesEmpty';
import { FavoritesToolbar, type FavoritesSort, type FavoritesViewMode } from './FavoritesToolbar';
import { RemoveFavoriteModal } from './RemoveFavoriteModal';

const PER_PAGE = 9;

function sortItems(items: FavoriteItem[], sortBy: FavoritesSort) {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name_asc':
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      case 'name_desc':
        return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}

export function FavoritesView({ items }: { items: FavoriteItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<FavoritesSort>('newest');
  const [viewMode, setViewMode] = useState<FavoritesViewMode>('grid');
  const [page, setPage] = useState(1);
  const [toRemove, setToRemove] = useState<FavoriteItem | null>(null);
  const [isRemoving, startTransition] = useTransition();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string; trigger: number } | null>(null);

  const query = useDeferredValue(search.trim().toLowerCase());

  const filtered = useMemo(() => {
    const matches = query
      ? items.filter((item) => `${item.name} ${item.title}`.toLowerCase().includes(query))
      : items;
    return sortItems(matches, sortBy);
  }, [items, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRemove = () => {
    if (!toRemove) return;
    const { candidateId } = toRemove;

    startTransition(async () => {
      const result = await removeCandidateAction(candidateId);
      setToRemove(null);

      if (result.error) {
        setAlert({ type: 'error', message: result.error, trigger: Date.now() });
        return;
      }
      setAlert({ type: 'success', message: result.message ?? 'Removed from saved candidates', trigger: Date.now() });
      router.refresh();
    });
  };

  const removingId = isRemoving ? toRemove?.candidateId : undefined;

  return (
    <>
      <FavoritesToolbar
        search={search}
        onSearchChange={handleSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {items.length === 0 ? (
        <FavoritesEmpty />
      ) : filtered.length === 0 ? (
        <FavoritesEmpty query={search} onReset={() => handleSearch('')} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              removing={removingId === item.candidateId}
              onRemove={() => setToRemove(item)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {pageItems.map((item) => (
            <FavoriteRow
              key={item.id}
              item={item}
              removing={removingId === item.candidateId}
              onRemove={() => setToRemove(item)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          label="Saved candidates pagination"
        />
      </div>

      {toRemove && (
        <RemoveFavoriteModal
          name={toRemove.name}
          removing={isRemoving}
          onConfirm={handleRemove}
          onClose={() => setToRemove(null)}
        />
      )}

      <FormAlert message={alert?.message} type={alert?.type} trigger={alert?.trigger} />
    </>
  );
}
