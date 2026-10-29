import 'server-only';
import { apiFetch } from './client';
import type { CompanyProfile, CompanyUpdate } from '@/types/company';

export const companyApi = {
  get: () => apiFetch<CompanyProfile>('/api/company'),
  update: (body: CompanyUpdate) => apiFetch<CompanyProfile>('/api/company', { method: 'PATCH', body }),
  uploadLogo: (file: FormData) =>
    apiFetch<{ message: string; logoUrl: string }>('/api/company/logo', { method: 'POST', body: file }),
  uploadBanner: (file: FormData) =>
    apiFetch<{ message: string; bannerUrl: string }>('/api/company/banner', { method: 'POST', body: file }),
};
