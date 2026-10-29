'use server';

import { errorMessage } from '@/lib/client';
import { companyApi } from '@/lib/company';
import { getCurrentUser } from '@/utils/session';
import type { CompanyMediaState, CompanyUpdate, SaveCompanyState } from '@/types/company';

const RECRUITER_ONLY = 'Please sign in as a recruiter to manage your company profile.';

async function isRecruiter() {
  const user = await getCurrentUser().catch(() => null);
  return user?.role === 'RECRUITER';
}

const hasFile = (formData: FormData) => formData.get('file') instanceof File;

export async function saveCompanyAction(patch: CompanyUpdate): Promise<SaveCompanyState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    return { company: await companyApi.update(patch), message: 'Company profile saved' };
  } catch (err) {
    return { error: errorMessage(err, 'Could not save company profile.') };
  }
}

export async function uploadCompanyLogoAction(formData: FormData): Promise<CompanyMediaState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };
  if (!hasFile(formData)) return { error: 'Please choose an image.' };

  try {
    const { logoUrl, message } = await companyApi.uploadLogo(formData);
    return { url: logoUrl, message };
  } catch (err) {
    return { error: errorMessage(err, 'Could not upload logo.') };
  }
}

export async function uploadCompanyBannerAction(formData: FormData): Promise<CompanyMediaState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };
  if (!hasFile(formData)) return { error: 'Please choose an image.' };

  try {
    const { bannerUrl, message } = await companyApi.uploadBanner(formData);
    return { url: bannerUrl, message };
  } catch (err) {
    return { error: errorMessage(err, 'Could not upload cover photo.') };
  }
}
