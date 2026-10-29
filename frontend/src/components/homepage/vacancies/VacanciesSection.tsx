import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { PrivateJobItem } from '@/types/jobs';
import { vacancyCounts } from '@/utils/homepage';

const VACANCY_ILLUSTRATIONS: Record<string, string> = {
  code: '/jobpilot/undraw_programmer_raqr.svg',
  palette: '/jobpilot/undraw_order-food_c92i.svg',
  megaphone: '/jobpilot/undraw_online-ad_703t.svg',
  chart: '/jobpilot/undraw_searching_pqji.svg',
  layers: '/jobpilot/undraw_file-manager_yics.svg',
  pen: '/jobpilot/undraw_markdown-file_io4x.svg',
  headset: '/jobpilot/undraw_plug-in_hy0z.svg',
  users: '/jobpilot/undraw_resume_jrgi.svg',
  trending: '/jobpilot/undraw_agreement_ftet.svg',
  calculator: '/jobpilot/undraw_budgeting_klon.svg',
  'pen-tool': '/jobpilot/undraw_designer_efwz.svg',
  bug: '/jobpilot/undraw_buggy-code_qtah.svg',
};

const TILE_TONES = [
  { bg: 'linear-gradient(160deg, #FFEADB 0%, #FFF5EE 100%)', accent: '#E8752E' },
  { bg: 'linear-gradient(160deg, #DDF3E8 0%, #EFFAF4 100%)', accent: '#1B9A67' },
  { bg: 'linear-gradient(160deg, #EAE3FC 0%, #F5F1FE 100%)', accent: '#7457E0' },
  { bg: 'linear-gradient(160deg, #DCEAFE 0%, #EFF6FF 100%)', accent: '#0A65CC' },
  { bg: 'linear-gradient(160deg, #FBE1EC 0%, #FDF0F5 100%)', accent: '#D74E88' },
  { bg: 'linear-gradient(160deg, #E9ECF1 0%, #F5F6F8 100%)', accent: '#495566' },
] as const;

const JP_VACANCIES = [
  { title: 'Software Developer', icon: 'code', href: '/jobs?q=Developer' },
  { title: 'UI/UX Designer', icon: 'palette', href: '/jobs?q=Designer' },
  { title: 'Digital Marketer', icon: 'megaphone', href: '/jobs?q=Marketing' },
  { title: 'Data Analyst', icon: 'chart', href: '/jobs?q=Data%20Analyst' },
  { title: 'Product Manager', icon: 'layers', href: '/jobs?q=Product%20Manager' },
  { title: 'Content Writer', icon: 'pen', href: '/jobs?q=Content%20Writer' },
  { title: 'Customer Support', icon: 'headset', href: '/jobs?q=Customer%20Support' },
  { title: 'HR Executive', icon: 'users', href: '/jobs?q=HR' },
  { title: 'Sales Executive', icon: 'trending', href: '/jobs?q=Sales' },
  { title: 'Accountant', icon: 'calculator', href: '/jobs?q=Accountant' },
  { title: 'Graphic Designer', icon: 'pen-tool', href: '/jobs?q=Graphic%20Designer' },
  { title: 'QA Engineer', icon: 'bug', href: '/jobs?q=QA' },
];

export function VacanciesSection({ jobs }: { jobs: PrivateJobItem[] }) {
  const counts = vacancyCounts(
    jobs,
    JP_VACANCIES.map((item) => item.title),
  );

  return (
    <section className="jp-vacancies-band is-inview" aria-labelledby="jp-vacancies-title">
      <div className="jp-container">
        <div className="jp-vacancies-bar">
          <div className="jp-vacancies-copy">
            <p className="jp-vacancies-kicker">Trending now</p>
            <h2 id="jp-vacancies-title" className="jp-vacancies-title">
              Most Popular Vacancies
            </h2>
            <p className="jp-vacancies-lead">Roles people search most right now.</p>
          </div>
          <Link href="/jobs" className="jp-btn jp-btn--primary jp-vacancies-cta">
            Browse all jobs <ArrowUpRight size={16} className="jp-vacancies-cta-arrow" aria-hidden />
          </Link>
        </div>

        <div className="jp-vacancy-board">
          {JP_VACANCIES.map((item, index) => {
            const illustration = VACANCY_ILLUSTRATIONS[item.icon] || '/jobpilot/undraw_searching_pqji.svg';
            const hot = index < 3;
            const tone = TILE_TONES[index % TILE_TONES.length];
            const liveCount = counts[index];

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`jp-vacancy-tile${hot ? ' is-hot' : ''}`}
                style={
                  {
                    '--i': index,
                    '--tone-bg': tone.bg,
                    '--tone-accent': tone.accent,
                  } as CSSProperties
                }
              >
                <span className="jp-vacancy-tile-color">
                  <span className="jp-vacancy-tile-top">
                    <span className="jp-vacancy-tile-pill">
                      {liveCount > 0 ? `${liveCount.toLocaleString()} roles` : 'Browse roles'}
                    </span>
                    <span className="jp-vacancy-tile-art" aria-hidden>
                      <Image src={illustration} alt="" width={120} height={90} unoptimized />
                    </span>
                  </span>

                  <span className="jp-vacancy-tile-title">{item.title}</span>
                </span>

                <span className="jp-vacancy-tile-bottom">
                  <span className="jp-vacancy-tile-hint">Explore openings</span>
                  <span className="jp-vacancy-tile-actions">
                    {hot ? (
                      <span className="jp-vacancy-tile-demand">
                        <span className="jp-vacancy-tile-demand-shine" aria-hidden />
                        High demand
                      </span>
                    ) : null}
                    <span className="jp-vacancy-tile-arrow" aria-hidden>
                      <ArrowRight size={16} strokeWidth={2.25} />
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
