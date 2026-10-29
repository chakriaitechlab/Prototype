'use server';

import { updateTag } from 'next/cache';
import { errorMessage } from '@/lib/client';
import { profileApi } from '@/lib/profile';
import { storageApi } from '@/lib/storage';
import { getCurrentUser } from '@/utils/session';
import { publicProfileTag } from '@/utils/public-profile';
import type { ActionState } from '@/types/auth';
import type { ProfileUpdate, ProjectPhotoState, ResumeState, SaveProfileState } from '@/types/profile';

const SESSION_EXPIRED = 'Your session has expired. Please sign in again.';

const getSeeker = async () => {
  const user = await getCurrentUser().catch(() => null);
  return user?.role === 'SEEKER' ? user : null;
};

const isSeeker = async () => Boolean(await getSeeker());

const refreshPublicProfile = (username: string | null) => {
  if (username) updateTag(publicProfileTag(username));
};

const hasFile = (formData: FormData) => formData.get('file') instanceof File;

export async function saveProfileAction(patch: ProfileUpdate): Promise<SaveProfileState> {
  const user = await getSeeker();
  if (!user) return { error: SESSION_EXPIRED };

  try {
    const profile = await profileApi.update(patch);
    refreshPublicProfile(user.username);
    return { profile, message: 'Profile saved' };
  } catch (err) {
    return { error: errorMessage(err, 'Could not save profile.') };
  }
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionState> {
  const user = await getSeeker();
  if (!user) return { error: SESSION_EXPIRED };
  if (!hasFile(formData)) return { error: 'Please choose an image.' };

  try {
    await storageApi.avatar(formData);
    refreshPublicProfile(user.username);
    return { message: 'Photo updated' };
  } catch (err) {
    return { error: errorMessage(err, 'Could not upload photo.') };
  }
}

export async function uploadResumeAction(formData: FormData): Promise<ResumeState> {
  if (!(await isSeeker())) return { error: SESSION_EXPIRED };
  if (!hasFile(formData)) return { error: 'Please choose a resume file.' };

  try {
    const { cvUrl } = await profileApi.uploadResume(formData);
    return { cvUrl, message: 'Resume uploaded' };
  } catch (err) {
    return { error: errorMessage(err, 'Could not upload resume.') };
  }
}

export async function deleteResumeAction(): Promise<ResumeState> {
  if (!(await isSeeker())) return { error: SESSION_EXPIRED };

  try {
    const { cvUrl } = await profileApi.deleteResume();
    return { cvUrl, message: 'Resume removed' };
  } catch (err) {
    return { error: errorMessage(err, 'Could not remove resume.') };
  }
}

export async function uploadProjectPhotoAction(formData: FormData): Promise<ProjectPhotoState> {
  if (!(await isSeeker())) return { error: SESSION_EXPIRED };
  if (!hasFile(formData)) return { error: 'Please choose an image.' };

  try {
    const { url } = await profileApi.uploadProjectPhoto(formData);
    return { url, message: 'Project photo uploaded' };
  } catch (err) {
    return { error: errorMessage(err, 'Could not upload project photo.') };
  }
}
