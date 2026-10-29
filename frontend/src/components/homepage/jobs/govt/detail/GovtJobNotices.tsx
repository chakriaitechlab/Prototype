import { Bell, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import type { GovtJobDetail } from '@/types/jobs';

export function GovtJobNotices({ admitCard, result }: Pick<GovtJobDetail, 'admitCard' | 'result'>) {
  if (!admitCard && !result) return null;

  return (
    <div className="mb-6 flex flex-col gap-3">
      {admitCard && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] px-5 py-4">
          <div className="flex items-center gap-3">
            <Bell size={22} className="text-[#059669]" />
            <div>
              <strong className="text-[0.95rem] text-[#065f46]">এডমিট কার্ড প্রকাশিত হয়েছে</strong>
              <p className="m-0 text-[0.85rem] text-[#047857]">এই পদের নিয়োগ পরীক্ষার প্রবেশপত্র ডাউনলোড চলছে।</p>
            </div>
          </div>
          {admitCard.url && (
            <a
              href={admitCard.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#16a34a] px-4 py-2 text-[0.85rem] font-semibold !text-white no-underline"
            >
              এডমিট ডাউনলোড <Download size={14} />
            </a>
          )}
        </div>
      )}

      {result && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-5 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-[#2563eb]" />
            <div>
              <strong className="text-[0.95rem] text-[#1e40af]">পরীক্ষার ফলাফল প্রকাশিত হয়েছে</strong>
              <p className="m-0 text-[0.85rem] text-[#1d4ed8]">নির্বাচিত প্রার্থীদের ফলাফল তালিকা প্রকাশিত হয়েছে।</p>
            </div>
          </div>
          {result.url && (
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-[0.85rem] font-semibold !text-white no-underline"
            >
              ফলাফল দেখুন <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
