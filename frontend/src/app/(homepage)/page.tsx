import { BetaNoticeBanner } from '@/components/homepage/notice/BetaNoticeBanner';
import { HeroSection } from '@/components/homepage/hero/HeroSection';
import { PlatformStatsSection } from '@/components/homepage/stats/PlatformStatsSection';
import { TopCompaniesSection } from '@/components/homepage/top-companies/TopCompaniesSection';
import { VacanciesSection } from '@/components/homepage/vacancies/VacanciesSection';
import { HowItWorksSection } from '@/components/homepage/how-it-works/HowItWorksSection';
import { PopularCategorySection } from '@/components/homepage/categories/PopularCategorySection';
import { FeaturedJobsSection } from '@/components/homepage/featured-jobs/FeaturedJobsSection';
import { CtaBannersSection } from '@/components/homepage/cta-banners/CtaBannersSection';
import { jobsApi } from '@/lib/jobs';
import { featuredJobs, hiringCompanies, homepageStats } from '@/utils/homepage';

const HOMEPAGE_JOBS_LIMIT = 100;

export default async function HomePage() {
  const { items, total } = await jobsApi.publicList({ limit: HOMEPAGE_JOBS_LIMIT });
  const companies = hiringCompanies(items);

  return (
    <>
      <BetaNoticeBanner />

      <HeroSection />

      <PlatformStatsSection stats={homepageStats(total, companies.length)} />

      <TopCompaniesSection topCompanies={companies} />

      <VacanciesSection jobs={items} />

      <HowItWorksSection />

      <PopularCategorySection />

      <FeaturedJobsSection jobs={featuredJobs(items)} />

      <CtaBannersSection />
    </>
  );
}
