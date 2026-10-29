import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { profileApi } from '@/lib/profile';
import { PortfolioView } from '@/components/homepage/username/PortfolioView';
import type { PublicProfile } from '@/types/profile';
import { isValidUsername, normalizeUsername, safeExternalUrl, SITE_URL } from '@/utils/public-profile';

export const instant = false;

const DESCRIPTION_LENGTH = 155;

interface PortfolioPageProps {
  params: Promise<{ username: string }>;
}

const loadProfile = cache(async (raw: string): Promise<PublicProfile | null> => {
  const username = normalizeUsername(raw);
  return isValidUsername(username) ? profileApi.publicProfile(username) : null;
});

function describe({ displayName, headline, about }: PublicProfile) {
  const bio = about.trim().replace(/\s+/g, ' ');
  if (bio) return bio.length > DESCRIPTION_LENGTH ? `${bio.slice(0, DESCRIPTION_LENGTH).trim()}...` : bio;
  if (headline.trim()) return `${displayName} — ${headline.trim()} on Chakri AI.`;
  return `${displayName}'s verified professional digital portfolio on Chakri AI.`;
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await loadProfile(username);

  if (!profile) {
    return {
      title: 'Portfolio Not Found | Chakri AI',
      description: 'The requested digital portfolio was not found on Chakri AI.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.displayName} (@${profile.username}) — Digital Portfolio | Chakri AI`;
  const description = describe(profile);
  const url = `/${profile.username}`;
  const images = profile.avatarUrl?.startsWith('http')
    ? [{ url: profile.avatarUrl, alt: `${profile.displayName}'s avatar` }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'profile', title, description, url, siteName: 'Chakri AI', images, username: profile.username },
    twitter: { card: images ? 'summary_large_image' : 'summary', title, description, images: images?.map(({ url: src }) => src) },
  };
}

function personJsonLd(profile: PublicProfile) {
  const url = `${SITE_URL}/${profile.username}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Person',
      name: profile.displayName,
      alternateName: `@${profile.username}`,
      url,
      image: profile.avatarUrl ?? undefined,
      jobTitle: profile.headline.trim() || undefined,
      description: profile.about.trim() || undefined,
      address: profile.location.trim() ? { '@type': 'PostalAddress', addressLocality: profile.location.trim() } : undefined,
      knowsAbout: profile.skills.map(({ name }) => name),
      knowsLanguage: profile.languages.map(({ name }) => name),
      sameAs: Object.values(profile.socialLinks).map((link) => safeExternalUrl(link)).filter(Boolean),
    },
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { username } = await params;
  const profile = await loadProfile(username);
  if (!profile) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(profile)).replace(/</g, '\\u003c') }}
      />
      <PortfolioView profile={profile} />
    </>
  );
}
