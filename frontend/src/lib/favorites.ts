import 'server-only';
import { cache } from 'react';
import { apiFetch } from './client';
import type { FavoriteToggleResult, FavoritesResponse } from '@/types/favorites';

export const favoritesApi = {
  list: cache((): Promise<FavoritesResponse> => apiFetch('/api/favorites')),

  save: (candidateId: string): Promise<FavoriteToggleResult> =>
    apiFetch('/api/favorites', { method: 'POST', body: { candidateId } }),

  remove: (candidateId: string): Promise<FavoriteToggleResult> =>
    apiFetch(`/api/favorites/${encodeURIComponent(candidateId)}`, { method: 'DELETE' }),
};
