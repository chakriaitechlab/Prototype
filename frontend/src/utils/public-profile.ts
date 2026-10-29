import type { LanguageProficiency, PublicProfile } from '@/types/profile';
import { LINK_PLATFORMS } from './profile';
import { messageUserPath } from './routes';

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,29}$/;
const DEFAULT_LOCATION = 'Bangladesh';
const DEFAULT_LANGUAGES = 'English, Bengali';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakriai.com';

export const normalizeUsername = (raw: string) => raw.trim().toLowerCase();

export const isValidUsername = (username: string) => USERNAME_PATTERN.test(username);

export const publicProfileTag = (username: string) => `public-profile:${username.toLowerCase()}`;

export function safeExternalUrl(raw?: string) {
  const value = raw?.trim();
  if (!value || value.startsWith('/') || /^(javascript|data):/i.test(value)) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

export function formatMemberSince(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Recently'
    : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatDateRange(start?: string, end?: string, current?: boolean) {
  const from = start?.trim() ?? '';
  const to = current ? 'Present' : (end?.trim() ?? '');
  return from && to ? `${from} – ${to}` : from || to;
}

export function yearOf(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return '';
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? trimmed : String(date.getFullYear());
}

const FLUENCY_LABELS: Record<LanguageProficiency, string> = {
  native: 'Native/Bilingual',
  fluent: 'Fluent',
  conversational: 'Conversational',
  basic: 'Basic',
};

export const fluencyLabel = (proficiency?: LanguageProficiency) => FLUENCY_LABELS[proficiency ?? 'fluent'];

export function publicProfileSummary(profile: PublicProfile) {
  const { languages, socialLinks } = profile;

  return {
    location: profile.location.trim() || DEFAULT_LOCATION,
    languagesText: languages.length > 0 ? languages.map(({ name }) => name).join(', ') : DEFAULT_LANGUAGES,
    memberSince: formatMemberSince(profile.memberSince),
    contactHref: messageUserPath(profile.username),
    links: LINK_PLATFORMS.flatMap(({ id, label }) => {
      const href = safeExternalUrl(socialLinks[id]);
      return href ? [{ platform: id, label, href }] : [];
    }),
  };
}

export type PublicProfileSummary = ReturnType<typeof publicProfileSummary>;
