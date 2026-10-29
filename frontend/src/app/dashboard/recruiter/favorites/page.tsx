import { Suspense } from 'react';
import type { Metadata } from 'next';
import { favoritesApi } from '@/lib/favorites';
import { RetryButton } from '@/components/dashboard/recruiter/RetryButton';
import { FavoritesHero } from '@/components/dashboard/recruiter/favorites/FavoritesHero';
import { FavoritesSkeleton } from '@/components/dashboard/recruiter/favorites/FavoritesSkeleton';
import { FavoritesView } from '@/components/dashboard/recruiter/favorites/FavoritesView';

export const metadata: Metadata = {
  title: 'Saved Candidates | Recruiter Dashboard | Chakri.ai',
  description: 'Talent and candidates bookmarked across your pipeline and searches for quick outreach.',
};

export default function RecruiterFavoritesPage() {
  return (
    <div className="recruiter-favorites-page w-full pb-10">
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesContent />
      </Suspense>
    </div>
  );
}

async function FavoritesContent() {
  const data = await favoritesApi.list().catch(() => null);

  if (!data) {
    return (
      <>
        <FavoritesHero total={0} />
        <div className="border border-rose-200 bg-white p-8 text-center text-sm text-rose-700 shadow-xs">
          <p className="mb-2 font-semibold">Couldn&apos;t load saved candidates.</p>
          <RetryButton
            label="Try again"
            className="inline-flex items-center gap-1.5 font-semibold text-[#0a65cc] hover:underline disabled:opacity-60"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <FavoritesHero total={data.total} />
      <FavoritesView items={data.items} />
    </>
  );
}
