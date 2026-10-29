'use server';

import { errorMessage } from '@/lib/client';
import { favoritesApi } from '@/lib/favorites';
import { getCurrentUser } from '@/utils/session';

const RECRUITER_ONLY = 'Please sign in as a recruiter to save candidates.';

type FavoriteActionResult = { saved?: boolean; message?: string; error?: string };

async function isRecruiter() {
  const user = await getCurrentUser().catch(() => null);
  return user?.role === 'RECRUITER';
}

export async function saveCandidateAction(candidateId: string): Promise<FavoriteActionResult> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    return await favoritesApi.save(candidateId);
  } catch (err) {
    return { error: errorMessage(err, 'Could not save candidate') };
  }
}

export async function removeCandidateAction(candidateId: string): Promise<FavoriteActionResult> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    return await favoritesApi.remove(candidateId);
  } catch (err) {
    return { error: errorMessage(err, 'Could not remove candidate') };
  }
}
