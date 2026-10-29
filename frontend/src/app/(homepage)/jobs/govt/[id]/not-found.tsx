import Link from 'next/link';
import { AlertTriangle, ChevronLeft } from 'lucide-react';

export default function GovtJobNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc] p-8 [font-family:var(--font-bengali),'Noto_Sans_Bengali',Inter,sans-serif]">
      <div className="max-w-[500px] rounded-2xl border border-[#e2e8f0] bg-white px-8 py-12 text-center shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="mx-auto mb-5 grid size-[60px] place-items-center rounded-full bg-[#fee2e2] text-[#dc2626]">
          <AlertTriangle size={30} />
        </div>
        <h1 className="mb-3 text-xl font-bold text-[#0f172a]">বিজ্ঞপ্তির তথ্য পাওয়া যায়নি</h1>
        <p className="mb-6 text-[0.95rem] leading-relaxed text-[#64748b]">
          বিজ্ঞপ্তিটি অপসারণ করা হয়েছে অথবা দেয়া লিংকে কোনো সরকারি চাকরি বিদ্যমান নেই।
        </p>
        <Link
          href="/jobs?type=govt"
          className="inline-flex items-center gap-2 rounded-lg bg-[#16a34a] px-5 py-2.5 font-semibold !text-white no-underline"
        >
          <ChevronLeft size={18} /> সকল সরকারি চাকরিতে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
