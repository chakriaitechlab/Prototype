import { PlanCard } from '@/components/ui/PlanCard';
import type { DiamondPlan, DiamondPlanId, PlanAudience } from '@/types/diamonds';
import { PLAN_PERKS, PLAN_TAGLINES } from '@/utils/diamonds';
import { CheckoutButton } from './CheckoutButton';

interface PlansSectionProps {
  audience: PlanAudience;
  plans: DiamondPlan[];
  currentPlanId: DiamondPlanId;
}

export function PlansSection({ audience, plans, currentPlanId }: PlansSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Choose a plan</h2>
      <p className="mt-1 mb-7 text-sm text-slate-500">Pay with bKash, Nagad, Rocket or card through SSLCommerz.</p>

      <div className="jp-price-grid">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              tagline={PLAN_TAGLINES[audience][plan.id]}
              perks={PLAN_PERKS[audience][plan.id]}
              isCurrent={isCurrent}
              action={
                plan.id === 'free' || isCurrent ? (
                  <span className="jp-btn jp-btn--block justify-center border border-slate-200 bg-slate-100 text-slate-600 cursor-default">
                    {isCurrent ? 'Your current plan' : 'Included for free'}
                  </span>
                ) : (
                  <CheckoutButton planId={plan.id} label={`Get ${plan.name}`} primary={plan.popular} />
                )
              }
            />
          );
        })}
      </div>
    </section>
  );
}
