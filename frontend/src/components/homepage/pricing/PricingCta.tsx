import { SignupLink } from '@/components/homepage/SignupLink';

export function PricingCta() {
  return (
    <section className="jp-section pt-0!">
      <div className="jp-container">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-xl bg-[#0a65cc] p-6 text-white sm:p-10">
          <div>
            <h3 className="text-2xl font-semibold">Start with 50 free diamonds</h3>
            <p className="mt-1.5 text-white/85">Create your account and try every AI tool today.</p>
          </div>
          <SignupLink label="Create free account" withArrow className="jp-btn bg-white! text-[#0a65cc]!" />
        </div>
      </div>
    </section>
  );
}
