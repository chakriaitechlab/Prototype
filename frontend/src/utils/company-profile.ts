import type { CompanyDraft, CompanyProfile, CompanyTab, CompanyUpdate, DraftSocialLink, SocialPlatform } from '@/types/company';

export const COMPANY_TABS: { id: CompanyTab; label: string }[] = [
  { id: 'info', label: 'Company Info' },
  { id: 'founding', label: 'Founding Info' },
  { id: 'social', label: 'Link' },
  { id: 'contact', label: 'Contact & Location' },
];

export const ORGANIZATION_TYPES = [
  'Private Limited',
  'Public Limited',
  'Startup',
  'Non-profit',
  'Government',
  'Agency',
  'Sole Proprietorship',
];

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Hospitality',
  'Other',
];

export const TEAM_SIZES = [
  '1-9 employees',
  '10-49 employees',
  '50-249 employees',
  '250-999 employees',
  '1000+ employees',
];

export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; placeholder: string }[] = [
  { id: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourhandle' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourhandle' },
  { id: 'x', label: 'X', placeholder: 'https://x.com/yourhandle' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { id: 'github', label: 'GitHub', placeholder: 'https://github.com/yourhandle' },
];

const DEFAULT_LINK_PLATFORMS: SocialPlatform[] = ['website', 'facebook', 'linkedin', 'x'];
const DEFAULT_COUNTRY = 'Bangladesh';

export const LOGO_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const BANNER_ACCEPT = 'image/jpeg,image/png,image/webp';
export const BANNER_MAX_BYTES = 5 * 1024 * 1024;

let linkSeq = 0;
export function newLinkId() {
  linkSeq += 1;
  return `link-${linkSeq}`;
}

function toDraftLinks(company: CompanyProfile): DraftSocialLink[] {
  const urlByPlatform = new Map(company.socialLinks.map(({ platform, url }) => [platform, url]));
  if (!urlByPlatform.has('website') && company.website) urlByPlatform.set('website', company.website);

  const defaults = DEFAULT_LINK_PLATFORMS.map((platform) => ({
    id: newLinkId(),
    platform,
    url: urlByPlatform.get(platform) ?? '',
  }));
  const extras = company.socialLinks
    .filter(({ platform }) => !DEFAULT_LINK_PLATFORMS.includes(platform))
    .map((link) => ({ id: newLinkId(), ...link }));

  return [...defaults, ...extras];
}

export function toCompanyDraft(company: CompanyProfile): CompanyDraft {
  return {
    about: company.about,
    organizationType: company.organizationType,
    industry: company.industry,
    teamSize: company.teamSize,
    foundedOn: company.foundedOn,
    website: company.website,
    vision: company.vision,
    socialLinks: toDraftLinks(company),
    mapLocation: company.mapLocation || [company.city, company.country].filter(Boolean).join(', '),
    address: company.address,
    city: company.city,
    country: company.country || DEFAULT_COUNTRY,
    lat: company.lat,
    lng: company.lng,
    bannerPosition: company.bannerPosition,
    removeBanner: false,
    tradeLicense: company.tradeLicense,
    rlNo: company.rlNo,
  };
}

export function toCompanyUpdate(draft: CompanyDraft, isVerified: boolean): CompanyUpdate {
  const { socialLinks, removeBanner, tradeLicense, rlNo, ...fields } = draft;
  return {
    ...fields,
    socialLinks: socialLinks.map(({ platform, url }) => ({ platform, url })),
    ...(removeBanner && { removeBanner }),
    ...(!isVerified && { tradeLicense, rlNo }),
  };
}

export function draftsEqual(a: CompanyDraft, b: CompanyDraft) {
  const strip = (draft: CompanyDraft) => ({
    ...draft,
    socialLinks: draft.socialLinks.map(({ platform, url }) => ({ platform, url })),
  });
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b));
}

export function websiteHref(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}
