import { Download, FileText } from 'lucide-react';
import type { GovtJobDetail } from '@/types/jobs';
import { GovtJobSection } from './GovtJobListSection';

export function GovtJobDescription({ job, paragraphs }: { job: GovtJobDetail; paragraphs: string[] }) {
  return (
    <GovtJobSection id="section-details" title="চাকরির বিবরণ">
      <div className="text-[0.95rem] leading-[1.8] text-[#334155]">
        {paragraphs.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="m-0">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="m-0">
            {job.organizationName}-এর অধীনে বিভিন্ন পদে স্থায়ী ও সরাসরি নিয়োগের লক্ষ্যে উপযুক্ত বাংলাদেশী নাগরিকদের কাছ থেকে
            অনলাইনে দরখাস্ত আহ্বান করা হচ্ছে। শিক্ষাগত যোগ্যতা, বয়সসীমা ও অন্যান্য প্রয়োজনীয় শর্তাবলি নিচে উল্লেখিত হলো।
          </p>
        )}

        {job.advertisementFile && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-[#dc2626]" />
              <div>
                <strong className="text-[0.9rem] text-[#0f172a]">মূল নিয়োগ বিজ্ঞপ্তি (Official Circular PDF)</strong>
                <span className="block text-[0.8rem] text-[#64748b]">অফিশিয়াল গেজেট ও সার্কুলার কপি</span>
              </div>
            </div>
            <a
              href={job.advertisementFile}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#cbd5e1] bg-white px-4 py-2 text-[0.85rem] font-semibold !text-[#334155] no-underline"
            >
              <Download size={14} /> PDF ডাউনলোড
            </a>
          </div>
        )}
      </div>
    </GovtJobSection>
  );
}
