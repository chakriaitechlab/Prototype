import type { GovtJobDetail } from '@/types/jobs';
import { govtJobContent } from '@/utils/govt-job-detail';
import { GovtJobApplyFooter } from './GovtJobApplyFooter';
import { GovtJobApplyProcess } from './GovtJobApplyProcess';
import { GovtJobDescription } from './GovtJobDescription';
import { GovtJobHeader } from './GovtJobHeader';
import { GovtJobListSection } from './GovtJobListSection';
import { GovtJobNotices } from './GovtJobNotices';
import { GovtJobStats } from './GovtJobStats';
import { GovtJobTabs } from './GovtJobTabs';

export function GovtJobDetailView({ job, url }: { job: GovtJobDetail; url: string }) {
  const content = govtJobContent(job);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 pb-16 pt-6 [font-family:var(--font-bengali),'Noto_Sans_Bengali',Inter,sans-serif]">
      <div className="mx-auto max-w-[1000px]">
        <GovtJobHeader job={job} url={url}>
          <GovtJobStats stats={content.stats} isExpired={job.isExpired} />
        </GovtJobHeader>

        <GovtJobTabs />

        <GovtJobNotices admitCard={job.admitCard} result={job.result} />

        <div className="rounded-2xl border border-[#e5e7eb] bg-white px-5 py-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] sm:px-9">
          <GovtJobDescription job={job} paragraphs={content.description} />
          <GovtJobListSection id="section-qualifications" title="যোগ্যতা ও অভিজ্ঞতা" items={content.qualifications} />
          <GovtJobListSection id="section-conditions" title="শর্তাবলী" items={content.conditions} />
          <GovtJobApplyProcess content={content} />
          <GovtJobListSection
            id="section-documents"
            title="প্রয়োজনীয় কাগজপত্র ও নির্দেশনা"
            items={content.documents}
            variant="checks"
          />
          <GovtJobApplyFooter
            applicationSite={content.applicationSite}
            isExpired={job.isExpired}
            publishedText={content.publishedText}
          />
        </div>
      </div>
    </div>
  );
}
