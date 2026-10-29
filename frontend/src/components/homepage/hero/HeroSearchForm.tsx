'use client';

import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';

export function HeroSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location.trim()) params.set('location', location.trim());
    router.push(`/jobs${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <form
      className="jp-command jp-hero-reveal"
      style={{ '--d': '240ms' } as CSSProperties}
      onSubmit={handleSubmit}
    >
      <div className="jp-command-shell">
        <label className="jp-command-field jp-command-field--query">
          <Search size={18} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by skills, company or job title"
            aria-label="Job title or keyword"
            className="!outline-none !ring-0 !shadow-none"
          />
        </label>
        <span className="jp-command-divider" aria-hidden />
        <label className="jp-command-field jp-command-field--loc">
          <MapPin size={18} aria-hidden />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            aria-label="Location"
            className="!outline-none !ring-0 !shadow-none"
          />
        </label>
        <button type="submit" className="jp-command-search">
          Search
        </button>
      </div>
    </form>
  );
}
