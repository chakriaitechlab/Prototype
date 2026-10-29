import Link from 'next/link';
import { Gem } from 'lucide-react';
import { diamondsApi } from '@/lib/diamonds';
import type { PlanAudience } from '@/types/diamonds';
import { formatCount } from '@/utils/format';

export async function DiamondChip({ audience }: { audience: PlanAudience }) {
  const wallet = await diamondsApi.wallet().catch(() => null);
  if (!wallet) return null;

  return (
    <Link
      href={`/dashboard/${audience}/usage`}
      className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-none border border-slate-300 bg-white text-slate-800 shadow-2xs hover:border-[#0a65cc] transition-colors shrink-0"
      title="Your diamond balance"
    >
      <Gem className="w-4 h-4 text-[#0a65cc] shrink-0" aria-hidden />
      <span className="text-sm font-semibold tracking-tight">{formatCount(wallet.balance)} diamonds</span>
    </Link>
  );
}
