'use client';

import { useRef } from 'react';
import { BadgeCheck, Building2, Globe, Mail, MapPin, Phone } from 'lucide-react';
import type { AuthUser } from '@/types/auth';
import { formatPhone } from '@/utils/phone';
import { websiteHref } from '@/utils/company-profile';
import { AccountStatusPill } from '../AccountStatusPill';
import { CompanyCover } from '../CompanyCover';
import { CompanyLogo } from '../CompanyLogo';
import { FormatToolbar } from '../FormatToolbar';
import type { CompanyEditor } from '../use-company-editor';

interface CompanyInfoSectionProps {
  editor: CompanyEditor;
  user: AuthUser;
  companyName: string;
  companyUsername: string | null;
  isVerified: boolean;
  uploading: 'logo' | 'banner' | null;
  onUploadLogo: (file: File) => void;
  onUploadBanner: (file: File) => void;
  onRepositioned: () => void;
}

export function CompanyInfoSection({
  editor,
  user,
  companyName,
  companyUsername,
  isVerified,
  uploading,
  onUploadLogo,
  onUploadBanner,
  onRepositioned,
}: CompanyInfoSectionProps) {
  const { draft, patch, logoUrl, bannerUrl } = editor;
  const aboutRef = useRef<HTMLTextAreaElement>(null);
  const location = draft.mapLocation.trim() || draft.address.trim();

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-[#e4e5e8] bg-white shadow-xs">
        <CompanyCover
          bannerUrl={bannerUrl}
          position={draft.bannerPosition}
          uploading={uploading === 'banner'}
          onPositionChange={(bannerPosition) => patch({ bannerPosition })}
          onUpload={onUploadBanner}
          onRemove={() => patch({ removeBanner: true, bannerPosition: 50 })}
          onRepositioned={onRepositioned}
        />

        <div className="relative -mt-16 flex flex-col items-center px-4 pb-6 sm:-mt-20 md:-mt-24">
          <CompanyLogo logoUrl={logoUrl ?? user.avatarUrl} name={companyName} uploading={uploading === 'logo'} onUpload={onUploadLogo} />

          <div className="mx-auto mt-3.5 flex w-full max-w-2xl flex-col items-center text-center">
            <div className="relative inline-flex items-center justify-center">
              <h2 className="text-center text-2xl font-bold tracking-tight text-[#18191c] sm:text-3xl">{companyName}</h2>
              <div className="absolute left-full top-1/2 ml-2.5 flex -translate-y-1/2 items-center whitespace-nowrap">
                {isVerified ? (
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-[4px] bg-[#e7f0fa] px-2.5 py-0.5 text-xs font-semibold text-[#0a65cc]"
                    title="Verified Company"
                  >
                    <BadgeCheck className="h-4 w-4 text-[#0a65cc]" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-[4px] bg-[#f1f2f4] px-2.5 py-0.5 text-xs font-medium text-[#5e6670]">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {companyUsername && <p className="mt-0.5 text-sm font-semibold text-[#0a65cc]">@{companyUsername}</p>}

            {draft.about.trim() ? (
              <p className="mx-auto mt-2 line-clamp-2 max-w-xl text-sm text-[#5e6670]">{draft.about.trim()}</p>
            ) : (
              <p className="mt-2 text-xs italic text-slate-400">Add your company description in About Us below</p>
            )}

            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              {location && (
                <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#f1f2f4] px-2.5 py-1 text-xs font-medium text-[#474c54]">
                  <MapPin className="h-3.5 w-3.5 text-[#5e6670]" />
                  {location}
                </span>
              )}
              {draft.organizationType && (
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#f1f2f4] px-2.5 py-1 text-xs font-medium text-[#474c54]">
                  <Building2 className="h-3.5 w-3.5 text-[#5e6670]" />
                  {draft.organizationType}
                </span>
              )}
              {draft.industry && (
                <span className="inline-flex items-center rounded-[4px] bg-[#e7f0fa] px-2.5 py-1 text-xs font-semibold text-[#0a65cc]">
                  {draft.industry}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[#5e6670]">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#767f8c]" />
                <span>{user.email}</span>
                <AccountStatusPill verified={user.emailVerified} />
              </span>
              {user.phoneNumber && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#767f8c]" />
                  <span>{formatPhone(user.phoneNumber)}</span>
                  <AccountStatusPill verified={user.phoneVerified} />
                </span>
              )}
              {draft.website && (
                <a
                  href={websiteHref(draft.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[#0a65cc] hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {draft.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="cset-section">
        <h3 className="cset-section-title">Basic Information</h3>
        <div className="mt-4 mb-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="cset-label" htmlFor="company-name">Company Name</label>
            <input id="company-name" className="cset-input" value={companyName} disabled />
          </div>

          <div>
            <label className="cset-label" htmlFor="company-username">Username</label>
            <input id="company-username" className="cset-input" value={companyUsername ?? ''} placeholder="Not set" disabled />
            {companyUsername && (
              <p className="mt-1.5 text-xs text-[#767f8c]">
                Candidates can find you as <span className="font-semibold text-[#18191c]">@{companyUsername}</span> in messages
              </p>
            )}
          </div>
        </div>

        <div className="cset-bio">
          <label className="cset-label">About Us</label>
          <div className="cset-bio-box">
            <textarea
              ref={aboutRef}
              className="cset-textarea"
              rows={5}
              placeholder="Write down about your company here. Let the candidate know who we are..."
              value={draft.about}
              onChange={(e) => patch({ about: e.target.value })}
            />
            <FormatToolbar textareaRef={aboutRef} value={draft.about} onChange={(about) => patch({ about })} />
          </div>
        </div>
      </section>
    </>
  );
}
