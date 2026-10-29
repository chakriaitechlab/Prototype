export interface FavoriteItem {
  id: string;
  candidateId: string;
  name: string;
  title: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface FavoritesResponse {
  items: FavoriteItem[];
  total: number;
}

export interface FavoriteToggleResult {
  saved: boolean;
  message: string;
}
