'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, Clock, Eye, Landmark, MapPin, Users } from 'lucide-react';
import type { GovtJobItem } from '@/types/jobs';
import { deadlineStatus, formatBanglaDate, toBengaliNumber } from '@/utils/bengali';
import { govtJobDetailPath } from '@/utils/routes';
import { SaveJobButton } from './SaveJobButton';

const DEADLINE_BADGE = { expired: 'jp-badge--contract', soon: 'jp-badge--part', open: 'jp-badge--intern' } as const;

function formatViewCount(views: number) {
  if (views >= 1000) return `${toBengaliNumber((views / 1000).toFixed(1).replace(/\.0$/, ''))}k ভিউ`;
  return `${toBengaliNumber(views)} ভিউ`;
}

function vacancyLabel({ vacancy, vacancyNotSpecific }: GovtJobItem) {
  if (vacancy) return `${toBengaliNumber(vacancy)} জন`;
  return vacancyNotSpecific ? 'পদ নির্দিষ্ট নয়' : 'পদসংখ্যা প্রযোজ্য';
}

type GovtJobCardProps = {
  job: GovtJobItem;
  now: number;
  seekerTools?: boolean;
};

export function GovtJobCard({ job, now, seekerTools = false }: GovtJobCardProps) {
  const [logoError, setLogoError] = useState(false);
  const deadline = deadlineStatus(job.deadlineDate, now);

  const titleBn = job.titleBn.trim();
  const titleEn = job.title.trim();
  const showBothTitles = Boolean(titleBn && titleEn && titleBn.toLowerCase() !== titleEn.toLowerCase());

  const orgName = job.organizationNameBn || job.organizationName || 'সরকারি প্রতিষ্ঠান';
  const orgShort = job.organizationShortName.trim();
  const orgDisplay = orgShort && !orgName.includes(orgShort) ? `${orgName} (${orgShort})` : orgName;
  const detailHref = govtJobDetailPath(job.id);

  return (
    <article className="jp-fcard jp-govt-card">
      <div className="jp-govt-card-head">
        <div className="jp-govt-card-logo" aria-hidden>
          {job.organizationLogo && !logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.organizationLogo} alt="" onError={() => setLogoError(true)} loading="lazy" />
          ) : (
            <div className="jp-govt-card-logo-fallback">
              <Landmark size={20} />
            </div>
          )}
        </div>

        <div className="jp-govt-card-body">
          <h3 className="jp-govt-card-title">
            <Link href={detailHref} title={titleBn || titleEn} className="hover:text-primary transition-colors">
              {titleBn || titleEn}
              {showBothTitles && <span className="jp-govt-card-title-en">({titleEn})</span>}
            </Link>
          </h3>

          <div className="jp-govt-card-org">
            <span className="jp-govt-card-org-name" title={orgDisplay}>
              {orgDisplay}
            </span>
            <span className="jp-govt-card-sep">•</span>
            <span className="jp-govt-card-location">
              <MapPin size={11} className="jp-govt-card-icon" /> বাংলাদেশ
            </span>
          </div>
        </div>
      </div>

      <div className="jp-fcard-meta">
        <span className="jp-badge jp-badge--full jp-govt-card-badge">সরকারি চাকরি</span>

        <span className="jp-badge jp-govt-card-badge jp-govt-card-badge--vacancy">
          <Users size={12} />
          {vacancyLabel(job)}
        </span>

        <span className={`jp-badge ${DEADLINE_BADGE[deadline.tone]} jp-govt-card-badge`}>
          <Clock size={12} />
          {deadline.text}
        </span>

        {job.viewCount > 0 && (
          <span
            className="jp-badge jp-govt-card-badge jp-govt-card-badge--views"
            title={`${toBengaliNumber(job.viewCount)} বার দেখা হয়েছে`}
          >
            <Eye size={12} />
            {formatViewCount(job.viewCount)}
          </span>
        )}
      </div>

      <div className="jp-govt-card-dates">
        <span className="jp-govt-card-date">
          <Calendar size={12} className="jp-govt-card-icon" />
          <span>প্রকাশ: {formatBanglaDate(job.publishedDate)}</span>
        </span>
        <span className="jp-govt-card-sep">•</span>
        <span className="jp-govt-card-date">
          <Clock size={12} className="jp-govt-card-icon" />
          <span>আবেদনের শেষ: {formatBanglaDate(job.deadlineDate)}</span>
        </span>
      </div>

      <div className={`jp-govt-card-foot${seekerTools ? ' jp-govt-card-foot--split' : ''}`}>
        {seekerTools && <SaveJobButton jobId={job.id} variant="labeled" />}
        <Link href={detailHref} className="jp-btn jp-btn--primary jp-govt-card-cta">
          <span>বিস্তারিত দেখুন</span>
          <ChevronRight size={13} />
        </Link>
      </div>
    </article>
  );
}
