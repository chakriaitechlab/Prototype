import { DiamondBalance } from '@/components/dashboard/DiamondBalance';
import { CreditsHeader } from '@/components/dashboard/credits/CreditsHeader';
import type { DiamondActivity, DiamondWallet } from '@/types/diamonds';
import { UsageHistory } from './UsageHistory';

export function UsageView({ wallet, activity }: { wallet: DiamondWallet; activity: DiamondActivity[] }) {
  return (
    <div className="cdash-content max-w-6xl mx-auto space-y-10 pb-16">
      <CreditsHeader title="Usage" description="Your diamond balance and where your diamonds came from." />
      <DiamondBalance wallet={wallet} />
      <UsageHistory activity={activity} />
    </div>
  );
}
