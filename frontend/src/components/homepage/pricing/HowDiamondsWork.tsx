import { RefreshCw, Sparkles, UserPlus } from 'lucide-react';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Sign up and get diamonds',
    body: 'Every new account starts on the free plan with 50 diamonds. No card needed.',
  },
  {
    icon: Sparkles,
    title: 'Use them for AI',
    body: 'Diamonds power the AI tools on Chakri.ai, from learning chat to the Chakri AI agent.',
  },
  {
    icon: RefreshCw,
    title: 'They refill every month',
    body: 'Your balance resets to your plan’s monthly diamonds. Upgrade any time for more.',
  },
];

export function HowDiamondsWork() {
  return (
    <section className="jp-section jp-section--muted">
      <div className="jp-container">
        <h2 className="jp-section-title jp-section-title--center">How diamonds work</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#e7f0fa] text-[#0a65cc]">
                <Icon size={22} aria-hidden />
              </div>
              <h3 className="text-[17px] font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5e6670]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
