import { AlertCircle, BadgeCheck } from 'lucide-react';

export function AccountStatusPill({ verified }: { verified: boolean }) {
  return verified ? (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-[#edf5fd] px-2 py-0.5 text-[11px] font-semibold text-[#0a65cc]"
      title="Verified"
    >
      <BadgeCheck className="h-3.5 w-3.5 shrink-0" fill="#0a65cc" stroke="#ffffff" strokeWidth={2.2} />
      Verified
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-semibold text-[#dc2626]"
      title="Unverified"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#dc2626]" />
      Unverified
    </span>
  );
}
