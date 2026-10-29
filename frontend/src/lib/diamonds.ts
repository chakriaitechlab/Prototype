import 'server-only';
import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { apiFetch, publicFetch } from './client';
import type { DiamondPlans, DiamondUsage, DiamondWallet, PlanAudience } from '@/types/diamonds';

async function plans(role: PlanAudience): Promise<DiamondPlans> {
  'use cache';
  cacheTag('diamond-plans');
  cacheLife('hours');

  return publicFetch<DiamondPlans>(`/api/diamonds/plans?role=${role}`);
}

export const diamondsApi = {
  plans,

  wallet: cache((): Promise<DiamondWallet> => apiFetch('/api/diamonds/wallet')),

  usage: cache((): Promise<DiamondUsage> => apiFetch('/api/diamonds/usage')),
};
