import { Suspense } from 'react';
import type { Metadata } from 'next';
import { requireDashboard } from '@/utils/session';
import { cvApi } from '@/lib/cv';
import { CvView } from '@/components/dashboard/seeker/cv/CvView';
import { AppLoader } from '@/components/ui/AppLoader';
import type { BuiltCvProfile } from '@/types/cv';

export const metadata: Metadata = {
  title: 'CV Generator | Chakri.ai',
  description: 'Build, edit, and download your professional ATS-friendly resume and CV.',
};

function CvSkeleton() {
  return (
    <div className="cv-gen-loading">
      <AppLoader />
      <span className="text-sm text-gray-500">Loading your profile…</span>
    </div>
  );
}

async function CvLoader() {
  await requireDashboard('SEEKER');
  const cvResponse = await cvApi.get().catch(() => null);
  const initialProfile = (cvResponse?.parsed_data as BuiltCvProfile | undefined) ?? null;

  return <CvView initialProfile={initialProfile} />;
}

export default function SeekerCvPage() {
  return (
    <Suspense fallback={<CvSkeleton />}>
      <CvLoader />
    </Suspense>
  );
}
