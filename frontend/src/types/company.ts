import type { LinkPlatform } from './profile';

export type SocialPlatform = LinkPlatform;

export interface CompanySocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface CompanyCompletion {
  percent: number;
  profileCompleted: boolean;
  missing: string[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  username: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  bannerPosition: number;
  about: string;
  organizationType: string;
  industry: string;
  teamSize: string;
  foundedOn: string;
  website: string;
  vision: string;
  socialLinks: CompanySocialLink[];
  mapLocation: string;
  address: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  tradeLicense: string;
  rlNo: string;
  isVerified: boolean;
  completion: CompanyCompletion;
}

export type CompanyTab = 'info' | 'founding' | 'social' | 'contact';

export interface DraftSocialLink extends CompanySocialLink {
  id: string;
}

export interface CompanyDraft {
  about: string;
  organizationType: string;
  industry: string;
  teamSize: string;
  foundedOn: string;
  website: string;
  vision: string;
  socialLinks: DraftSocialLink[];
  mapLocation: string;
  address: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  bannerPosition: number;
  removeBanner: boolean;
  tradeLicense: string;
  rlNo: string;
}

export type CompanyUpdate = Partial<Omit<CompanyDraft, 'socialLinks'>> & { socialLinks?: CompanySocialLink[] };

export interface SaveCompanyState {
  company?: CompanyProfile;
  message?: string;
  error?: string;
}

export interface CompanyMediaState {
  url?: string;
  message?: string;
  error?: string;
}

export interface OfficeGeoResult {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  mapLocation: string;
}
