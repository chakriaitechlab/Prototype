'use client';

import { useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { saveCompanyAction, uploadCompanyBannerAction, uploadCompanyLogoAction } from '@/actions/company.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState, AuthUser } from '@/types/auth';
import type { CompanyProfile, CompanyTab } from '@/types/company';
import { BANNER_MAX_BYTES, COMPANY_TABS, LOGO_MAX_BYTES, toCompanyUpdate } from '@/utils/company-profile';
import { CompanyProfileDone } from './CompanyProfileDone';
import { CompanyProfileHeader } from './CompanyProfileHeader';
import { CompanyProfileSaveBar } from './CompanyProfileSaveBar';
import { CompanyProfileTabs } from './CompanyProfileTabs';
import { CompanyInfoSection } from './sections/CompanyInfoSection';
import { ContactLocationSection } from './sections/ContactLocationSection';
import { FoundingInfoSection } from './sections/FoundingInfoSection';
import { SocialLinksSection } from './sections/SocialLinksSection';
import { useCompanyEditor } from './use-company-editor';

const MISSING_PREVIEW_COUNT = 4;

const MEDIA = {
  logo: { action: uploadCompanyLogoAction, maxBytes: LOGO_MAX_BYTES, tooLarge: 'Logo must be 2 MB or smaller.' },
  banner: { action: uploadCompanyBannerAction, maxBytes: BANNER_MAX_BYTES, tooLarge: 'Cover photo must be 5 MB or smaller.' },
} as const;

interface CompanyProfileViewProps {
  company: CompanyProfile;
  user: AuthUser;
}

export function CompanyProfileView({ company, user }: CompanyProfileViewProps) {
  const router = useRouter();
  const editor = useCompanyEditor(company);
  const [tab, setTab] = useState<CompanyTab>('info');
  const [alert, setAlert] = useState<ActionState>({});
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);
  const [saving, startSaving] = useTransition();
  const [, startUpload] = useTransition();

  const tabIndex = COMPANY_TABS.findIndex(({ id }) => id === tab);
  const isLastTab = tabIndex === COMPANY_TABS.length - 1;

  const save = (advance: boolean) =>
    startSaving(async () => {
      const result = await saveCompanyAction(toCompanyUpdate(editor.draft, company.isVerified));
      if (!result.company) {
        setAlert({ error: result.error });
        return;
      }

      editor.markSaved(result.company);
      router.refresh();

      const { profileCompleted, missing } = result.company.completion;
      if (profileCompleted) {
        setDone(true);
        return;
      }

      if (advance && !isLastTab) {
        setAlert({ message: result.message });
        setTab(COMPANY_TABS[tabIndex + 1].id);
      } else if (isLastTab && missing.length) {
        setAlert({ error: `Still missing: ${missing.slice(0, MISSING_PREVIEW_COUNT).join(', ')}` });
      } else {
        setAlert({ message: result.message });
      }
    });

  const upload = (kind: 'logo' | 'banner', file: File) => {
    const { action, maxBytes, tooLarge } = MEDIA[kind];
    if (file.size > maxBytes) {
      setAlert({ error: tooLarge });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(kind);
    startUpload(async () => {
      const result = await action(formData);
      setUploading(null);
      if (!result.url) {
        setAlert({ error: result.error });
        return;
      }

      if (kind === 'logo') editor.setLogoUrl(result.url);
      else editor.bannerUploaded(result.url);
      setAlert({ message: result.message });
      router.refresh();
    });
  };

  if (done) return <CompanyProfileDone />;

  const sections: Record<CompanyTab, ReactNode> = {
    info: (
      <CompanyInfoSection
        editor={editor}
        user={user}
        companyName={company.name}
        companyUsername={company.username}
        isVerified={company.isVerified}
        uploading={uploading}
        onUploadLogo={(file) => upload('logo', file)}
        onUploadBanner={(file) => upload('banner', file)}
        onRepositioned={() => setAlert({ message: 'Cover position updated' })}
      />
    ),
    founding: <FoundingInfoSection editor={editor} />,
    social: <SocialLinksSection editor={editor} />,
    contact: <ContactLocationSection editor={editor} user={user} isVerified={company.isVerified} onNotify={setAlert} />,
  };

  return (
    <div className="cco-settings w-full pb-16">
      <FormAlert message={alert.error ?? alert.message} type={alert.error ? 'error' : 'success'} trigger={alert} />

      <div className="sticky top-[-1.25rem] z-20 -mx-4 -mt-5 mb-6 border-b border-[#e4e5e8] bg-white px-4 pt-5 lg:top-[-2rem] lg:-mx-10 lg:-mt-8 lg:px-10 lg:pt-8">
        <CompanyProfileHeader
          percent={editor.completion.percent}
          saving={saving}
          dirty={editor.dirty}
          onSave={() => save(false)}
        />
        <CompanyProfileTabs active={tab} onChange={setTab} />
      </div>

      {sections[tab]}

      <CompanyProfileSaveBar
        isFirstTab={tabIndex === 0}
        isLastTab={isLastTab}
        saving={saving}
        dirty={editor.dirty}
        onPrevious={() => setTab(COMPANY_TABS[tabIndex - 1].id)}
        onSave={() => save(!isLastTab)}
      />
    </div>
  );
}
