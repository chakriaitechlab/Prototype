'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CompanyDraft, CompanyProfile } from '@/types/company';
import { draftsEqual, toCompanyDraft } from '@/utils/company-profile';

export function useCompanyEditor(company: CompanyProfile) {
  const [source, setSource] = useState(company);
  const [saved, setSaved] = useState(() => toCompanyDraft(company));
  const [draft, setDraft] = useState(saved);
  const [logoUrl, setLogoUrl] = useState(company.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(company.bannerUrl);
  const [completion, setCompletion] = useState(company.completion);

  const dirty = useMemo(() => !draftsEqual(draft, saved), [draft, saved]);

  if (source !== company) {
    setSource(company);
    setLogoUrl(company.logoUrl);
    setBannerUrl(company.bannerUrl);
    setCompletion(company.completion);
    if (!dirty) {
      const next = toCompanyDraft(company);
      setSaved(next);
      setDraft(next);
    }
  }

  const patch = useCallback((next: Partial<CompanyDraft>) => {
    setDraft((current) => ({ ...current, ...next }));
  }, []);

  const markSaved = useCallback((next: CompanyProfile) => {
    const nextDraft = toCompanyDraft(next);
    setSaved(nextDraft);
    setDraft(nextDraft);
    setLogoUrl(next.logoUrl);
    setBannerUrl(next.bannerUrl);
    setCompletion(next.completion);
  }, []);

  const bannerUploaded = useCallback((url: string) => {
    setBannerUrl(url);
    setDraft((current) => ({ ...current, removeBanner: false }));
  }, []);

  return {
    draft,
    dirty,
    logoUrl,
    bannerUrl: draft.removeBanner ? null : bannerUrl,
    completion,
    patch,
    markSaved,
    setLogoUrl,
    bannerUploaded,
  };
}

export type CompanyEditor = ReturnType<typeof useCompanyEditor>;
