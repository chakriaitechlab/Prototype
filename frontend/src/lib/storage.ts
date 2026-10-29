import 'server-only';
import { apiFetch } from './client';

export const storageApi = {
  avatar: (file: FormData) =>
    apiFetch<{ message: string; avatarUrl: string }>('/api/upload/avatar', { method: 'POST', body: file }),
};
