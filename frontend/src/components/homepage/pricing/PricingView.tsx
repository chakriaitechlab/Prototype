import { Gem } from 'lucide-react';
import { SignupLink } from '@/components/homepage/SignupLink';
import { PlanCard } from '@/components/ui/PlanCard';
import type { DiamondPlan, PlanAudience } from '@/types/diamonds';
import { PLAN_PERKS, PLAN_TAGLINES } from '@/utils/diamonds';
import { AudienceToggle } from './AudienceToggle';
import { HowDiamondsWork } from './HowDiamondsWork';
import { PricingCta } from './PricingCta';
import { PricingFaq } from './PricingFaq';

interface PricingViewProps {
  seekerPlans: DiamondPlan[];
  recruiterPlans: DiamondPlan[];
}

function PlanGrid({ audience, plans }: { audience: PlanAudience; plans: DiamondPlan[] }) {
  return (
    <div className="jp-price-grid">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          tagline={PLAN_TAGLINES[audience][plan.id]}
          perks={PLAN_PERKS[audience][plan.id]}
          action={
            <SignupLink
              label={plan.id === 'free' ? 'Start free' : `Get ${plan.name}`}
              href={`/auth/signup?role=${audience}`}
              withArrow
              className={`jp-btn ${plan.popular ? 'jp-btn--primary' : 'jp-btn--soft'} jp-btn--block`}
            />
          }
        />
      ))}
    </div>
  );
}

export function PricingView({ seekerPlans, recruiterPlans }: PricingViewProps) {
  return (
    <>
      <section className="jp-section" style={{ paddingTop: '3.5rem' }}>
        <div className="jp-container">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f0fa] px-3.5 py-1.5 text-[13px] font-semibold text-[#0a65cc]">
              <Gem size={15} aria-hidden />
              Start free, 50 diamonds every month
            </span>
            <h1 className="mt-5 text-[clamp(30px,4.4vw,44px)] font-bold leading-tight tracking-tight text-slate-900">
              Pay for what your AI does, not for a seat
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-[#5e6670]">
              Every account gets free diamonds each month to power the AI tools. Upgrade when you need more.
            </p>
          </div>

          <AudienceToggle
            seeker={<PlanGrid audience="seeker" plans={seekerPlans} />}
            recruiter={<PlanGrid audience="recruiter" plans={recruiterPlans} />}
          />
        </div>
      </section>

      <HowDiamondsWork />
      <PricingFaq />
      <PricingCta />
    </>
  );
}
