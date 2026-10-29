import { DiamondBalance } from '@/components/dashboard/DiamondBalance';
import type { DiamondPlan, DiamondWallet, PlanAudience } from '@/types/diamonds';
import type { PaymentRecord } from '@/types/payments';
import { CreditsHeader } from './CreditsHeader';
import { PaymentHistory } from './PaymentHistory';
import { PaymentResultAlert } from './PaymentResultAlert';
import { PlansSection } from './PlansSection';

interface CreditsViewProps {
  audience: PlanAudience;
  wallet: DiamondWallet;
  plans: DiamondPlan[];
  payments: PaymentRecord[];
}

export function CreditsView({ audience, wallet, plans, payments }: CreditsViewProps) {
  return (
    <div className="cdash-content max-w-6xl mx-auto space-y-10 pb-16">
      <PaymentResultAlert />

      <CreditsHeader
        title="Plans and pricing"
        description="Diamonds power AI on Chakri.ai. Your plan refills them every month."
      />

      <DiamondBalance wallet={wallet} />

      <PlansSection audience={audience} plans={plans} currentPlanId={wallet.planId} />

      <PaymentHistory payments={payments} plans={plans} />
    </div>
  );
}
