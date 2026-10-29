import Image from 'next/image';
import type { CSSProperties } from 'react';
import { HeroSearchForm } from './HeroSearchForm';

const HERO_CONTENT = {
  brand: 'Chakri.ai',
  title: 'Find Jobs in Bangladesh with AI',
  supporting: 'AI Advantage for Every Candidate',
  description:
    'Discover jobs and internships across Bangladesh — including Dhaka openings and remote roles — with AI matching and application tools.',
  suggestions: ['Designer', 'Programming', 'Digital Marketing', 'Video', 'Animation'],
};

const STREAM_CARDS = [
  { id: 1, y: 18, delay: 0, pick: false },
  { id: 2, y: 92, delay: 1.1, pick: true },
  { id: 3, y: 156, delay: 2.0, pick: false },
  { id: 4, y: 48, delay: 2.9, pick: false },
  { id: 5, y: 128, delay: 3.8, pick: true },
  { id: 6, y: 72, delay: 4.7, pick: false },
  { id: 7, y: 178, delay: 5.5, pick: false },
  { id: 8, y: 34, delay: 6.4, pick: true },
  { id: 9, y: 148, delay: 7.2, pick: false },
  { id: 10, y: 98, delay: 8.1, pick: false },
] as const;

const PAPER_ROWS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  top: 8 + ((i * 17) % 86),
  delay: (i * 0.45) % 9,
  duration: 9 + (i % 4),
  scale: 0.55 + (i % 5) * 0.08,
}));

export function HeroSection() {
  return (
    <section className="jp-hero jp-hero--landing border-b border-[#e4e5e8]">
      <div className="jp-hero-atmosphere" aria-hidden>
        <span className="jp-hero-blob jp-hero-blob--a" />
        <span className="jp-hero-blob jp-hero-blob--b" />
      </div>

      <div className="jp-container jp-hero-stage">
        {/* Left Visual Stream Figure */}
        <div className="jp-hero-figure">
          <div className="jp-hero-cvstream" aria-hidden>
            <div className="jp-hero-cvstream-fade" />

            <div className="jp-hero-cvstream-papers">
              {PAPER_ROWS.map((p) => (
                <span
                  key={p.id}
                  className="jp-cv-paper"
                  style={
                    {
                      '--top': `${p.top}%`,
                      '--delay': `${p.delay}s`,
                      '--dur': `${p.duration}s`,
                      '--scale': p.scale,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            <div className="jp-hero-cvstream-lane">
              <div className="jp-hero-cvstream-beam" />
              {STREAM_CARDS.map((card) => (
                <article
                  key={card.id}
                  className={`jp-cv${card.pick ? ' is-pick' : ' is-pass'}`}
                  style={
                    {
                      '--y': `${card.y}px`,
                      '--delay': `${card.delay}s`,
                    } as CSSProperties
                  }
                >
                  <span className="jp-cv-avatar">
                    <Image
                      src="/jobpilot/undraw_shy-guy-avatar_094a.svg"
                      alt=""
                      width={32}
                      height={32}
                      unoptimized
                    />
                  </span>
                  <span className="jp-cv-lines">
                    <span className="jp-cv-line jp-cv-line--title" />
                    <span className="jp-cv-line" />
                    <span className="jp-cv-line jp-cv-line--short" />
                    <span className="jp-cv-line jp-cv-line--mid" />
                  </span>
                  <span className="jp-cv-check" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7.2L5.8 10L11 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </article>
              ))}
            </div>

            <div className="jp-hero-cvstream-matched">
              <span className="jp-hero-cvstream-matched-label">Matched</span>
              <div className="jp-hero-cvstream-stack">
                <span className="jp-cv-stack-card" />
                <span className="jp-cv-stack-card" />
                <span className="jp-cv-stack-card is-top" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero Content & Search Command */}
        <div className="jp-hero-copy">
          <p className="jp-hero-kicker jp-hero-reveal" style={{ '--d': '40ms' } as CSSProperties}>
            {HERO_CONTENT.supporting}
          </p>

          <h1 className="jp-hero-title jp-hero-reveal" style={{ '--d': '90ms' } as CSSProperties}>
            Find Jobs in Bangladesh with{' '}
            <span className="jp-hero-title-accent">AI</span>
          </h1>

          <p className="jp-hero-lead jp-hero-reveal" style={{ '--d': '160ms' } as CSSProperties}>
            {HERO_CONTENT.description}
          </p>

          <HeroSearchForm />
        </div>
      </div>
    </section>
  );
}
