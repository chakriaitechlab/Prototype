const JOURNEY_STEPS = [
  {
    n: '01',
    title: 'Create account',
    desc: 'Sign up and set your preferences in a few minutes.',
    visual: 'account' as const,
  },
  {
    n: '02',
    title: 'Upload CV',
    desc: 'Drop your resume once. Chakri parses skills for you.',
    visual: 'cv' as const,
  },
  {
    n: '03',
    title: 'Find roles',
    desc: 'Browse AI-ranked jobs across Bangladesh and remote.',
    visual: 'jobs' as const,
  },
  {
    n: '04',
    title: 'Apply',
    desc: 'Submit tailored applications and track every reply.',
    visual: 'apply' as const,
  },
];

function JourneyStepVisual({ kind }: { kind: (typeof JOURNEY_STEPS)[number]['visual'] }) {
  if (kind === 'account') {
    return (
      <div className="jp-flow-visual jp-flow-visual--account" aria-hidden>
        <div className="jp-flow-profile">
          <span className="jp-flow-profile-av" />
          <span className="jp-flow-profile-lines">
            <i />
            <i />
          </span>
        </div>
        <div className="jp-flow-fields">
          <span />
          <span />
          <span className="is-short" />
        </div>
      </div>
    );
  }
  if (kind === 'cv') {
    return (
      <div className="jp-flow-visual jp-flow-visual--cv" aria-hidden>
        <div className="jp-flow-doc">
          <span className="jp-flow-doc-mark" />
          <span className="jp-flow-doc-lines">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="jp-flow-tags">
          <span>Figma</span>
          <span>Product</span>
          <span>Research</span>
        </div>
      </div>
    );
  }
  if (kind === 'jobs') {
    return (
      <div className="jp-flow-visual jp-flow-visual--jobs" aria-hidden>
        <article>
          <div>
            <strong />
            <em />
          </div>
          <b>94%</b>
        </article>
        <article>
          <div>
            <strong />
            <em />
          </div>
          <b>88%</b>
        </article>
        <article>
          <div>
            <strong />
            <em />
          </div>
          <b>81%</b>
        </article>
      </div>
    );
  }
  return (
    <div className="jp-flow-visual jp-flow-visual--apply" aria-hidden>
      <div className="jp-flow-apply-card">
        <span className="jp-flow-apply-av" />
        <span className="jp-flow-apply-lines">
          <i />
          <i />
        </span>
        <span className="jp-flow-apply-btn" />
      </div>
      <div className="jp-flow-apply-ok">
        <svg viewBox="0 0 20 20" width="16" height="16">
          <path
            d="M4.5 10.5l3.5 3.5 7.5-7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Submitted
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="jp-section jp-flow" aria-label="How Chakri.ai works">
      <div className="jp-container">
        <div className="jp-flow-head">
          <h2 className="jp-section-title jp-section-title--center">How Chakri.ai works</h2>
          <p className="jp-flow-sub">
            Four steps from a blank profile to a tracked application.
          </p>
        </div>

        <ol className="jp-flow-grid">
          {JOURNEY_STEPS.map((step, i) => (
            <li key={step.n} className="jp-flow-step">
              <div className="jp-flow-step-visual">
                <JourneyStepVisual kind={step.visual} />
              </div>
              <span className="jp-flow-step-n">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < JOURNEY_STEPS.length - 1 ? <span className="jp-flow-step-bridge" aria-hidden /> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
